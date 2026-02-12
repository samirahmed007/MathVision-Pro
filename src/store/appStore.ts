import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  apiKeyUrl: string;
  apiKeyRequired: boolean;
  isBuiltIn: boolean;
  isLocal: boolean;
  isEnabled: boolean;
  icon: string;
}

export interface AIModel {
  id: string;
  providerId: string;
  modelId: string;
  displayName: string;
  supportsVision: boolean;
  isFree: boolean;
  isEnabled: boolean;
  isDefault: boolean;
  isRecommended?: boolean;
  speedRating: number;
  accuracyRating: number;
}

export interface OutputFormat {
  id: string;
  name: string;
  extension: string;
  category: 'markup' | 'document' | 'code' | 'image' | 'text';
}

export interface OCRResult {
  id: string;
  imageUrl: string;
  timestamp: Date;
  provider: string;
  model: string;
  outputs: Record<string, string>;
  processingTime: number;
}

export interface BatchItem {
  id: string;
  file: File | null;
  imageUrl: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputs?: Record<string, string>;
  error?: string;
}

export interface BatchJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'paused';
  outputFormats: string[];
  items: BatchItem[];
  createdAt: Date;
  completedAt?: Date;
}

export interface UserSettings {
  defaultProviderId: string;
  defaultModelId: string;
  defaultOutputFormat: string;
  autoCopyEnabled: boolean;
  autoCopyFormat: string;
  showAutoCopyNotification: boolean;
  editorTheme: 'vs-dark' | 'vs-light';
  editorFontSize: number;
  theme: 'light' | 'dark' | 'system';
  selectedOutputFormats: string[];
}

interface AppState {
  // Providers & Models
  providers: AIProvider[];
  models: AIModel[];
  apiKeys: Record<string, string>;
  
  // Current state
  currentImage: string | null;
  currentResults: OCRResult | null;
  isProcessing: boolean;
  
  // History
  history: OCRResult[];
  
  // Batch
  batchJobs: BatchJob[];
  currentBatch: BatchItem[];
  
  // Settings
  settings: UserSettings;
  
  // UI state
  activeTab: 'ocr' | 'batch' | 'history' | 'settings' | 'about';
  activeOutputTab: string;
  
  // Actions
  setCurrentImage: (image: string | null) => void;
  setCurrentResults: (results: OCRResult | null) => void;
  setIsProcessing: (processing: boolean) => void;
  addToHistory: (result: OCRResult) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  setApiKey: (providerId: string, apiKey: string) => void;
  removeApiKey: (providerId: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setActiveTab: (tab: 'ocr' | 'batch' | 'history' | 'settings' | 'about') => void;
  setActiveOutputTab: (tab: string) => void;
  toggleProvider: (providerId: string) => void;
  updateProvider: (providerId: string, updates: Partial<AIProvider>) => void;
  addProvider: (provider: AIProvider) => void;
  removeProvider: (providerId: string) => void;
  addModel: (model: AIModel) => void;
  updateModel: (modelId: string, updates: Partial<AIModel>) => void;
  removeModel: (modelId: string) => void;
  toggleModel: (modelId: string) => void;
  setDefaultModel: (providerId: string, modelId: string) => void;
  resetToDefaults: () => void;
  addToBatch: (items: BatchItem[]) => void;
  clearBatch: () => void;
  removeBatchItem: (itemId: string) => void;
  updateBatchItem: (itemId: string, updates: Partial<BatchItem>) => void;
}

const defaultProviders: AIProvider[] = [
  {
    id: 'google',
    name: 'google',
    displayName: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '🔷',
  },
  {
    id: 'openrouter',
    name: 'openrouter',
    displayName: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyUrl: 'https://openrouter.ai/keys',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '🌐',
  },
  {
    id: 'groq',
    name: 'groq',
    displayName: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKeyUrl: 'https://console.groq.com/keys',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '⚡',
  },
  {
    id: 'huggingface',
    name: 'huggingface',
    displayName: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/models',
    apiKeyUrl: 'https://huggingface.co/settings/tokens',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '🤗',
  },
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '🧠',
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '🔮',
  },
  {
    id: 'mistral',
    name: 'mistral',
    displayName: 'Mistral AI',
    baseUrl: 'https://api.mistral.ai/v1',
    apiKeyUrl: 'https://console.mistral.ai/api-keys',
    apiKeyRequired: true,
    isBuiltIn: true,
    isLocal: false,
    isEnabled: true,
    icon: '🌀',
  },
  {
    id: 'ollama',
    name: 'ollama',
    displayName: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/api',
    apiKeyUrl: '',
    apiKeyRequired: false,
    isBuiltIn: true,
    isLocal: true,
    isEnabled: true,
    icon: '🦙',
  },
];

const defaultModels: AIModel[] = [
  // Google Gemini - Updated with all available models
  { id: 'gemini-3-pro', providerId: 'google', modelId: 'gemini-3-pro-preview', displayName: 'Gemini 3 Pro Preview', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, isRecommended: true, speedRating: 4, accuracyRating: 5 },
  { id: 'gemini-3-flash', providerId: 'google', modelId: 'gemini-3-flash-preview', displayName: 'Gemini 3 Flash Preview', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 5 },
  { id: 'gemini-2.5-pro', providerId: 'google', modelId: 'gemini-2.5-pro-preview-06-05', displayName: 'Gemini 2.5 Pro Preview', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, isRecommended: true, speedRating: 4, accuracyRating: 5 },
  { id: 'gemini-2.5-flash', providerId: 'google', modelId: 'gemini-2.5-flash-preview-05-20', displayName: 'Gemini 2.5 Flash Preview', supportsVision: true, isFree: true, isEnabled: true, isDefault: true, speedRating: 5, accuracyRating: 4 },
  { id: 'gemini-2.5-flash-lite', providerId: 'google', modelId: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 4 },
  { id: 'gemini-2.5-flash-lite-preview', providerId: 'google', modelId: 'gemini-2.5-flash-lite-preview-09-2025', displayName: 'Gemini 2.5 Flash Lite Preview', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 4 },
  { id: 'gemini-2.0-flash', providerId: 'google', modelId: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 4 },
  { id: 'gemini-2.0-flash-lite', providerId: 'google', modelId: 'gemini-2.0-flash-lite', displayName: 'Gemini 2.0 Flash Lite', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 3 },
  { id: 'gemini-1.5-pro', providerId: 'google', modelId: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 3, accuracyRating: 5 },
  { id: 'gemini-1.5-flash', providerId: 'google', modelId: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 4 },
  { id: 'gemini-1.5-flash-8b', providerId: 'google', modelId: 'gemini-1.5-flash-8b', displayName: 'Gemini 1.5 Flash 8B', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 3 },
  
  // OpenRouter
  { id: 'qwen-vl-72b', providerId: 'openrouter', modelId: 'qwen/qwen2.5-vl-72b-instruct:free', displayName: 'Qwen 2.5 VL 72B (Free)', supportsVision: true, isFree: true, isEnabled: true, isDefault: true, isRecommended: true, speedRating: 3, accuracyRating: 5 },
  { id: 'qwen-vl-32b', providerId: 'openrouter', modelId: 'qwen/qwen2.5-vl-32b-instruct:free', displayName: 'Qwen 2.5 VL 32B (Free)', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 4 },
  { id: 'llama-vision', providerId: 'openrouter', modelId: 'meta-llama/llama-3.2-11b-vision-instruct:free', displayName: 'Llama 3.2 11B Vision (Free)', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 3 },
  { id: 'gemma-3-27b', providerId: 'openrouter', modelId: 'google/gemma-3-27b-it:free', displayName: 'Gemma 3 27B (Free)', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 4 },
  
  // Groq
  { id: 'groq-llama-90b', providerId: 'groq', modelId: 'llama-3.2-90b-vision-preview', displayName: 'Llama 3.2 90B Vision', supportsVision: true, isFree: true, isEnabled: true, isDefault: true, isRecommended: true, speedRating: 5, accuracyRating: 4 },
  { id: 'groq-llama-11b', providerId: 'groq', modelId: 'llama-3.2-11b-vision-preview', displayName: 'Llama 3.2 11B Vision', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 3 },
  
  // OpenAI
  { id: 'gpt-4o', providerId: 'openai', modelId: 'gpt-4o', displayName: 'GPT-4o', supportsVision: true, isFree: false, isEnabled: true, isDefault: true, isRecommended: true, speedRating: 4, accuracyRating: 5 },
  { id: 'gpt-4o-mini', providerId: 'openai', modelId: 'gpt-4o-mini', displayName: 'GPT-4o Mini', supportsVision: true, isFree: false, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 4 },
  { id: 'gpt-4-turbo', providerId: 'openai', modelId: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', supportsVision: true, isFree: false, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 5 },
  
  // Anthropic
  { id: 'claude-sonnet-4', providerId: 'anthropic', modelId: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4', supportsVision: true, isFree: false, isEnabled: true, isDefault: true, isRecommended: true, speedRating: 4, accuracyRating: 5 },
  { id: 'claude-3-5-sonnet', providerId: 'anthropic', modelId: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', supportsVision: true, isFree: false, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 5 },
  { id: 'claude-haiku', providerId: 'anthropic', modelId: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku', supportsVision: true, isFree: false, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 4 },
  
  // Mistral
  { id: 'pixtral-large', providerId: 'mistral', modelId: 'pixtral-large-latest', displayName: 'Pixtral Large', supportsVision: true, isFree: false, isEnabled: true, isDefault: true, isRecommended: true, speedRating: 4, accuracyRating: 5 },
  { id: 'pixtral-12b', providerId: 'mistral', modelId: 'pixtral-12b-2409', displayName: 'Pixtral 12B', supportsVision: true, isFree: false, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 3 },
  
  // HuggingFace
  { id: 'hf-qwen2-vl-72b', providerId: 'huggingface', modelId: 'Qwen/Qwen2-VL-72B-Instruct', displayName: 'Qwen2 VL 72B', supportsVision: true, isFree: true, isEnabled: true, isDefault: true, isRecommended: true, speedRating: 3, accuracyRating: 5 },
  { id: 'hf-florence-2', providerId: 'huggingface', modelId: 'microsoft/Florence-2-large', displayName: 'Florence 2 Large', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 3 },
  
  // Ollama
  { id: 'llava-34b', providerId: 'ollama', modelId: 'llava:34b', displayName: 'LLaVA 34B', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 2, accuracyRating: 4 },
  { id: 'llava-13b', providerId: 'ollama', modelId: 'llava:13b', displayName: 'LLaVA 13B', supportsVision: true, isFree: true, isEnabled: true, isDefault: true, speedRating: 3, accuracyRating: 3 },
  { id: 'llava-7b', providerId: 'ollama', modelId: 'llava:7b', displayName: 'LLaVA 7B', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 2 },
  { id: 'llama-vision-11b', providerId: 'ollama', modelId: 'llama3.2-vision:11b', displayName: 'Llama 3.2 Vision 11B', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 4, accuracyRating: 4 },
  { id: 'moondream', providerId: 'ollama', modelId: 'moondream:latest', displayName: 'Moondream', supportsVision: true, isFree: true, isEnabled: true, isDefault: false, speedRating: 5, accuracyRating: 2 },
];

export const outputFormats: OutputFormat[] = [
  { id: 'latex', name: 'LaTeX', extension: '.tex', category: 'markup' },
  { id: 'mathml', name: 'MathML', extension: '.mml', category: 'markup' },
  { id: 'asciimath', name: 'AsciiMath', extension: '.txt', category: 'markup' },
  { id: 'typst', name: 'Typst', extension: '.typ', category: 'markup' },
  { id: 'markdown', name: 'Markdown', extension: '.md', category: 'document' },
  { id: 'html', name: 'HTML', extension: '.html', category: 'document' },
  { id: 'sympy', name: 'SymPy (Python)', extension: '.py', category: 'code' },
  { id: 'wolfram', name: 'Wolfram', extension: '.wl', category: 'code' },
  { id: 'maple', name: 'Maple', extension: '.mpl', category: 'code' },
  { id: 'unicode', name: 'Unicode', extension: '.txt', category: 'text' },
];

const defaultSettings: UserSettings = {
  defaultProviderId: 'google',
  defaultModelId: 'gemini-2.5-flash',
  defaultOutputFormat: 'latex',
  autoCopyEnabled: true,
  autoCopyFormat: 'latex',
  showAutoCopyNotification: true,
  editorTheme: 'vs-dark',
  editorFontSize: 14,
  theme: 'dark',
  selectedOutputFormats: ['latex', 'mathml', 'asciimath', 'markdown'],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      providers: defaultProviders,
      models: defaultModels,
      apiKeys: {},
      currentImage: null,
      currentResults: null,
      isProcessing: false,
      history: [],
      batchJobs: [],
      currentBatch: [],
      settings: defaultSettings,
      activeTab: 'ocr',
      activeOutputTab: 'latex',
      
      setCurrentImage: (image) => set({ currentImage: image }),
      setCurrentResults: (results) => set({ currentResults: results }),
      setIsProcessing: (processing) => set({ isProcessing: processing }),
      
      addToHistory: (result) => set((state) => ({
        history: [result, ...state.history].slice(0, 100)
      })),
      
      clearHistory: () => set({ history: [] }),
      
      deleteHistoryItem: (id) => set((state) => ({
        history: state.history.filter(item => item.id !== id)
      })),
      
      setApiKey: (providerId, apiKey) => set((state) => ({
        apiKeys: { ...state.apiKeys, [providerId]: apiKey }
      })),
      
      removeApiKey: (providerId) => set((state) => {
        const newKeys = { ...state.apiKeys };
        delete newKeys[providerId];
        return { apiKeys: newKeys };
      }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveOutputTab: (tab) => set({ activeOutputTab: tab }),
      
      toggleProvider: (providerId) => set((state) => ({
        providers: state.providers.map(p =>
          p.id === providerId ? { ...p, isEnabled: !p.isEnabled } : p
        )
      })),
      
      updateProvider: (providerId, updates) => set((state) => ({
        providers: state.providers.map(p =>
          p.id === providerId ? { ...p, ...updates } : p
        )
      })),
      
      addProvider: (provider) => set((state) => ({
        providers: [...state.providers, provider]
      })),
      
      removeProvider: (providerId) => set((state) => ({
        providers: state.providers.filter(p => p.id !== providerId),
        models: state.models.filter(m => m.providerId !== providerId)
      })),
      
      addModel: (model) => set((state) => ({
        models: [...state.models, model]
      })),
      
      updateModel: (modelId, updates) => set((state) => ({
        models: state.models.map(m =>
          m.id === modelId ? { ...m, ...updates } : m
        )
      })),
      
      removeModel: (modelId) => set((state) => ({
        models: state.models.filter(m => m.id !== modelId)
      })),
      
      toggleModel: (modelId) => set((state) => ({
        models: state.models.map(m =>
          m.id === modelId ? { ...m, isEnabled: !m.isEnabled } : m
        )
      })),
      
      setDefaultModel: (providerId, modelId) => set((state) => ({
        models: state.models.map(m =>
          m.providerId === providerId
            ? { ...m, isDefault: m.id === modelId }
            : m
        )
      })),
      
      resetToDefaults: () => set({
        providers: defaultProviders,
        models: defaultModels,
        settings: defaultSettings,
      }),
      
      addToBatch: (items) => set((state) => ({
        currentBatch: [...state.currentBatch, ...items]
      })),
      
      clearBatch: () => set({ currentBatch: [] }),
      
      removeBatchItem: (itemId) => set((state) => ({
        currentBatch: state.currentBatch.filter(item => item.id !== itemId)
      })),
      
      updateBatchItem: (itemId, updates) => set((state) => ({
        currentBatch: state.currentBatch.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      })),
    }),
    {
      name: 'mathvision-storage',
      partialize: (state) => ({
        apiKeys: state.apiKeys,
        settings: state.settings,
        history: state.history,
        providers: state.providers,
        models: state.models,
      }),
    }
  )
);
