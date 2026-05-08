import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAudioState, createGameAudio, soundForAnswer, toggleAudio } from "./audio.js";

describe("audio controls", () => {
  it("starts enabled and toggles off", () => {
    const state = createAudioState();

    assert.equal(toggleAudio(state).enabled, false);
  });

  it("uses modest original game events for answers", () => {
    assert.equal(soundForAnswer({ isCorrect: true, allMastered: false }), "correct");
    assert.equal(soundForAnswer({ isCorrect: false, allMastered: false }), "wrong");
    assert.equal(soundForAnswer({ isCorrect: true, allMastered: true }), "correct");
    assert.equal(soundForAnswer({ isCorrect: false, allMastered: true }), "mastered");
  });

  it("uses the provided headshot asset for correct blasts", () => {
    const audio = createGameAudio({ AudioContextClass: null });

    assert.equal(audio.assets.correct, "./assets/audio/ak-headshot.mp3");
    assert.equal(audio.assets.background, "./assets/audio/lobby-background.mp3");
    assert.equal(audio.assets.menu, "./assets/audio/menu.mp3?v=trim-05");
    assert.equal(audio.assets.roll, "./assets/audio/roll.mp3");
  });

  it("plays draw on weapon change and layers weapon shot with headshot", () => {
    const created = [];
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.playCount = 0;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio });
    audio.setCorrectSound("deagle", { playDraw: true });
    audio.correct();

    assert.deepEqual(created.map((player) => player.path), [
      "./assets/audio/weapon-deagle-draw.wav",
      "./assets/audio/weapon-deagle-shot.wav",
      "./assets/audio/ak-headshot.mp3",
    ]);
  });

  it("plays menu and start roll clips at their immediate configured volume", () => {
    const created = [];
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.playCount = 0;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio });
    audio.menu();
    audio.roll();

    assert.deepEqual(created.map((player) => player.path), [
      "./assets/audio/menu.mp3?v=trim-05",
      "./assets/audio/roll.mp3",
    ]);
    assert.equal(created[0].volume, 0.55);
    assert.equal(created[1].volume, 0.4);
    assert.deepEqual(created.map((player) => player.playCount), [1, 1]);
  });

  it("starts both roll and background music at full configured volume", () => {
    const created = [];
    const timers = createFakeTimers();
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.loop = false;
        this.playCount = 0;
        this.onended = null;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
      pause() {}
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio, timers });
    audio.roll();
    audio.startBackgroundMusic();

    const roll = created.find((player) => player.path === "./assets/audio/roll.mp3");
    const background = created.find((player) => player.path === "./assets/audio/lobby-background.mp3");

    assert.equal(roll.volume, 0.4);
    assert.equal(roll.volume, 0.4);
    assert.equal(background.volume, 0.4);
  });

  it("exposes mastered reward clips and chooses one randomly", () => {
    const audio = createGameAudio({ AudioContextClass: null, random: () => 0 });

    assert.equal(audio.assets.mastered.length, 83);
    assert.equal(audio.pickMasteredAsset(), "./assets/audio/mastered/001_00-00_Darude%20-%20Moments%20CSGO.mp3");
  });

  it("prepares one mastered clip and reuses it for playback", () => {
    const created = [];
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.preload = "";
        this.currentTime = 0;
        this.playCount = 0;
        this.pauseCount = 0;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
      pause() {
        this.pauseCount += 1;
      }
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio, random: () => 0 });
    const prepared = audio.prepareMastered();
    audio.mastered();

    assert.equal(prepared, "./assets/audio/mastered/001_00-00_Darude%20-%20Moments%20CSGO.mp3");
    assert.equal(created.length, 1);
    assert.equal(created[0].playCount, 2);
  });

  it("starts and mutes page background music", () => {
    const created = [];
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.loop = false;
        this.muted = false;
        this.playCount = 0;
        this.pauseCount = 0;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
      pause() {
        this.pauseCount += 1;
      }
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio });
    audio.setMusicMuted(false);
    audio.startBackgroundMusic();
    audio.setMusicMuted(true);

    assert.equal(created.length, 1);
    assert.equal(created[0].path, "./assets/audio/lobby-background.mp3");
    assert.equal(created[0].loop, true);
    assert.equal(created[0].playCount, 1);
    assert.equal(created[0].pauseCount, 1);
  });

  it("fades out background music when the start roll clip ends", () => {
    const created = [];
    const timers = createFakeTimers();
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.loop = false;
        this.playCount = 0;
        this.pauseCount = 0;
        this.onended = null;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
      pause() {
        this.pauseCount += 1;
      }
      end() {
        this.onended?.();
      }
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio, timers });
    audio.startBackgroundMusic();
    audio.roll();

    const background = created.find((player) => player.path === "./assets/audio/lobby-background.mp3");
    const roll = created.find((player) => player.path === "./assets/audio/roll.mp3");
    roll.end();

    assert.equal(background.playCount, 1);
    assert.equal(background.pauseCount, 0);
    assert.ok(background.volume < 0.4);
    timers.tick(18);
    assert.equal(background.pauseCount, 1);
    assert.equal(background.volume, 0);
  });

  it("fades background music back in after the mastered clip ends", () => {
    const created = [];
    const timers = createFakeTimers();
    class FakeAudio {
      constructor(path) {
        this.path = path;
        this.volume = 1;
        this.loop = false;
        this.playCount = 0;
        this.pauseCount = 0;
        this.onended = null;
        created.push(this);
      }
      load() {}
      play() {
        this.playCount += 1;
        return Promise.resolve();
      }
      pause() {
        this.pauseCount += 1;
      }
      end() {
        this.onended?.();
      }
    }

    const audio = createGameAudio({ AudioContextClass: null, AudioClass: FakeAudio, random: () => 0, timers });
    audio.startBackgroundMusic();
    audio.prepareMastered();
    audio.mastered();
    timers.tick(18);

    const background = created.find((player) => player.path === "./assets/audio/lobby-background.mp3");
    const mastered = created.find((player) => player.path === "./assets/audio/mastered/001_00-00_Darude%20-%20Moments%20CSGO.mp3");
    mastered.end();

    assert.equal(background.pauseCount, 1);
    assert.equal(background.playCount, 2);
    assert.ok(background.volume < 0.22);
    timers.tick(18);
    assert.equal(background.volume, 0.4);
  });
});

function createFakeTimers() {
  let timerId = 0;
  const intervals = new Map();
  return {
    setInterval(callback) {
      timerId += 1;
      intervals.set(timerId, callback);
      return timerId;
    },
    clearInterval(id) {
      intervals.delete(id);
    },
    tick(count = 1) {
      for (let index = 0; index < count; index += 1) {
        for (const callback of [...intervals.values()]) {
          callback();
        }
      }
    },
  };
}
