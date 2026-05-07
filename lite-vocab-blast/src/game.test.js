import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  answerCurrent,
  createSession,
  getDifficulty,
  nextRound,
} from "./game.js";

const cards = [
  { id: "one", term: "serene", meaning: "calm and peaceful" },
  { id: "two", term: "vivid", meaning: "bright and clear" },
  { id: "three", term: "nimble", meaning: "quick and light" },
  { id: "four", term: "sturdy", meaning: "strong and solid" },
];

describe("game session", () => {
  it("builds term-to-meaning rounds", () => {
    const session = createSession(cards, "term-to-meaning", () => 0);
    const round = nextRound(session);

    assert.equal(round.card.id, "one");
    assert.equal(round.prompt, "serene");
    assert.equal(round.correctText, "calm and peaceful");
    assert.ok(round.choices.includes("calm and peaceful"));
  });

  it("builds meaning-to-term rounds", () => {
    const session = createSession(cards, "meaning-to-term", () => 0.26);
    const round = nextRound(session);

    assert.equal(round.card.id, "two");
    assert.equal(round.prompt, "bright and clear");
    assert.equal(round.correctText, "vivid");
    assert.ok(round.choices.includes("vivid"));
  });

  it("updates score and combo for correct answers", () => {
    const session = createSession(cards, "term-to-meaning", () => 0);
    nextRound(session);

    const result = answerCurrent(session, "calm and peaceful");

    assert.equal(result.correct, true);
    assert.ok(session.score > 0);
    assert.equal(session.combo, 1);
    assert.equal(session.lives, 3);
    assert.deepEqual(session.recentAnswers, [true]);
  });

  it("costs one life, resets combo, and queues weak cards for wrong answers", () => {
    const session = createSession(cards, "term-to-meaning", () => 0);
    nextRound(session);
    session.combo = 3;

    const result = answerCurrent(session, "not even close");

    assert.equal(result.correct, false);
    assert.equal(session.lives, 2);
    assert.equal(session.combo, 0);
    assert.deepEqual(session.weakQueue, ["one"]);
    assert.deepEqual(session.recentAnswers, [false]);
  });

  it("creates usable choices with fewer than four cards", () => {
    const smallDeck = cards.slice(0, 2);
    const session = createSession(smallDeck, "meaning-to-term", () => 0);
    const round = nextRound(session);

    assert.equal(round.choices.length, 2);
    assert.equal(new Set(round.choices).size, 2);
    assert.ok(round.choices.includes("serene"));
  });

  it("caps adaptive speed at 0.72 after level 9", () => {
    assert.ok(getDifficulty({ level: 9, recentAccuracy: 1 }).speed <= 0.72);
    assert.equal(getDifficulty({ level: 14, recentAccuracy: 1 }).speed, 0.72);
  });
});
