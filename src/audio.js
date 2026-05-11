const MASTERED_CLIPS = [
  "./assets/audio/mastered/001_00-00_Darude%20-%20Moments%20CSGO.mp3",
  "./assets/audio/mastered/002_00-07_Twin%20Atlantic%20-%20GLA.mp3",
  "./assets/audio/mastered/003_00-16_Roam%20-%20Backbone.mp3",
  "./assets/audio/mastered/004_00-24_Beartooth%20-%20Disgusting.mp3",
  "./assets/audio/mastered/005_00-33_New%20Beat%20Fund%20-%20Sponge%20Fingerz.mp3",
  "./assets/audio/mastered/006_00-47_Michael%20Bross%20-%20Invasion%21.mp3",
  "./assets/audio/mastered/007_00-56_Mord%20Fustang%20-%20Diamonds.mp3",
  "./assets/audio/mastered/008_01-07_Daniel%20Sadowski%20-%20The%208-Bit%20Kit.mp3",
  "./assets/audio/mastered/009_01-14_Skog%20-%20II-Headshot.mp3",
  "./assets/audio/mastered/010_01-20_Troels%20Folmann%20-%20Uber%20Blasto%20Phone.mp3",
  "./assets/audio/mastered/011_01-29_KiTheory%20-%20MOLOTOV.mp3",
  "./assets/audio/mastered/012_01-36_Damjan%20Mravunac%20-%20The%20Talos%20Principle.mp3",
  "./assets/audio/mastered/013_01-45_Daniel%20Sadowski%20-%20Total%20Domination.mp3",
  "./assets/audio/mastered/014_01-52_Mateo%20Messina%20-%20For%20No%20Mankind.mp3",
  "./assets/audio/mastered/015_01-58_Chapter%20015.mp3",
  "./assets/audio/mastered/016_02-07_Chapter%20016.mp3",
  "./assets/audio/mastered/017_02-14_Chapter%20017.mp3",
  "./assets/audio/mastered/018_02-20_Chapter%20018.mp3",
  "./assets/audio/mastered/019_02-28_Chapter%20019.mp3",
  "./assets/audio/mastered/020_02-35_Chapter%20020.mp3",
  "./assets/audio/mastered/021_02-46_Chapter%20021.mp3",
  "./assets/audio/mastered/022_02-54_Chapter%20022.mp3",
  "./assets/audio/mastered/023_03-22_Chapter%20023.mp3",
  "./assets/audio/mastered/024_03-31_Chapter%20024.mp3",
  "./assets/audio/mastered/025_03-39_Chapter%20025.mp3",
  "./assets/audio/mastered/026_03-48_Chapter%20026.mp3",
  "./assets/audio/mastered/027_03-56_Chapter%20027.mp3",
  "./assets/audio/mastered/028_04-06_Chapter%20028.mp3",
  "./assets/audio/mastered/029_04-15_Chapter%20029.mp3",
  "./assets/audio/mastered/030_04-36_Chapter%20030.mp3",
  "./assets/audio/mastered/031_04-47_Chapter%20031.mp3",
  "./assets/audio/mastered/032_04-58_Chapter%20032.mp3",
  "./assets/audio/mastered/033_05-07_Chapter%20033.mp3",
  "./assets/audio/mastered/034_05-20_Chapter%20034.mp3",
  "./assets/audio/mastered/035_05-33_Chapter%20035.mp3",
  "./assets/audio/mastered/036_05-43_Chapter%20036.mp3",
  "./assets/audio/mastered/037_05-53_Chapter%20037.mp3",
  "./assets/audio/mastered/038_06-03_Chapter%20038.mp3",
  "./assets/audio/mastered/039_06-12_Chapter%20039.mp3",
  "./assets/audio/mastered/040_06-20_Chapter%20040.mp3",
  "./assets/audio/mastered/041_06-39_Chapter%20041.mp3",
  "./assets/audio/mastered/042_06-47_Chapter%20042.mp3",
  "./assets/audio/mastered/043_06-56_Chapter%20043.mp3",
  "./assets/audio/mastered/044_07-04_Chapter%20044.mp3",
  "./assets/audio/mastered/045_07-17_Chapter%20045.mp3",
  "./assets/audio/mastered/046_07-40_Chapter%20046.mp3",
  "./assets/audio/mastered/047_07-48_Chapter%20047.mp3",
  "./assets/audio/mastered/048_07-57_Chapter%20048.mp3",
  "./assets/audio/mastered/049_08-14_Chapter%20049.mp3",
  "./assets/audio/mastered/050_08-22_Chapter%20050.mp3",
  "./assets/audio/mastered/051_08-51_Chapter%20051.mp3",
  "./assets/audio/mastered/052_09-01_Chapter%20052.mp3",
  "./assets/audio/mastered/053_09-10_Chapter%20053.mp3",
  "./assets/audio/mastered/054_09-19_Chapter%20054.mp3",
  "./assets/audio/mastered/055_09-26_Chapter%20055.mp3",
  "./assets/audio/mastered/056_09-35_Chapter%20056.mp3",
  "./assets/audio/mastered/057_09-41_Chapter%20057.mp3",
  "./assets/audio/mastered/058_09-53_Chapter%20058.mp3",
  "./assets/audio/mastered/059_10-04_Chapter%20059.mp3",
  "./assets/audio/mastered/060_10-12_Chapter%20060.mp3",
  "./assets/audio/mastered/061_10-20_Chapter%20061.mp3",
  "./assets/audio/mastered/062_10-27_Chapter%20062.mp3",
  "./assets/audio/mastered/063_10-42_Chapter%20063.mp3",
  "./assets/audio/mastered/064_11-07_Chapter%20064.mp3",
  "./assets/audio/mastered/065_11-15_Chapter%20065.mp3",
  "./assets/audio/mastered/066_11-33_Chapter%20066.mp3",
  "./assets/audio/mastered/067_11-38_Chapter%20067.mp3",
  "./assets/audio/mastered/068_11-44_Chapter%20068.mp3",
  "./assets/audio/mastered/069_12-05_Chapter%20069.mp3",
  "./assets/audio/mastered/070_12-13_Chapter%20070.mp3",
  "./assets/audio/mastered/071_12-22_Chapter%20071.mp3",
  "./assets/audio/mastered/072_12-31_Chapter%20072.mp3",
  "./assets/audio/mastered/073_12-38_Chapter%20073.mp3",
  "./assets/audio/mastered/074_12-50_Chapter%20074.mp3",
  "./assets/audio/mastered/075_13-00_Chapter%20075.mp3",
  "./assets/audio/mastered/076_13-08_Chapter%20076.mp3",
  "./assets/audio/mastered/077_13-18_Chapter%20077.mp3",
  "./assets/audio/mastered/078_13-35_Chapter%20078.mp3",
  "./assets/audio/mastered/079_13-44_Chapter%20079.mp3",
  "./assets/audio/mastered/080_13-53_Chapter%20080.mp3",
  "./assets/audio/mastered/081_14-01_Chapter%20081.mp3",
  "./assets/audio/mastered/082_14-09_Chapter%20082.mp3",
  "./assets/audio/mastered/083_14-20_Chapter%20083.mp3",
];

const BACKGROUND_VOLUME = 0.4;
const ROLL_VOLUME = 0.4;
const MASTERED_VOLUME = 0.55;
const MASTERED_FADE_SECONDS = 1.8;
const FADE_STEPS = 18;
const FADE_INTERVAL_MS = 140;

export const AUDIO_ASSETS = {
  background: "./assets/audio/lobby-background.mp3",
  correct: "./assets/audio/ak-headshot.mp3",
  weaponShotAk: "./assets/audio/weapon-ak-shot-headshot.wav",
  weaponDrawAk: "./assets/audio/weapon-ak-draw.wav",
  weaponShotDeagle: "./assets/audio/weapon-deagle-shot-headshot.wav",
  weaponDrawDeagle: "./assets/audio/weapon-deagle-draw.wav",
  taserCombo: "./assets/audio/taser-shot-death.wav",
  menu: "./assets/audio/menu.mp3?v=trim-05",
  mastered: MASTERED_CLIPS,
  roll: "./assets/audio/roll.mp3",
};

export function createAudioState({ enabled = true } = {}) {
  return {
    enabled,
    context: null,
    masterGain: null,
    musicTimer: null,
    players: {},
    preparedMasteredPath: null,
    fadeTimers: new Map(),
    musicMuted: false,
    correctSound: "ak",
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
  AudioClass = globalThis.Audio,
  random = Math.random,
  timers = globalThis,
} = {}) {
  const state = createAudioState();

  return {
    assets: AUDIO_ASSETS,
    pickMasteredAsset() {
      return pickMasteredAsset(random);
    },
    prepareMastered() {
      const path = state.preparedMasteredPath || pickMasteredAsset(random);
      state.preparedMasteredPath = path;
      const player = preloadAssetPath(state, AudioClass, path, MASTERED_VOLUME);
      primePlayer(player);
      return path;
    },
    get enabled() {
      return state.enabled;
    },
    setMusicMuted(muted) {
      state.musicMuted = Boolean(muted);
      const player = state.players[AUDIO_ASSETS.background];
      if (state.musicMuted) {
        stopBackground(state, timers);
      } else if (player) {
        playPreparedPlayer(player);
      }
    },
    setEnabled(enabled) {
      state.enabled = Boolean(enabled);
      if (state.masterGain) {
        state.masterGain.gain.value = state.enabled ? 0.22 : 0;
      }
      if (!state.enabled) {
        stopBackground(state, timers);
      }
    },
    setCorrectSound(kind, { playDraw = false } = {}) {
      const previous = state.correctSound;
      state.correctSound = kind;
      if (playDraw && previous !== kind) {
        if (kind === "ak") {
          playAssetPath(state, AudioClass, AUDIO_ASSETS.weaponDrawAk, 0.55);
        } else if (kind === "deagle") {
          playAssetPath(state, AudioClass, AUDIO_ASSETS.weaponDrawDeagle, 0.55);
        }
      }
    },
    playCurrentWeaponDraw() {
      if (!state.enabled) return Promise.resolve(false);
      if (state.correctSound === "ak") {
        return playAssetPathWithEnd(state, AudioClass, AUDIO_ASSETS.weaponDrawAk, 0.55);
      }
      if (state.correctSound === "deagle") {
        return playAssetPathWithEnd(state, AudioClass, AUDIO_ASSETS.weaponDrawDeagle, 0.55);
      }
      return Promise.resolve(false);
    },
    async start() {
      if (!state.enabled || !AudioContextClass) return;
      ensureContext(state, AudioContextClass);
      if (state.context.state === "suspended") {
        await state.context.resume();
      }
    },
    async preloadAllAssets() {
      const preloadPaths = [
        AUDIO_ASSETS.background,
        AUDIO_ASSETS.correct,
        AUDIO_ASSETS.menu,
        AUDIO_ASSETS.roll,
        AUDIO_ASSETS.weaponShotAk,
        AUDIO_ASSETS.weaponDrawAk,
        AUDIO_ASSETS.weaponShotDeagle,
        AUDIO_ASSETS.weaponDrawDeagle,
        AUDIO_ASSETS.taserCombo,
        AUDIO_ASSETS.mastered[0],
      ];
      const tasks = preloadPaths
        .filter(Boolean)
        .map((path) => {
          const player = preloadAssetPath(state, AudioClass, path, 0.2);
          return waitForCanPlay(player, timers);
        });
      await Promise.all(tasks);
    },
    async tryAutoPlayBackground() {
      if (state.musicMuted || !state.enabled) return false;
      const player = preloadAssetPath(state, AudioClass, AUDIO_ASSETS.background, BACKGROUND_VOLUME);
      if (!player) return false;
      player.loop = true;
      return playPreparedPlayer(player);
    },
    startBackgroundMusic() {
      startBackgroundMusic(state, AudioClass, timers);
    },
    menu() {
      if (!state.enabled) return;
      playAssetPath(state, AudioClass, AUDIO_ASSETS.menu, 0.55);
    },
    roll() {
      if (!state.enabled) return;
      const player = playAssetPath(state, AudioClass, AUDIO_ASSETS.roll, ROLL_VOLUME);
      if (player) {
        player.onended = () => stopBackground(state, timers, { fade: true });
      }
    },
    playRollThenWeaponDraw() {
      if (!state.enabled) return Promise.resolve(false);
      const rollPlayer = playAssetPath(state, AudioClass, AUDIO_ASSETS.roll, ROLL_VOLUME);
      if (!rollPlayer) return this.playCurrentWeaponDraw();
      return new Promise((resolve) => {
        let finished = false;
        const finish = async () => {
          if (finished) return;
          finished = true;
          const playedDraw = await this.playCurrentWeaponDraw();
          resolve(Boolean(playedDraw));
        };
        rollPlayer.onended = () => {
          stopBackground(state, timers, { fade: true });
          finish();
        };
        window.setTimeout(() => {
          stopBackground(state, timers, { fade: true });
          finish();
        }, 7000);
      });
    },
    shoot() {
      if (!canPlay(state)) return;
      playBurst(state, 0.035, 140, 90);
      playBurst(state, 0.028, 120, 80, 0.045);
    },
    correct() {
      if (!state.enabled) return;
      if (state.correctSound === "ak") {
        const playedShot = Boolean(playAssetPath(state, AudioClass, AUDIO_ASSETS.weaponShotAk, 0.6));
        if (playedShot) return;
      }
      if (state.correctSound === "deagle") {
        const playedShot = Boolean(playAssetPath(state, AudioClass, AUDIO_ASSETS.weaponShotDeagle, 0.5));
        if (playedShot) return;
      }
      if (!canPlay(state)) return;
      if (state.correctSound === "laser") {
        playTone(state, 1020, 0.05, "square", 0.09);
        playTone(state, 1480, 0.08, "triangle", 0.07, 0.04);
        return;
      }
      playTone(state, 820, 0.04, "triangle", 0.08);
      playTone(state, 980, 0.07, "sine", 0.06, 0.03);
    },
    wrong() {
      if (!state.enabled) return;
      const playedCombo = Boolean(playAssetPath(state, AudioClass, AUDIO_ASSETS.taserCombo, 0.62));
      if (playedCombo) return;
      if (!canPlay(state)) return;
      playTone(state, 180, 0.12, "sawtooth", 0.08);
    },
    mastered() {
      stopBackground(state, timers, { fade: true });
      const path = state.preparedMasteredPath || pickMasteredAsset(random);
      state.preparedMasteredPath = null;
      if (state.enabled) {
        const player = playAssetPath(state, AudioClass, path, MASTERED_VOLUME);
        if (player) {
          attachFadeOutNearEnd(player, MASTERED_VOLUME, MASTERED_FADE_SECONDS);
          player.onended = () => startBackgroundMusic(state, AudioClass, timers, { fade: true });
          return;
        }
      }
      if (!canPlay(state)) return;
      [523, 659, 784, 1046, 1318].forEach((frequency, index) => {
        playTone(state, frequency, 0.22, "triangle", 0.1, index * 0.11);
      });
      playNoiseSweep(state, 0.5, 0.04);
    },
  };
}

function primePlayer(player) {
  if (!player) return;
  player.muted = true;
  const playPromise = player.play();
  if (playPromise?.then) {
    playPromise
      .then(() => {
        player.pause?.();
        try {
          player.currentTime = 0;
        } catch {}
        player.muted = false;
      })
      .catch(() => {
        player.muted = false;
      });
  } else {
    player.pause?.();
    try {
      player.currentTime = 0;
    } catch {}
    player.muted = false;
  }
}

function pickMasteredAsset(random) {
  const index = Math.floor(Math.min(0.999999, Math.max(0, random())) * AUDIO_ASSETS.mastered.length);
  return AUDIO_ASSETS.mastered[index];
}

function playAsset(state, AudioClass, name) {
  return Boolean(playAssetPath(state, AudioClass, AUDIO_ASSETS[name], 0.38));
}

function preloadAssetPath(state, AudioClass, path, volume) {
  if (!AudioClass || !path) return null;
  if (!state.players[path]) {
    state.players[path] = new AudioClass(path);
  }
  state.players[path].volume = volume;
  state.players[path].preload = "auto";
  state.players[path].load?.();
  return state.players[path];
}

function playAssetPath(state, AudioClass, path, volume) {
  const player = preloadAssetPath(state, AudioClass, path, volume);
  if (!player) return null;
  player.muted = false;
  try {
    player.currentTime = 0;
  } catch {
    // Some browsers reject seeking before metadata is ready; playback can still start.
  }
  playPreparedPlayer(player);
  return player;
}

function playAssetPathWithEnd(state, AudioClass, path, volume) {
  const player = playAssetPath(state, AudioClass, path, volume);
  if (!player) return Promise.resolve(false);
  return new Promise((resolve) => {
    player.onended = () => resolve(true);
    window.setTimeout(() => resolve(true), 4000);
  });
}

function playAssetPathDelayed(state, AudioClass, timers, path, volume, delayMs) {
  if (!AudioClass || !path) return false;
  timers.setTimeout(() => {
    playAssetPath(state, AudioClass, path, volume);
  }, delayMs);
  return true;
}

function startBackgroundMusic(state, AudioClass, timers, { fade = false } = {}) {
  if (state.musicMuted) return;
  const player = preloadAssetPath(state, AudioClass, AUDIO_ASSETS.background, fade ? 0 : BACKGROUND_VOLUME);
  if (!player) return;
  stopFade(state, timers, player);
  player.loop = true;
  playPreparedPlayer(player);
  if (fade) {
    fadePlayerVolume(state, timers, player, BACKGROUND_VOLUME);
  }
}

function playPreparedPlayer(player) {
  const playPromise = player.play();
  if (playPromise?.then) {
    return playPromise.then(() => true).catch(() => false);
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

function stopBackground(state, timers, { fade = false } = {}) {
  const player = state.players[AUDIO_ASSETS.background];
  if (player) {
    if (fade) {
      fadePlayerVolume(state, timers, player, 0, () => player.pause?.());
    } else {
      stopFade(state, timers, player);
      player.pause?.();
    }
  }
  if (state.musicTimer) {
    window.clearInterval(state.musicTimer);
    state.musicTimer = null;
  }
}

function fadePlayerVolume(state, timers, player, targetVolume, onComplete) {
  stopFade(state, timers, player);
  const startVolume = Number(player.volume) || 0;
  let step = 0;
  const timer = timers.setInterval(() => {
    step += 1;
    const progress = Math.min(1, step / FADE_STEPS);
    player.volume = roundVolume(startVolume + (targetVolume - startVolume) * progress);
    if (progress >= 1) {
      stopFade(state, timers, player);
      onComplete?.();
    }
  }, FADE_INTERVAL_MS);
  state.fadeTimers.set(player, timer);
  timer?.unref?.();
  player.volume = roundVolume(startVolume + (targetVolume - startVolume) / FADE_STEPS);
}

function stopFade(state, timers, player) {
  const timer = state.fadeTimers.get(player);
  if (!timer) return;
  timers.clearInterval(timer);
  state.fadeTimers.delete(player);
}

function roundVolume(volume) {
  return Math.round(volume * 1000) / 1000;
}

function attachFadeOutNearEnd(player, startVolume, fadeSeconds) {
  if (!player) return;
  let fading = false;
  player.volume = startVolume;
  player.ontimeupdate = () => {
    if (fading) return;
    const duration = Number(player.duration);
    const currentTime = Number(player.currentTime);
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return;
    const remaining = duration - currentTime;
    if (remaining > fadeSeconds) return;
    fading = true;
    const startedAt = currentTime;
    player.ontimeupdate = () => {
      const elapsed = Number(player.currentTime) - startedAt;
      const progress = Math.min(1, Math.max(0, elapsed / fadeSeconds));
      player.volume = roundVolume(startVolume * (1 - progress));
    };
  };
}

function waitForCanPlay(player, timers, timeoutMs = 10000) {
  if (!player) return Promise.resolve();
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      player.removeEventListener?.("canplaythrough", done);
      player.removeEventListener?.("loadeddata", done);
      resolve();
    };
    player.addEventListener?.("canplaythrough", done, { once: true });
    player.addEventListener?.("loadeddata", done, { once: true });
    timers.setTimeout(done, timeoutMs);
  });
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
