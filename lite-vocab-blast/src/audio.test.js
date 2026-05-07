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
});
