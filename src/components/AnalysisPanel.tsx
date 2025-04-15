import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { TextAnalysis } from '../types';
import { useClickAway } from '../hooks/useClickAway';
import { TextAnalysisPanel } from './TextAnalysisPanel';

interface AnalysisPanelProps {
  analysis: TextAnalysis;
  onClose: () => void;
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
}

export function AnalysisPanel({ analysis, onClose, theme, language }: AnalysisPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useClickAway(panelRef, onClose);

  useEffect(() => {
    firstFocusableRef.current?.focus();
  }, []);

  const t = {
    en: { title: 'Analysis Results' },
    ru: { title: 'Результаты анализа' },
  }[language];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div
        ref={panelRef}
        className={`w-full max-w-md h-full overflow-y-auto shadow-xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      >
        <div className={`p-4 border-b sticky top-0 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close analysis"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <TextAnalysisPanel analysis={analysis} theme={theme} language={language} />
        </div>
      </div>
    </div>
  );
}