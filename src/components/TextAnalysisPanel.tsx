import React from 'react';
import type { TextAnalysis } from '../types';

interface TextAnalysisPanelProps {
  analysis: TextAnalysis;
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
}

export function TextAnalysisPanel({ analysis, theme, language }: TextAnalysisPanelProps) {
  const translations = {
    en: {
      wordStats: 'Word Stats',
      words: 'Words',
      characters: 'Characters',
      sentences: 'Sentences',
      averageWordLength: 'Average Word Length',
      longWords: 'Long Words',
      noLongWords: 'No long words found.',
      commonWords: 'Common Words',
      noCommonWords: 'No common words found.',
    },
    ru: {
      wordStats: 'Статистика слов',
      words: 'Слов',
      characters: 'Символов',
      sentences: 'Предложений',
      averageWordLength: 'Средняя длина слова',
      longWords: 'Длинные слова',
      noLongWords: 'Длинные слова не найдены.',
      commonWords: 'Частые слова',
      noCommonWords: 'Частые слова не найдены.',
    },
  };

  const t = translations[language];

  // Проверяем, есть ли длинные слова, которые требуют больше места
  const hasLongContent =
    analysis.longWords.some(word => word.length > 20) || // Уменьшаем порог с 50 до 20 символов
    analysis.commonWords.some(word => word.word.length > 20);

  return (
    <div className={`flex ${hasLongContent ? 'flex-wrap' : 'flex'} gap-4`}>
      {/* Word Stats */}
      <div
        className={`p-4 border rounded-lg ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        } ${hasLongContent ? 'w-full' : 'flex-1'}`}
      >
        <h3 className="text-lg font-semibold mb-2">{t.wordStats}</h3>
        <ul className="space-y-1">
          <li>{t.words}: {analysis.wordCount}</li>
          <li>{t.characters}: {analysis.characterCount}</li>
          <li>{t.sentences}: {analysis.sentenceCount}</li>
          {analysis.averageWordLength > 0 && (
            <li>
              {t.averageWordLength}: {analysis.averageWordLength.toFixed(2)}
            </li>
          )}
        </ul>
      </div>

      {/* Long Words */}
      <div
        className={`p-4 border rounded-lg ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        } ${hasLongContent ? 'w-full' : 'flex-1'}`}
      >
        <h3 className="text-lg font-semibold mb-2">{t.longWords}</h3>
        {analysis.longWords.length > 0 ? (
          <ul className="space-y-1">
            {analysis.longWords.map((word, index) => (
              <li key={index} className="break-words">
                {word}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t.noLongWords}</p>
        )}
      </div>

      {/* Common Words */}
      <div
        className={`p-4 border rounded-lg ${
          theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
        } ${hasLongContent ? 'w-full' : 'flex-1'}`}
      >
        <h3 className="text-lg font-semibold mb-2">{t.commonWords}</h3>
        {analysis.commonWords.length > 0 ? (
          <ul className="space-y-1">
            {analysis.commonWords.map((word, index) => (
              <li key={index} className="break-words">
                {word.word} ({word.count}x)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">{t.noCommonWords}</p>
        )}
      </div>
    </div>
  );
}