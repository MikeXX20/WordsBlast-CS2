import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getReviewCards, isMastered, normalizeMasteryTarget, recordAnswer, summarizeProgress } from "./progress.js";

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

  it("caps correct answers at mastery count", () => {
    const card = { id: "1", seenCount: 3, correctCount: 3, missCount: 0 };

    assert.deepEqual(recordAnswer(card, true), {
      id: "1",
      seenCount: 4,
      correctCount: 3,
      missCount: 0,
      mastered: true,
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
      masteredCount: 0,
      masteryPercent: 0,
      reviewCount: 3,
      bestScore: 12,
    });
  });

  it('returns zero accuracy when no answers have been seen', () => {
    assert.deepEqual(summarizeProgress([{ missCount: 1 }], 0), {
      cardCount: 1,
      accuracy: 0,
      weakCount: 1,
      masteredCount: 0,
      masteryPercent: 0,
      reviewCount: 1,
      bestScore: 0,
    });
  });

  it("tracks mastered and review totals", () => {
    const cards = [
      { correctCount: 3, missCount: 0 },
      { correctCount: 3, missCount: 2 },
      { correctCount: 1, missCount: 0 },
      { correctCount: 0, missCount: 0 },
    ];

    assert.deepEqual(summarizeProgress(cards, 900), {
      cardCount: 4,
      accuracy: 0,
      weakCount: 1,
      masteredCount: 2,
      masteryPercent: 50,
      reviewCount: 2,
      bestScore: 900,
    });
  });

  it("uses only whole-number mastery targets from 1 through 20", () => {
    for (const target of [1, 5, 20]) {
      assert.equal(normalizeMasteryTarget(target), target);
    }
    for (const target of [undefined, null, "5", 0, 21, 1.5, Infinity, NaN]) {
      assert.equal(normalizeMasteryTarget(target), 3);
    }
  });

  it("retires a word after one correct answer when the target is one", () => {
    const result = recordAnswer({ id: "one" }, true, 1);

    assert.equal(result.correctCount, 1);
    assert.equal(result.mastered, true);
  });

  it("counts cumulative correct answers toward a target of five", () => {
    let card = { id: "one" };
    for (const correct of [true, false, true, true, false, true]) {
      card = recordAnswer(card, correct, 5);
      assert.notEqual(card.mastered, true);
    }
    card = recordAnswer(card, true, 5);

    assert.equal(card.correctCount, 5);
    assert.equal(card.seenCount, 7);
    assert.equal(card.missCount, 2);
    assert.equal(card.mastered, true);
    assert.equal(recordAnswer(card, true, 5).correctCount, 5);
  });

  it("does not retire a word after a wrong answer at a target of one", () => {
    const result = recordAnswer({ id: "one" }, false, 1);

    assert.equal(result.correctCount, 0);
    assert.notEqual(result.mastered, true);
  });

  it("keeps a retired word mastered when the target later increases", () => {
    const retired = recordAnswer({ id: "one" }, true, 1);
    const result = recordAnswer(retired, false, 5);

    assert.equal(result.mastered, true);
    assert.equal(isMastered(result, 5), true);
  });

  it("recognizes saved retirement and legacy counts at the selected target", () => {
    assert.equal(isMastered({ mastered: true, correctCount: 1 }, 5), true);
    assert.equal(isMastered({ correctCount: 3 }), true);
    assert.equal(isMastered({ correctCount: 4 }, 5), false);
    assert.equal(isMastered({ correctCount: 5 }, 5), true);
  });

  it("excludes retired words with historical misses from review", () => {
    const cards = [
      { id: "retired", correctCount: 1, missCount: 2, mastered: true },
      { id: "legacy", correctCount: 5, missCount: 1 },
      { id: "learning", correctCount: 4, missCount: 0 },
    ];

    assert.deepEqual(getReviewCards(cards, 5).map((card) => card.id), ["learning"]);
  });

  it("summarizes permanent retirement and the current mastery target", () => {
    const cards = [
      { mastered: true, seenCount: 3, correctCount: 1, missCount: 2 },
      { seenCount: 6, correctCount: 5, missCount: 1 },
      { seenCount: 4, correctCount: 4, missCount: 0 },
    ];

    assert.deepEqual(summarizeProgress(cards, 120, 5), {
      cardCount: 3,
      accuracy: 77,
      weakCount: 2,
      masteredCount: 2,
      masteryPercent: 67,
      reviewCount: 1,
      bestScore: 120,
    });
  });
});
