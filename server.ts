import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in your secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. AI Translator API - Dynamic translation for picture book page
app.post("/api/gemini/translate", async (req, res) => {
  try {
    const { text, targetLanguageName } = req.body;
    if (!text || !targetLanguageName) {
      return res.status(400).json({ error: "Missing required parameters: text and targetLanguageName" });
    }

    const ai = getGeminiAI();
    const prompt = `You are a children's book translation expert.
Translate the following story page text into ${targetLanguageName}.
Keep the tone warm, friendly, vivid, engaging, and suitable for young children.
Return ONLY the translated story text without commentary.

Original text:
"${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const translatedText = response.text?.trim() || text;
    res.json({ translation: translatedText });
  } catch (err: any) {
    console.error("Translation API error:", err);
    res.status(500).json({ error: err.message || "Failed to translate text" });
  }
});

// 2. AI Vocabulary Explainer - Returns phonetic, child-friendly definition and example sentence
app.post("/api/gemini/explain-vocab", async (req, res) => {
  try {
    const { word, contextSentence, targetLangName } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    const ai = getGeminiAI();
    const prompt = `Analyze the word "${word}" in the context of this children's story line: "${contextSentence || ''}".
Provide a child-friendly explanation in ${targetLangName || 'Traditional Chinese'}.
Include:
1. Phonetic / Pinyin / Pronunciation guide
2. Direct translation in ${targetLangName || 'Traditional Chinese'}
3. Simple 1-sentence child-friendly definition
4. An easy example sentence suitable for kids.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            translation: { type: Type.STRING },
            definition: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
          },
          required: ["word", "phonetic", "translation", "definition", "exampleSentence"],
        },
      },
    });

    const resultText = response.text?.trim();
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return res.json(parsed);
    }
    throw new Error("Empty response from AI");
  } catch (err: any) {
    console.error("Vocab API error:", err);
    res.status(500).json({
      word: req.body.word || "",
      phonetic: "",
      translation: req.body.word || "",
      definition: "這是一個有趣的詞彙，可以在故事中多看看它出現的地方哦！",
      exampleSentence: `我們在故事裡學到了「${req.body.word}」。`,
    });
  }
});

// 3. AI Story Companion Q&A & Quiz (說故事小夥伴)
app.post("/api/gemini/story-qa", async (req, res) => {
  try {
    const { bookTitle, pageText, userQuestion, history } = req.body;
    if (!userQuestion) {
      return res.status(400).json({ error: "Question is required" });
    }

    const ai = getGeminiAI();
    const systemInstruction = `You are "Little Owl" (小貓頭鷹), a cheerful, polite, and encouraging AI storybook buddy for children reading the book "${bookTitle || '繪本'}".
Your goal is to answer children's questions about the story in simple, warm, inspiring, and easy-to-understand language in Traditional Chinese (繁體中文).
Use cute expressions, emojis (🦉, ✨, 🌟, 📖), and ask a small follow-up question to spark curiosity. Keep answers short (under 3 sentences).`;

    const historyPrompt = (history || [])
      .map((h: any) => `${h.role === 'user' ? 'Child' : 'Little Owl'}: ${h.content}`)
      .join('\n');

    const prompt = `Current Page Text: "${pageText || ''}"
Previous Conversation:
${historyPrompt}

Child's Question: "${userQuestion}"
Little Owl's Response:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    res.json({ answer: response.text?.trim() || "小貓頭鷹非常高興跟你一起看這個故事！你覺得接下來會發生什麼事呢？🦉✨" });
  } catch (err: any) {
    console.error("Story QA error:", err);
    res.status(500).json({ answer: "小貓頭鷹剛好去採集星星果實了，我們一起繼續讀故事吧！🦉🌟" });
  }
});

// 3b. AI Story Quiz Generator (繪本問答與隨堂小測驗)
app.post("/api/gemini/story-quiz", async (req, res) => {
  try {
    const { bookTitle, fullStoryText, ageGroup } = req.body;
    if (!bookTitle) {
      return res.status(400).json({ error: "Book title is required" });
    }

    const ai = getGeminiAI();
    const prompt = `You are a warm, encouraging elementary school reading comprehension & AI story quiz creator for children aged ${ageGroup || '6-8'}.
Based on the children's picture book titled "${bookTitle}" with story content:
"${fullStoryText || ''}"

Generate 3 fun, engaging, child-friendly multiple choice questions in Traditional Chinese (繁體中文).
Each question must test basic plot recall, character empathy, or a fun moral/vocabulary detail.

Format output as JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "問題內容",
      "options": ["選項A", "選項B", "選項C"],
      "correctOptionIndex": 0,
      "explanation": "答對了！因為故事中...",
      "hint": "提示：想想故事第一頁發生的事情"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  hint: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctOptionIndex", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response");
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Story Quiz API error:", err);
    // Fallback static quiz
    res.json({
      questions: [
        {
          id: 'fallback-q1',
          question: `故事《${req.body.bookTitle || '繪本'}》中，主要角色的最棒品質是什麼？`,
          options: ['充滿勇氣與善良', '喜歡獨自睡覺', '忘記關電燈'],
          correctOptionIndex: 0,
          explanation: '答對了！主要角色展現了無比的勇氣與善良，值得我們學習！⭐',
          hint: '想想主角如何幫助大家！'
        },
        {
          id: 'fallback-q2',
          question: '看完這個故事，你最想學習到什麼好習慣呢？',
          options: ['勇敢面對困難', '亂丟玩具', '不跟朋友分享'],
          correctOptionIndex: 0,
          explanation: '太棒了！勇敢面對困難是每位故事小探險家必備的能力！',
          hint: '正面有愛的好品質！'
        }
      ]
    });
  }
});

// 3c. AI Story Character Interactive Roleplay (與故事主角對話 - 沉浸式角色扮演互動)
app.post("/api/gemini/character-roleplay", async (req, res) => {
  try {
    const {
      bookTitle,
      characterName,
      characterRole,
      currentPageText,
      userMessage,
      history,
      childName,
    } = req.body;

    if (!characterName || !userMessage) {
      return res.status(400).json({ error: "characterName and userMessage are required" });
    }

    const ai = getGeminiAI();

    const systemInstruction = `You are roleplaying as "${characterName}" (${characterRole || '故事中的重要角色'}), a beloved character from the children's picture book "${bookTitle || '繪本'}".
The child reader named "${childName || '小讀者'}" is reading this book and talking directly to you.

Guidelines:
1. Speak completely in character as ${characterName}. Match their personality, tone, vocabulary, and worldview.
2. Tone: Warm, cheerful, imaginative, respectful, and emotionally supportive for children aged 4-10.
3. Language: Traditional Chinese (繁體中文).
4. Reference current story events: The child is currently at a page with this text: "${currentPageText || ''}".
5. Return JSON format with:
   - "reply": Your spoken dialog as the character (2-4 lively, kid-friendly sentences).
   - "emotion": One of ['happy', 'curious', 'brave', 'caring', 'playful', 'surprised'].
   - "actionGesture": A short, cute physical action/expression description (e.g., '微笑地眨了眨眼睛', '開心地揮舞小手', '挺起胸膛擺出勇敢的姿勢').
   - "suggestedFollowUps": Array of 2 to 3 short, inspiring questions (under 15 chars each) the child can tap to continue chatting with you.`;

    const historyText = (history || [])
      .slice(-6)
      .map((h: any) => `${h.role === 'user' ? 'Child' : characterName}: ${h.content}`)
      .join('\n');

    const prompt = `Story Context (Current Page): "${currentPageText || ''}"
Previous Conversation:
${historyText}

Child's Message: "${userMessage}"
Generate your in-character response:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            emotion: { type: Type.STRING },
            actionGesture: { type: Type.STRING },
            suggestedFollowUps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["reply", "emotion", "actionGesture", "suggestedFollowUps"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty character response from AI");
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Character roleplay API error:", err);
    // Graceful fallback response
    const charName = req.body.characterName || '故事主角';
    res.json({
      reply: `你好呀！我是${charName}！聽到你的聲音我太開心了！我們一起在繪本的世界裡繼續探險吧！✨`,
      emotion: "happy",
      actionGesture: "開心地揮了揮手向你打招呼",
      suggestedFollowUps: [
        "你在故事中最喜歡哪一個部分？",
        "可以教我如何跟你一樣勇敢嗎？",
        "接下來我們要去哪裡探險呢？",
      ],
    });
  }
});

// 4. AI Picture Book Creator Endpoint (繪本創作工坊 - 支援英雄之旅、寓言故事、探險日記等結構模板)
app.post("/api/gemini/generate-book", async (req, res) => {
  try {
    const { prompt, ageGroup, artStyle, category, characterNames, moralLesson, storyStructure, customSteps } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Story topic prompt is required" });
    }

    const ai = getGeminiAI();

    let structureGuidance = "";
    if (storyStructure && storyStructure.name) {
      structureGuidance = `
STORY STRUCTURE TEMPLATE: ${storyStructure.name} (${storyStructure.badge || ''})
NARRATIVE LOGIC & BACKBONE: ${storyStructure.narrativeLogic || ''}
${customSteps && Array.isArray(customSteps) && customSteps.length > 0 ? `Custom Outline Steps:\n${customSteps.map((s: any, idx: number) => `Act ${idx + 1} (${s.title || ''}): ${s.userText || s.exampleText || ''}`).join('\n')}` : ''}

You MUST logically structure the 3-page children's picture book as follows:
- Page 1 (Beginning / Setup): Corresponds to the opening stage (e.g. Ordinary World & Call in Hero's Journey, or Character & Flaw in Fable, or Day 1 Departure & Equipment in Adventure Diary). Establish characters, world, and inciting spark.
- Page 2 (Development / Turning Point): Corresponds to the trials, conflict, moral dilemma, obstacle, or Day 2-3 perilous encounters. Build tension and test the characters.
- Page 3 (Climax & Resolution): Corresponds to the supreme triumph, moral wisdom realization, treasure discovery, or triumphant return. Deliver high emotional resonance and growth.
`;
    }

    const systemPrompt = `You are a world-class children's picture book author and master storytelling architect.
Create a complete, cohesive 3-page children's picture book strictly adhering to the specified story structure.
Target Age Group: ${ageGroup || '3-8'} years old.
Art Style: ${artStyle || 'Colorful Children Picture Book'}.
Category: ${category || 'Adventure'}.
Characters: ${characterNames || 'A brave little adventurer'}.
Moral Lesson: ${moralLesson || 'Kindness, Courage, Curiosity'}.
${structureGuidance}

Generate JSON output with:
1. Title in Traditional Chinese (zh-TW) and English (en)
2. Summary in Traditional Chinese (zh-TW) and English (en)
3. 3 pages, each containing:
   - pageNumber (1, 2, 3)
   - text for zh-TW (Traditional Chinese), en (English), ja (Japanese)
   - 2 key vocabulary items for kids (word, phonetic, translation, definition)
   - illustrationPrompt (an image prompt for generating or finding art matching ${artStyle})
   - interactivePrompt (a question for kids on that page)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Idea: "${prompt}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleZh: { type: Type.STRING },
            titleEn: { type: Type.STRING },
            summaryZh: { type: Type.STRING },
            summaryEn: { type: Type.STRING },
            pages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: { type: Type.INTEGER },
                  textZh: { type: Type.STRING },
                  textEn: { type: Type.STRING },
                  textJa: { type: Type.STRING },
                  illustrationPrompt: { type: Type.STRING },
                  interactivePrompt: { type: Type.STRING },
                  vocab: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        phonetic: { type: Type.STRING },
                        translation: { type: Type.STRING },
                        definition: { type: Type.STRING },
                      },
                      required: ["word", "phonetic", "translation", "definition"],
                    },
                  },
                },
                required: ["pageNumber", "textZh", "textEn", "textJa", "illustrationPrompt", "interactivePrompt", "vocab"],
              },
            },
          },
          required: ["titleZh", "titleEn", "summaryZh", "summaryEn", "pages"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response from AI");

    const data = JSON.parse(jsonText);

    // Map AI output to application Book model
    const illustrations = [
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
    ];

    const generatedBook = {
      id: `custom-book-${Date.now()}`,
      title: {
        'zh-TW': data.titleZh,
        en: data.titleEn,
        ja: `${data.titleZh} (日文)`,
        fr: `${data.titleEn} (Français)`,
        es: `${data.titleEn} (Español)`,
        de: `${data.titleEn} (Deutsch)`,
        ko: `${data.titleZh} (한국어)`,
        vi: `${data.titleEn} (Tiếng Việt)`,
      },
      author: 'AI 創意童書工坊 & 你',
      originCountry: '地球村',
      flag: '🌍',
      ageGroup: ageGroup || '6-8',
      category: category || 'Adventure',
      coverUrl: illustrations[0],
      rating: 5.0,
      readCount: 1,
      isCustom: true,
      createdAt: new Date().toLocaleDateString('zh-TW'),
      summary: {
        'zh-TW': data.summaryZh,
        en: data.summaryEn,
        ja: data.summaryZh,
        fr: data.summaryEn,
        es: data.summaryEn,
        de: data.summaryEn,
        ko: data.summaryZh,
        vi: data.summaryEn,
      },
      pages: data.pages.map((p: any, idx: number) => ({
        pageNumber: p.pageNumber || idx + 1,
        illustrationUrl: illustrations[idx % illustrations.length],
        text: {
          'zh-TW': p.textZh,
          en: p.textEn,
          ja: p.textJa || p.textZh,
          fr: p.textEn,
          es: p.textEn,
          de: p.textEn,
          ko: p.textZh,
          vi: p.textEn,
        },
        vocab: p.vocab || [],
        interactivePrompt: p.interactivePrompt,
      })),
    };

    res.json(generatedBook);
  } catch (err: any) {
    console.error("Book Generator error:", err);
    res.status(500).json({ error: err.message || "Failed to generate picture book" });
  }
});

// 4b. AI Picture Book Creative Spark Generator (創意生成器 - 提供 3 個隨機繪本創作靈感標籤與完整大綱)
app.post("/api/gemini/generate-creative-sparks", async (req, res) => {
  try {
    const { category = "Adventure", ageGroup = "6-8", keyword = "" } = req.body;

    const ai = getGeminiAI();
    const prompt = `You are a world-class creative children's book author and imaginative idea generator.
Generate 3 unique, vibrant, whimsical, and inspiring story sparks for children aged ${ageGroup} in the genre "${category}".
${keyword ? `Optional user focus keyword: "${keyword}".` : ""}

Guidelines:
1. Provide 3 distinctly different story inspirations.
2. For each spark:
   - "id": a unique string (e.g. "spark-1")
   - "tag": short catchy spark tag with emoji (e.g. "🌌 漂浮在彩虹上的雲朵天文台", "🦖 偷偷復活的博物館恐龍", "🌿 收集眼淚發電的發光小樹蛙")
   - "title": a charming book title
   - "character": interesting protagonist name and trait
   - "scene": vivid magical or real-world setting
   - "conflict": engaging yet child-safe problem/quest
   - "moral": heartwarming or educational takeaway
   - "recommendedArtStyle": suitable art style (e.g. "溫馨水彩繪本", "點陣像素風格", "趣味蠟筆風格", "黏土手作風格", "剪紙與童話風", "卡通動畫風格")
   - "prompt": a ready-to-use comprehensive prompt paragraph in Traditional Chinese (繁體中文) that a child can immediately submit to generate a 3-4 page picture book.

Language: Traditional Chinese (繁體中文).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            sparks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  title: { type: Type.STRING },
                  character: { type: Type.STRING },
                  scene: { type: Type.STRING },
                  conflict: { type: Type.STRING },
                  moral: { type: Type.STRING },
                  recommendedArtStyle: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                },
                required: [
                  "id",
                  "tag",
                  "title",
                  "character",
                  "scene",
                  "conflict",
                  "moral",
                  "recommendedArtStyle",
                  "prompt",
                ],
              },
            },
          },
          required: ["category", "sparks"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response from AI");
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Creative sparks API error:", err);
    // Dynamic fallback sparks
    const cat = req.body.category || "Adventure";
    res.json({
      category: cat,
      sparks: [
        {
          id: "spark-fallback-1",
          tag: "🌌 雲端上的星光鐘錶師",
          title: "星光鐘錶師的小貓咪",
          character: "帶著金色齒輪放大鏡的小白貓「露露」",
          scene: "漂浮在積雨雲上的七彩發條鐘樓",
          conflict: "天空中的星星鐘突然停擺，夜晚的流星雨就要迷路了！",
          moral: "細心與耐心能修理最複雜的難題，每顆小星星都有發光的時刻。",
          recommendedArtStyle: "溫馨水彩繪本",
          prompt: "請創作一本繪本《星光鐘錶師的小貓咪》：住在雲端鐘樓的貓咪露露，發現星空發條卡住了。她帶著名為希望的小齒輪踏上星河，運用智慧與耐心修復夜空秩序，讓每顆流星重新閃爍。"
        },
        {
          id: "spark-fallback-2",
          tag: "🌿 森林裡的微風烘焙坊",
          title: "小樹蛙的香甜晨光派",
          character: "背著葉片廚師帽的小樹蛙「呱呱」",
          scene: "晨露閃爍的古老橡樹樹洞廚房",
          conflict: "森林小夥伴們今天都無精打采，需要一份帶來元氣的自然秘方！",
          moral: "用心分享美味與笑容，能讓整個世界充滿溫暖力量。",
          recommendedArtStyle: "趣味蠟筆風格",
          prompt: "請創作一本繪本《小樹蛙的香甜晨光派》：小樹蛙呱呱採集早晨第一道陽光碎片和清甜蜂蜜，為森林裡沮喪的小松鼠與小熊烘烤魔法鬆餅，大家吃完後重新充滿活力與歡笑。"
        },
        {
          id: "spark-fallback-3",
          tag: "🚀 穿越時空的恐龍偵探",
          title: "三角龍波波的神秘足跡",
          character: "戴著紅色探險帽的小三角龍「波波」",
          scene: "長滿發光巨大蕨類植物的白堊紀峽谷",
          conflict: "水源邊出現了從沒見過的奇異光圈足跡，連腕龍爺爺都不知道是誰留下的！",
          moral: "勇敢探索未知，保護大自然中的每一位新朋友。",
          recommendedArtStyle: "卡通動畫風格",
          prompt: "請創作一本繪本《三角龍波波的神秘足跡》：好奇的三角龍波波跟隨奇異腳印展開探險，發現迷路的機器人小夥伴，波波用友誼與智慧幫助機器人修復電源，成為跨時空的最好朋友。"
        }
      ]
    });
  }
});

// 4c. AI Picture Book Reading Guide Script Generator (繪本導讀腳本 - 啟發開場白、互動提問、深度共讀結尾討論)
app.post("/api/gemini/reading-guide-script", async (req, res) => {
  try {
    const { bookTitle, category = "繪本", summary = "", fullStoryText = "", targetAgeGroup = "3-8歲" } = req.body;
    if (!bookTitle) {
      return res.status(400).json({ error: "Book title is required" });
    }

    const ai = getGeminiAI();
    const prompt = `You are a warm, imaginative, and world-class early childhood reading specialist, parent-child storytelling coach, and reading guide scriptwriter.
Analyze the picture book "${bookTitle}" (Genre: ${category}, Target Audience: ${targetAgeGroup}).
Summary: "${summary}"
Full Story Text: "${fullStoryText}"

Please generate a comprehensive, highly engaging, and practical "Picture Book Reading Guide Script" (繪本導讀腳本) in Traditional Chinese (繁體中文).

It must include:
1. "openingScript":
   - "headline": Catchy headline for the opening (e.g. "探險前的魔法悄悄話")
   - "hookQuestion": 1-2 interactive ice-breaker questions asking the child to observe the cover or imagine a related concept
   - "speechText": A lively, conversational 3-4 sentence opening script that a parent or audio narrator can read directly to the child to ignite curiosity before turning the first page.
2. "checkpointPrompts": Array of 2-3 mid-story guiding tips (e.g. Page checkpoint, what to observe in the artwork, how to encourage empathy).
3. "closingDiscussion":
   - "summaryTakeaway": A warm 1-2 sentence closing reflection.
   - "deepQuestions": 3 progressive questions for deep parent-child co-reading:
     1) [情節理解題] Understanding what happened
     2) [情感共鳴題] Empathizing with the character's emotions
     3) [生活連結題] Connecting the moral to the child's daily life
   - "extensionActivity": A fun 2-3 minute parent-child creative game, drawing idea, or roleplay mini-activity.
4. "parentTips": 2-3 practical tips for parents to deliver the most memorable reading experience (e.g. vocal inflection tips, pausing strategies).

Language: Traditional Chinese (繁體中文).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING },
            openingScript: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                hookQuestion: { type: Type.STRING },
                speechText: { type: Type.STRING },
              },
              required: ["headline", "hookQuestion", "speechText"],
            },
            checkpointPrompts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  guidance: { type: Type.STRING },
                  suggestedQuestion: { type: Type.STRING },
                },
                required: ["stage", "guidance", "suggestedQuestion"],
              },
            },
            closingDiscussion: {
              type: Type.OBJECT,
              properties: {
                summaryTakeaway: { type: Type.STRING },
                deepQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      question: { type: Type.STRING },
                      guidanceHint: { type: Type.STRING },
                    },
                    required: ["type", "question", "guidanceHint"],
                  },
                },
                extensionActivity: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              required: ["summaryTakeaway", "deepQuestions", "extensionActivity"],
            },
            parentTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["bookTitle", "openingScript", "checkpointPrompts", "closingDiscussion", "parentTips"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty response from AI");
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Reading guide script API error:", err);
    // Robust fallback
    const title = req.body.bookTitle || "這本繪本";
    res.json({
      bookTitle: title,
      openingScript: {
        headline: "🌟 翻開魔法扉頁前的悄悄話",
        hookQuestion: "你看！封面上藏著什麼秘密？如果走進這個世界，你最想遇到誰呢？",
        speechText: `親愛的小探險家，今天我們要一起打開《${title}》的奇妙旅程囉！在故事裡，有許多驚喜和暖心的時刻正在等待著我們。準備好你的好奇心眼睛和豎起小耳朵，我們一起出發吧！`,
      },
      checkpointPrompts: [
        {
          stage: "故事前半段（起點）",
          guidance: "引導孩子觀察角色的表情與出發時的心情，建立期待感。",
          suggestedQuestion: "你猜猜主角現在心情是緊張還是興奮？從哪裡看出來的？",
        },
        {
          stage: "故事轉折處（高潮）",
          guidance: "當主角面臨難關時，暫停一秒，邀請孩子一起幫忙想辦法。",
          suggestedQuestion: "如果是你，這時候會用什麼魔法或智慧來解決這個難題呢？",
        },
      ],
      closingDiscussion: {
        summaryTakeaway: `《${title}》告訴我們：無論遇到多大的風浪或未知的挑戰，只要懷抱勇氣、真誠與愛，我們總能發現生活中最美好的奇蹟！`,
        deepQuestions: [
          {
            type: "情節理解",
            question: "在整個故事裡，主角最勇敢或最聰明的是哪一個時刻？",
            guidanceHint: "幫助孩子回顧故事情節脈絡與因果關係。",
          },
          {
            type: "情感共鳴",
            question: "當主角最後達成目標時，你心裡的感覺是什麼呢？",
            guidanceHint: "引導孩子表達內心真實情感，建立同理與共情能力。",
          },
          {
            type: "生活連結",
            question: "在日常生活中，如果我們也遇到了類似的挑戰，可以怎麼做呢？",
            guidanceHint: "將繪本寓意轉化為生活中的正向行動力與品格力量。",
          },
        ],
        extensionActivity: {
          title: "🎨 親子共讀延伸：小小角色劇場與心願畫布",
          description: "和爸爸媽媽一起模仿故事裡最喜歡的角色講一句話，或者在一張白紙上畫出你想像中主角接下來的下一場大冒險！",
        },
      },
      parentTips: [
        "伴讀時可以用豐富的聲調變化模仿不同角色的說話口氣，吸引孩子的專注力。",
        "共讀沒有標準答案，當孩子提出天馬行空的想法時，多給予肯定與好奇的追問。",
        "讀完後抱抱孩子，讓閱讀的溫暖感受深深留在親子回憶裡。",
      ],
    });
  }
});

// 5. AI Reading Comprehension Mind Map Generator (AI 閱讀理解地圖)
app.post("/api/gemini/reading-map", async (req, res) => {
  try {
    const { bookTitle, summary, fullStoryText } = req.body;
    if (!bookTitle) {
      return res.status(400).json({ error: "Book title is required" });
    }

    const ai = getGeminiAI();
    const prompt = `You are an expert children's literature educator and mind map architect.
Create a rich, structured AI Reading Comprehension Map (AI 閱讀理解地圖) in Traditional Chinese (繁體中文) for the picture book "${bookTitle}".
Story Summary: "${summary || ''}"
Full Story Text: "${fullStoryText || ''}"

Return JSON matching schema:
{
  "bookTitle": "${bookTitle}",
  "coreTheme": "1-2 sentence core message or theme",
  "nodes": [
    {
      "id": "node-1",
      "category": "character" | "plot" | "moral" | "reflection",
      "title": "Node Title",
      "icon": "Emoji",
      "description": "Detailed explanation for kids",
      "keyTakeaway": "Key takeaway or reflection question"
    }
  ],
  "discussionPrompts": [
    "Thought-provoking question 1 for parents/kids to discuss",
    "Thought-provoking question 2"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING },
            coreTheme: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING },
                },
                required: ["id", "category", "title", "icon", "description", "keyTakeaway"],
              },
            },
            discussionPrompts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["bookTitle", "coreTheme", "nodes", "discussionPrompts"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty AI response");

    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (err: any) {
    console.error("Reading map API error:", err);
    // Fallback static map
    res.json({
      bookTitle: req.body.bookTitle || '繪本理解地圖',
      coreTheme: '探索愛的勇氣與陪伴的力量，學習理解自己與身邊的世界。',
      nodes: [
        {
          id: 'node-char',
          category: 'character',
          title: '🎭 角色特質圖譜',
          icon: '🦊',
          description: '故事主角展現出無比的好奇心與善良心意，並在旅程中學會傾聽與團隊合作。',
          keyTakeaway: '真誠的對待朋友，能化解許多心中的恐懼。',
        },
        {
          id: 'node-plot',
          category: 'plot',
          title: '🧭 起承轉合起伏線',
          icon: '🗺️',
          description: '從平靜的冒險起點，遇到意外難關，最後靠著智慧與堅持解開謎題獲得完美結局。',
          keyTakeaway: '面對挑戰時，停下來深呼吸並思考是最佳策略。',
        },
        {
          id: 'node-moral',
          category: 'moral',
          title: '💡 核心寓意與成長',
          icon: '🌟',
          description: '傳遞關懷環境、珍惜朋友與勇敢嘗試的核心價值，讓心靈充滿陽光。',
          keyTakeaway: '每一次嘗試都是通往成長的小基石。',
        },
        {
          id: 'node-ref',
          category: 'reflection',
          title: '🦉 親子共讀延伸討論',
          icon: '💬',
          description: '如果你是故事中的主角，當遇到迷路時，你會向誰尋求協助呢？',
          keyTakeaway: '試著用自己的話說說看主角的心情變化吧！',
        },
      ],
      discussionPrompts: [
        '故事中最讓你覺得最精彩或感動的地方是哪一頁？為什麼呢？',
        '主角遇到了什麼困難？他最後是用什麼聰明方法解決的？',
        '如果你能給主角一個神奇禮物，你最想送他什麼呢？',
      ],
    });
  }
});

// 6. Interactive Page-Aware Story World Map & Character Graph Generator
app.post("/api/gemini/interactive-reading-map", async (req, res) => {
  try {
    const { bookTitle, currentPageNumber, currentPageText, summary, fullStoryText } = req.body;
    if (!bookTitle) {
      return res.status(400).json({ error: "Book title is required" });
    }

    const ai = getGeminiAI();
    const pageNum = Number(currentPageNumber) || 1;
    const prompt = `You are a children's literature educator and interactive world map architect.
Create an interactive reading comprehension map (AI 閱讀理解輔助器地圖) in Traditional Chinese (繁體中文) for page ${pageNum} of the book "${bookTitle}".

Current Page (${pageNum}) Content: "${currentPageText || ''}"
Full Story Context: "${summary || ''} - ${fullStoryText || ''}"

Return JSON matching schema:
{
  "bookTitle": "${bookTitle}",
  "currentPageNumber": ${pageNum},
  "currentPageSummary": "1-sentence summary of page ${pageNum}",
  "locations": [
    {
      "id": "loc-1",
      "name": "Location Name (e.g. 🌲 霧影森林)",
      "icon": "🌲",
      "coordinates": { "x": 25, "y": 30 },
      "description": "What this place is and its importance to kids",
      "isCurrentPageLocation": true,
      "keyEvents": ["Event on page ${pageNum}"],
      "pageNumber": 1,
      "presentCharacters": ["🦊 小狐狸", "🦉 智慧貓頭鷹"],
      "keyObjects": ["📜 探險地圖", "🗝️ 魔法金鑰匙"],
      "sceneSecrets": "趣味知識：據說夜晚這裡會發出神秘的光芒..."
    }
  ],
  "characterRelationships": [
    {
      "id": "char-1",
      "name": "Character Name",
      "avatar": "🦊",
      "role": "主角",
      "description": "Character summary and current page state",
      "relations": [
        {
          "targetId": "char-2",
          "targetName": "Target Character Name",
          "relationType": "互助夥伴",
          "description": "Relationship explanation"
        }
      ]
    }
  ],
  "plotTrajectory": [
    {
      "stage": "起因",
      "title": "Stage Title",
      "description": "What happens in this stage",
      "pageRange": "第 1 頁",
      "isCurrentStage": true,
      "icon": "🌱"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookTitle: { type: Type.STRING },
            currentPageNumber: { type: Type.NUMBER },
            currentPageSummary: { type: Type.STRING },
            locations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                    },
                    required: ["x", "y"],
                  },
                  description: { type: Type.STRING },
                  isCurrentPageLocation: { type: Type.BOOLEAN },
                  keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
                  pageNumber: { type: Type.NUMBER },
                  presentCharacters: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyObjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sceneSecrets: { type: Type.STRING },
                },
                required: ["id", "name", "icon", "coordinates", "description", "isCurrentPageLocation", "keyEvents", "pageNumber", "presentCharacters", "keyObjects", "sceneSecrets"],
              },
            },
            characterRelationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  avatar: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING },
                  relations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        targetId: { type: Type.STRING },
                        targetName: { type: Type.STRING },
                        relationType: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ["targetId", "targetName", "relationType", "description"],
                    },
                  },
                },
                required: ["id", "name", "avatar", "role", "description", "relations"],
              },
            },
            plotTrajectory: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  pageRange: { type: Type.STRING },
                  isCurrentStage: { type: Type.BOOLEAN },
                  icon: { type: Type.STRING },
                },
                required: ["stage", "title", "description", "pageRange", "isCurrentStage", "icon"],
              },
            },
          },
          required: ["bookTitle", "currentPageNumber", "currentPageSummary", "locations", "characterRelationships", "plotTrajectory"],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) throw new Error("Empty AI response");

    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (err: any) {
    console.error("Interactive reading map API error:", err);
    const pNum = Number(req.body.currentPageNumber) || 1;
    // Fallback response tailored to page
    res.json({
      bookTitle: req.body.bookTitle || "故事童話王國",
      currentPageNumber: pNum,
      currentPageSummary: `第 ${pNum} 頁：主角踏上冒險之旅，展現出無比勇氣與好奇心。`,
      locations: [
        {
          id: "loc-1",
          name: "🌲 溫馨故事森林村",
          icon: "🌲",
          coordinates: { x: 25, y: 35 },
          description: "故事開始的地方，充滿陽光與鳥語花香的平安家園。",
          isCurrentPageLocation: pNum === 1,
          keyEvents: ["主角整理好探險行囊出發"],
          pageNumber: 1,
          presentCharacters: ["🦊 探險小狐狸", "🐿️ 熱心小松鼠"],
          keyObjects: ["🎒 勇氣背包", "📜 古老森林地圖"],
          sceneSecrets: "隱藏知識：森林村裡的清晨樹葉上有七彩露珠，據說是小精靈調製的幸運藥水喔！",
        },
        {
          id: "loc-2",
          name: "🌌 奇幻星光谷與湖畔",
          icon: "🌌",
          coordinates: { x: 55, y: 60 },
          description: "藏著魔法謎題與關鍵線索的神秘峽谷，需要冷靜思考才能通過。",
          isCurrentPageLocation: pNum > 1 && pNum < 4,
          keyEvents: ["遇見智慧導師", "獲得解決問題的金鑰匙"],
          pageNumber: 2,
          presentCharacters: ["🦊 探險小狐狸", "🦉 智慧貓頭鷹"],
          keyObjects: ["🗝️ 魔法金鑰匙", "🧭 閃耀星光指南針"],
          sceneSecrets: "隱藏知識：湖水在滿月之夜會映照出內心深處最真實的願望喔！",
        },
        {
          id: "loc-3",
          name: "🏰 故事希望金頂塔",
          icon: "🏰",
          coordinates: { x: 80, y: 30 },
          description: "冒險的最終目的地，閃耀著友誼與成長的終極成就之光。",
          isCurrentPageLocation: pNum >= 4,
          keyEvents: ["順利解開魔法謎題", "與朋友歡慶成功"],
          pageNumber: 4,
          presentCharacters: ["🦊 探險小狐狸", "🦉 智慧貓頭鷹", "🐰 熱心小兔"],
          keyObjects: ["🏆 友誼黃金獎牌", "💎 閃耀希望寶石"],
          sceneSecrets: "隱藏知識：金頂塔最高處的鐘聲響起時，會降下會飛舞的五彩糖果雪花！",
        },
      ],
      characterRelationships: [
        {
          id: "c-1",
          name: "故事主角",
          avatar: "🦊",
          role: "主角探險家",
          description: "勇於嘗試、對萬物保持善意與熱情的小勇士。",
          relations: [
            {
              targetId: "c-2",
              targetName: "智慧貓頭鷹",
              relationType: "導師與聽眾",
              description: "引導思考問題方向，適時給予溫暖鼓勵。",
            },
            {
              targetId: "c-3",
              targetName: "熱心小兔",
              relationType: "互助好夥伴",
              description: "攜手並肩解決困難，共享歡笑與喜悅。",
            },
          ],
        },
        {
          id: "c-2",
          name: "智慧貓頭鷹",
          avatar: "🦉",
          role: "智者導師",
          description: "擁有豐富的知識庫與耐心的長者。",
          relations: [
            {
              targetId: "c-1",
              targetName: "故事主角",
              relationType: "啟發點撥",
              description: "指引關鍵線索，鼓勵獨立完成考驗。",
            },
          ],
        },
      ],
      plotTrajectory: [
        {
          stage: "起因",
          title: "🌱 冒險序幕揭開",
          description: "介紹背景角色與最初發現的神奇契機。",
          pageRange: "第 1 頁",
          isCurrentStage: pNum === 1,
          icon: "🌱",
        },
        {
          stage: "發展",
          title: "🧭 啟程遇到關卡",
          description: "踏入未知的地圖，運用智慧與朋友協力探索。",
          pageRange: "第 2-3 頁",
          isCurrentStage: pNum > 1 && pNum < 4,
          icon: "🧭",
        },
        {
          stage: "高潮",
          title: "🌟 突破核心考驗",
          description: "展現最關鍵的勇氣與愛心，戰勝恐懼與危機。",
          pageRange: "第 4 頁",
          isCurrentStage: pNum >= 4,
          icon: "🌟",
        },
      ],
    });
  }
});

// 7. AI Co-Reading Room Moderator API - Guided Parent-Child/Friend Discussion & Focus Analytics
app.post("/api/gemini/coreading-moderator", async (req, res) => {
  try {
    const {
      bookTitle = "兒童繪本",
      currentPage = 1,
      pageText = "",
      userRole = "child",
      userMessage = "",
      action = "init_prompt",
    } = req.body;

    const ai = getGeminiAI();

    const roleNameMap: Record<string, string> = {
      child: "孩童",
      parent: "陪讀家長",
      friend: "共讀好友",
    };

    const currentRoleName = roleNameMap[userRole] || "參與者";

    let prompt = "";
    if (action === "init_prompt") {
      prompt = `你是一位專業、親切且富有引導力的兒童繪本共讀「AI 版主/主持人」。
當前繪本：《${bookTitle}》第 ${currentPage} 頁。
頁面故事內容：「${pageText}」。

請擔任這場「親子/好友 AI 共讀室」的版主，根據這個繪本頁面，設計一個能引發孩童與家長/好友深刻互動討論的問題與引導語。

請以 JSON 格式回應：
{
  "moderatorPrompt": "AI 版主溫馨引導問句（例如：『爸爸和孩子覺得小狐狸在這個畫面為什麼突然停下腳步呢？爸爸可以先猜猜看，孩子再補充喔！』）",
  "suggestedQuestions": ["引導問題選項 1", "引導問題選項 2", "引導問題選項 3"],
  "encouragement": "版主給予雙方共同閱讀的鼓勵或溫馨提示",
  "focusAnalysis": {
    "focusScore": 92,
    "thoughtJumpRate": 15,
    "discussionHeat": 88,
    "synergyInsight": "雙方目前互動默契絕佳，孩子專注力維持在高峰期！"
  }
}`;
    } else {
      prompt = `你是一位專業、親切且富有引導力的兒童繪本共讀「AI 版主/主持人」。
當前繪本：《${bookTitle}》第 ${currentPage} 頁。
頁面故事內容：「${pageText}」。
剛才發言的參與者是：【${currentRoleName}】，發言內容為：「${userMessage}」。

請作為 AI 共讀版主，對【${currentRoleName}】的發言給予及時的回應、讚賞與延伸引導問句，促進另一方（例如孩子或家長/好友）接著回應。

請以 JSON 格式回應：
{
  "moderatorPrompt": "AI 版主的回應與延伸引導（讚賞發言並邀請另一方表達看法）",
  "suggestedQuestions": ["延伸問題選項 1", "延伸問題選項 2"],
  "encouragement": "版主的及時正面反饋與金句",
  "focusAnalysis": {
    "focusScore": 95,
    "thoughtJumpRate": 12,
    "discussionHeat": 94,
    "synergyInsight": "此番對話激發了孩子的深度思考，思緒極為安定專注！"
  }
}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const resultText = response.text || "";
    try {
      const jsonResult = JSON.parse(resultText);
      return res.json(jsonResult);
    } catch (_e) {
      return res.json({
        moderatorPrompt: `🤖 AI 版主引導：這頁的故事真精彩！${currentRoleName}覺得故事主角接下來會怎麼做呢？`,
        suggestedQuestions: ["主角會勇敢向前走！", "尋找好朋友一起解決", "先停下來思考觀察"],
        encouragement: "非常棒的討論！持續保持好奇心與想像力！",
        focusAnalysis: {
          focusScore: 90,
          thoughtJumpRate: 18,
          discussionHeat: 85,
          synergyInsight: "專注度穩定，親子互動氛圍非常融洽！",
        },
      });
    }
  } catch (error) {
    console.error("AI Co-Reading Moderator Error:", error);
    return res.json({
      moderatorPrompt: `🤖 AI 共讀版主：歡迎來到共讀室！我們一起來看看這一頁的故事吧！大家有發現什麼有趣的畫面細節嗎？`,
      suggestedQuestions: ["我發現了隱藏的魔法線索！", "小主角的表情很有趣", "家長先分享看看"],
      encouragement: "共享閱讀時光是最好的陪伴！",
      focusAnalysis: {
        focusScore: 88,
        thoughtJumpRate: 20,
        discussionHeat: 80,
        synergyInsight: "專注度良好，建議保持熱情互動！",
      },
    });
  }
});

// 8. AI Story Context Map Generator API - Key Scene Nodes, Connections, Hidden Character Knowledge & Pace Analytics
app.post("/api/gemini/story-context-map", async (req, res) => {
  const {
    bookTitle = "兒童繪本",
    bookDescription = "",
    pages = [],
  } = req.body || {};

  try {
    const ai = getGeminiAI();

    const pagesSummaryStr = pages
      .slice(0, 8)
      .map((p: any, idx: number) => `[第 ${idx + 1} 頁]: ${p.text || ""}`)
      .join("\n");

    const prompt = `你是一位專業的童書文學專家與故事結構分析 AI。
請針對這本兒童繪本進行「故事脈絡地圖（Story Context Map）」的結構化擷取：
繪本名稱：《${bookTitle}》
繪本簡介：${bookDescription}
繪本內文片段：
${pagesSummaryStr}

請分析這本繪本的關鍵動態場景、角色關係脈絡、隱藏角色知識（趣味密碼/秘辛），並回傳 JSON 格式：
{
  "scenes": [
    {
      "id": "scene-1",
      "pageNumber": 1,
      "title": "簡短標題 (如：🌲 冒險啟程・森林村)",
      "x": 15,
      "y": 35,
      "icon": "🌲",
      "summary": "場景簡要回顧內容（1-2句）",
      "hiddenCharacterSecrets": [
        "隱藏角色知識 1（如：🦊 探險小狐狸的背包裡裝著幸運四葉草喔！）",
        "隱藏角色知識 2"
      ],
      "keyObjects": ["🎒 勇氣背包", "📜 森林地圖"],
      "emotionTag": "期待興奮"
    },
    {
      "id": "scene-2",
      "pageNumber": 2,
      "title": "簡短標題 (如：🌊 秘境探索・智慧湖)",
      "x": 50,
      "y": 65,
      "icon": "🌊",
      "summary": "場景簡要回顧內容（1-2句）",
      "hiddenCharacterSecrets": [
        "隱藏角色知識（如：🦉 智慧貓頭鷹每晚會看 100 本星光百科全書！）"
      ],
      "keyObjects": ["🗝️ 魔法鑰匙"],
      "emotionTag": "充滿好奇"
    },
    {
      "id": "scene-3",
      "pageNumber": 3,
      "title": "簡短標題 (如：🏰 圓滿達成・希望城堡)",
      "x": 85,
      "y": 30,
      "icon": "🏰",
      "summary": "場景簡要回顧內容（1-2句）",
      "hiddenCharacterSecrets": [
        "隱藏角色知識（如：🐰 熱心小兔最擅長製作溫暖的五彩彩虹糖果餅乾！）"
      ],
      "keyObjects": ["🏆 友誼獎牌"],
      "emotionTag": "溫馨感動"
    }
  ],
  "characterConnections": [
    {
      "from": "scene-1",
      "to": "scene-2",
      "relationshipLabel": "踏上尋找智慧之光的旅程"
    },
    {
      "from": "scene-2",
      "to": "scene-3",
      "relationshipLabel": "攜手解開魔法密碼圓滿攻頂"
    }
  ],
  "readingPaceAnalytics": {
    "recommendedPaceSec": 45,
    "rhythmConsistencyScore": 95,
    "focusLevel": "極佳 (Focus Peak)",
    "smartAdvice": "您的閱讀節奏非常勻稱安定，在故事轉折處給予了充分的想像 space，表現極佳！"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const resultText = response.text || "";
    try {
      const jsonResult = JSON.parse(resultText);
      return res.json(jsonResult);
    } catch (_e) {
      return res.json({
        scenes: [
          {
            id: "scene-1",
            pageNumber: 1,
            title: "🌲 冒險啟程・森林村莊",
            x: 18,
            y: 35,
            icon: "🌲",
            summary: "主角懷著滿滿勇氣從平安的森林村出發，展開探索神奇世界的旅程。",
            hiddenCharacterSecrets: [
              "🦊 探險小狐狸秘辛：隨身背包裡隨時備有七彩幸運四葉草水！",
              "🐿️ 熱心松鼠秘辛：藏在樹洞裡的松果地圖是他親手繪製的喔！"
            ],
            keyObjects: ["🎒 勇氣背包", "📜 古老地圖"],
            emotionTag: "期待"
          },
          {
            id: "scene-2",
            pageNumber: Math.min(2, pages.length),
            title: "🌊 秘境轉折・智慧湖畔",
            x: 50,
            y: 68,
            icon: "🌊",
            summary: "在湖畔偶遇智慧小夥伴，互相分享線索，順利克服第一道迷宮考驗。",
            hiddenCharacterSecrets: [
              "🦉 智慧貓頭鷹秘辛：戴著魔法眼鏡能看穿夜空中最亮的幸運星！"
            ],
            keyObjects: ["🗝️ 魔法金鑰匙", "🧭 閃耀指南針"],
            emotionTag: "探索"
          },
          {
            id: "scene-3",
            pageNumber: Math.max(1, pages.length),
            title: "🏰 圓滿高潮・希望城堡",
            x: 82,
            y: 32,
            icon: "🏰",
            summary: "大家齊心協力抵達終點城堡，體會友誼、分享與成長帶來的最美感動。",
            hiddenCharacterSecrets: [
              "🐰 熱心小兔秘辛：城堡裡最厲害的甜點大師，烤出的餅乾會閃耀光芒！"
            ],
            keyObjects: ["🏆 友誼黃金獎牌", "💎 希望寶石"],
            emotionTag: "感動"
          }
        ],
        characterConnections: [
          {
            from: "scene-1",
            to: "scene-2",
            relationshipLabel: "勇敢踏出森林探險"
          },
          {
            from: "scene-2",
            to: "scene-3",
            relationshipLabel: "合作解開魔法奧秘"
          }
        ],
        readingPaceAnalytics: {
          recommendedPaceSec: 42,
          rhythmConsistencyScore: 94,
          focusLevel: "高專注沉浸",
          smartAdvice: "閱讀節奏極為流暢，建議在關鍵轉折頁面適時停頓朗讀，享受故事餘韻！"
        }
      });
    }
  } catch (error) {
    console.error("Story Context Map Generator Error:", error);
    return res.json({
      scenes: [
        {
          id: "scene-1",
          pageNumber: 1,
          title: "🌲 繪本開端・探索開始",
          x: 20,
          y: 40,
          icon: "🌲",
          summary: "故事拉開序幕，主角展開屬於自己的精彩歷險故事。",
          hiddenCharacterSecrets: [
            "🦊 主角小祕密：身上總帶著會發光的小哨子，用來向好朋友打招呼！"
          ],
          keyObjects: ["🎒 探險包"],
          emotionTag: "啟程"
        },
        {
          id: "scene-2",
          pageNumber: Math.max(1, pages.length),
          title: "🏰 故事終章・美好結局",
          x: 80,
          y: 40,
          icon: "🏰",
          summary: "經過種種考驗後，收穫滿滿的智慧與真摯的友誼。",
          hiddenCharacterSecrets: [
            "🦉 夥伴小祕密：懂得世界上每一種小動物的語言喔！"
          ],
          keyObjects: ["🏆 勝利勳章"],
          emotionTag: "歡樂"
        }
      ],
      characterConnections: [
        {
          from: "scene-1",
          to: "scene-2",
          relationshipLabel: "攜手歷經成長轉折"
        }
      ],
      readingPaceAnalytics: {
        recommendedPaceSec: 40,
        rhythmConsistencyScore: 90,
        focusLevel: "安定專注",
        smartAdvice: "閱讀步調穩健，隨時可與親友分享閱讀心得！"
      }
    });
  }
});

// Vite Middleware for Dev or Static Server for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Children Library Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
