const OTHER_SEPARATORS = [":", ",", "\t"];

export function parseVocabulary(text) {
  const cards = [];
  const errors = [];
  const seenTerms = new Set();
  let blankLineCount = 0;
  let duplicateCount = 0;
  let pendingLine = null;

  const lines = String(text ?? "").split(/\r?\n/);

  function addCard(term, meaning) {
    const normalizedTerm = term.trim();
    const normalizedMeaning = meaning.trim();
    const duplicateKey = normalizedTerm.toLocaleLowerCase();

    if (seenTerms.has(duplicateKey)) {
      duplicateCount += 1;
      return;
    }

    seenTerms.add(duplicateKey);
    cards.push({
      id: `card-${cards.length + 1}`,
      term: normalizedTerm,
      meaning: normalizedMeaning,
      seenCount: 0,
      correctCount: 0,
      missCount: 0,
    });
  }

  function addMissingMeaningError(line) {
    errors.push({
      line: line.number,
      text: line.text,
      reason: "Missing meaning",
    });
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = {
      number: index + 1,
      text: lines[index],
    };
    const trimmed = line.text.trim();

    if (!trimmed) {
      blankLineCount += 1;
      continue;
    }

    const separatedRow = splitSeparatedRow(trimmed);
    if (separatedRow) {
      if (pendingLine) {
        addMissingMeaningError(pendingLine);
        pendingLine = null;
      }

      if (!separatedRow.term || !separatedRow.meaning) {
        addMissingMeaningError(line);
        continue;
      }

      addCard(separatedRow.term, separatedRow.meaning);
      continue;
    }

    if (pendingLine) {
      addCard(pendingLine.text, trimmed);
      pendingLine = null;
      continue;
    }

    pendingLine = {
      number: line.number,
      text: trimmed,
    };
  }

  if (pendingLine) {
    addMissingMeaningError(pendingLine);
  }

  return {
    cards,
    errors,
    summary: {
      cardCount: cards.length,
      blankLineCount,
      duplicateCount,
      errorCount: errors.length,
    },
  };
}

function splitSeparatedRow(line) {
  const dashMatch = line.match(/^(.*?)\s[-–—]\s?(.*)$/);
  if (dashMatch) {
    return {
      term: dashMatch[1].trim(),
      meaning: dashMatch[2].trim(),
    };
  }

  for (const separator of OTHER_SEPARATORS) {
    const separatorIndex = line.indexOf(separator);
    if (separatorIndex === -1) {
      continue;
    }

    return {
      term: line.slice(0, separatorIndex).trim(),
      meaning: line.slice(separatorIndex + separator.length).trim(),
    };
  }

  return null;
}
