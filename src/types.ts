// Base interface for text analysis
export interface TextAnalysis {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  averageWordLength: number;
  longWords: string[];
  commonWords: Array<{ word: string; count: number }>;
}

// Type for text errors
export interface TextError {
  start: number;
  end: number;
  type: 'spelling' | 'grammar' | 'style' | 'punctuation' | 'other';
  message: string;
  suggestions: string[];
  context?: string; // Optional context for better error description
}

// Type for text processing history
export interface HistoryEntry {
  id: string;
  originalText: string; // Original input text
  correctedText: string; // Corrected version of the text
  analysis: TextAnalysis;
  errors: TextError[];
  timestamp: number;
  preview: string;
  language: 'en' | 'ru'; // Language used for checking
}

// Type for application settings
export interface Settings {
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  fontSize: number;
  autoApplyCorrections: boolean;
  showAIChat?: boolean; // Added field for ChatGPT widget
}

// Type for export formats
export type ExportFormat = 'docx' | 'pdf' | 'txt' | 'md';

// Type for file handling errors
export type FileHandlerError =
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'PARSE_ERROR'
  | 'UNSUPPORTED_FORMAT';