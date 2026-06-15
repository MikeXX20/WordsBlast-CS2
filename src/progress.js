export const MASTERY_CORRECT_COUNT = 3;

function counter(value) {
  return Number.isFinite(value) ? value : 0;
}

export function recordAnswer(card, isCorrect) {
  return {
    ...card,
    seenCount: counter(card.seenCount) + 1,
    correctCount: Math.min(MASTERY_CORRECT_COUNT, counter(card.correctCount) + (isCorrect ? 1 : 0)),
    missCount: counter(card.missCount) + (isCorrect ? 0 : 1),
  };
}

export function summarizeProgress(cards, bestScore) {
  const totals = cards.reduce(
    (summary, card) => ({
      seenCount: summary.seenCount + counter(card.seenCount),
      correctCount: summary.correctCount + counter(card.correctCount),
      weakCount: summary.weakCount + (counter(card.missCount) > 0 ? 1 : 0),
      masteredCount: summary.masteredCount + (counter(card.correctCount) >= MASTERY_CORRECT_COUNT ? 1 : 0),
    }),
    { seenCount: 0, correctCount: 0, weakCount: 0, masteredCount: 0 },
  );

  return {
    cardCount: cards.length,
    accuracy: totals.seenCount === 0 ? 0 : Math.round((totals.correctCount / totals.seenCount) * 100),
    weakCount: totals.weakCount,
    masteredCount: totals.masteredCount,
    masteryPercent: cards.length === 0 ? 0 : Math.round((totals.masteredCount / cards.length) * 100),
    reviewCount: cards.filter((card) => counter(card.correctCount) < MASTERY_CORRECT_COUNT || counter(card.missCount) > 0).length,
    bestScore,
  };
}
