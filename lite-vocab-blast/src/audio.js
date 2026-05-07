const MASTERED_CLIP_COUNT = 102;

export const AUDIO_ASSETS = {
  correct: "./assets/audio/ak-headshot.mp3",
  mastered: Array.from(
    { length: MASTERED_CLIP_COUNT },
    (_, index) => `./assets/audio/mastered/mastered-${String(index).padStart(3, "0")}.mp3`,
  ),
};

export function createAudioState({ enabled = true } = {}) {
  return {
    enabled,
    context: null,
    masterGain: null,
    musicTimer: null,
    players: {},
  };
}

export function toggleAudio(state) {
  return { ...state, enabled: !state.enabled };
}

export function soundForAnswer({ isCorrect, allMastered }) {
  if (isCorrect) return "correct";
  return allMastered ? "mastered" : "wrong";
}

export function createGameAudio({
  AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext,
  random = Math.random,
} = {}) {
  const state = createAudioState();

  return {
    assets: AUDIO_ASSETS,
    pickMasteredAsset() {
      return pickMasteredAsset(random);
    },
    get enabled() {
      return state.enabled;
    },
    setEnabled(enabled) {
      state.enabled = Boolean(enabled);
      if (state.masterGain) {
        state.masterGain.gain.value = state.enabled ? 0.22 : 0;
      }
      if (!state.enabled) {
        stopBackground(state);
      }
    },
    async start() {
      if (!state.enabled || !AudioContextClass) return;
      ensureContext(state, AudioContextClass);
      if (state.context.state === "suspended") {
        await state.context.resume();
      }
      startBackground(state);
    },
    shoot() {
      if (!canPlay(state)) return;
      playBurst(state, 0.035, 140, 90);
      playBurst(state, 0.028, 120, 80, 0.045);
    },
    correct() {
      if (!state.enabled) return;
      if (playAsset(state, "correct")) return;
      if (!canPlay(state)) return;
      playTone(state, 740, 0.05, "square", 0.11);
      playTone(state, 1180, 0.08, "triangle", 0.08, 0.05);
    },
    wrong() {
      if (!canPlay(state)) return;
      playTone(state, 180, 0.12, "sawtooth", 0.08);
    },
    mastered() {
      stopBackground(state);
      if (state.enabled && playAssetPath(state, pickMasteredAsset(random), 0.45)) return;
      if (!canPlay(state)) return;
      [523, 659, 784, 1046, 1318].forEach((frequency, index) => {
        playTone(state, frequency, 0.22, "triangle", 0.1, index * 0.11);
      });
      playNoiseSweep(state, 0.5, 0.04);
    },
  };
}

function pickMasteredAsset(random) {
  const index = Math.floor(Math.min(0.999999, Math.max(0, random())) * AUDIO_ASSETS.mastered.length);
  return AUDIO_ASSETS.mastered[index];
}

function playAsset(state, name) {
  return playAssetPath(state, AUDIO_ASSETS[name], 0.38);
}

function playAssetPath(state, path, volume) {
  if (typeof Audio === "undefined" || !path) return false;
  if (!state.players[path]) {
    state.players[path] = new Audio(path);
    state.players[path].volume = volume;
    state.players[path].preload = "auto";
  }
  const player = state.players[path];
  player.currentTime = 0;
  const playPromise = player.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
  return true;
}

function ensureContext(state, AudioContextClass) {
  if (state.context) return;
  state.context = new AudioContextClass();
  state.masterGain = state.context.createGain();
  state.masterGain.gain.value = state.enabled ? 0.22 : 0;
  state.masterGain.connect(state.context.destination);
}

function canPlay(state) {
  return state.enabled && state.context && state.masterGain;
}

function startBackground(state) {
  if (state.musicTimer || !canPlay(state)) return;
  const notes = [262, 330, 392, 494];
  let step = 0;
  state.musicTimer = window.setInterval(() => {
    playTone(state, notes[step % notes.length], 0.08, "triangle", 0.025);
    step += 1;
  }, 520);
}

function stopBackground(state) {
  if (!state.musicTimer) return;
  window.clearInterval(state.musicTimer);
  state.musicTimer = null;
}

function playTone(state, frequency, duration, type = "sine", volume = 0.08, delay = 0) {
  const now = state.context.currentTime + delay;
  const oscillator = state.context.createOscillator();
  const gain = state.context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(state.masterGain);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function playBurst(state, duration, highFrequency, lowFrequency, delay = 0) {
  const now = state.context.currentTime + delay;
  const oscillator = state.context.createOscillator();
  const gain = state.context.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(highFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(lowFrequency, now + duration);
  gain.gain.setValueAtTime(0.11, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(gain).connect(state.masterGain);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
}

function playNoiseSweep(state, duration, delay = 0) {
  const now = state.context.currentTime + delay;
  const buffer = state.context.createBuffer(1, state.context.sampleRate * duration, state.context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  const source = state.context.createBufferSource();
  const gain = state.context.createGain();
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.buffer = buffer;
  source.connect(gain).connect(state.masterGain);
  source.start(now);
}
