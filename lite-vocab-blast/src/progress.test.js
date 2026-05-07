import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recordAnswer, summarizeProgress } from "./progress.js";

describe('progress', () => {
  it('records a correct answer', () => {
    const card = { id: '1', seenCount: 1, correctCount: 1, missCount: 1 };

    assert.deepEqual(recordAnswer(card, true), {
      id: '1',
      seenCount: 2,
      correctCount: 2,
      missCount: 1,
    });
  });

  it('records a wrong answer', () => {
    const card = { id: '1', seenCount: 1, correctCount: 1, missCount: 1 };

    assert.deepEqual(recordAnswer(card, false), {
      id: '1',
      seenCount: 2,
      correctCount: 1,
      missCount: 2,
    });
  });

  it('treats missing progress counters as zero', () => {
    assert.deepEqual(recordAnswer({ id: "1" }, true), {
      id: "1",
      seenCount: 1,
      correctCount: 1,
      missCount: 0,
    });
  });

  it('summarizes card count, rounded accuracy, weak cards, and best score', () => {
    const cards = [
      { seenCount: 3, correctCount: 2, missCount: 1 },
      { seenCount: 2, correctCount: 2, missCount: 0 },
      { seenCount: 0, correctCount: 0, missCount: 0 },
    ];

    assert.deepEqual(summarizeProgress(cards, 12), {
      cardCount: 3,
      accuracy: 80,
      weakCount: 1,
      bestScore: 12,
    });
  });

  it('returns zero accuracy when no answers have been seen', () => {
    assert.deepEqual(summarizeProgress([{ missCount: 1 }], 0), {
      cardCount: 1,
      accuracy: 0,
      weakCount: 1,
      bestScore: 0,
    });
  });
});
