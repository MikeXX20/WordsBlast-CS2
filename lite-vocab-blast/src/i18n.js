export const SUPPORTED_LANGUAGES = ["en", "zh"];

export const TEXT = {
  en: {
    appTitle: "Lite Vocabulary Blast",
    musicOn: "Music On",
    musicOff: "Music Off",
    languageButton: "中文",
    setupLabel: "Vocabulary setup",
    gameLabel: "Blast game",
    brandTitle: "Vocab Blast",
    brandSubtitle: "Import words, choose a direction, and practice at a gentle pace.",
    importLabel: "Import vocabulary",
    importPlaceholder: "apple - 苹果\naccelerate - speed up",
    importButton: "Import",
    clearButton: "Clear",
    deckHeading: "Deck",
    cardsStat: "Cards",
    accuracyStat: "Accuracy",
    weakWordsStat: "Weak words",
    bestScoreStat: "Best score",
    modeHeading: "Mode",
    directionLegend: "Practice direction",
    wordToMeaning: "Word to Meaning",
    meaningToWord: "Meaning to Word",
    startButton: "Start Blast",
    soundOn: "Sound On",
    soundOff: "Sound Off",
    nightOn: "Night On",
    nightOff: "Night Off",
    scoreHud: "Score",
    levelHud: "Level",
    livesHud: "Lives",
    comboHud: "Combo",
    pauseButton: "Pause",
    resumeButton: "Resume",
    restartButton: "Restart",
    pasteFirst: "Paste vocabulary first.",
    deckCleared: "Deck cleared.",
    importedSummary: "Imported {cards} cards. Skipped {blanks} empty lines. Found {duplicates} duplicates.",
    saveWarning: "Progress may not save: {reason}",
    errorLine: "Line {line}: {reason} ({text})",
    allMastered: "All words mastered.",
    sessionComplete: "Session complete. Score: {score}",
    chooseMode: "Choose a mode and start Blast.",
    importToBegin: "Import at least one card to begin.",
    answerBubbles: "Answer bubbles will appear here.",
    practiceAgain: "Press Start Blast to practice again.",
  },
  zh: {
    appTitle: "轻量单词爆破",
    musicOn: "音乐开",
    musicOff: "音乐关",
    languageButton: "EN",
    setupLabel: "词汇设置",
    gameLabel: "爆破练习",
    brandTitle: "单词爆破",
    brandSubtitle: "导入单词，选择练习方向，用温和节奏记忆词汇。",
    importLabel: "导入词汇",
    importPlaceholder: "apple - 苹果\naccelerate - 加速",
    importButton: "导入",
    clearButton: "清空",
    deckHeading: "词库",
    cardsStat: "卡片",
    accuracyStat: "正确率",
    weakWordsStat: "薄弱词",
    bestScoreStat: "最高分",
    modeHeading: "模式",
    directionLegend: "练习方向",
    wordToMeaning: "单词到释义",
    meaningToWord: "释义到单词",
    startButton: "开始爆破",
    soundOn: "音效开",
    soundOff: "音效关",
    nightOn: "夜间开",
    nightOff: "夜间关",
    scoreHud: "分数",
    levelHud: "等级",
    livesHud: "生命",
    comboHud: "连击",
    pauseButton: "暂停",
    resumeButton: "继续",
    restartButton: "重开",
    pasteFirst: "请先粘贴词汇。",
    deckCleared: "词库已清空。",
    importedSummary: "已导入 {cards} 张卡片。跳过 {blanks} 个空行。发现 {duplicates} 个重复词。",
    saveWarning: "进度可能无法保存：{reason}",
    errorLine: "第 {line} 行：{reason}（{text}）",
    allMastered: "所有词汇已掌握。",
    sessionComplete: "本轮完成。分数：{score}",
    chooseMode: "选择模式并开始爆破。",
    importToBegin: "至少导入一张卡片才能开始。",
    answerBubbles: "答案泡泡会出现在这里。",
    practiceAgain: "点击开始爆破继续练习。",
  },
};

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : "en";
}

export function nextLanguage(language) {
  return normalizeLanguage(language) === "en" ? "zh" : "en";
}

export function getText(language, key) {
  const normalized = normalizeLanguage(language);
  return TEXT[normalized][key] ?? TEXT.en[key] ?? key;
}

export function getTextWithVars(language, key, values = {}) {
  return getText(language, key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
}
