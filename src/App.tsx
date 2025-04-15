import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FileText, Upload, History, Settings as SettingsIcon, Book, AlertCircle, Bot } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { CorrectedText } from './components/CorrectedText';
import { AnalysisPanel } from './components/AnalysisPanel';
import { analyzeText, findErrors } from './utils/textAnalysis';
import { Settings, TextAnalysis, TextError, HistoryEntry } from './types';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const HISTORY_KEY = 'grammarguard_history';
const SETTINGS_KEY = 'grammarguard_settings';
const MAX_HISTORY_ENTRIES = 10;

function getShortSummary(text: string): string {
  const words = text.split(/\s+/);
  const shortWords = words.filter((_, index) => index % 2 === 0);
  return shortWords.join(' ');
}

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<TextAnalysis>({
    wordCount: 0,
    characterCount: 0,
    sentenceCount: 0,
    averageWordLength: 0,
    longWords: [],
    commonWords: [],
  });
  const [errors, setErrors] = useState<TextError[]>([]);
  const [shortenedText, setShortenedText] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'en',
    fontSize: 16,
    autoApplyCorrections: false,
    showAIChat: false,
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const newAnalysis = analyzeText(text);
    setAnalysis(newAnalysis);

    const summary = getShortSummary(text);
    setShortenedText(summary);

    const timer = setTimeout(() => {
      const newErrors = findErrors(text);
      setErrors(newErrors);

      if (text.trim()) {
        const correctedText = settings.autoApplyCorrections ? applyCorrections(text, newErrors) : text;
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          originalText: text,
          correctedText,
          analysis: newAnalysis,
          errors: newErrors,
          timestamp: Date.now(),
          preview: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
          language: settings.language,
        };

        setHistory((prevHistory) => {
          const updatedHistory = [newEntry, ...prevHistory].slice(0, MAX_HISTORY_ENTRIES);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
          return updatedHistory;
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text, settings.language, settings.autoApplyCorrections]);

  useEffect(() => {
    if (textAreaRef.current && analysisRef.current) {
      textAreaRef.current.style.height = 'auto';
      const textHeight = textAreaRef.current.scrollHeight;
      const minHeight = 200;
      const newHeight = Math.max(textHeight, minHeight);
      textAreaRef.current.style.height = `${newHeight}px`;
      analysisRef.current.style.minHeight = `${newHeight}px`;
    }
  }, [text]);

  const translations = {
    en: {
      title: 'GrammarGuard',
      inputText: 'Input Text',
      uploadFile: 'Upload File',
      correctedText: 'Corrected Text',
      analysisResults: 'Analysis Results',
      shortenedText: 'Shortened Text',
      history: 'History',
      settings: 'Settings',
      issuesFound: 'Potential issues found',
      enterText: 'Enter or paste your text here...',
      noAnalysis: 'Enter text to see corrected version',
      noText: 'No text to show',
      login: 'Login',
      aiAssistant: 'AI Assistant',
    },
    ru: {
      title: 'ГраммарГард',
      inputText: 'Ввод текста',
      uploadFile: 'Загрузить файл',
      correctedText: 'Исправленный текст',
      analysisResults: 'Результаты анализа',
      shortenedText: 'Сокращенный текст',
      history: 'История',
      settings: 'Настройки',
      issuesFound: 'Потенциальных проблем найдено',
      enterText: 'Введите или вставьте текст сюда...',
      noAnalysis: 'Введите текст для просмотра исправленной версии',
      noText: 'Текст для показа отсутствует',
      login: 'Войти',
      aiAssistant: 'ИИ Помощник',
    },
  };

  const t = translations[settings.language];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type === 'text/plain') {
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.onerror = () => {
        toast.error('Error reading text file');
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      reader.onload = async (e) => {
        try {
          const pdfData = e.target?.result as ArrayBuffer;
          const pdf = await pdfjsLib.getDocument(pdfData).promise;
          let text = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map((item: any) => item.str).join(' ') + ' ';
          }

          setText(text);
        } catch (error) {
          console.error('Error processing PDF:', error);
          toast.error('Failed to parse PDF file');
        }
      };
      reader.onerror = () => {
        toast.error('Error reading PDF file');
      };
      reader.readAsArrayBuffer(file);
    } else if (
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        mammoth
          .extractRawText({ arrayBuffer })
          .then((result) => {
            setText(result.value);
          })
          .catch((err) => {
            toast.error('Failed to parse .docx file');
          });
      };
      reader.onerror = () => {
        toast.error('Error reading Word file');
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Unsupported file type');
    }
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setText(entry.originalText);
    setIsHistoryOpen(false);
    toast.success(settings.language === 'en' ? 'Text loaded from history' : 'Текст загружен из истории');
  };

  const handleHistoryDelete = (id: string) => {
    setHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter((entry) => entry.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
    toast.success(settings.language === 'en' ? 'History entry deleted' : 'Запись истории удалена');
  };

  function applyCorrections(text: string, errors: TextError[]): string {
    if (!errors.length) return text;
    let result = text;
    errors.sort((a, b) => b.start - a.start).forEach((error) => {
      const suggestion = error.suggestions[0] || text.slice(error.start, error.end);
      result = result.slice(0, error.start) + suggestion + result.slice(error.end);
    });
    return result;
  }

  return (
    <Router>
      <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Toaster position="top-right" />
        
        {/* ChatGPT Widget */}
        {settings.showAIChat && (
          <div className="fixed bottom-4 right-4 z-50">
            <iframe
              src="https://chat.openai.com"
              className="w-[350px] h-[500px] rounded-lg shadow-xl border bg-white"
              title="AI Assistant"
            />
            <button 
              onClick={() => setSettings({...settings, showAIChat: false})}
              className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <header className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-20`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <Book className="h-8 w-8 text-indigo-600 flex-shrink-0" />
                <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <History className="h-5 w-5" />
                  <span>{t.history}</span>
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span>{t.settings}</span>
                </button>
                <button
                  onClick={() => setSettings({...settings, showAIChat: true})}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bot className="h-5 w-5" />
                  <span>{t.aiAssistant}</span>
                </button>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span>{t.login}</span>
                </Link>
              </div>
              <div className="flex md:hidden items-center space-x-2">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="p-2 rounded-full text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t.history}
                >
                  <History className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2 rounded-full text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t.settings}
                >
                  <SettingsIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSettings({...settings, showAIChat: true})}
                  className="p-2 rounded-full text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t.aiAssistant}
                >
                  <Bot className="h-5 w-5" />
                </button>
                <Link
                  to="/login"
                  className="p-2 rounded-full text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={t.login}
                >
                  <span>{t.login}</span>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/"
              element={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <h2 className="text-xl font-semibold">{t.inputText}</h2>
                      <label
                        className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md ${
                          settings.theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        } cursor-pointer`}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {t.uploadFile}
                        <input type="file" className="hidden" accept=".txt, .pdf, .doc, .docx" onChange={handleFileUpload} />
                      </label>
                    </div>
                    <textarea
                      ref={textAreaRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className={`w-full min-h-[200px] p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 break-words resize-none ${
                        settings.theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder={t.enterText}
                    />
                  </div>

                  <div ref={analysisRef} className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <h2 className="text-xl font-semibold">{t.correctedText}</h2>
                      <div className="flex items-center gap-3">
                        {errors.length > 0 && (
                          <div className="flex items-center text-amber-500">
                            <AlertCircle className="h-5 w-5 mr-1" />
                            <span className="text-sm">{errors.length} {t.issuesFound}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setIsAnalysisOpen(true)}
                          className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FileText className="h-5 w-5" />
                          <span>{t.analysisResults}</span>
                        </button>
                      </div>
                    </div>
                    {text ? (
                      <CorrectedText text={text} errors={errors} theme={settings.theme} />
                    ) : (
                      <div className={`min-h-[200px] border rounded-lg p-4 flex items-center justify-center ${
                        settings.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                      }`}>
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">{t.noAnalysis}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <h2 className="text-xl font-semibold">{t.shortenedText}</h2>
                    </div>
                    <div className="p-4">
                      {shortenedText ? (
                        <p className="break-words">{shortenedText}</p>
                      ) : (
                        <div className="text-center text-gray-500">{t.noText}</div>
                      )}
                    </div>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>

        {isHistoryOpen && (
          <HistoryPanel
            history={history}
            onSelect={handleHistorySelect}
            onDelete={handleHistoryDelete}
            onClose={() => setIsHistoryOpen(false)}
            language={settings.language}
            theme={settings.theme}
          />
        )}

        {isSettingsOpen && (
          <SettingsPanel
            settings={settings}
            setSettings={setSettings}
            onClose={() => setIsSettingsOpen(false)}
            isOpen={isSettingsOpen}
          />
        )}

        {isAnalysisOpen && (
          <AnalysisPanel
            analysis={analysis}
            onClose={() => setIsAnalysisOpen(false)}
            theme={settings.theme}
            language={settings.language}
          />
        )}
      </div>
    </Router>
  );
};

export default App;