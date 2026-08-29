import { Book } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: {
      'zh-TW': '小王子與星空狐狸',
      en: 'The Little Prince & the Star Fox',
      ja: '星の王子さまと星空のキツネ',
      fr: 'Le Petit Prince et le Renard Étoilé',
      es: 'El Principito y el Zorro Estelar',
      de: 'Der kleine Prinz und der Sternenfuchs',
      ko: '어린 왕자와 별빛 여우',
      vi: 'Hoàng Tử Bé và Cáo Sao',
    },
    author: '安東尼·聖修伯里 (改編)',
    illustrator: '星海插畫工作室',
    originCountry: '法國',
    flag: '🇫🇷',
    ageGroup: '6-8',
    category: 'Fairy Tale',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    readCount: 12840,
    isFeatured: true,
    summary: {
      'zh-TW': '小王子離開了自己的小星球 B-612，在浩瀚的銀河中遇到一隻閃耀著金光的小狐狸，展開了一段關於友誼與愛的動人冒險。',
      en: 'The Little Prince leaves his tiny asteroid B-612 and meets a golden glowing fox in the vast galaxy, discovering the true secret of friendship.',
      ja: '小王子は小惑星B-612を旅立ち、広大な銀河で金色に輝くキツネと出会い、友情の真の秘密を発見します。',
      fr: 'Le Petit Prince quitte son astéroïde B-612 et rencontre un renard doré dans la vaste galaxie, découvrant le vrai secret de l\'amitié.',
      es: 'El Principito deja su pequeño asteroide B-612 y conoce a un zorro dorado en la vasta galaxia, descubriendo el verdadero secreto de la amistad.',
      de: 'Der kleine Prinz verlässt seinen Asteroiden B-612 und trifft in der Galaxie einen goldenen Fuchs.',
      ko: '어린 왕자가 소행성 B-612를 떠나 황금빛 여우를 만나 우정의 소중함을 배웁니다.',
      vi: 'Hoàng Tử Bé rời tiểu hành tinh B-612 và gặp chú cáo vàng lấp lánh trong dải ngân hà.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '在一座很小很小的星球上，住著一位頭髮像金穗般閃耀的小王子。這座星球上只有一座火山和一朵驕傲的玫瑰花。',
          en: 'On a tiny asteroid, there lived a Little Prince with hair shining like golden wheat. On his planet were only a small volcano and a proud rose.',
          ja: 'とても小さな星に、金色の麦穂のように光る髪の小王子が住んでいました。この星には小さな火山とプライドの高いバラが一輪ありました。',
          fr: 'Sur une toute petite planète vivait un Petit Prince aux cheveux dorés comme le blé. Il n\'y avait qu\'un volcan et une rose orgueilleuse.',
          es: 'En un planeta muy pequeño vivía un Principito con el cabello brillante como el trigo dorado. Solo había un volcán y una rosa orgullosa.',
          de: 'Auf einem winzigen Planeten lebte ein kleiner Prinz mit weizenblondem Haar.',
          ko: '아주 작은 별에 황금빛 머리카락을 가진 어린 왕자가 살고 있었습니다. 그 별에는 작은 화산 하나와 자랑스러운 장미 한 송이가 있었습니다.',
          vi: 'Trên một hành tinh rất nhỏ, có một Hoàng Tử Bé với mái tóc vàng lấp lánh như bông lúa.',
        },
        vocab: [
          { word: '星球', phonetic: 'xīng qiú', translation: 'Planet / Asteroid', definition: '宇宙中像地球一樣的星體', exampleSentence: '小王子的星球非常可愛。' },
          { word: '閃耀', phonetic: 'shǎn yào', translation: 'Shine / Sparkle', definition: '發出耀眼的光芒', exampleSentence: '星星在夜空中閃耀。' },
          { word: '火山', phonetic: 'huǒ shān', translation: 'Volcano', definition: '會噴出岩漿的山峰', exampleSentence: '小王子每天清理火山。' }
        ],
        interactivePrompt: '你覺得小王子的星球上有什麼最特別的東西呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '小王子穿過彩虹般的星雲，來到了美麗的地球。在開滿金黃小花的大草原上，他遇到了一隻尾巴像流星般閃爍的小狐狸。',
          en: 'Travelling through rainbow nebulas, the Little Prince arrived on Earth. On a meadow filled with yellow flowers, he met a fox with a starry meteor tail.',
          ja: '虹色の星雲を抜けて、小王子は美しい地球にやってきました。金色の花が咲く草原で、流星のような尾を持つキツネに出会いました。',
          fr: 'Traversant des nébuleuses arc-en-ciel, le Petit Prince arriva sur Terre. Dans une prairie fleurie, il rencontra un renard à la queue d\'étoile.',
          es: 'Viajando por nebulosas de arcoíris, el Principito llegó a la Tierra. En un prado de flores amarillas, conoció a un zorro con cola de estrella.',
          de: 'Durch Regenbogen-Nebel reiste der kleine Prinz zur Erde und traf einen Sternenfuchs.',
          ko: '무지개빛 성운을 지나 어린 왕자는 지구에 도착했습니다. 노란 꽃이 만발한 초원에서 유성 같은 꼬리를 가진 여우를 만났습니다.',
          vi: 'Băng qua những tinh vân cầu vồng, Hoàng Tử Bé đến Trái Đất và gặp chú cáo tail sao rơi.',
        },
        vocab: [
          { word: '星雲', phonetic: 'xīng yún', translation: 'Nebula', definition: '宇宙中由氣體與塵埃組成的雲狀天體', exampleSentence: '夜空中的星雲絢麗多彩。' },
          { word: '草原', phonetic: 'cǎo yuán', translation: 'Meadow / Grassland', definition: '長滿青草的廣闊平地', exampleSentence: '小狐狸在草原上嬉戲。' }
        ],
        interactivePrompt: '如果你遇到一隻會說話的小狐狸，你會想對牠說什麼？'
      },
      {
        pageNumber: 3,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '小狐狸溫柔地對小王子說：「真正重要的東西，是用眼睛看不見的，只有用心才能看得到。」小王子微笑著點了點頭。',
          en: 'The fox gently whispered: "What is essential is invisible to the eye; one sees clearly only with the heart." The Little Prince smiled and nodded.',
          ja: 'キツネは優しく言いました。「本当に大切なものは、目には見えないんだよ。心で見なくちゃ。」王子様は笑顔でうなずきました。',
          fr: 'Le renard chuchota doucement : « On ne voit bien qu\'avec le cœur. L\'essentiel est invisible pour les yeux. » Le Petit Prince sourit.',
          es: 'El zorro le susurró suavemente: "Solo con el corazón se puede ver bien; lo esencial es invisible a los ojos." El Principito sonrió.',
          de: 'Der Fuchs sprach sanft: "Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar."',
          ko: '여우가 다정하게 말했습니다. "가장 중요한 것은 눈에 보이지 않아. 마음으로 봐야만 분명하게 볼 수 있어." 어린 왕자는 미소를 지었습니다.',
          vi: 'Chú cáo thì thầm: "Người ta chỉ nhìn rõ được bằng trái tim. Những gì cốt lõi thì mắt thường không thấy được."',
        },
        vocab: [
          { word: '真正', phonetic: 'zhēn zhèng', translation: 'True / Essential', definition: '真實不虛假的事物', exampleSentence: '真正的朋友會互相陪伴。' },
          { word: '用心', phonetic: 'yòng xīn', translation: 'With Heart', definition: '使用真心與情感去感受', exampleSentence: '用心感受大自然的美好。' }
        ],
        interactivePrompt: '有什麼東西是「眼睛看不見，但用心能感受到的」呢？比如：愛、友情或溫暖。'
      }
    ]
  },
  {
    id: 'book-2',
    title: {
      'zh-TW': '三隻小豬的環保綠建築',
      en: 'The Three Little Pigs Build a Green Eco-House',
      ja: '三匹の子ぶたの節電・エコハウス',
      fr: 'Les Trois Petits Cochons Écolos',
      es: 'Los Tres Cerditos y su Casa Ecológica',
      de: 'Die drei kleinen Schweinchen und das Ökohaus',
      ko: '아기 돼지 삼형제의 친환경 에코하우스',
      vi: 'Ba Chú Heo Con Xây Nhà Xanh Eco',
    },
    author: '伊索童話改編委員會',
    illustrator: '綠色森林工作室',
    originCountry: '英國',
    flag: '🇬🇧',
    ageGroup: '3-5',
    category: 'Nature & Science',
    coverUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    readCount: 9520,
    isFeatured: true,
    summary: {
      'zh-TW': '豬大哥、豬二哥和豬小弟這次不只防大灰狼，更要一起發揮創意，利用太陽能、竹子與再生磚，建造一座節能又堅固的環保樹屋！',
      en: 'The Three Little Pigs use solar energy, bamboo, and recycled bricks to build a strong, sustainable eco-treehouse that stays cool in summer and warm in winter!',
      ja: '三匹の子ぶた達が太陽光発電や竹、リサイクルレンガを使って、強くて地球にやさしいエコハウスを完成させます！',
      fr: 'Les trois petits cochons utilisent l\'énergie solaire et le bambou pour construire une maison verte super solide !',
      es: '¡Los tres cerditos usan energía solar y bambú para construir una casa ecológica resistente y súper genial!',
      de: 'Die drei Schweinchen bauen ein umweltfreundliches, stabiles Haus mit Solarenergie.',
      ko: '아기 돼지 삼형제가 태양광 에너지와 대나무, 재활용 벽돌로 튼튼한 친환경 하우스를 만듭니다!',
      vi: 'Ba chú heo con sử dụng năng lượng mặt trời và tre để xây dựng ngôi nhà sinh thái vừa chắc chắn vừa thân thiện với môi trường.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '在陽光普照的歡樂森林裡，豬大哥喜歡睡覺，豬二哥喜歡唱歌，豬小弟則最喜歡發明新工具。有一天，他們決定蓋一棟新房子。',
          en: 'In the sunny Happy Forest, Big Pig loved napping, Middle Pig loved singing, and Little Pig loved inventing green gadgets. One day, they decided to build a house.',
          ja: '日当たりの良いハッピーの森で、長男は昼寝、次男は歌、末っ子は発明が大好きでした。ある日、新しい家を建てることにしました。',
          fr: 'Dans la forêt ensoleillée, l\'aîné aimait faire la sieste, le second chanter, et le plus jeune inventer. Ils décidèrent de construire une maison.',
          es: 'En el bosque soleado, el hermano mayor amaba la siesta, el segundo cantar y el menor inventar ecológicos. Decidieron construir una casa.',
          de: 'Im sonnigen Wald beschlossen die drei Schweinchen, ein neues Haus zu bauen.',
          ko: '햇살 가득한 행복의 숲에서 첫째 돼지는 낮잠을, 둘째 돼지는 노래를, 막내 돼지는 새로운 친환경 발명을 좋아했습니다.',
          vi: 'Trong khu rừng vui vẻ đầy nắng, ba chú heo con quyết định cùng nhau xây một ngôi nhà mới.',
        },
        vocab: [
          { word: '發明', phonetic: 'fā míng', translation: 'Invent', definition: '創造出前所未有的新事物', exampleSentence: '豬小弟發明了太陽能遙控車。' },
          { word: '陽光', phonetic: 'yáng guāng', translation: 'Sunshine', definition: '太陽發出的光芒', exampleSentence: '陽光帶來溫暖與能量。' }
        ],
        interactivePrompt: '如果你要蓋自己的房子，你會想放什麼有趣的設施呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '豬小弟拿出了藍圖說：「我們要在屋頂裝上太陽能板發電，並用堅固的竹子做支架！」大家齊心協力，蓋出了一座漂亮的綠建築。',
          en: 'Little Pig showed a blueprint: "We\'ll put solar panels on the roof and build with sturdy bamboo!" Together, they created a beautiful eco-friendly house.',
          ja: '末っ子は設計図を見せて言いました。「屋根にソーラーパネルを付けて、丈夫な竹で骨組みを作ろう！」みんなで力を合わせて素晴らしいエコハウスを建てました。',
          fr: 'Le plus jeune montra les plans : « Des panneaux solaires sur le toit et du bambou solide ! » Ils construisirent ensemble une magnifique maison verte.',
          es: 'El menor mostró el plano: "¡Pondremos paneles solares en el techo y usaremos bambú resistente!" Juntos construyeron una casa ecológica maravillosa.',
          de: 'Sie installierten Solaranlagen auf dem Dach und benutzten Stabile Bambusstäbe.',
          ko: '막내 돼지가 도면을 보여주며 말했습니다. "지붕에는 태양광 판을 설치하고, 튼튼한 대나무로 기둥을 세우자!"',
          vi: 'Chú heo út đưa ra bản thiết kế: "Chúng ta sẽ lắp tấm pin mặt trời trên mái và dựng khung bằng tre 튼튼!"',
        },
        vocab: [
          { word: '太陽能', phonetic: 'tài yáng néng', translation: 'Solar Energy', definition: '利用太陽光轉化為乾淨的電力', exampleSentence: '太陽能是非常環保的能源。' },
          { word: '齊心協力', phonetic: 'qí xīn xié lì', translation: 'Work Together', definition: '大家心思一致，共同努力', exampleSentence: '大家齊心協力完成了難關。' }
        ],
        interactivePrompt: '你知不知道太陽能是怎麼幫我們省電的呢？'
      }
    ]
  },
  {
    id: 'book-3',
    title: {
      'zh-TW': '神筆馬良與彩虹之龍',
      en: 'Ma Liang & the Rainbow Dragon',
      ja: '神筆の馬良と虹の龍',
      fr: 'Ma Liang et le Dragon Arc-en-Ciel',
      es: 'Ma Liang y el Dragón Arcoíris',
      de: 'Ma Liang und der Regenbogen-Drache',
      ko: '신기한 붓 마량과 무지개 용',
      vi: 'Mã Lương Và Cây Bút Thần Rồng Cầu Vồng',
    },
    author: '民間故事改編',
    illustrator: '水墨童畫集',
    originCountry: '中國',
    flag: '🇨🇳',
    ageGroup: '6-8',
    category: 'Culture & Heritage',
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    rating: 4.95,
    readCount: 15400,
    isFeatured: true,
    summary: {
      'zh-TW': '善良的繪畫少年馬良獲得了一支能將畫中事物變成真實的神筆。當乾旱降臨村莊，馬良揮毫畫出一條帶來甘霖的彩虹巨龍！',
      en: 'Kind-hearted young artist Ma Liang receives a magic paintbrush that brings drawings to life. When a drought strikes, he paints a glorious Rainbow Dragon to bring rain!',
      ja: '心優しい少年・馬良は描いたものが本物になる魔法の筆を手に入れます。日照りが襲った時、村を救うため虹色の龍を描きます！',
      fr: 'Le jeune Ma Liang reçoit un pinceau magique qui donne vie à ses dessins. Pour sauver son village de la sécheresse, il peint un dragon arc-en-ciel !',
      es: 'El joven Ma Liang recibe un pincel mágico que cobra vida a sus dibujos. ¡Para salvar su aldea de la sequía, dibuja un Gran Dragón Arcoíris!',
      de: 'Der hilfsbereite Junge Ma Liang bringt mit seinem Zauberpinsel Zeichnungen zum Leben.',
      ko: '착한 마량은 그림이 진짜로 살아나는 신기한 붓을 받습니다. 가뭄이 들었을 때 마량은 비를 내릴 무지개 용을 그립니다.',
      vi: 'Cậu bé Mã Lương tốt bụng có được cây bút thần vẽ gì thành nấy. Khi hạn hán tới, cậu vẽ một con Rồng Cầu Vồng mang mưa mát lành cho dân làng.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '很久很久以前，有個熱愛畫畫的小男孩叫馬良。他家境貧寒買不起筆，便用樹枝在地上畫小鳥，小鳥高興得彷彿要飛起來。',
          en: 'Long ago, a boy named Ma Liang loved drawing. Being too poor to buy brushes, he drew birds on the ground with twigs, so lively they almost flew.',
          ja: '昔々、絵を描くのが大好きな馬良という男の子がいました。筆を買うお金がなかったため、小枝で地面に小鳥を描いていました。',
          fr: 'Il y a très longtemps, un garçon nommé Ma Liang adorait dessiner. Trop pauvre pour acheter des pinceaux, il dessinait par terre avec des branches.',
          es: 'Hace mucho tiempo, un niño llamado Ma Liang amaba dibujar. Al ser pobre, dibujaba pajaritos en la tierra con ramitas.',
          de: 'Vor langer Zeit lebte der junge Ma Liang, der leidenschaftlich gerne zeichnete.',
          ko: '옛날 옛적에 그림 그리기를 아주 좋아하는 마량이라는 소년이 살고 있었습니다. 가난했던 마량은 나뭇가지로 땅에 어여쁜 새를 그렸습니다.',
          vi: 'Ngày xưa có một cậu bé tên là Mã Lương rất thích vẽ. Dù nghèo không có tiền mua bút, cậu dùng cành cây vẽ những chú chim ríu rít trên mặt đất.',
        },
        vocab: [
          { word: '貧寒', phonetic: 'pín hán', translation: 'Poor / Humble', definition: '家境生活比較清苦', exampleSentence: '馬良雖然生活貧寒，但非常努力。' },
          { word: '熱愛', phonetic: 'rè ài', translation: 'Passionate', definition: '非常熱情且真心喜愛', exampleSentence: '他熱愛大自然與繪畫。' }
        ],
        interactivePrompt: '如果你有一支神筆，第一件想畫出來的東西會是什麼？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '老仙人贈送馬良一支金色神筆。馬良在牆上畫了一條五彩斑斕的彩虹龍，巨龍眨眨眼睛，伴隨著清涼的雨滴飛上了雲霄！',
          en: 'An immortal sage gifted Ma Liang a golden magic brush. Ma Liang painted a colorful rainbow dragon on the wall—the dragon blinked and soared into the sky with refreshing rain!',
          ja: '仙人から金色の魔法の筆を授かった馬良。壁に七色の龍を描くと、龍はパチッと目を開け、恵みの雨とともに空へ飛び立ちました！',
          fr: 'Un sage immortel lui offrit un pinceau d\'or. Ma Liang dessina un dragon arc-en-ciel qui prit vie et s\'encola dans le ciel en apportant la pluie !',
          es: 'Un anciano sabio le regaló un pincel dorado. Ma Liang dibujó un dragón arcoíris que parpadeó y voló alto trayendo lluvia fresca.',
          de: 'Ma Liang zeichnete einen prächtigen Regenbogen-Drachen, der zum Leben erwachte.',
          ko: '신선이 마량에게 황금 신기한 붓을 주었습니다. 마량이 무지개 용을 그리자 용이 눈을 벅벅 비비더니 시원한 빗방울과 함께 하늘로 날아올랐습니다!',
          vi: 'Một vị tiên ông trao cho Mã Lương cây bút thần bằng vàng. Mã Lương vẽ một con rồng cầu vồng rực rỡ, con rồng vỗ cánh cất tiếng gầm mang mưa mát rượi.',
        },
        vocab: [
          { word: '彩虹', phonetic: 'cǎi hóng', translation: 'Rainbow', definition: '雨後天空中出現的七彩光弧', exampleSentence: '雨過天晴後出現了一道彩虹。' },
          { word: '雲霄', phonetic: 'yún xiāo', translation: 'Sky / Clouds', definition: '極高的天空深處', exampleSentence: '巨龍盤旋著飛上雲霄。' }
        ],
        interactivePrompt: '你喜歡彩虹上的哪一種顏色呢？'
      }
    ]
  },
  {
    id: 'book-4',
    title: {
      'zh-TW': '丑小鴨的羽毛冒險',
      en: 'The Ugly Duckling\'s Feather Journey',
      ja: 'みにくいアヒルの子と翼の冒険',
      fr: 'Le Lecon du Vilain Petit Canard',
      es: 'El Viaje de Plumas del Patito Feo',
      de: 'Das hässliche Entlein und die Reise des Schwans',
      ko: '미운 오리 새끼의 깃털 모험',
      vi: 'Hành Trình Lông Vũ Của Chú Vịt Con',
    },
    author: '安徒生 (改編)',
    illustrator: '北歐安徒生工作室',
    originCountry: '丹麥',
    flag: '🇩🇰',
    ageGroup: '3-5',
    category: 'Moral & Wisdom',
    coverUrl: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=800&auto=format&fit=crop',
    rating: 4.85,
    readCount: 11200,
    isFeatured: false,
    summary: {
      'zh-TW': '灰灰的小鴨因為外表跟別人不同而感到沮喪。經過寒冬的歷練，他發現自己其實不是鴨子，而是一隻擁有最優雅羽毛的高貴天鵝！',
      en: 'A grey little duckling feels sad for being different. After surviving the harsh winter, he looks down into the lake and discovers he is a graceful white swan!',
      ja: '灰色の小さなヒナは他と違う姿に悲しんでいました。寒い冬を乗り越えた春、湖に映った自分の姿は高貴な白鳥でした！',
      fr: 'Un caneton gris se sent triste d\'être différent. Après l\'hiver, il découvre en se miroitant dans le lac qu\'il est devenu un magnifique cygne blanc !',
      es: 'Un patito gris se siente triste por ser diferente. Tras superar el frío invierno, ¡descubre en el lago que se ha convertido en un hermoso cisne!',
      de: 'Nach einem langen Winter erkennt das kleine graue Entlein im Wasser sein Spiegelbild als wunderschöner Schwan.',
      ko: '회색 오리 새끼는 다른 오리들과 생김새가 달라 슬펐습니다. 하지만 추운 겨울을견뎌낸 후 자신이 고귀한 백조임을 알게 됩니다!',
      vi: 'Chú vịt con màu xám buồn rầu vì khác biệt. Sau mùa đông giá lạnh, chú nhìn xuống mặt hồ và kinh ngạc nhận ra mình là một chú thiên nga xinh đẹp!',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '溫暖的春天到了，農場裡的蛋一個個破殼而出。最後出來的小鴨個子特別大，羽毛灰灰黃黃的，大家覺得他長得很奇怪。',
          en: 'Warm spring arrived, and eggs on the farm hatched one by one. The last duckling was unusually big with messy grey feathers, making others laugh.',
          ja: '暖かい春が来ました。農場の卵が次々と孵化します。最後に生まれたヒナはとても大きく灰色の羽をしていて、みんなに変だと言われました。',
          fr: 'Le printemps arriva et les œufs éclosent. Le dernier caneton était très grand avec des plumes grises. Tout le monde le trouvait bizarre.',
          es: 'Llegó la primavera y los huevos eclosionaron. El último patito era grande y gris, y los demás pensaban que era muy raro.',
          de: 'Im Frühling schlüpfte das letzte Küken—groß und grau.',
          ko: '따뜻한 봄이 오자 농장의 알들이 차례로 깨어났습니다. 마지막으로 태어난 아기 오리는 덩치가 크고 회색 깃털을 가졌습니다.',
          vi: 'Mùa xuân ấm áp đến, những quả trứng nở ra. Chú vịt cuối cùng có thân hình to lớn và bộ lông xám xịt.',
        },
        vocab: [
          { word: '破殼', phonetic: 'pò ké', translation: 'Hatch', definition: '小鳥或幼蟲打破蛋殼出生', exampleSentence: '小雛鳥破殼而出了。' },
          { word: '羽毛', phonetic: 'yǔ máo', translation: 'Feather', definition: '鳥類身上用來保暖與飛行的毛', exampleSentence: '天鵝的羽毛潔白如雪。' }
        ],
        interactivePrompt: '當有人跟我們長得不一樣時，我們應該怎麼看待他們呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '當冰雪融化，春天再次降臨。小鴨低頭看著清徹的湖水，倒影中不再是醜小鴨，而是一隻展開雪白翅膀的璀璨天鵝！',
          en: 'As ice melted, spring returned. Looking down into the crystal-clear lake, he saw not an ugly duckling, but a glorious white swan spreading his wings!',
          ja: '雪が溶け、再び春が巡ってきました。清らかな湖面を覗き込むと、そこには醜いヒナではなく、雪のように真っ白な美しい白鳥が映っていました！',
          fr: 'Quand la glace fondit, le caneton regarda dans l\'eau claire. Ce n\'était plus un vilain petit canard, mais un splendide cygne aux ailes blanches !',
          es: 'Cuando el hielo se derritió, el patito se miró en el agua cristalina. ¡No era un patito feo, sino un brillante cisne blanco desplegando sus alas!',
          de: 'Im krisstallklaren Wasser sah er keinen hässlichen Vogel mehr, sondern einen prächtigen weißen Schwan!',
          ko: '얼음이 녹고 봄이 다시 찾아왔습니다. 아기 오리가 맑은 호수를 내려다보자 그 안에는 회색 오리가 아닌 순백의 날개를 펼친 아름다운 백조가 있었습니다!',
          vi: 'Khi băng tan, vịt con nhìn xuống mặt nước hồ trong veo. Chú không còn là chú vịt xám xịt mà là một chú thiên nga kiêu hãnh với đôi cánh trắng tinh!',
        },
        vocab: [
          { word: '融化', phonetic: 'róng huà', translation: 'Melt', definition: '冰雪受熱變成水', exampleSentence: '春天的陽光讓積雪融化了。' },
          { word: '倒影', phonetic: 'dào yǐng', translation: 'Reflection', definition: '水面或鏡子呈現出來的影子', exampleSentence: '清澈的湖水映出藍天倒影。' }
        ],
        interactivePrompt: '你覺得醜小鴨是靠著什麼精神度過艱難的冬天的呢？'
      }
    ]
  },
  {
    id: 'book-5',
    title: {
      'zh-TW': '太陽與月亮的傳說',
      en: 'Why the Sun & Moon Live in the Sky',
      ja: '太陽と月が空に住む理由',
      fr: 'Pourquoi le Soleil et la Lune Vivent au Ciel',
      es: 'Por Qué el Sol y la Luna Viven en el Cielo',
      de: 'Warum Sonne und Mond im Himmel wohnen',
      ko: '해와 달이 하늘에 살게 된 이유',
      vi: 'Tại Sao Mặt Trời Và Mặt Trăng Sống Trên Trời',
    },
    author: '非洲民間傳說',
    illustrator: '非洲大地圖誌',
    originCountry: '奈及利亞',
    flag: '🇳🇬',
    ageGroup: '6-8',
    category: 'Culture & Heritage',
    coverUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    readCount: 8900,
    isFeatured: false,
    summary: {
      'zh-TW': '太陽與水是大好朋友。當太陽邀請水帶著海洋生物來家裡作客時，水源源不絕湧入，把房子填得太滿，太陽和月亮只好跳上了天空！',
      en: 'Sun and Water were best friends. When Sun invited Water and all marine creatures to visit his house, the flood rose so high that Sun and Moon moved up to the sky!',
      ja: '太陽と水は親友でした。太陽が水を家に招待すると、海の水と生き物が溢れ出し、太陽と月は空へ避難することになりました！',
      fr: 'Le Soleil invita son ami l\'Océan dans sa maison. Mais l\'eau monta si haut que le Soleil et sa femme la Lune durent se réfugier au ciel !',
      es: 'El Sol invitó al Agua y a todas las criaturas marinas a su casa. ¡El agua subió tanto que el Sol y la Luna tuvieron que subir al cielo!',
      de: 'Das Wasser füllte das Haus des Sonnenkönigs, woraufhin Sonne und Mond in den Himmel stiegen.',
      ko: '태양과 물은 절친한 친구였습니다. 태양이 물과 바다 생물들을 집으로 초대하자 물이 차올라 태양과 달은 하늘로 올라갔습니다!',
      vi: 'Mặt Trời mời bạn thân là Nước cùng các sinh vật biển đến chơi nhà. Nước dâng lên quá cao khiến Mặt Trời và Mặt Trăng phải nhay lên bầu trời sống.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '在很久很久以前，太陽和月亮夫妻住在陸地上。太陽非常喜歡他的好朋友「水」，總是邀請水到家裡聊天。',
          en: 'A long time ago, Sun and his wife Moon lived on dry land. Sun was great friends with Water and often visited him by the seashore.',
          ja: 'ずっと昔、太陽と妻の月は陸に住んでいました。太陽は親友の「水」が大好きで、よく家に遊びに誘っていました。',
          fr: 'Il y a fort longtemps, le Soleil et la Lune habitaient sur Terre. Le Soleil adorait son ami l\'Eau et l\'invitait souvent.',
          es: 'Hace mucho tiempo, el Sol y la Luna vivían en la Tierra. El Sol era muy amigo del Agua y siempre la invitaba a conversar.',
          de: 'Vor langer Zeit lebten Sonne und Mond auf dem Land.',
          ko: '아주 오랜 옛날, 태양과 그의 아내 달은 땅 위에 살고 있었습니다. 태양은 물 친구를 아주 좋아해서 자주 초대를 했습니다.',
          vi: 'Ngày xửa ngày xưa, Mặt Trời và Mặt Trăng sống trên mặt đất. Mặt Trời rất mến bạn Nước và hay mời Nước ghé chơi.',
        },
        vocab: [
          { word: '邀請', phonetic: 'yāo qǐng', translation: 'Invite', definition: '禮貌地請別人來參加或訪問', exampleSentence: '太陽邀請好朋友來家裡做客。' },
          { word: '陸地', phonetic: 'lù dì', translation: 'Land / Ground', definition: '地球表面沒有被海洋覆蓋的高地', exampleSentence: '陸地上長滿了茂密的樹木。' }
        ],
        interactivePrompt: '如果你要邀請朋友到家裡，你會準備什麼熱情接待他們呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '水帶著各種閃亮的熱帶魚和海龜湧進家門。水流越升越高，直到了屋頂！太陽與月亮相視一笑，輕輕一躍，飛到了遼闊的天空中。',
          en: 'Water came with shimmering tropical fish and sea turtles. The water rose higher and higher to the roof! Sun and Moon smiled and leaped into the vast open sky.',
          ja: '水はカラフルな魚やウミガメを連れてやってきました。水面がどんどん上がり屋根まで達すると、太陽と月は空高く飛び立ちました！',
          fr: 'L\'Eau arriva avec des poissons multicolores. L\'eau monta jusqu\'au toit ! Le Soleil et la Lune sautèrent alors joyeusement dans le grand ciel.',
          es: 'El Agua llegó con peces multicolores y tortugas. El agua subió hasta el techo, ¡así que el Sol y la Luna saltaron felizmente al cielo abierto!',
          de: 'Das Wasser stieg bis zum Dach, woraufhin Sonne und Mond in den Himmel schwebten.',
          ko: '물이 알록달록한 물고기와 바다거북들과 함께 들어왔습니다. 물이 지붕까지 차오르자 태양과 달은 하늘 위로 폴짝 올라갔습니다!',
          vi: 'Nước cùng đàn cá heo và rùa biển rủ nhau tràn vào nhà. Nước dâng cao tới tận mái, Mặt Trời và Mặt Trăng liền bay lên bầu trời bao la.',
        },
        vocab: [
          { word: '湧進', phonetic: 'yǒng jìn', translation: 'Surge in', definition: '水流或人群大量地進入', exampleSentence: '涼爽的海水湧進了岸邊。' },
          { word: '遼闊', phonetic: 'liáo kuò', translation: 'Vast / Endless', definition: '寬廣無邊無際', exampleSentence: '晴朗的天空非常遼闊。' }
        ],
        interactivePrompt: '白天看到太陽，晚上看到月亮時，你會想起這個溫馨的故事嗎？'
      }
    ]
  },
  {
    id: 'book-6',
    title: {
      'zh-TW': '安徒生童話：《小人魚的海藍夢》',
      en: 'The Little Mermaid\'s Ocean Dream',
      ja: 'アンデルセン童話：人魚姫の海の夢',
      fr: 'La Petite Sirène - Le Rêve de l\'Océan',
      es: 'La Sirenita y el Sueño del Océano',
      de: 'Die kleine Meerjungfrau und der Ozeantraum',
      ko: '안데르센 동화: 인어공주의 바다 꿈',
      vi: 'Truyện Cổ Andersen: Nàng Tiên Cá Và Giấc Mơ Đại Dương',
    },
    author: '安徒生 (原著改編)',
    illustrator: '哥本哈根童話藝術館',
    originCountry: '丹麥',
    flag: '🇩🇰',
    ageGroup: '6-8',
    category: 'Fairy Tale',
    coverUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    rating: 4.96,
    readCount: 16800,
    isFeatured: true,
    summary: {
      'zh-TW': '生活在璀璨海底水晶宮殿的小人魚公主，對神秘的陸地世界充滿憧憬。當大海湧起風浪，她憑著善良與勇氣唱響愛與祝福的歌聲，展開奇幻探索！',
      en: 'Living in a shimmering crystal coral palace, the Little Mermaid longs for the world above the waves. With courage, kindness, and her magical voice, she embarks on a journey of love and wonder!',
      ja: '美しいサンゴの宮殿に暮らす人魚姫は、地上への憧れを抱いていました。優しさと勇気を胸に、愛と祝福の歌声を響かせます！',
      fr: 'Dans un palais de corail brillant, la Petite Sirène rêve du monde de la surface. Avec courage et bonté, elle entonne sa douce chanson !',
      es: 'En un palacio de coral cristalino, la Sirenita sueña con el mundo sobre las olas. Con valentía y bondad, ¡canta con su hermosa voz!',
      de: 'Die kleine Meerjungfrau lebt in einem Korallenpalast und träumt von der Welt über den Wellen.',
      ko: '반짝이는 산호 궁전에 사는 인어공주는 육지 세상에 대한 꿈을 꿉니다. 용기와 착한 마음으로 사랑을 전하는 아름다운 모험!',
      vi: 'Nàng Tiên Cá xinh đẹp sống trong cung điện san hô lung linh, mơ ước khám phá thế giới trên mặt đất tràn ngập ánh nắng.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '在藍得像甜豌豆花瓣的水底深處，住著一位歌聲最甜美的小人魚公主。她的眼眸像清澈的海洋，小魚們最喜歡繞著她跳舞。',
          en: 'Deep beneath the ocean where the water is blue as sweet pea petals lived the Little Mermaid with the sweetest singing voice. Fish danced happily around her.',
          ja: 'スイートピーの花びらのように青い海の底に、一番美しい歌声を持つ人魚姫が住んでいました。魚たちが楽しそうに周りを踊ります。',
          fr: 'Au plus profond de l\'océan bleu comme des pétale de pois de senteur vivait la Petite Sirène à la voix la plus douce.',
          es: 'En lo más profundo del océano, tan azul como los pétalos de flores, vivía la Sirenita con la voz más dulce de todas.',
          de: 'Tief im blauen Ozean lebte die kleine Meerjungfrau mit der süßesten Stimme.',
          ko: '아주 푸른 바다 깊은 곳에 가장 고운 목소리를 가진 인어공주가 살고 있었습니다. 알록달록 물고기들이 공주 주위에서 춤을 추었습니다.',
          vi: 'Sâu dưới đáy biển xanh trong như những cánh hoa, Nàng Tiên Cá cất tiếng hát trong trẻo khiến đàn cá tung tăng nhảy múa.',
        },
        vocab: [
          { word: '宮殿', phonetic: 'gōng diàn', translation: 'Palace', definition: '帝王或神仙居住的宏偉建築', exampleSentence: '海底宮殿擺滿了珍珠與珊瑚。' },
          { word: '憧憬', phonetic: 'chōng jǐng', translation: 'Longing / Yearning', definition: '對美好未來的嚮往與期望', exampleSentence: '小人魚對美好的陸地充滿憧憬。' }
        ],
        interactivePrompt: '如果你可以像小人魚一樣在海底悠游，你最想跟哪種海洋生物做朋友呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '當小人魚第一次游出水面，繁星點點的夜空與溫暖的微風讓她驚嘆不已。她明白，世界上最寶貴的是心靈的善良與對自然的熱愛。',
          en: 'Rising above the waves for the first time, she marvelled at starry night skies and warm breezes, realizing that kindness and love for nature are life\'s greatest treasures.',
          ja: '初めて水面に顔を出すと、星空と暖かい夜風に深く感動しました。彼女は心の中の優しさと自然への愛こそが宝物だと気づきました。',
          fr: 'Émergeant des vagues pour la première fois, elle fut émerveillée par les étoiles et comprit que la bonté du cœur est le plus grand trésor.',
          es: 'Al salir a la superficie por primera vez, se maravilló con el cielo estrellado y entendió que la bondad y el amor son los tesoros más valiosos.',
          de: 'Unter dem Sternenhimmel erkannte sie, dass Güte und Liebe das größte Geschenk sind.',
          ko: '처음으로 수면 위로 올라온 인어공주는 반짝이는 별자리에 감탄했습니다. 가장 소중한 것은 착한 마음이라는 것을 깨달았습니다.',
          vi: 'Lần đầu tiên nhô lên mặt nước, nàng ngỡ ngàng trước bầu trời đêm muôn ngàn vì sao lung linh và nhận ra lòng tốt là điều diệu kỳ nhất.',
        },
        vocab: [
          { word: '繁星', phonetic: 'fán xīng', translation: 'Starry sky', definition: '多得像數不清的閃耀星星', exampleSentence: '夜空中的繁星閃爍著光芒。' },
          { word: '寶貴', phonetic: 'bǎo guì', translation: 'Precious', definition: '極有價值且值得珍視', exampleSentence: '真摯的友誼是最寶貴的禮物。' }
        ],
        interactivePrompt: '你覺得海面上的夜空和海底的珊瑚世界，哪一個比較神秘呢？'
      }
    ]
  },
  {
    id: 'book-7',
    title: {
      'zh-TW': '格林童話：《糖果屋與森林小精靈》',
      en: 'Brothers Grimm: Hansel, Gretel & the Candy House',
      ja: 'グリム童話：ヘンゼルとグレーテルとお菓子の家',
      fr: 'Frères Grimm : Hansel et Gretel et la Maison en Pain d\'Épices',
      es: 'Hermanos Grimm: Hansel y Gretel y la Casa de Dulces',
      de: 'Brüder Grimm: Hänsel und Gretel im Knusperhäuschen',
      ko: '그림 형제 동화: 헨젤과 그레텔의 과자 집',
      vi: 'Truyện Cổ Grimm: Hansel, Gretel Và Ngôi Nhà Bánh Kẹo',
    },
    author: '格林兄弟 (原著改編)',
    illustrator: '黑森林童話工坊',
    originCountry: '德國',
    flag: '🇩🇪',
    ageGroup: '3-5',
    category: 'Fairy Tale',
    coverUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    rating: 4.92,
    readCount: 14200,
    isFeatured: true,
    summary: {
      'zh-TW': '韓塞爾與葛雷特兄妹在翠綠的黑森林中探險，意外找到了一座屋頂鋪滿薑餅、窗戶是透明薄荷糖的神奇小屋！他們發揮機智與合作，展開歡樂歷險！',
      en: 'Exploring the green Black Forest, Hansel and Gretel discover a magical gingerbread house with mint sugar windows! Using wits and teamwork, they enjoy a sweet adventure.',
      ja: 'ヘンゼルとグレーテルが黒い森を探検していると、お菓子でできた魔法の家を発見！知恵とチームワークで甘く楽しい冒険が始まります！',
      fr: 'Hansel et Gretel découvrent dans la Forêt-Noire une maison couverte de pain d\'épices et de bonbons ! Grâce à leur ruse, ils passent une aventure palpitante.',
      es: '¡Hansel y Gretel descubren en el bosque una casa de pan de jengibre y caramelos! Con astucia y trabajo en equipo, viven una dulce aventura.',
      de: 'Hänsel und Gretel entdecken ein Knusperhäuschen aus Lebkuchen und Zucker.',
      ko: '헨젤과 그레텔 남매가 숲속에서 달콤한 과자와 사탕으로 만들어진 신비한 집을 발견합니다! 지혜와 협동으로 펼치는 신나는 모험!',
      vi: 'Hai anh em Hansel và Gretel lạc vào rừng sâu và phát hiện ngôi nhà làm bằng bánh gừng và kẹo ngọt lung linh, cùng nhau trải qua chuyến phiêu lưu lý thú.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '陽光穿透高聳的松樹，韓塞爾沿路撒下一顆顆閃亮的小石子。突然，眼前出現一座散發香濃巧克力味的小屋，屋頂居然是甜甜的薑餅呢！',
          en: 'Sunlight filtered through tall pine trees. Hansel dropped shiny pebbles along the path. Suddenly, a house smelling of rich chocolate appeared, with gingerbread on the roof!',
          ja: '松の木の間から光が差し込みます。ヘンゼルは道に光る小石を並べました。すると香ばしいチョコレートの香りがするお菓子の家が現れました！',
          fr: 'Le soleil traversait les grands pins. Soudain, une maison au toit en pain d\'épices et parfumée au chocolat apparut devant eux !',
          es: 'La luz del sol se filtraba entre los pinos. De repente, apareció una casa con olor a chocolate y techo de pan de jengibre.',
          de: 'Mitten im Wald entdeckten sie ein Häuschen aus duftendem Lebkuchen.',
          ko: '높은 소나무 사이로 햇살이 내리쬐었습니다. 헨젤과 그레텔 앞에 달콤한 초콜릿 향이 나는 과자의 집이 나타났습니다!',
          vi: 'Ánh nắng len qua những rặng thông. Hai anh em ngỡ ngàng khi nhìn thấy ngôi nhà sực nức hương sô-cô-la thơm lừng.',
        },
        vocab: [
          { word: '薑餅', phonetic: 'jiāng bǐng', translation: 'Gingerbread', definition: '帶有薑香與蜂蜜甜味的烘焙餅乾', exampleSentence: '薑餅屋上裝飾著五彩糖果。' },
          { word: '探險', phonetic: 'tàn xiǎn', translation: 'Explore / Adventure', definition: '前往未知的環境去尋求新發現', exampleSentence: '兄妹倆在森林裡快樂探險。' }
        ],
        interactivePrompt: '如果你能用餅乾和糖果蓋一間小屋，你會用什麼甜點做門窗呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '林中的小白鳥為他們引路，善良的森林精靈送給他們滿滿一袋堅果與水果乾。兄妹倆手拉著手，踏著輕快的腳步順利回到了親愛的家。',
          en: 'A white forest bird guided their way, and friendly forest elves gave them bags of sweet nuts. Hand in hand, the siblings happily journeyed home.',
          ja: '白い鳥が道案内をし、森の妖精がたくさんのナッツをプレゼントしてくれました。二人は手を繋ぎ、大好きなわが家へ帰りました。',
          fr: 'Un petit oiseau blanc les guida, et de gentils lutins leur offertent des fruits. Les enfants rentrèrent chez eux la main dans la main.',
          es: 'Un pajarito blanco los guió y los duendes del bosque les regalaron frutas. Agarrados de la mano, regresaron felices a su hogar.',
          de: 'Ein weißer Vogel zeigte ihnen den Weg zurück nach Hause.',
          ko: '하얀 새가 길을 안내해 주고 숲속 요정이 맛있는 견과류를 선물해 주었습니다. 남매는 손을 잡고 행복하게 집으로 돌아왔습니다.',
          vi: 'Chú chim trắng dẫn đường và các vị thần rừng tặng hai anh em túi hạt thơm ngon, dẫn họ trở về nhà an toàn.',
        },
        vocab: [
          { word: '機智', phonetic: 'jī zhì', translation: 'Witty / Clever', definition: '反應敏捷且富智慧', exampleSentence: '小葛雷特憑著機智化解了困難。' },
          { word: '引路', phonetic: 'yǐn lù', translation: 'Guide way', definition: '在前面帶路指引方向', exampleSentence: '小白鳥在空中飛翔為大家引路。' }
        ],
        interactivePrompt: '當我們遇到不熟悉的環境時，要怎麼像故事裡的兄妹一樣冷靜冷靜應對呢？'
      }
    ]
  },
  {
    id: 'book-8',
    title: {
      'zh-TW': '安徒生童話：《拇指姑娘的花園之旅》',
      en: 'Andersen: Thumbelina\'s Flower Garden Journey',
      ja: 'アンデルセン童話：親指姫の花園の旅',
      fr: 'Andersen : Le Voyage de Poucet dans le Jardin Fleurie',
      es: 'Andersen: El Viaje de Pulgarcita por el Jardín',
      de: 'Andersen: Däumelinchens Reise durch den Blumengarten',
      ko: '안데르센 동화: 엄지공주의 꽃밭 여행',
      vi: 'Truyện Cổ Andersen: Hành Trình Vườn Hoa Của Nàng Ngón Tay',
    },
    author: '安徒生 (原著改編)',
    illustrator: '北歐花園圖誌',
    originCountry: '丹麥',
    flag: '🇩🇰',
    ageGroup: '3-5',
    category: 'Moral & Wisdom',
    coverUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=800&auto=format&fit=crop',
    rating: 4.88,
    readCount: 10400,
    isFeatured: false,
    summary: {
      'zh-TW': '從美麗鬱金香花朵中誕生的拇指姑娘，身材只有大拇指般精緻嬌小。她乘著睡蓮葉片與小燕子翅膀，在多彩多姿的花海中展開尋找光明與愛的旅行！',
      en: 'Born inside a magical tulip flower, tiny Thumbelina is no bigger than a thumb. Floating on lily pads and riding a Swallow\'s wing, she discovers a bright world of love.',
      ja: 'チューリップの花から生まれた小さな親指姫。スイレンの葉に乗って流れ、ツバメの翼に乗って美しい花園へ旅立ちます！',
      fr: 'Née dans une tulipe, Poucet n\'est pas plus grande qu\'un pouce. Naviguant sur un nénuphar, elle voyage vers un royaume baigné de lumière !',
      es: 'Nacida dentro de un tulipán, Pulgarcita es del tamaño de un pulgar. Navegando en un lirio y volando con una golondrina, ¡encuentra su reino de luz!',
      de: 'Aus einer Tulpe geboren, reist das winzige Däumelinchen auf einem Seerosenblatt.',
      ko: '아름다운 튤립 꽃 속에서 태어난 엄지공주. 수련 잎을 타고 제비 날개를 날며 빛과 사랑이 넘치는 꽃밭으로 여행을 떠납니다!',
      vi: 'Sinh ra từ nhụy hoa u-lip, Nàng Ngón Tay nhỏ nhắn xinh xắn cưỡi lá súng dạo chơi và cùng chú chim én bay tới vương quốc hoa tràn ngập ánh sáng.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '清晨的一滴露珠落在粉紅鬱金香上，花瓣徐徐展開，裡面坐著一位可愛的拇指姑娘。她的核桃殼小床鋪著香甜的紫羅蘭花瓣。',
          en: 'A morning dewdrop fell on a pink tulip. As petals opened, tiny Thumbelina sat inside, sleeping on a walnut shell bed cushioned with violet petals.',
          ja: '朝露がチューリップに落ちると花びらが開き、中に小さな親指姫が座っていました。クルミの殻のベッドで気持ちよさそうにお昼寝しています。',
          fr: 'Une goutte de rosée tomba sur la tulipe qui s\'ouvrit pour révéler la petite Poucet, dormant dans un lit en coquille de noix.',
          es: 'Una gota de rocío cayó sobre el tulipán. Los pétalos se abrieron y mostraron a Pulgarcita durmiendo en una cuna de cáscara de nuez.',
          de: 'In einer Tulpe schlummerte das winzige Däumelinchen in einer Nussschale.',
          ko: '이슬방울이 튤립에 떨어지자 꽃잎이 열리고 엄지공주가 나타났습니다. 호두껍질 침대에서 보라색 꽃잎을 덮고 자고 있었지요.',
          vi: 'Giọt sương mai đọng trên cánh hoa u-lip rực rỡ, cánh hoa từ từ hé nở xòe ra cô bé Nàng Ngón Tay xinh xắn ngủ ngoan trong chiếc giường vỏ hạt dẻ.',
        },
        vocab: [
          { word: '露珠', phonetic: 'lù zhū', translation: 'Dewdrop', definition: '凝結在植物花葉上的小水珠', exampleSentence: '清晨的花瓣上凝聚著晶瑩露珠。' },
          { word: '徐徐', phonetic: 'xú xú', translation: 'Slowly / Gently', definition: '緩慢悠閒地進行', exampleSentence: '微風吹拂，花瓣徐徐展開。' }
        ],
        interactivePrompt: '如果你跟拇指姑娘一樣小，看世界會有什麼不一樣的新奇體驗呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '拇指姑娘細心照顧受傷的小燕子。當春風吹起，小燕子展翅高飛，帶著拇指姑娘來到了四季常青、百花盛開的花朵王國！',
          en: 'Thumbelina kindly cared for an injured swallow. When spring arrived, the swallow spread its wings and carried her to a magical kingdom of blooming flowers!',
          ja: '親指姫は怪我をしたツバメを優しく手当てしました。春が来ると、ツバメは翼を広げ、一年中花が咲き誇る夢の王国へと案内してくれました！',
          fr: 'Poucet soigna l\'hirondelle blessée. Au printemps, l\'oiseau l\'emmena dans un royaume féerique où les fleurs ne fanaient jamais !',
          es: 'Pulgarcita cuidó con amor a una golondrina herida. Al llegar la primavera, el ave la llevó volando a un reino de flores eternas.',
          de: 'Däumelinchen pflegte eine Schwalbe, die sie im Frühling in ein wunderschönes Blumenreich flog.',
          ko: '엄지공주는 다친 제비를 온정으로 돌보아 주었습니다. 봄이 오자 제비는 은혜를 갚기 위해 영원히 꽃이 피는 왕국으로 공주를 태워주었습니다!',
          vi: 'Nàng Ngón Tay ân cần chăm sóc chú chim én bị thương. Khi mùa xuân đến, chim én chao cánh đưa nàng tới vương quốc hoa thơm ngát.',
        },
        vocab: [
          { word: '盛開', phonetic: 'shèng kāi', translation: 'In full bloom', definition: '花朵完全開放出美麗姿態', exampleSentence: '花園裡百花盛開，吸引無數蝴蝶。' },
          { word: '關懷', phonetic: 'guān huái', translation: 'Caring / Compassion', definition: '充滿溫情地關心與照顧', exampleSentence: '拇指姑娘用無私的關懷治癒了小燕子。' }
        ],
        interactivePrompt: '你是否也曾經照顧過受傷的小動物或植物呢？感覺如何？'
      }
    ]
  },
  {
    id: 'book-9',
    title: {
      'zh-TW': '安徒生童話：《賣火柴的小女孩》',
      en: 'Andersen: The Little Match Girl',
      ja: 'アンデルセン童話：マッチ売りの少女',
      fr: 'Andersen : La Petite Fille aux Allumettes',
      es: 'Andersen: La Pequeña Cerillera',
      de: 'Andersen: Das kleine Mädchen mit den Schwefelhölzern',
      ko: '안데르센 동화: 성냥팔이 소녀',
      vi: 'Truyện Cổ Andersen: Cô Bé Bán Diêm',
    },
    author: '漢斯·克里斯汀·安徒生 (原著改編)',
    illustrator: '北歐星火童話繪館',
    originCountry: '丹麥',
    flag: '🇩🇰',
    ageGroup: '6-8',
    category: 'Moral & Wisdom',
    coverUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=800&auto=format&fit=crop',
    rating: 4.97,
    readCount: 18920,
    isFeatured: true,
    summary: {
      'zh-TW': '在寒冷的除夕夜，小女孩在街頭點燃一根根神奇的火柴。火光中映照出溫暖的火爐、香噴噴的烤鵝與最慈祥的祖母，為人間帶來愛與永恆的希望。',
      en: 'On a cold New Year\'s Eve, a little girl lights magical matches. In each warm flame, she sees cozy stoves, delicious feasts, and her loving grandmother bringing eternal peace.',
      ja: '大晦日の寒い夜、少女が擦ったマッチの炎から暖かい暖炉や優しいおばあさんの幻影が現れ、希望と愛に満ちた奇跡を伝えます。',
      fr: 'Par une froide nuit de réveillon, une fillette allume des allumettes magiques. Chaque flamme révèle la chaleur du foyer et l\'amour de sa grand-mère.',
      es: 'En una fría Nochevieja, una niña enciende fósforos mágicos que iluminan visiones de calor hogareño y el amor protector de su abuelita.',
      de: 'In einer kalten Silvesternacht entzündet ein kleines Mädchen Hölzchen, die ihr wundersame Bilder von Wärme und Liebe schenken.',
      ko: '추운 섣달그믐날 밤, 소녀가 성냥을 켤 때마다 따뜻한 난로와 자애로운 할머니의 사랑이 환하게 빛납니다.',
      vi: 'Vào đêm giao thừa giá rét, cô bé quẹt từng que diêm thần kỳ tỏa ánh sáng ấm áp, hiện lên hình ảnh người bà hiền từ tràn ngập tình yêu thương.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '除夕夜的大街上飄著紛紛白雪，小女孩走在靜謐的街道上。她的手凍得通紅，輕輕擦亮了第一根火柴。',
          en: 'Snowflakes fluttered on the quiet street on New Year\'s Eve. With chilly hands, the little girl gently struck her very first match.',
          ja: '大晦日の静かな街に白い雪が舞い散ります。冷たい手で、少女はそっと最初の一本のマッチを擦りました。',
          fr: 'Les flocons de neige dansaient dans la rue silencieuse. Les mains glacées, la fillette craqua doucement sa première allumette.',
          es: 'La nieve caía suavemente en la víspera de Año Nuevo. Con sus manitas frías, la niña encendió con cuidado el primer fósforo.',
          de: 'Flocken tanzten durch die stille Straße, als das Mädchen behutsam das erste Hölzchen entzündete.',
          ko: '섣달그믐날 밤 조용한 거리에 흰 눈이 소복소복 내렸습니다. 소녀는 얼어붙은 손으로 첫 번째 성냥을 조심스레 켰습니다.',
          vi: 'Những bông tuyết trắng nhẹ nhàng rơi trên con phố tĩnh lặng đêm giao thừa. Cô bé run run quẹt que diêm đầu tiên.',
        },
        vocab: [
          { word: '除夕', phonetic: 'chú xī', translation: 'New Year\'s Eve', definition: '一年中的最後一個夜晚', exampleSentence: '除夕夜家家戶戶燈火通明。' },
          { word: '靜謐', phonetic: 'jìng mì', translation: 'Quiet / Tranquil', definition: '安靜祥和的狀態', exampleSentence: '雪夜的城鎮顯得格外靜謐。' },
          { word: '火柴', phonetic: 'huǒ chái', translation: 'Matchstick', definition: '用來取火的引火小木棒', exampleSentence: '點燃火柴發出微弱而溫暖的光芒。' }
        ],
        interactivePrompt: '當你在寒冷的天氣裡，最能讓你感到溫暖的是什麼事物呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '火光發出溫暖的金光，彷彿一個舒適的壁爐在劈啪作響。當第二根火柴亮起時，桌上擺滿了香甜的蘋果和晶瑩的聖誕樹！',
          en: 'The flame glowed like a cozy fireplace crackling softly. As the second match shone, a feast of sweet apples and a sparkling Christmas tree appeared!',
          ja: 'パチパチと暖炉が燃えるような温かい光。二本目のマッチを擦ると、甘いリンゴとキラキラ光るクリスマスツリーが浮かび上がりました！',
          fr: 'La flamme brillait d\'une douce chaleur dorée. À la deuxième allumette, un magnifique sapin de Noël scintillant apparut devant elle !',
          es: 'La llama brillaba con un resplandor dorado. ¡Al encender el segundo fósforo, vio una mesa festiva y un árbol de Navidad resplandeciente!',
          de: 'Ein goldener Schein erwärmte sie, und im Licht tanzten Bilder von einem leuchtenden Weihnachtsbaum.',
          ko: '타닥타닥 따뜻한 벽난로처럼 포근한 금빛 불꽃이 피어올랐습니다. 성냥 불빛 속에서 반짝이는 크리스마스트리가 환하게 빛났습니다.',
          vi: 'Ngọn lửa tỏa ánh vàng ấm áp như chiếc lò sưởi. Que diêm thứ hai bừng sáng hiện ra cây thông Noel rực rỡ muôn màu.',
        },
        vocab: [
          { word: '壁爐', phonetic: 'bì lú', translation: 'Fireplace', definition: '鑲嵌在牆壁中燃燒木柴取暖的爐子', exampleSentence: '壁爐裡的木炭散發著融融暖意。' },
          { word: '晶瑩', phonetic: 'jīng yíng', translation: 'Sparkling / Crystal', definition: '光亮透明的美好樣子', exampleSentence: '聖誕樹上的水晶球晶瑩剔透。' }
        ],
        interactivePrompt: '如果你能點燃一根魔法火柴，你最想看到什麼美麗的景象？'
      },
      {
        pageNumber: 3,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '女孩擦亮了整束火柴，天空中升起一顆閃耀的流星。慈祥的祖母張開雙臂，帶著無盡的溫柔與微笑，擁抱著女孩飛向充滿光明與幸福的星空。',
          en: 'She lit the whole bundle of matches, and a bright shooting star crossed the sky. Her kind grandmother opened her arms with boundless love, guiding her to the starry heavens.',
          ja: '残りのマッチをすべて灯すと、流れ星が空を渡りました。優しいおばあさんが両手を広げ、愛と光に包まれた星空へと導いてくれました。',
          fr: 'Elle alluma tout le paquet, et une étoile filante traversa le ciel. Sa tendre grand-mère lui ouvrit les bras et l\'emmena vers la lumière éternelle.',
          es: 'Encendió todo el manojo y una estrella fugaz cruzó el cielo. Su amorosa abuelita la abrazó con dulzura, llevándola a un reino de paz y luz.',
          de: 'Eine Sternschnuppe zog über den Himmel, als die liebevolle Großmutter sie zärtlich in ihre Arme schloss.',
          ko: '소녀가 성냥 묶음을 모두 켜자 반짝이는 유성이 하늘을 수놓았습니다. 다정한 할머니가 팔을 벌려 따뜻한 사랑으로 소녀를 안아주었습니다.',
          vi: 'Cô bé quẹt hết cả bao diêm, một ngôi sao băng vụt sáng trên trời. Người bà hiền hậu mỉm cười dang rộng vòng tay đón cô bé vào cõi bình yên tràn ngập tình thương.',
        },
        vocab: [
          { word: '流星', phonetic: 'liú xīng', translation: 'Shooting star / Meteor', definition: '在夜空中劃過一道光亮的星體', exampleSentence: '看到流星時，大家許下了美好的願望。' },
          { word: '慈祥', phonetic: 'cí xiáng', translation: 'Kind / Loving', definition: '長輩和藹安詳充滿愛心', exampleSentence: '老祖母的眼神非常慈祥溫和。' }
        ],
        interactivePrompt: '這個故事教會了我們關心身邊需要幫助的人，你想對身邊的人送上什麼溫暖的祝福呢？'
      }
    ]
  },
  {
    id: 'book-10',
    title: {
      'zh-TW': '王爾德童話：《快樂王子與小燕子》',
      en: 'Oscar Wilde: The Happy Prince & the Swallow',
      ja: 'オスカー・ワイルド童話：幸福の王子とツバメ',
      fr: 'Oscar Wilde : Le Prince Heureux et l\'Hirondelle',
      es: 'Oscar Wilde: El Príncipe Feliz y la Golondrina',
      de: 'Oscar Wilde: Der glückliche Prinz und die Schwalbe',
      ko: '오스카 와일드 동화: 행복한 왕자와 제비',
      vi: 'Truyện Cổ Oscar Wilde: Hoàng Tử Hạnh Phúc Và Chim Én',
    },
    author: '奧斯卡·王爾德 (原著改編)',
    illustrator: '英倫翡翠彩繪館',
    originCountry: '愛爾蘭',
    flag: '🇮🇪',
    ageGroup: '6-8',
    category: 'Friendship & Love',
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
    rating: 4.98,
    readCount: 19800,
    isFeatured: true,
    summary: {
      'zh-TW': '高高佇立在城市中央的快樂王子雕像，身上覆蓋著純金葉片與閃亮紅寶石。為了幫助城裡貧困受苦的人們，他與一隻勇敢善良的小燕子攜手送出所有珍寶，譜寫出最純淨無私的愛之頌歌。',
      en: 'High above the city stands the statue of the Happy Prince, covered in gold leaf with a glowing ruby sword. With the help of a loyal swallow, he gives away all his riches to comfort the poor and spread true happiness.',
      ja: '街を見下ろす幸福の王子の像は、困っている人びとを助けるため、心優しいツバメと共に自らの金箔や宝石を分け与えます。真実の無償の愛の物語。',
      fr: 'Du haut de son piédestal, la statue du Prince Heureux voit la misère de la ville. Aidé d\'une hirondelle fidèle, il fait don de son or et de ses rubis pour soulager les pauvres.',
      es: 'En lo alto de la ciudad, la estatua del Príncipe Feliz se despoja de su oro y zafiros con la ayuda de una noble golondrina para ayudar a los necesitados.',
      de: 'Der glückliche Prinz schenkt mit Hilfe einer treuen Schwalbe all sein Gold und seine Edelsteine den Armen der Stadt.',
      ko: '도시 높은 곳에 서 있는 행복한 왕자 동상은 착한 제비와 함께 자신의 금박과 보석을 가난한 이웃들에게 나누어 주며 가장 숭고한 사랑을 실천합니다.',
      vi: 'Bức tượng Hoàng Tử Hạnh Phúc đứng sừng sững giữa quảng trường, cùng chú chim én trung thành đem tặng từng miếng vàng và ngọc quý cho những người nghèo khổ.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '城市的廣場高處矗立著快樂王子的雕像。他全身貼滿薄薄的純金箔，雙眼是兩顆深藍的藍寶石，劍柄上更鑲嵌著一顆璀璨的紅寶石。',
          en: 'High above the city stood the statue of the Happy Prince, gilded all over with fine gold leaf. His eyes were bright blue sapphires, and a large ruby glowed on his sword hilt.',
          ja: '街の中心の台座の上に、幸福な王子の像が立っていました。全身が純金の箔で覆われ、瞳には青いサファイア、剣には真っ赤なルビーが輝いていました。',
          fr: 'Au sommet de la ville se dressait la statue du Prince Heureux, recouverte de feuilles d\'or pur. Ses yeux étaient deux saphirs étincelants et son épée portait un rubis éclatant.',
          es: 'En lo alto de la plaza se alzaba la estatua del Príncipe Feliz, cubierta de finas hojas de oro. Sus ojos eran zafiros azules y un rubí brillaba en su espada.',
          de: 'Hoch über der Stadt glänzte die Statue des glücklichen Prinzen im reinsten Blattgold.',
          ko: '도시 높은 광장에 행복한 왕자의 동상이 서 있었습니다. 온몸은 얇은 순금박으로 덮여 있고, 두 눈은 푸른 사파이어, 칼자루에는 붉은 루비가 찬란하게 빛났습니다.',
          vi: 'Trên đài cao giữa quảng trường là bức tượng Hoàng Tử Hạnh Phúc, toàn thân dát vàng lá lộng lẫy, hai mắt là ngọc bích xanh biếc và chuôi kiếm nạm viên hồng ngọc rực rỡ.',
        },
        vocab: [
          { word: '雕像', phonetic: 'diāo xiàng', translation: 'Statue', definition: '用石、木或金屬雕刻鑄造的人像', exampleSentence: '廣場中央聳立著宏偉的雕像。' },
          { word: '璀璨', phonetic: 'cuǐ càn', translation: 'Dazzling / Brilliant', definition: '光彩奪目非常耀眼', exampleSentence: '王子的紅寶石散發出璀璨光澤。' }
        ],
        interactivePrompt: '你覺得「真正的快樂」是來自擁有許多珠寶，還是幫助別人呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '一隻飛往南方過冬的小燕子停在王子腳下休息。王子流下眼淚，請求小燕子將劍柄上的紅寶石送給生病的孩子，把藍寶石送給寒夜裡寫作的青年。',
          en: 'A little swallow rested at the Prince\'s feet. Weeping for the city\'s sorrow, the Prince asked the swallow to bring his ruby to a sick child and his sapphire to a cold young writer.',
          ja: '南へ渡る途中のツバメが王子の足元で羽を休めました。王子は涙を浮かべ、病気の子どもや貧しい青年に宝石を届けてほしいと頼みました。',
          fr: 'Une petite hirondelle se posa aux pieds du Prince. Ému par la détresse des pauvres, le Prince lui demanda de porter ses joyaux à un enfant malade et à un jeune écrivain.',
          es: 'Una pequeña golondrina descansó a los pies del Príncipe. Conmovido por el sufrimiento de la gente, el Príncipe le pidió llevar sus joyas a los más necesitados.',
          de: 'Eine kleine Schwalbe brachte auf Bitten des Prinzen die Edelsteine zu den notleidenden Menschen.',
          ko: '남쪽으로 날아가던 작은 제비가 왕자의 발밑에 내려앉았습니다. 왕자는 눈물을 흘리며 아픈 아이와 가난한 작가에게 보석을 전해달라고 부탁했습니다.',
          vi: 'Một chú chim én nhỏ bay ngang qua ghé chân nghỉ. Hoàng Tử rơi lệ, nhờ chim én gắp viên hồng ngọc tặng em bé ốm và viên ngọc bích cho chàng nhà văn nghèo.',
        },
        vocab: [
          { word: '奉獻', phonetic: 'fèng xiàn', translation: 'Dedicate / Give selflessly', definition: '毫無保留地付出與給予', exampleSentence: '王子無私的奉獻溫暖了整座城市。' },
          { word: '忠誠', phonetic: 'zhōng chéng', translation: 'Loyal / Faithful', definition: '真心誠意且堅定不移', exampleSentence: '小燕子忠誠地陪伴在王子身邊。' }
        ],
        interactivePrompt: '如果你是一隻小燕子，當看到別人需要幫助時，你會願意留下來幫忙嗎？'
      },
      {
        pageNumber: 3,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '雖然王子的外表不再閃亮金黃，但他的鉛心與小燕子的愛成了世間最珍貴的寶物。天使從天而降，將他們帶進了永遠開滿繁花的金色樂園。',
          en: 'Though the Prince lost his golden luster, his steadfast heart and the swallow\'s noble love became the most precious treasures on Earth, carried by angels to Paradise.',
          ja: '黄金の輝きを失った王子の像とツバメの深い友情は、天使によって天上の楽園へと運ばれ、永遠に祝福されました。',
          fr: 'Même dépouillé de son or, le cœur pur du Prince et l\'hirondelle devinrent les plus beaux trésors du monde, accueillis au Paradis par les anges.',
          es: 'Aunque el Príncipe perdió su brillo de oro, su noble corazón y la golondrina fueron llevados por ángeles al Jardín Eterno por su inmenso amor.',
          de: 'Die Engel brachten das Herz des Prinzen und die treue Schwalbe in das ewige Paradies.',
          ko: '비록 왕자의 금빛 옷은 사라졌지만, 왕자의 진실한 마음과 제비의 헌신은 세상에서 가장 귀한 보물이 되어 영원한 낙원으로 인도되었습니다.',
          vi: 'Dẫu bức tượng không còn dát vàng rực rỡ, nhưng trái tim nhân hậu của Hoàng Tử và tình bạn cao đẹp của chim én đã trở thành báu vật được các thiên thần đưa về thiên đàng.',
        },
        vocab: [
          { word: '珍貴', phonetic: 'zhēn guì', translation: 'Precious / Invaluable', definition: '極有價值值得珍惜保護', exampleSentence: '發自內心的愛比任何黃金都更珍貴。' },
          { word: '樂園', phonetic: 'lè yuán', translation: 'Paradise', definition: '充滿和平、歡樂與愛的美好地方', exampleSentence: '鳥語花香的樂園充滿祥和。' }
        ],
        interactivePrompt: '這個故事給了你什麼樣的感動呢？分享你心中最珍貴的寶物吧！'
      }
    ]
  },
  {
    id: 'book-11',
    title: {
      'zh-TW': '佩羅童話：《穿長靴的機智貓》',
      en: 'Charles Perrault: Puss in Boots',
      ja: 'ペロー童話：長靴をはいた猫',
      fr: 'Charles Perrault : Le Chat Botté',
      es: 'Charles Perrault: El Gato con Botas',
      de: 'Charles Perrault: Der gestiefelte Kater',
      ko: '샤를 페로 동화: 장화 신은 고양이',
      vi: 'Truyện Cổ Perrault: Chú Mèo Đi Hia',
    },
    author: '夏爾·佩羅 (原著改編)',
    illustrator: '凡爾賽故事畫舫',
    originCountry: '法國',
    flag: '🇫🇷',
    ageGroup: '6-8',
    category: 'Adventure',
    coverUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
    rating: 4.91,
    readCount: 13500,
    isFeatured: false,
    summary: {
      'zh-TW': '一隻穿著帥氣皮長靴的聰明貓咪，憑著無比的機智與勇氣，幫助貧窮的主人化險為夷，贏得國王的尊敬與公主的芳心！',
      en: 'A clever cat wearing splendid leather boots uses his wit and courage to help his poor master overcome challenges, earning the King\'s admiration.',
      ja: 'おしゃれな長靴をはいた賢い猫が、機転と知恵で貧しい主人を助け、幸せな未来を切り開く痛快な冒険物語！',
      fr: 'Chausse de belles bottes, un chat plein d\'astuce et de courage utilise toute son ingéniosité pour faire la fortune de son jeune maître.',
      es: 'Un ingenioso gato con botas de cuero ayuda a su humilde dueño a superar todos los obstáculos con astucia y valentía.',
      de: 'Mit schnellen Stiefeln und schlauem Verstand verhilft der Kater seinem armen Müllersohn zu Glück und Ansehen.',
      ko: '멋진 장화를 신은 영리한 고양이가 번뜩이는 지혜와 용기로 가난한 주인을 도와 행복을 선물합니다!',
      vi: 'Chú mèo thông minh đi đôi hia da tuyệt đẹp dùng mưu trí và lòng dũng cảm giúp đỡ người chủ nghèo trở nên giàu có và hạnh phúc.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '磨坊主人的小兒子只分到了一隻貓咪。貓咪拍拍胸脯自信地說：「主人，請給我一雙皮長靴和一個布袋，我會為您帶來意想不到的驚喜！」',
          en: 'A poor miller\'s son inherited only a cat. The cat tapped his chest proudly and said: "Master, give me a pair of sturdy boots and a bag, and you will see wonders!"',
          ja: '粉屋の末息子は一匹の猫だけを受け継ぎました。猫は胸を張って言いました。「ご主人様、私に革の長靴と袋をください。きっと素晴らしい幸運をお届けします！」',
          fr: 'Le jeune fils de meunier n\'hérita que d\'un chat. Mais le chat s\'écria : « Donnez-moi une paire de bottes et un sac, et vous verrez ma bravoure ! »',
          es: 'El hijo menor del molinero solo heredó un gato. El gato le dijo con orgullo: "¡Amo, deme un par de botas y un saco, y verá qué gran fortuna le consigo!"',
          de: 'Der Müllersohn erbte nur einen Kater, der ihm stolz versprach: "Besorge mir Stiefel und einen Sack, und du wirst dein Glück finden!"',
          ko: '방앗간 집 셋째 아들은 고양이 한 마리만 물려받았습니다. 고양이는 당당하게 말했습니다. "주인님, 장화 한 켤레와 자루 하나만 주시면 큰 행운을 드리겠습니다!"',
          vi: 'Người con út nghèo chỉ được thừa kế một chú mèo. Chú mèo tự tin bảo: "Chủ nhân hãy cho tôi một đôi hia và một cái túi, tôi sẽ đem đến bất ngờ tuyệt vời!"',
        },
        vocab: [
          { word: '長靴', phonetic: 'cháng xuē', translation: 'Boots', definition: '高至小腿或膝蓋的堅固鞋子', exampleSentence: '穿上長靴的小貓顯得神氣十足。' },
          { word: '自信', phonetic: 'zì xìn', translation: 'Confidence', definition: '對自己的能力充滿信心', exampleSentence: '保持自信能幫助我們克服未知挑戰。' }
        ],
        interactivePrompt: '如果你的寵物突然會說話，你希望牠和你一起做什麼冒險？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '穿上長靴的貓咪敏捷地穿梭在森林與宮殿之間。他運用聰明才智化解了城堡巨人的危機，讓主人住進了宏偉的城堡，大家歡欣慶祝！',
          en: 'Wearing his fine boots, the clever cat leaped gracefully between forests and palaces. With sharp wit, he outsmarted the castle ogre and won great honor for his master!',
          ja: '長靴をはいた猫は森と城を軽やかに駆け巡ります。機転を利かせてお城の巨人を翻弄し、主人を立派な城主へと導いて大歓声を浴びました！',
          fr: 'Chausse de ses bottes, le chat rusé triompha du puissant ogre par son esprit brillant et offrit un magnifique château à son maître.',
          es: 'Con sus botas, el gato burló al gigante del castillo con gran astucia, logrando que su amo fuera aclamado y feliz.',
          de: 'Mit Klugheit und Mut überlistete der gestiefelte Kater den Riesen und schenkte seinem Herrn ein prächtiges Schloss.',
          ko: '장화를 신은 고양이는 숲과 궁전을 누비며 번뜩이는 재치로 거인을 물리치고, 주인을 멋진 성의 주인으로 만들어 환호를 받았습니다!',
          vi: 'Mang hia trên chân, chú mèo thoăn thoắt vượt rừng vào lâu đài, dùng mưu trí đánh bại gã khổng lồ mang lại vinh quang cho người chủ.',
        },
        vocab: [
          { word: '敏捷', phonetic: 'mǐn jié', translation: 'Agile / Nimble', definition: '動作靈巧迅速敏銳', exampleSentence: '小貓步伐敏捷地躍上高牆。' },
          { word: '才智', phonetic: 'cái zhì', translation: 'Wit / Intelligence', definition: '聰敏的才華與智慧', exampleSentence: '運用才智可以化解許多棘手難題。' }
        ],
        interactivePrompt: '你覺得面對困難時，力氣重要還是智慧更重要呢？'
      }
    ]
  },
  {
    id: 'book-12',
    title: {
      'zh-TW': '科洛迪童話：《小木偶皮諾丘奇遇記》',
      en: 'Carlo Collodi: The Adventures of Pinocchio',
      ja: 'コッローディ童話：ピノキオの冒険',
      fr: 'Carlo Collodi : Les Aventures de Pinocchio',
      es: 'Carlo Collodi: Las Aventuras de Pinocho',
      de: 'Carlo Collodi: Die Abenteuer des Pinocchio',
      ko: '콜로디 동화: 피노키오의 모험',
      vi: 'Truyện Cổ Collodi: Những Cuộc Phiêu Lưu Của Pinocchio',
    },
    author: '卡洛·科洛迪 (原著改編)',
    illustrator: '義大利托斯卡納木雕館',
    originCountry: '義大利',
    flag: '🇮🇹',
    ageGroup: '3-5',
    category: 'Moral & Wisdom',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    rating: 4.93,
    readCount: 16200,
    isFeatured: true,
    summary: {
      'zh-TW': '由老木匠雕刻出的小木偶皮諾丘，只要一說謊鼻子就會變長。在藍仙女與良心蟋蟀的引導下，皮諾丘學會誠實、勇敢與孝順，最終蛻變成真正的人類小男孩！',
      en: 'Carved by woodcarver Geppetto, puppet Pinocchio\'s nose grows longer whenever he tells a lie. Learning honesty, courage, and love, he finally becomes a real boy!',
      ja: '優しいおじいさんに作られた木の人形ピノキオ。嘘をつくと鼻が伸びてしまいます。誠実と勇気を学び、本当の人間の男の子へと成長します！',
      fr: 'Façonné par Geppetto, le pantin Pinocchio voit son nez s\'allonger à chaque mensonge. En apprenant la sincérité et le courage, il devient un vrai petit garçon !',
      es: 'Tallado en madera por Gepetto, a Pinocho le crece la nariz cuando miente. Aprendiendo honestidad y valentía, ¡se convierte en un niño de verdad!',
      de: 'Die Holzpuppe Pinocchio lernt durch viele Abenteuer, ehrlich und mutig zu sein, bis sie ein echter Junge wird.',
      ko: '제페토 할아버지가 만든 나무 인형 피노키오. 거짓말을 하면 코가 쑥 길어집니다. 정직과 사랑을 배워 진짜 소년으로 변신합니다!',
      vi: 'Chú rối gỗ Pinocchio do bác thợ mộc Geppetto đẽo gọt, mỗi khi nói dối thì mũi lại dài ra. Nhờ học được tính trung thực và lòng hiếu thảo, chú đã trở thành một cậu bé thật sự.',
    },
    pages: [
      {
        pageNumber: 1,
        illustrationUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '老木匠蓋比特用神奇的木頭雕刻出一個活靈活現的小木偶，取名叫皮諾丘。藍仙女揮動魔杖賦予他生命，並叮嚀他要做一個誠實勇敢的好孩子。',
          en: 'Kindly woodcarver Geppetto carved a lively puppet named Pinocchio from magical wood. The Blue Fairy touched him with her wand, encouraging him to be honest and brave.',
          ja: '心優しいジェペットおじいさんが魔法の木からピノキオを作りました。青い妖精が命を吹き込み、「正直で勇敢な子になりなさい」と約束しました。',
          fr: 'Geppetto sculpta un pantin de bois magique nommé Pinocchio. La Fée Bleue lui donna vie en lui rappelant d\'être sincère et courageux.',
          es: 'Gepetto talló con amor un muñeco de madera al que llamó Pinocho. El Hada Azul le dio vida y le aconsejó ser siempre sincero y valiente.',
          de: 'Meister Geppetto schnitzte die Holzpuppe Pinocchio, der von der blauen Fee Leben geschenkt wurde.',
          ko: '제페토 할아버지는 신비한 나무로 피노키오를 만들었습니다. 푸른 요정이 마법 지팡이로 생명을 불어넣으며 정직한 아이가 되라고 격려했습니다.',
          vi: 'Bác thợ mộc Geppetto đẽo một chú rối gỗ đáng yêu đặt tên là Pinocchio. Cô tiên xanh vung đũa phép ban cho chú sự sống và dặn dò chú luôn thành thật.',
        },
        vocab: [
          { word: '活靈活現', phonetic: 'huó líng huó xiàn', translation: 'Vivid / Lifelike', definition: '生動逼真彷彿活的一樣', exampleSentence: '雕刻出來的木偶活靈活現十分生動。' },
          { word: '魔杖', phonetic: 'mó zhàng', translation: 'Magic wand', definition: '童話中施展魔法的奇妙手杖', exampleSentence: '仙女揮動魔杖點亮了繁星。' }
        ],
        interactivePrompt: '為什麼說實話是世界上最棒的美德之一呢？'
      },
      {
        pageNumber: 2,
        illustrationUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
        text: {
          'zh-TW': '皮諾丘為了拯救落入大鯨魚肚子裡的爸爸，鼓起全部勇氣游進深海，點燃木柴生煙順利救出爸爸。藍仙女微笑著將他變成了真正的健康小男孩！',
          en: 'To rescue his father from the giant whale, brave Pinocchio swam into the deep sea. Touched by his love and honesty, the Blue Fairy turned him into a real boy!',
          ja: '巨大なクジラのお腹に閉じ込められたお父さんを救うため、ピノキオは勇気を出して海へ飛び込みました。その誠実な心に感動した妖精が、彼を本当の男の子にしてくれました！',
          fr: 'Pour sauver son père de la baleine géante, Pinocchio fit preuve d\'un grand courage. Émue par son amour, la Fée Bleue le transforma en un vrai petit garçon !',
          es: 'Para salvar a su padre de la ballena, Pinocho nadó con valentía. El Hada Azul, conmovida por su amor filial, ¡lo convirtió en un niño de carne y hueso!',
          de: 'Durch seinen Mut und seine Liebe rettete Pinocchio seinen Vater und wurde in einen echten Jungen verwandelt.',
          ko: '거대한 고래 배 속에 갇힌 아버지를 구하기 위해 피노키오는 용기를 내어 바다로 뛰어들었습니다. 효심과 용기에 감동한 푸른 요정이 피노키오를 진짜 사람 소년으로 만들어 주었습니다!',
          vi: 'Để cứu bác Geppetto khỏi bụng cá voi khổng lồ, Pinocchio đã dũng cảm lặn xuống biển sâu. Cảm động trước lòng hiếu thảo, cô tiên xanh đã biến chú thành một cậu bé bằng da bằng thịt!',
        },
        vocab: [
          { word: '勇氣', phonetic: 'yǒng qì', translation: 'Courage / Bravery', definition: '不畏懼危險克服困難的氣魄', exampleSentence: '皮諾丘鼓起勇氣救出了最愛的爸爸。' },
          { word: '蛻變', phonetic: 'tuì biàn', translation: 'Transform / Metamorphosis', definition: '從原本的樣貌轉變為更美好的存在', exampleSentence: '經歷考驗後，小木偶完成了美好的蛻變。' }
        ],
        interactivePrompt: '你是否也曾像皮諾丘一樣，勇敢地克服困難並學會誠實呢？'
      }
    ]
  }
];

