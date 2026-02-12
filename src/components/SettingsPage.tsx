import { useState } from 'react';
import { 
  Key, Eye, EyeOff, ExternalLink, Check, X, Loader2, Trash2, 
  ToggleLeft, ToggleRight, Settings2, Plus, Edit2, ChevronDown, 
  ChevronRight, Star, Zap, Target, RotateCcw, Save, AlertTriangle,
  Globe
} from 'lucide-react';
import { useAppStore, outputFormats, AIProvider, AIModel } from '@/store/appStore';
import { testProviderConnection } from '@/services/ocrService';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Modal Component
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn("relative w-full bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden", sizeClasses[size])}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

// Add/Edit Model Modal
function ModelModal({
  isOpen,
  onClose,
  providerId,
  model,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  model?: AIModel | null;
  onSave: (model: AIModel) => void;
}) {
  const [formData, setFormData] = useState<Partial<AIModel>>({
    modelId: model?.modelId || '',
    displayName: model?.displayName || '',
    supportsVision: model?.supportsVision ?? true,
    isFree: model?.isFree ?? true,
    isEnabled: model?.isEnabled ?? true,
    isDefault: model?.isDefault ?? false,
    isRecommended: model?.isRecommended ?? false,
    speedRating: model?.speedRating ?? 3,
    accuracyRating: model?.accuracyRating ?? 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modelId || !formData.displayName) {
      toast.error('Model ID and Display Name are required');
      return;
    }
    
    const newModel: AIModel = {
      id: model?.id || `${providerId}-${Date.now()}`,
      providerId,
      modelId: formData.modelId!,
      displayName: formData.displayName!,
      supportsVision: formData.supportsVision ?? true,
      isFree: formData.isFree ?? true,
      isEnabled: formData.isEnabled ?? true,
      isDefault: formData.isDefault ?? false,
      isRecommended: formData.isRecommended ?? false,
      speedRating: formData.speedRating ?? 3,
      accuracyRating: formData.accuracyRating ?? 3,
    };
    
    onSave(newModel);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={model ? 'Edit Model' : 'Add New Model'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Model ID *</label>
          <input
            type="text"
            value={formData.modelId}
            onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
            placeholder="e.g., gemini-2.0-flash, gpt-4o"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
          <p className="text-xs text-gray-500">The exact model identifier used by the API</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Display Name *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="e.g., Gemini 2.0 Flash, GPT-4o"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Speed Rating</label>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <input
                type="range"
                min="1"
                max="5"
                value={formData.speedRating}
                onChange={(e) => setFormData(prev => ({ ...prev, speedRating: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-4">{formData.speedRating}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Accuracy Rating</label>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <input
                type="range"
                min="1"
                max="5"
                value={formData.accuracyRating}
                onChange={(e) => setFormData(prev => ({ ...prev, accuracyRating: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-sm text-gray-400 w-4">{formData.accuracyRating}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.supportsVision}
              onChange={(e) => setFormData(prev => ({ ...prev, supportsVision: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Supports Vision</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFree}
              onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Free Tier</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRecommended}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecommended: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Recommended</span>
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            {model ? 'Update Model' : 'Add Model'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Add/Edit Provider Modal
function ProviderModal({
  isOpen,
  onClose,
  provider,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  provider?: AIProvider | null;
  onSave: (provider: AIProvider) => void;
}) {
  const [formData, setFormData] = useState<Partial<AIProvider>>({
    name: provider?.name || '',
    displayName: provider?.displayName || '',
    baseUrl: provider?.baseUrl || '',
    apiKeyUrl: provider?.apiKeyUrl || '',
    apiKeyRequired: provider?.apiKeyRequired ?? true,
    isLocal: provider?.isLocal ?? false,
    icon: provider?.icon || '🔌',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.displayName || !formData.baseUrl) {
      toast.error('Name, Display Name, and Base URL are required');
      return;
    }
    
    const newProvider: AIProvider = {
      id: provider?.id || formData.name!.toLowerCase().replace(/\s+/g, '-'),
      name: formData.name!,
      displayName: formData.displayName!,
      baseUrl: formData.baseUrl!,
      apiKeyUrl: formData.apiKeyUrl || '',
      apiKeyRequired: formData.apiKeyRequired ?? true,
      isBuiltIn: false,
      isLocal: formData.isLocal ?? false,
      isEnabled: provider?.isEnabled ?? true,
      icon: formData.icon || '🔌',
    };
    
    onSave(newProvider);
    onClose();
  };

  const emojiOptions = ['🔌', '🤖', '🧠', '⚡', '🌟', '🔷', '🟢', '🟣', '🔶', '💫', '🚀', '✨'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={provider ? 'Edit Provider' : 'Add Custom Provider'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                className={cn(
                  'w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-all',
                  formData.icon === emoji
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Provider Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., custom-provider"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Display Name *</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., My Custom Provider"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Base URL *</label>
          <input
            type="url"
            value={formData.baseUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://api.example.com/v1"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">API Key URL (optional)</label>
          <input
            type="url"
            value={formData.apiKeyUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKeyUrl: e.target.value }))}
            placeholder="https://example.com/api-keys"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.apiKeyRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKeyRequired: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Requires API Key</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isLocal}
              onChange={(e) => setFormData(prev => ({ ...prev, isLocal: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300">Local Provider</span>
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            {provider ? 'Update Provider' : 'Add Provider'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Edit Base URL Modal
function EditBaseUrlModal({
  isOpen,
  onClose,
  provider,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  provider: AIProvider;
  onSave: (baseUrl: string) => void;
}) {
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseUrl.trim()) {
      toast.error('Base URL is required');
      return;
    }
    onSave(baseUrl.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Base URL - ${provider.displayName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Base URL</label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            The base URL for API requests. Change this if you're using a proxy or custom endpoint.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function SettingsPage() {
  const {
    providers,
    models,
    apiKeys,
    settings,
    setApiKey,
    removeApiKey,
    updateSettings,
    toggleProvider,
    addProvider,
    updateProvider,
    removeProvider,
    addModel,
    updateModel,
    removeModel,
    toggleModel,
    setDefaultModel,
    resetToDefaults,
  } = useAppStore();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, { success: boolean; message: string }>>({});
  const [editingKey, setEditingKey] = useState<Record<string, string>>({});
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  
  // Modal states
  const [showModelModal, setShowModelModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showBaseUrlModal, setShowBaseUrlModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [editingBaseUrlProvider, setEditingBaseUrlProvider] = useState<AIProvider | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleShowKey = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleTestConnection = async (providerId: string) => {
    const apiKey = apiKeys[providerId] || '';
    const provider = providers.find(p => p.id === providerId);
    setTestingProvider(providerId);
    
    const result = await testProviderConnection(providerId, apiKey, provider?.baseUrl);
    setConnectionStatus(prev => ({ ...prev, [providerId]: result }));
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setTestingProvider(null);
  };

  const handleSaveKey = (providerId: string) => {
    const key = editingKey[providerId];
    if (key?.trim()) {
      setApiKey(providerId, key.trim());
      setEditingKey(prev => ({ ...prev, [providerId]: '' }));
      toast.success('API key saved');
    }
  };

  const handleSaveModel = (model: AIModel) => {
    if (editingModel) {
      updateModel(model.id, model);
      toast.success('Model updated');
    } else {
      addModel(model);
      toast.success('Model added');
    }
    setEditingModel(null);
  };

  const handleSaveProvider = (provider: AIProvider) => {
    if (editingProvider) {
      updateProvider(provider.id, provider);
      toast.success('Provider updated');
    } else {
      addProvider(provider);
      toast.success('Provider added');
    }
    setEditingProvider(null);
  };

  const handleSaveBaseUrl = (baseUrl: string) => {
    if (editingBaseUrlProvider) {
      updateProvider(editingBaseUrlProvider.id, { baseUrl });
      toast.success('Base URL updated');
    }
  };

  const handleDeleteModel = (modelId: string, modelName: string) => {
    if (confirm(`Delete model "${modelName}"?`)) {
      removeModel(modelId);
      toast.success('Model deleted');
    }
  };

  const handleDeleteProvider = (providerId: string, providerName: string) => {
    if (confirm(`Delete provider "${providerName}" and all its models?`)) {
      removeProvider(providerId);
      toast.success('Provider deleted');
    }
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings2 className="h-7 w-7 text-violet-500" />
            Settings
          </h2>
          <p className="text-gray-400 mt-1">
            Configure AI providers, models, API keys, and output preferences
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* AI Providers Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">AI Providers</h3>
          <button
            onClick={() => {
              setEditingProvider(null);
              setShowProviderModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Provider
          </button>
        </div>
        
        <div className="grid gap-4">
          {providers.map((provider) => {
            const providerModels = models.filter(m => m.providerId === provider.id);
            const hasApiKey = !!apiKeys[provider.id];
            const status = connectionStatus[provider.id];
            const isExpanded = expandedProvider === provider.id;
            
            return (
              <motion.div
                key={provider.id}
                layout
                className={cn(
                  'rounded-2xl border transition-colors overflow-hidden',
                  provider.isEnabled
                    ? 'bg-gray-900/50 border-gray-800'
                    : 'bg-gray-950/50 border-gray-900 opacity-60'
                )}
              >
                {/* Provider Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Provider Info */}
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{provider.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white">
                            {provider.displayName}
                          </h4>
                          {provider.isLocal && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                              Local
                            </span>
                          )}
                          {providerModels.some(m => m.isFree) && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-violet-500/20 text-violet-400 rounded-full">
                              Free Tier
                            </span>
                          )}
                          {!provider.isBuiltIn && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {providerModels.filter(m => m.isEnabled).length} of {providerModels.length} models enabled
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Edit Base URL */}
                      <button
                        onClick={() => {
                          setEditingBaseUrlProvider(provider);
                          setShowBaseUrlModal(true);
                        }}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                        title="Edit Base URL"
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                      
                      {!provider.isBuiltIn && (
                        <>
                          <button
                            onClick={() => {
                              setEditingProvider(provider);
                              setShowProviderModal(true);
                            }}
                            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id, provider.displayName)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => toggleProvider(provider.id)}>
                        {provider.isEnabled ? (
                          <ToggleRight className="h-8 w-8 text-violet-500" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Base URL Display */}
                  {provider.isEnabled && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <Globe className="h-3 w-3" />
                      <span className="font-mono truncate">{provider.baseUrl}</span>
                    </div>
                  )}

                  {/* API Key Section */}
                  {provider.apiKeyRequired && provider.isEnabled && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">API Key</span>
                        {hasApiKey && (
                          <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                            Configured
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showKeys[provider.id] ? 'text' : 'password'}
                            value={editingKey[provider.id] ?? (hasApiKey ? '••••••••••••••••' : '')}
                            onChange={(e) => setEditingKey(prev => ({ ...prev, [provider.id]: e.target.value }))}
                            placeholder="Enter your API key..."
                            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 pr-10 font-mono text-sm"
                          />
                          <button
                            onClick={() => toggleShowKey(provider.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                          >
                            {showKeys[provider.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {editingKey[provider.id] ? (
                          <button
                            onClick={() => handleSaveKey(provider.id)}
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Save
                          </button>
                        ) : hasApiKey ? (
                          <>
                            <button
                              onClick={() => handleTestConnection(provider.id)}
                              disabled={testingProvider === provider.id}
                              className={cn(
                                'px-4 py-2 rounded-lg font-medium transition-colors',
                                status?.success
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-800 hover:bg-gray-700 text-white'
                              )}
                            >
                              {testingProvider === provider.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : status?.success ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                'Test'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                removeApiKey(provider.id);
                                toast.success('API key removed');
                              }}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                      </div>

                      {provider.apiKeyUrl && (
                        <a
                          href={provider.apiKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-violet-400 hover:text-violet-300"
                        >
                          Get API Key <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      {status && !status.success && (
                        <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {status.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Models Section */}
                {provider.isEnabled && (
                  <div className="border-t border-gray-800">
                    <button
                      onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-300">
                        Manage Models ({providerModels.length})
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Add Model Button */}
                            <button
                              onClick={() => {
                                setSelectedProviderId(provider.id);
                                setEditingModel(null);
                                setShowModelModal(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors border border-dashed border-gray-700"
                            >
                              <Plus className="h-4 w-4" />
                              Add Model
                            </button>

                            {/* Models List */}
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                              {providerModels.map((model) => (
                                <div
                                  key={model.id}
                                  className={cn(
                                    'flex items-center justify-between p-3 rounded-xl border transition-colors',
                                    model.isEnabled
                                      ? 'bg-gray-800/80 border-gray-700'
                                      : 'bg-gray-900/50 border-gray-800 opacity-50'
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-white truncate">
                                        {model.displayName}
                                      </span>
                                      {model.isDefault && (
                                        <span className="px-1.5 py-0.5 text-xs bg-violet-500/20 text-violet-400 rounded">
                                          Default
                                        </span>
                                      )}
                                      {model.isRecommended && (
                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                      )}
                                      {model.isFree && (
                                        <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                                          Free
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate font-mono">
                                      {model.modelId}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Zap className="h-3 w-3 text-yellow-500" />
                                        {model.speedRating}/5
                                      </span>
                                      <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Target className="h-3 w-3 text-green-500" />
                                        {model.accuracyRating}/5
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 ml-2">
                                    {!model.isDefault && model.isEnabled && (
                                      <button
                                        onClick={() => {
                                          setDefaultModel(provider.id, model.id);
                                          toast.success(`${model.displayName} set as default`);
                                        }}
                                        className="p-1.5 bg-gray-700 hover:bg-violet-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                                        title="Set as default"
                                      >
                                        <Star className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setSelectedProviderId(provider.id);
                                        setEditingModel(model);
                                        setShowModelModal(true);
                                      }}
                                      className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => toggleModel(model.id)}
                                      className="p-1.5"
                                    >
                                      {model.isEnabled ? (
                                        <ToggleRight className="h-5 w-5 text-violet-500" />
                                      ) : (
                                        <ToggleLeft className="h-5 w-5 text-gray-600" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModel(model.id, model.displayName)}
                                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {providerModels.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  No models configured. Add a model to get started.
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Output Preferences */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Output Preferences</h3>
        
        <div className="p-5 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-6">
          {/* Auto Copy */}
          <div className="space-y-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Auto-copy to clipboard</p>
                <p className="text-sm text-gray-400">
                  Automatically copy selected format after OCR processing
                </p>
              </div>
              <button
                onClick={() => updateSettings({ autoCopyEnabled: !settings.autoCopyEnabled })}
              >
                {settings.autoCopyEnabled ? (
                  <ToggleRight className="h-8 w-8 text-violet-500" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-gray-600" />
                )}
              </button>
            </div>

            {settings.autoCopyEnabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Format to auto-copy
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {outputFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => updateSettings({ autoCopyFormat: format.id })}
                        className={cn(
                          'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          settings.autoCopyFormat === format.id
                            ? 'bg-violet-600 text-white ring-2 ring-violet-400'
                            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                        )}
                      >
                        {settings.autoCopyFormat === format.id && <Check className="h-4 w-4" />}
                        {format.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    After OCR completes, the <span className="text-violet-400 font-medium">{outputFormats.find(f => f.id === settings.autoCopyFormat)?.name || 'LaTeX'}</span> output will be automatically copied to your clipboard.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div>
                    <p className="font-medium text-white text-sm">Show notification</p>
                    <p className="text-xs text-gray-500">
                      Display a toast when content is auto-copied
                    </p>
                  </div>
                  <button
                    onClick={() => updateSettings({ showAutoCopyNotification: !settings.showAutoCopyNotification })}
                  >
                    {settings.showAutoCopyNotification ? (
                      <ToggleRight className="h-6 w-6 text-violet-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Default Output Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Default output format
            </label>
            <select
              value={settings.defaultOutputFormat}
              onChange={(e) => updateSettings({ defaultOutputFormat: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
            >
              {outputFormats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Output Formats */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400">
              Output formats to generate
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {outputFormats.map((format) => {
                const isSelected = settings.selectedOutputFormats.includes(format.id);
                return (
                  <button
                    key={format.id}
                    onClick={() => {
                      const newFormats = isSelected
                        ? settings.selectedOutputFormats.filter(f => f !== format.id)
                        : [...settings.selectedOutputFormats, format.id];
                      updateSettings({ selectedOutputFormats: newFormats });
                    }}
                    className={cn(
                      'flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    )}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {format.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Appearance</h3>
        
        <div className="p-5 bg-gray-900/50 rounded-2xl border border-gray-800 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Editor Theme
              </label>
              <select
                value={settings.editorTheme}
                onChange={(e) => updateSettings({ editorTheme: e.target.value as 'vs-dark' | 'vs-light' })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
              >
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Editor Font Size: {settings.editorFontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                value={settings.editorFontSize}
                onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value) })}
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ModelModal
        isOpen={showModelModal}
        onClose={() => {
          setShowModelModal(false);
          setEditingModel(null);
        }}
        providerId={selectedProviderId}
        model={editingModel}
        onSave={handleSaveModel}
      />

      <ProviderModal
        isOpen={showProviderModal}
        onClose={() => {
          setShowProviderModal(false);
          setEditingProvider(null);
        }}
        provider={editingProvider}
        onSave={handleSaveProvider}
      />

      {editingBaseUrlProvider && (
        <EditBaseUrlModal
          isOpen={showBaseUrlModal}
          onClose={() => {
            setShowBaseUrlModal(false);
            setEditingBaseUrlProvider(null);
          }}
          provider={editingBaseUrlProvider}
          onSave={handleSaveBaseUrl}
        />
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset to Defaults"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              This will reset all providers, models, and settings to their default values. API keys will be preserved. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResetToDefaults}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
