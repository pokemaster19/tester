import { TextAnalysis, TextError } from '../types';

// Функция для анализа текста
export function analyzeText(text: string): TextAnalysis {
  if (!text.trim()) {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      averageWordLength: 0,
      longWords: [],
      commonWords: [],
    };
  }

  const words = text.trim().split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    const normalized = word.toLowerCase();
    wordFrequency[normalized] = (wordFrequency[normalized] || 0) + 1;
  });

  const commonWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  const longWords = [...new Set(words.filter(word => word.length > 8))];

  const totalCharacters = words.reduce((sum, word) => sum + word.length, 0);
  const averageWordLength = words.length ? totalCharacters / words.length : 0;

  return {
    wordCount: words.length,
    characterCount: text.length,
    sentenceCount: sentences.length,
    averageWordLength: Number(averageWordLength.toFixed(1)),
    longWords: longWords.slice(0, 5),
    commonWords,
  };
}

// Функция для получения сокращенного текста
function getShortSummary(text: string): string {
  const words = text.split(/\s+/); // Разбиваем текст на слова

  // Простой фильтр для существительных и глаголов (используются базовые регулярки для примера)
  const filteredWords = words.filter(word => {
    // Фильтруем слова, например, через регулярные выражения
    return /\b(\w+)\b/.test(word); // Это просто пример для фильтрации
  });

  return filteredWords.join(' '); // Возвращаем сокращённый текст
}

// Словарь неправильных слов
const incorrectWords = [
  'вечерррм', 'домй', 'вдргг', 'ттень', 'спросла', 'бьло', 'птшла',
  'бысрее', 'ногг', 'споткнлась', 'кррень', 'кошкаа', 'засмеялсь', 'серце',
  'стукло', 'вдрууг', 'тмны', 'старичк', 'фонарм', 'бйсь', 'футбоо',
  'дворц', 'полетнл', 'подуумал', 'назд', 'выбежла', 'мячм', 'вздхнул',
  'угрдел', 'тепеерь', 'грязныйыы', 'кррррч', 'экрне', 'птгас', 'пробрррбррмутал',
  'клавыатуру', 'млькнул', 'привт', 'пркхожу', 'раздлся', 'колонк', 'вырррвал', 'сдааам'
];

// Функция для поиска ошибок в тексте
export function findErrors(text: string): TextError[] {
  const errors: TextError[] = [];
  const words = text.split(/\s+/); // Разбиваем текст на слова
  let position = 0; // Позиция, с которой будем отсчитывать ошибки

  // Проходим по каждому слову
  words.forEach(word => {
    // Проверка на неправильные слова
    if (incorrectWords.includes(word.toLowerCase())) {
      errors.push({
        start: position,
        end: position + word.length,
        type: 'spelling',
        message: 'Incorrect spelling: possible typo',
        suggestions: [word], // Предложение исправления: само слово
      });
    }

    // Пример для пунктуации: проверка на повторяющиеся символы
    if (word.match(/(.)\1{2,}/)) {
      errors.push({
        start: position,
        end: position + word.length,
        type: 'punctuation',
        message: 'Possible punctuation error: repeated characters',
        suggestions: [word.replace(/(.)\1{2,}/g, '$1$1')],
      });
    }

    position += word.length + 1; // Сдвигаем позицию на следующее слово
  });

  return errors;
}

// Функция для подсветки ошибок в тексте
export function highlightTextWithErrors(text: string, errors: TextError[]): string {
  let highlightedText = text;

  // Для каждой ошибки в списке ошибок, подсвечиваем соответствующие слова
  errors.forEach(error => {
    const errorText = text.substring(error.start, error.end);
    highlightedText = highlightedText.replace(errorText, `<span style="color: red; font-weight: bold">${errorText}</span>`);
  });

  return highlightedText;
}
