import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { parseVocabulary } from "./parser.js";

describe("parseVocabulary", () => {
  test("parses dash, en dash, em dash, colon, comma, and tab separated rows", () => {
    const result = parseVocabulary(
      [
        "abate - become less intense",
        "brisk – quick and energetic",
        "candid — truthful and direct",
        "dormant: inactive",
        "elated, very happy",
        "frugal\tcareful with money",
      ].join("\n"),
    );

    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.summary, {
      cardCount: 6,
      blankLineCount: 0,
      duplicateCount: 0,
      errorCount: 0,
    });
    assert.deepEqual(result.cards, [
      {
        id: "card-1",
        term: "abate",
        meaning: "become less intense",
        seenCount: 0,
        correctCount: 0,
        missCount: 0,
      },
      {
        id: "card-2",
        term: "brisk",
        meaning: "quick and energetic",
        seenCount: 0,
        correctCount: 0,
        missCount: 0,
      },
      {
        id: "card-3",
        term: "candid",
        meaning: "truthful and direct",
        seenCount: 0,
        correctCount: 0,
        missCount: 0,
      },
      {
        id: "card-4",
        term: "dormant",
        meaning: "inactive",
        seenCount: 0,
        correctCount: 0,
        missCount: 0,
      },
      {
        id: "card-5",
        term: "elated",
        meaning: "very happy",
        seenCount: 0,
        correctCount: 0,
        missCount: 0,
      },
      {
        id: "card-6",
        term: "frugal",
        meaning: "careful with money",
        seenCount: 0,
        correctCount: 0,
        missCount: 0,
      },
    ]);
  });

  test("parses Quizlet-style repeated term and definition line pairs", () => {
    const result = parseVocabulary(
      ["gregarious", "fond of company", "hapless", "unlucky"].join("\n"),
    );

    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.cards.map(({ term, meaning }) => ({ term, meaning })), [
      { term: "gregarious", meaning: "fond of company" },
      { term: "hapless", meaning: "unlucky" },
    ]);
  });

  test("ignores blank lines and skips duplicate terms after the first card", () => {
    const result = parseVocabulary(
      ["keen - eager", "", "keen: sharp", "lucid - clear", "   "].join("\n"),
    );

    assert.deepEqual(result.cards.map(({ term, meaning }) => ({ term, meaning })), [
      { term: "keen", meaning: "eager" },
      { term: "lucid", meaning: "clear" },
    ]);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.summary, {
      cardCount: 2,
      blankLineCount: 2,
      duplicateCount: 1,
      errorCount: 0,
    });
  });

  test("reports invalid rows and unpaired lines as missing meanings", () => {
    const result = parseVocabulary(["lonely", "mirth - ", "neat - tidy"].join("\n"));

    assert.deepEqual(result.cards.map(({ term, meaning }) => ({ term, meaning })), [
      { term: "neat", meaning: "tidy" },
    ]);
    assert.deepEqual(result.errors, [
      { line: 1, text: "lonely", reason: "Missing meaning" },
      { line: 2, text: "mirth - ", reason: "Missing meaning" },
    ]);
    assert.deepEqual(result.summary, {
      cardCount: 1,
      blankLineCount: 0,
      duplicateCount: 0,
      errorCount: 2,
    });
  });
});
