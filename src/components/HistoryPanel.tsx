import React from 'react';
import { HistoryEntry } from '../types';
import { Trash2, X } from 'lucide-react';
import { useClickAway } from '../hooks/useClickAway';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  language: 'en' | 'ru';
  theme: 'light' | 'dark';
}

export function HistoryPanel({ history, onSelect, onDelete, onClose, language, theme }: HistoryPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const firstFocusableRef = React.useRef<HTMLButtonElement>(null);

  useClickAway(panelRef, onClose);

  React.useEffect(() => {
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, []);

  const translations = {
    en: {
      history: 'History',
      noHistory: 'No history available',
      delete: 'Delete',
    },
    ru: {
      history: 'История',
      noHistory: 'История отсутствует',
      delete: 'Удалить',
    },
  };

  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div
        ref={panelRef}
        className={`w-full max-w-md h-full overflow-y-auto shadow-xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      >
        <div className={`p-4 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t.history}</h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close history"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">{t.noHistory}</p>
          ) : (
            <ul className="space-y-4">
              {history.map((entry) => (
                <li 
                  key={entry.id}
                  className={`p-4 border rounded-lg cursor-pointer ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => onSelect(entry)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words">{entry.preview}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(entry.id);
                      }}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      aria-label={t.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}