import React from 'react';
import { Moon, Sun, Languages, Type, X, Bot } from 'lucide-react';
import { useClickAway } from '../hooks/useClickAway';
import { Settings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export function SettingsPanel({ isOpen, onClose, settings, setSettings }: SettingsPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const firstFocusableRef = React.useRef<HTMLButtonElement>(null);

  useClickAway(panelRef, onClose);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const translations = {
    en: {
      settings: 'Settings',
      theme: 'Theme',
      darkMode: 'Dark mode',
      language: 'Language',
      fontSize: 'Font Size',
      reset: 'Reset to Defaults',
      enableAI: 'Enable AI Assistant',
      aiDisclaimer: 'AI requires ChatGPT account'
    },
    ru: {
      settings: 'Настройки',
      theme: 'Тема',
      darkMode: 'Темный режим',
      language: 'Язык',
      fontSize: 'Размер шрифта',
      reset: 'Сбросить настройки',
      enableAI: 'Включить ИИ-помощник',
      aiDisclaimer: 'Для работы ИИ требуется аккаунт ChatGPT'
    },
  };

  const t = translations[settings.language];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Settings panel"
    >
      <div
        ref={panelRef}
        className={`w-full max-w-md h-full overflow-y-auto shadow-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
      >
        <div className={`p-4 border-b sticky top-0 z-10 ${settings.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t.settings}</h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Sun className="h-4 w-4 mr-2" />
              {t.theme}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.darkMode}</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
                role="switch"
                aria-checked={settings.theme === 'dark'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full ${settings.theme === 'dark' ? 'bg-white translate-x-6' : 'bg-gray-600 translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          {/* Добавленная секция для AI ассистента */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              {t.enableAI}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.aiDisclaimer}</span>
              <button
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  showAIChat: !prev.showAIChat 
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.showAIChat ? 'bg-indigo-600' : 'bg-gray-300'}`}
                role="switch"
                aria-checked={settings.showAIChat}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full ${settings.showAIChat ? 'bg-white translate-x-6' : 'bg-gray-600 translate-x-1'}`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <a 
                href="https://chat.openai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t.aiDisclaimer}
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              {t.language}
            </h3>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'ru' }))}
              className={`mt-1 block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${settings.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center">
              <Type className="h-4 w-4 mr-2" />
              {t.fontSize}
            </h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="12"
                max="20"
                value={settings.fontSize}
                onChange={(e) => setSettings(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-sm min-w-[3ch]">{settings.fontSize}px</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSettings({ 
                theme: 'light', 
                language: 'en', 
                fontSize: 16,
                showAIChat: false 
              })}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md ${settings.theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {t.reset}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}