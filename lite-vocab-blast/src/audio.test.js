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
    assert.equal(soundForAnswer({ isCorrect: true, allMastered: true }), "mastered");
  });

  it("uses the provided headshot asset for correct blasts", () => {
    const audio = createGameAudio({ AudioContextClass: null });

    assert.equal(audio.assets.correct, "./assets/audio/ak-headshot.mp3");
  });
});
