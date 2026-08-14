import { SoundEffectType, AmbientSoundType, SessionType } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // AudioContext resumption suspended by browser autoplay policy
    });
  }
  return audioCtx;
}

/**
 * Synthesizes crisp notification alert tones using standard Web Audio API
 */
export function playNotificationSound(type: SoundEffectType, volume: number = 0.8): void {
  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'tibetan_bowl': {
        // Tibetan Singing Bowl harmonic resonance
        const freqs = [216, 432, 648, 864];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          
          const initialAmp = 0.4 / (idx + 1);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(initialAmp, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 3.1);
        });
        break;
      }

      case 'digital_chime': {
        // Upward triad sequence (E5, G#5, B5, E6)
        const notes = [659.25, 830.61, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.01, startTime);
          gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
        break;
      }

      case 'marimba': {
        // Warm percussive marimba sound
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + idx * 0.1;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, startTime);

          gain.gain.setValueAtTime(0.5, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.45);
        });
        break;
      }

      case 'synth_rise': {
        // Elevating warm synth swell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(2400, now + 1.2);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.5);
        break;
      }

      case 'gentle_bell':
      default: {
        // Warm soft bell tone (440 Hz + harmonic)
        [440, 880].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.3 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.85);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

// Global active ambient generator references
let activeAmbientNodes: {
  stop: () => void;
  setVolume: (v: number) => void;
} | null = null;

/**
 * Procedural ambient focus sound generator (Alpha Binaural Beats, Brown Noise, Rain, White Noise)
 */
export function startAmbientSound(type: AmbientSoundType, volume: number = 0.5): void {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    let currentVol = Math.max(0, Math.min(1, volume));
    masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const cleanupFns: Array<() => void> = [];

    if (type === 'alpha_binaural') {
      // 10 Hz Binaural Alpha beat (Left ear 210 Hz, Right ear 200 Hz)
      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = 210;

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = 200;

      oscL.connect(merger, 0, 0); // left channel
      oscR.connect(merger, 0, 1); // right channel

      merger.connect(masterGain);
      oscL.start();
      oscR.start();

      cleanupFns.push(() => {
        oscL.stop();
        oscR.stop();
        oscL.disconnect();
        oscR.disconnect();
      });
    } else if (type === 'theta_binaural') {
      // 6 Hz Binaural Theta beat for creative flow (Left 142 Hz, Right 136 Hz)
      const merger = ctx.createChannelMerger(2);

      const oscL = ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = 142;

      const oscR = ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = 136;

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      merger.connect(masterGain);
      oscL.start();
      oscR.start();

      cleanupFns.push(() => {
        oscL.stop();
        oscR.stop();
        oscL.disconnect();
        oscR.disconnect();
      });
    } else if (type === 'deep_space') {
      // Warm cosmic sub-synth drone (55Hz A1 + 110Hz A2)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.value = 55;
      osc2.type = 'triangle';
      osc2.frequency.value = 110.5;

      filter.type = 'lowpass';
      filter.frequency.value = 180;

      const subGain = ctx.createGain();
      subGain.gain.value = 0.3;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(subGain);
      subGain.connect(masterGain);

      osc1.start();
      osc2.start();

      cleanupFns.push(() => {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      });
    } else if (type === 'brown_noise' || type === 'white_noise' || type === 'pink_noise') {
      // Buffer for noise synthesis
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown_noise') {
          // 1/f^2 Brown Noise filter
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain boost
        } else if (type === 'pink_noise') {
          // Paul Kellet's Pink Noise algorithm
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        } else {
          output[i] = white * 0.15;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Add soft lowpass filtering for comfortable focus
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'brown_noise' ? 400 : type === 'pink_noise' ? 800 : 1200;

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      cleanupFns.push(() => {
        whiteNoise.stop();
        whiteNoise.disconnect();
      });
    } else if (type === 'rain_waves') {
      // Filtered noise with low frequency LFO modulating volume for ocean/rain waves
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12; // Wave pulse every ~8 seconds

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.25;

      lfo.connect(lfoGain.gain);
      noise.connect(filter);
      filter.connect(lfoGain);
      lfoGain.connect(masterGain);

      noise.start();
      lfo.start();

      cleanupFns.push(() => {
        noise.stop();
        lfo.stop();
      });
    }

    activeAmbientNodes = {
      stop: () => {
        cleanupFns.forEach((fn) => fn());
      },
      setVolume: (v: number) => {
        currentVol = Math.max(0, Math.min(1, v));
        masterGain.gain.setValueAtTime(currentVol, ctx.currentTime);
      },
    };
  } catch (err) {
    console.warn('Ambient sound error:', err);
  }
}

export function stopAmbientSound(): void {
  if (activeAmbientNodes) {
    activeAmbientNodes.stop();
    activeAmbientNodes = null;
  }
}

export function setAmbientVolume(volume: number): void {
  if (activeAmbientNodes) {
    activeAmbientNodes.setVolume(volume);
  }
}

/**
 * Plays a gentle, organic acoustic chime when switching light/dark theme
 */
export function playThemeTransitionChime(isDarkTarget: boolean): void {
  try {
    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime); // Soft volume
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (isDarkTarget) {
      // Warm, descending nightfall harmonics (432 Hz -> 216 Hz)
      [432, 324, 216].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } else {
      // Bright, ascending dawn harmonics (261 Hz -> 523 Hz -> 784 Hz)
      [261.63, 523.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    }
  } catch (err) {
    // Silent fallback
  }
}

/**
 * Procedural Web Audio API sound triggered when user passes a rival or gains a rank position
 */
export function playRankUpSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, now);
    masterGain.connect(ctx.destination);

    // 1. Physical "Whoosh" air pressure sweep
    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.35);
    filter.Q.value = 3;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);

    // 2. Rising pitch synth sequence (E5 -> G#5 -> B5 -> E6)
    const pitches = [659.25, 830.61, 987.77, 1318.51];
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.35, st + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(st);
      osc.stop(st + 0.55);
    });
  } catch (e) {
    console.warn('Rank up audio error:', e);
  }
}

/**
 * Soft acoustic chime for session phase transitions (Work -> Break or Break -> Work)
 */
export function playPhaseTransitionSound(toType: SessionType): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, now);
    masterGain.connect(ctx.destination);

    if (toType === 'work') {
      // Energetic ascending interval (G4 -> C5 -> E5)
      const notes = [392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = now + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, st);

        gain.gain.setValueAtTime(0.001, st);
        gain.gain.linearRampToValueAtTime(0.3, st + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(st);
        osc.stop(st + 0.85);
      });
    } else {
      // Gentle calming descending/warm bowl resonance (A4 -> E4 -> C4)
      const notes = [440.00, 329.63, 261.63];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const st = now + idx * 0.15;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, st);

        gain.gain.setValueAtTime(0.001, st);
        gain.gain.linearRampToValueAtTime(0.25, st + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, st + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(st);
        osc.stop(st + 1.25);
      });
    }
  } catch (e) {
    console.warn('Phase transition audio error:', e);
  }
}

/**
 * Procedural Web Audio API sound triggered when reaching a major league milestone or top spot
 */
export function playMilestoneSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.connect(ctx.destination);

    // Celebratory harmonic chord (C5, E5, G5, C6)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.4, st + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(st);
      osc.stop(st + 1.25);
    });
  } catch (e) {
    console.warn('Milestone audio error:', e);
  }
}
