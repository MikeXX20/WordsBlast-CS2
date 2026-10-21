export const MASTERY_CORRECT_COUNT = 3;

export function normalizeMasteryTarget(value) {
  return Number.isInteger(value) && value >= 1 && value <= 20 ? value : MASTERY_CORRECT_COUNT;
}

function counter(value) {
  return Number.isFinite(value) ? value : 0;
}

export function isMastered(card, target = MASTERY_CORRECT_COUNT) {
  return card.mastered === true || counter(card.correctCount) >= normalizeMasteryTarget(target);
}

export function getReviewCards(cards, target = MASTERY_CORRECT_COUNT) {
  return cards.filter((card) => !isMastered(card, target));
}

export function recordAnswer(card, isCorrect, target = MASTERY_CORRECT_COUNT) {
  const masteryTarget = normalizeMasteryTarget(target);
  const correctCount = Math.min(masteryTarget, counter(card.correctCount) + (isCorrect ? 1 : 0));
  const mastered = isMastered(card, masteryTarget) || correctCount >= masteryTarget;

  return {
    ...card,
    seenCount: counter(card.seenCount) + 1,
    correctCount,
    missCount: counter(card.missCount) + (isCorrect ? 0 : 1),
    ...(mastered ? { mastered: true } : {}),
  };
}

export function summarizeProgress(cards, bestScore, target = MASTERY_CORRECT_COUNT) {
  const totals = cards.reduce(
    (summary, card) => ({
      seenCount: summary.seenCount + counter(card.seenCount),
      correctCount: summary.correctCount + counter(card.correctCount),
      weakCount: summary.weakCount + (counter(card.missCount) > 0 ? 1 : 0),
      masteredCount: summary.masteredCount + (isMastered(card, target) ? 1 : 0),
    }),
    { seenCount: 0, correctCount: 0, weakCount: 0, masteredCount: 0 },
  );

  return {
    cardCount: cards.length,
    accuracy: totals.seenCount === 0 ? 0 : Math.round((totals.correctCount / totals.seenCount) * 100),
    weakCount: totals.weakCount,
    masteredCount: totals.masteredCount,
    masteryPercent: cards.length === 0 ? 0 : Math.round((totals.masteredCount / cards.length) * 100),
    reviewCount: getReviewCards(cards, target).length,
    bestScore,
  };
}
