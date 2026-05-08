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

  it("plays menu and start roll clips as modest UI sounds", () => {
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
    assert.deepEqual(created.map((player) => player.volume), [0.32, 0.4]);
    assert.deepEqual(created.map((player) => player.playCount), [1, 1]);
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
    assert.ok(background.volume < 0.22);
    timers.tick(5);
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
    timers.tick(5);

    const background = created.find((player) => player.path === "./assets/audio/lobby-background.mp3");
    const mastered = created.find((player) => player.path === "./assets/audio/mastered/001_00-00_Darude%20-%20Moments%20CSGO.mp3");
    mastered.end();

    assert.equal(background.pauseCount, 1);
    assert.equal(background.playCount, 2);
    assert.ok(background.volume < 0.22);
    timers.tick(5);
    assert.equal(background.volume, 0.22);
  });
});

function createFakeTimers() {
  const intervals = new Set();
  return {
    setInterval(callback) {
      intervals.add(callback);
      return callback;
    },
    clearInterval(callback) {
      intervals.delete(callback);
    },
    tick(count = 1) {
      for (let index = 0; index < count; index += 1) {
        for (const callback of [...intervals]) {
          callback();
        }
      }
    },
  };
}
