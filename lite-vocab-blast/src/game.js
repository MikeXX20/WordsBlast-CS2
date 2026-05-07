const DIRECTIONS = new Set(["term-to-meaning", "meaning-to-term"]);
const STARTING_LIVES = 3;
const MAX_CHOICES = 4;
const RECENT_WINDOW = 10;

export function createSession(cards, direction, random = Math.random) {
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error("createSession requires at least one card.");
  }

  if (!DIRECTIONS.has(direction)) {
    throw new Error(`Unsupported direction: ${direction}`);
  }

  return {
    cards: cards.slice(),
    direction,
    random,
    score: 0,
    combo: 0,
    lives: STARTING_LIVES,
    level: 1,
    roundsPlayed: 0,
    currentRound: null,
    weakQueue: [],
    recentAnswers: [],
  };
}

export function nextRound(session) {
  const card = pickCard(session);
  const roundNumber = session.roundsPlayed + 1;
  const recentAccuracy = getRecentAccuracy(session.recentAnswers);
  const correctText = getCorrectText(card, session.direction);

  const round = {
    card,
    prompt: getPrompt(card, session.direction),
    correctText,
    choices: buildChoices(session.cards, card, session.direction, session.random),
    difficulty: getDifficulty({ level: session.level, recentAccuracy }),
  };

  session.roundsPlayed = roundNumber;
  session.level = Math.max(1, Math.floor(roundNumber / 3) + 1);
  session.currentRound = round;

  return round;
}

export function answerCurrent(session, answerText) {
  if (!session.currentRound) {
    throw new Error("No current round to answer.");
  }

  const correct = normalizeAnswer(answerText) === normalizeAnswer(session.currentRound.correctText);

  if (correct) {
    session.combo += 1;
    session.score += 100 + session.combo * 10;
  } else {
    session.lives = Math.max(0, session.lives - 1);
    session.combo = 0;
    session.weakQueue.push(session.currentRound.card.id);
  }

  session.recentAnswers.push(correct);
  if (session.recentAnswers.length > RECENT_WINDOW) {
    session.recentAnswers.shift();
  }

  const result = {
    correct,
    correctText: session.currentRound.correctText,
    card: session.currentRound.card,
    score: session.score,
    combo: session.combo,
    lives: session.lives,
  };

  session.currentRound = null;
  return result;
}

export function getDifficulty({ level, recentAccuracy }) {
  const safeLevel = Math.max(1, Number(level) || 1);
  const safeAccuracy = clamp(Number(recentAccuracy) || 0, 0, 1);
  const pressure = safeAccuracy >= 0.8 ? 0.06 : safeAccuracy < 0.5 ? -0.04 : 0;
  const baseSpeed = 0.38 + (safeLevel - 1) * 0.04 + pressure;
  const maxSpeed = safeLevel >= 9 ? 0.72 : 0.8;

  return {
    level: safeLevel,
    speed: roundToHundredths(clamp(baseSpeed, 0.3, maxSpeed)),
    choiceLimit: safeLevel >= 5 ? 4 : 3,
  };
}

function pickCard(session) {
  const weakCardId = session.weakQueue.shift();
  const weakCard = weakCardId
    ? session.cards.find((card) => card.id === weakCardId)
    : null;

  if (weakCard) {
    return weakCard;
  }

  const index = Math.floor(clamp(session.random(), 0, 0.999999) * session.cards.length);
  return session.cards[index];
}

function buildChoices(cards, currentCard, direction, random) {
  const correctText = getCorrectText(currentCard, direction);
  const distractors = cards
    .filter((card) => card.id !== currentCard.id)
    .map((card) => getCorrectText(card, direction))
    .filter((choice) => choice !== correctText);
  const choices = [correctText, ...distractors].slice(0, Math.min(MAX_CHOICES, cards.length));

  return shuffle(choices, random);
}

function shuffle(values, random) {
  const shuffled = values.slice();

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(clamp(random(), 0, 0.999999) * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function getPrompt(card, direction) {
  return direction === "term-to-meaning" ? card.term : card.meaning;
}

function getCorrectText(card, direction) {
  return direction === "term-to-meaning" ? card.meaning : card.term;
}

function getRecentAccuracy(recentAnswers) {
  if (recentAnswers.length === 0) {
    return 0.5;
  }

  const correctCount = recentAnswers.filter(Boolean).length;
  return correctCount / recentAnswers.length;
}

function normalizeAnswer(answer) {
  return String(answer).trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToHundredths(value) {
  return Math.round(value * 100) / 100;
}
