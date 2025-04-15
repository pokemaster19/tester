import { TextError } from '../types';

interface CorrectedTextProps {
  text: string;
  errors: TextError[];
  theme: 'light' | 'dark';
}

export function CorrectedText({ text, errors, theme }: CorrectedTextProps) {
  if (!errors.length) {
    return <p className="p-4 break-words">{text}</p>; // Если ошибок нет, просто показываем текст
  }

  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  // Проходим по всем ошибкам
  errors.sort((a, b) => a.start - b.start).forEach((error, index) => {
    // Добавляем текст до ошибки
    if (lastIndex < error.start) {
      parts.push(
        <span key={`text-${index}`}>
          {text.slice(lastIndex, error.start)}
        </span>
      );
    }

    // Предлагаем исправление, если оно есть
    const suggestion = error.suggestions[0] || text.slice(error.start, error.end);
    parts.push(
      <span
        key={`error-${index}`}
        className={`error`} // Применяем класс для подсветки ошибки
        title={error.message} // Подсказка с ошибкой
      >
        {suggestion}
      </span>
    );

    lastIndex = error.end; // Обновляем позицию
  });

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    parts.push(<span key="remaining">{text.slice(lastIndex)}</span>);
  }

  return <p className="p-4 break-words">{parts}</p>;
}