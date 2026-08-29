// Web Audio API Synthesizer for Focus Ambient Sound Machine (專注白噪音與自然伴讀音效)

let audioCtx: AudioContext | null = null;
let activeNodes: { stop: () => void }[] = [];
let currentSoundId: string | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopAmbientSound() {
  activeNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // ignore
    }
  });
  activeNodes = [];
  currentSoundId = null;
}

export function getCurrentAmbientSoundId(): string | null {
  return currentSoundId;
}

export function playAmbientSound(soundId: string, volume: number = 0.3) {
  stopAmbientSound();
  const ctx = getAudioContext();
  currentSoundId = soundId;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  if (soundId === 'rain') {
    // Pink noise for gentle rain
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    // Filter to make it sound like gentle rainfall on window
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    noiseSrc.connect(filter);
    filter.connect(masterGain);
    noiseSrc.start();

    activeNodes.push({ stop: () => noiseSrc.stop() });

  } else if (soundId === 'forest') {
    // Gentle wind filter + periodic bird synth chimes
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    noiseSrc.connect(filter);
    filter.connect(masterGain);
    noiseSrc.start();

    // Bird chirp interval
    const chirpInterval = setInterval(() => {
      if (currentSoundId !== 'forest') {
        clearInterval(chirpInterval);
        return;
      }
      playBirdChirp(ctx, masterGain);
    }, 4500);

    activeNodes.push({
      stop: () => {
        noiseSrc.stop();
        lfo.stop();
        clearInterval(chirpInterval);
      },
    });

  } else if (soundId === 'piano') {
    // Soft soothing piano chord loop generator
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [220.00, 261.63, 329.63, 440.00], // A minor
      [174.61, 220.00, 261.63, 349.23], // F major
      [196.00, 246.94, 293.66, 392.00], // G major
    ];

    let step = 0;
    const playChordStep = () => {
      if (currentSoundId !== 'piano') return;
      const currentChord = chords[step % chords.length];
      step++;

      currentChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + idx * 0.15 + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 3.2);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 3.3);
      });
    };

    playChordStep();
    const chordInterval = setInterval(playChordStep, 4000);

    activeNodes.push({
      stop: () => clearInterval(chordInterval),
    });

  } else if (soundId === 'ocean') {
    // Deep rolling wave noise generator
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // Slow wave swell
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(350, ctx.currentTime);

    filter.frequency.setValueAtTime(450, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    lfo.start();
    noiseSrc.connect(filter);
    filter.connect(masterGain);
    noiseSrc.start();

    activeNodes.push({
      stop: () => {
        noiseSrc.stop();
        lfo.stop();
      },
    });
  }
}

function playBirdChirp(ctx: AudioContext, destination: GainNode) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';

  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(2200, now + 0.15);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.04, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(now);
  osc.stop(now + 0.2);
}
