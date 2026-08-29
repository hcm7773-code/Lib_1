// Web Audio Sound Effects & Browser SpeechSynthesis Helper

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play realistic soft page turn sound effect using Web Audio API noise buffer
export function playPageTurnSound() {
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.15; // 0.15s short rustle
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch (e) {
    console.warn('Audio FX error:', e);
  }
}

// 2. Play rewarding star chime
export function playStarChime() {
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = ctx.currentTime + idx * 0.08;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  } catch (e) {
    console.warn('Star Chime error:', e);
  }
}

import { analyzeEmotionForText, EmotionType } from './emotionAnalyzer';
import { VoiceRole, BgMusicTrack } from '../types';

export interface BgMusicTrackInfo {
  id: BgMusicTrack;
  name: string;
  emoji: string;
  description: string;
  categoryTag: string;
}

export const BG_MUSIC_PLAYLIST: BgMusicTrackInfo[] = [
  { id: 'off', name: '靜音無配樂', emoji: '🔇', description: '保持環境安靜，專注語音朗讀', categoryTag: '靜音' },
  { id: 'lullaby', name: '搖籃安眠琴聲', emoji: '🌙', description: '柔和童話八音盒與五聲木琴', categoryTag: '睡前故事' },
  { id: 'forest', name: '晨曦森林微風', emoji: '🌲', description: '微風徐徐與清晨小鳥輕唱', categoryTag: '自然科普' },
  { id: 'adventure', name: '奇幻勇氣樂章', emoji: '🚀', description: '高昂長笛與大提琴勇氣吉他', categoryTag: '冒險奇幻' },
  { id: 'rain', name: '舒緩微雨夜曲', emoji: '🌧️', description: '溫暖雨聲與舒緩太白噪聲', categoryTag: '靜心思考' },
  { id: 'space', name: '神秘太空微光', emoji: '🌌', description: '空靈星際嗡鳴與星塵閃爍聲', categoryTag: '太空冒險' },
  { id: 'magic', name: '魔法王國八音', emoji: '🪄', description: '晶瑩水晶八音盒與歡樂旋律', categoryTag: '童話魔法' },
  { id: 'ocean', name: '深海藍鯨海浪', emoji: '🐳', description: '澎湃緩和潮汐與鯨魚低鳴', categoryTag: '海洋探險' },
  { id: 'cozy', name: '溫馨柴火吉他', emoji: '☕', description: '溫暖營火柴火聲與木吉他', categoryTag: '親情溫馨' },
];

// Speech Synthesis Helper
export function speakText(
  text: string,
  langSpeechCode: string,
  rate: number = 1.0,
  voiceRole: VoiceRole = 'mom',
  customPitch: number = 1.0,
  onEnd?: () => void,
  onBoundary?: (charIndex: number) => void,
  emotionType?: EmotionType,
  emotionIntensity: number = 80
): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return null;
  }

  window.speechSynthesis.cancel(); // Stop any active speech

  const utterance = new SpeechSynthesisUtterance(text);

  // Pitch and rate modifiers based on voiceRole persona
  let pitchVal = 1.2;
  let rateModifier = 1.0;

  if (voiceRole === 'mom') {
    pitchVal = 1.25; // Gentle, warm motherly tone
    rateModifier = 0.95;
  } else if (voiceRole === 'cartoon') {
    pitchVal = 1.55; // High-pitched, lively cartoon voice
    rateModifier = 1.10;
  } else if (voiceRole === 'grandpa') {
    pitchVal = 0.70; // Deep, slow, wise grandfather voice
    rateModifier = 0.85;
  } else if (voiceRole === 'teacher') {
    pitchVal = 1.10; // Clear, encouraging teacher voice
    rateModifier = 1.0;
  } else if (voiceRole === 'robot') {
    pitchVal = 0.85; // Metallic steady robot voice
    rateModifier = 0.90;
  } else if (voiceRole === 'fairy') {
    pitchVal = 1.68; // Magical high-pitched story fairy
    rateModifier = 1.05;
  } else if (voiceRole === 'detective') {
    pitchVal = 0.92; // Clever detective rhythm
    rateModifier = 1.05;
  } else if (voiceRole === 'astronaut') {
    pitchVal = 0.95; // Galactic space explorer radio tone
    rateModifier = 0.98;
  } else if (voiceRole === 'wizard') {
    pitchVal = 0.65; // Ancient magical wizard resonant tone
    rateModifier = 0.80;
  } else if (voiceRole === 'dragon') {
    pitchVal = 0.75; // Gentle dragon rumble tone
    rateModifier = 0.90;
  } else if (voiceRole === 'alien') {
    pitchVal = 1.75; // Quirky high helium alien beep tone
    rateModifier = 1.15;
  } else if (voiceRole === 'santa') {
    pitchVal = 0.68; // Merry Christmas Santa HoHoHo tone
    rateModifier = 0.88;
  }

  // Auto emotion detection if not explicitly passed
  const activeEmotionResult = emotionType
    ? undefined
    : analyzeEmotionForText(text);

  if (activeEmotionResult) {
    // Dynamic pitch/rate modulation based on emotion intensity (0-100%)
    const intensityFactor = Math.max(0, Math.min(100, emotionIntensity)) / 100;
    const pitchDelta = (activeEmotionResult.pitchModifier - 1.0) * intensityFactor;
    const rateDelta = (activeEmotionResult.rateModifier - 1.0) * intensityFactor;
    pitchVal *= (1.0 + pitchDelta);
    rateModifier *= (1.0 + rateDelta);
  }

  utterance.rate = Math.max(0.5, Math.min(2.0, rate * rateModifier));
  utterance.pitch = Math.max(0.2, Math.min(2.0, pitchVal * customPitch));

  // Find best matching voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === langSpeechCode.toLowerCase().replace('_', '-')
  ) || voices.find((v) => v.lang.toLowerCase().startsWith(langSpeechCode.slice(0, 2)));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  } else {
    utterance.lang = langSpeechCode;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  if (onBoundary) {
    utterance.onboundary = (event) => {
      onBoundary(event.charIndex);
    };
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

// 3. Web Audio Synthesized Background Music & Ambience Loop
let bgTimer: any = null;
let bgGainNode: GainNode | null = null;
let currentBgTrack: BgMusicTrack = 'off';
let activeBgNodes: OscillatorNode[] = [];

export function stopBackgroundAmbience() {
  if (bgTimer) {
    clearInterval(bgTimer);
    bgTimer = null;
  }
  activeBgNodes.forEach((node) => {
    try {
      node.stop();
      node.disconnect();
    } catch (e) {}
  });
  activeBgNodes = [];
  currentBgTrack = 'off';
}

export function setBackgroundAmbienceVolume(volume: number) {
  if (bgGainNode && audioCtx) {
    const clamped = Math.max(0, Math.min(1, volume));
    bgGainNode.gain.setTargetAtTime(clamped * 0.25, audioCtx.currentTime, 0.1);
  }
}

export function playBackgroundAmbience(track: BgMusicTrack, volume: number = 0.3) {
  stopBackgroundAmbience();
  if (track === 'off') return;

  try {
    const ctx = getAudioContext();
    bgGainNode = ctx.createGain();
    bgGainNode.gain.value = volume * 0.25;
    bgGainNode.connect(ctx.destination);
    currentBgTrack = track;

    if (track === 'lullaby') {
      // Gentle warm pentatonic lullaby arpeggios
      const freqs = [261.63, 329.63, 392.0, 523.25, 659.25]; // C4, E4, G4, C5, E5
      let step = 0;
      const playLullabyNote = () => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freqs[step % freqs.length];
        step++;

        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(noteGain);
        noteGain.connect(bgGainNode!);
        osc.start(now);
        osc.stop(now + 2.6);
      };

      playLullabyNote();
      bgTimer = setInterval(playLullabyNote, 1800);
    } else if (track === 'forest') {
      // Forest wind + soft bird chirp sounds
      const playBirdChirp = () => {
        const osc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        osc.type = 'sine';

        const baseFreq = 2200 + Math.random() * 800;
        const now = ctx.currentTime;

        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.18);

        chirpGain.gain.setValueAtTime(0.01, now);
        chirpGain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(chirpGain);
        chirpGain.connect(bgGainNode!);
        osc.start(now);
        osc.stop(now + 0.22);
      };

      playBirdChirp();
      bgTimer = setInterval(() => {
        if (Math.random() > 0.3) playBirdChirp();
      }, 2200);
    } else if (track === 'adventure') {
      // Whimsical Major 7th chord chime loops
      const chord = [349.23, 440.0, 523.25, 659.25]; // F Major 7th
      const playAdventureChime = () => {
        const now = ctx.currentTime;
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = i % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.value = freq;

          const start = now + i * 0.15;
          noteGain.gain.setValueAtTime(0.001, start);
          noteGain.gain.linearRampToValueAtTime(0.1, start + 0.2);
          noteGain.gain.exponentialRampToValueAtTime(0.001, start + 2.0);

          osc.connect(noteGain);
          noteGain.connect(bgGainNode!);
          osc.start(start);
          osc.stop(start + 2.1);
        });
      };

      playAdventureChime();
      bgTimer = setInterval(playAdventureChime, 3200);
    } else if (track === 'rain') {
      // Soothing Pink Rain noise + warm bass drone
      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      noiseSource.connect(filter);
      filter.connect(bgGainNode);
      noiseSource.start();
    } else if (track === 'space') {
      // Deep ethereal drone + stardust sparkle
      const playSpaceChime = () => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        const freqs = [146.83, 220.0, 293.66, 440.0, 587.33]; // D3, A3, D4, A4, D5
        osc.frequency.value = freqs[Math.floor(Math.random() * freqs.length)];

        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.12, now + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

        osc.connect(noteGain);
        noteGain.connect(bgGainNode!);
        osc.start(now);
        osc.stop(now + 3.6);
      };

      playSpaceChime();
      bgTimer = setInterval(playSpaceChime, 2400);
    } else if (track === 'magic') {
      // Crystal glass bell chime scale
      const scale = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
      let idx = 0;
      const playMagicNote = () => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = scale[idx % scale.length];
        idx++;

        const now = ctx.currentTime;
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(noteGain);
        noteGain.connect(bgGainNode!);
        osc.start(now);
        osc.stop(now + 1.9);
      };

      playMagicNote();
      bgTimer = setInterval(playMagicNote, 1200);
    } else if (track === 'ocean') {
      // Deep wave swell filter
      const playOceanWave = () => {
        const osc = ctx.createOscillator();
        const waveGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 110.0; // A2 bass

        const now = ctx.currentTime;
        waveGain.gain.setValueAtTime(0.001, now);
        waveGain.gain.linearRampToValueAtTime(0.15, now + 2.0);
        waveGain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);

        osc.connect(waveGain);
        waveGain.connect(bgGainNode!);
        osc.start(now);
        osc.stop(now + 5.2);
      };

      playOceanWave();
      bgTimer = setInterval(playOceanWave, 4500);
    } else if (track === 'cozy') {
      // Warm acoustic guitar triad loop
      const triad = [261.63, 329.63, 392.0]; // C major
      const playCozyGuitar = () => {
        const now = ctx.currentTime;
        triad.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = f;

          const start = now + i * 0.2;
          noteGain.gain.setValueAtTime(0.001, start);
          noteGain.gain.linearRampToValueAtTime(0.14, start + 0.15);
          noteGain.gain.exponentialRampToValueAtTime(0.001, start + 2.2);

          osc.connect(noteGain);
          noteGain.connect(bgGainNode!);
          osc.start(start);
          osc.stop(start + 2.3);
        });
      };

      playCozyGuitar();
      bgTimer = setInterval(playCozyGuitar, 2800);
    }
  } catch (e) {
    console.warn('Background Ambience error:', e);
  }
}

export function getRecommendedBgMusicForCategory(
  category?: 'Fairy Tale' | 'Nature & Science' | 'Friendship & Love' | 'Adventure' | 'Culture & Heritage' | 'Moral & Wisdom'
): BgMusicTrack {
  switch (category) {
    case 'Fairy Tale':
      return 'magic';
    case 'Nature & Science':
      return 'forest';
    case 'Adventure':
      return 'adventure';
    case 'Culture & Heritage':
      return 'cozy';
    case 'Moral & Wisdom':
      return 'rain';
    default:
      return 'lullaby';
  }
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function stopAllAudio() {
  stopSpeech();
  stopBackgroundAmbience();
}
