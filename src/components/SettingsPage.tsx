import { useState, useEffect, useCallback } from 'react';
import { 
  Key, Eye, EyeOff, ExternalLink, Check, X, Loader2, Trash2, 
  ToggleLeft, ToggleRight, Settings2, Plus, Edit2, ChevronDown, 
  ChevronRight, Star, Zap, Target, RotateCcw, Save, AlertTriangle,
  Globe, Palette, XCircle
} from 'lucide-react';
import { useAppStore, outputFormats, AIProvider, AIModel, APP_THEMES, AppTheme } from '@/store/appStore';
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
        className={cn("relative w-full rounded-2xl shadow-2xl overflow-hidden", sizeClasses[size])}
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border-dark)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
          <button onClick={onClose} className="p-1 transition-colors" style={{ color: 'var(--color-text-muted)' }}>
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
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Model ID *</label>
          <input
            type="text"
            value={formData.modelId}
            onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
            placeholder="e.g., gemini-2.0-flash, gpt-4o"
            className="w-full px-4 py-2.5 rounded-lg text-sm font-mono"
          />
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>The exact model identifier used by the API</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Display Name *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="e.g., Gemini 2.0 Flash, GPT-4o"
            className="w-full px-4 py-2.5 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Speed Rating</label>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <input type="range" min="1" max="5" value={formData.speedRating}
                onChange={(e) => setFormData(prev => ({ ...prev, speedRating: parseInt(e.target.value) }))} className="flex-1" />
              <span className="text-sm w-4" style={{ color: 'var(--color-text-muted)' }}>{formData.speedRating}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Accuracy Rating</label>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <input type="range" min="1" max="5" value={formData.accuracyRating}
                onChange={(e) => setFormData(prev => ({ ...prev, accuracyRating: parseInt(e.target.value) }))} className="flex-1" />
              <span className="text-sm w-4" style={{ color: 'var(--color-text-muted)' }}>{formData.accuracyRating}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.supportsVision}
              onChange={(e) => setFormData(prev => ({ ...prev, supportsVision: e.target.checked }))} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Supports Vision</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isFree}
              onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Free Tier</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isRecommended}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecommended: e.target.checked }))} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Recommended</span>
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}>
            Cancel
          </button>
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
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
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Icon</label>
          <div className="flex gap-2 flex-wrap">
            {emojiOptions.map((emoji) => (
              <button key={emoji} type="button" onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                style={{
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', borderRadius: '8px', cursor: 'pointer',
                  border: formData.icon === emoji ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                  backgroundColor: formData.icon === emoji ? 'var(--color-accent-bg)' : 'var(--color-bg-tertiary)',
                }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Provider Name *</label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., custom-provider" className="w-full px-4 py-2.5 rounded-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Display Name *</label>
            <input type="text" value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., My Custom Provider" className="w-full px-4 py-2.5 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Base URL *</label>
          <input type="url" value={formData.baseUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
            placeholder="https://api.example.com/v1" className="w-full px-4 py-2.5 rounded-lg" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>API Key URL (optional)</label>
          <input type="url" value={formData.apiKeyUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, apiKeyUrl: e.target.value }))}
            placeholder="https://example.com/api-keys" className="w-full px-4 py-2.5 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.apiKeyRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKeyRequired: e.target.checked }))} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Requires API Key</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isLocal}
              onChange={(e) => setFormData(prev => ({ ...prev, isLocal: e.target.checked }))} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Local Provider</span>
          </label>
        </div>
        <div className="flex gap-2 pt-4">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}>Cancel</button>
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
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
    if (!baseUrl.trim()) { toast.error('Base URL is required'); return; }
    onSave(baseUrl.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Base URL - ${provider.displayName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Base URL</label>
          <input type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full px-4 py-2.5 rounded-lg font-mono text-sm" />
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            The base URL for API requests. Change this if you're using a proxy or custom endpoint.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}>Cancel</button>
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
            <Save className="h-4 w-4" />Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function SettingsPage() {
  const {
    providers, models, apiKeys, settings,
    setApiKey, removeApiKey, updateSettings,
    toggleProvider, addProvider, updateProvider, removeProvider,
    addModel, updateModel, removeModel, toggleModel,
    setDefaultModel, resetToDefaults, setActiveTab,
  } = useAppStore();

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, { success: boolean; message: string }>>({});
  const [editingKey, setEditingKey] = useState<Record<string, string>>({});
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  
  const [showModelModal, setShowModelModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showBaseUrlModal, setShowBaseUrlModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [editingBaseUrlProvider, setEditingBaseUrlProvider] = useState<AIProvider | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Create snapshot on mount
  useEffect(() => {
    const snapshot = JSON.stringify({ settings, providers, models, apiKeys });
    setSavedSnapshot(snapshot);
  }, []);

  // Track changes
  useEffect(() => {
    if (!savedSnapshot) return;
    const current = JSON.stringify({ settings, providers, models, apiKeys });
    setHasUnsavedChanges(current !== savedSnapshot);
  }, [settings, providers, models, apiKeys, savedSnapshot]);

  const handleSaveChanges = useCallback(() => {
    const snapshot = JSON.stringify({ settings, providers, models, apiKeys });
    setSavedSnapshot(snapshot);
    setHasUnsavedChanges(false);
    toast.success('✅ Settings saved successfully!');
  }, [settings, providers, models, apiKeys]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setActiveTab('ocr');
      }
    } else {
      setActiveTab('ocr');
    }
  }, [hasUnsavedChanges, setActiveTab]);

  const toggleShowKey = (providerId: string) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const handleTestConnection = async (providerId: string) => {
    const apiKey = apiKeys[providerId] || '';
    const provider = providers.find(p => p.id === providerId);
    setTestingProvider(providerId);
    const result = await testProviderConnection(providerId, apiKey, provider?.baseUrl);
    setConnectionStatus(prev => ({ ...prev, [providerId]: result }));
    if (result.success) { toast.success(result.message); } else { toast.error(result.message); }
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
    if (editingModel) { updateModel(model.id, model); toast.success('Model updated'); }
    else { addModel(model); toast.success('Model added'); }
    setEditingModel(null);
  };

  const handleSaveProvider = (provider: AIProvider) => {
    if (editingProvider) { updateProvider(provider.id, provider); toast.success('Provider updated'); }
    else { addProvider(provider); toast.success('Provider added'); }
    setEditingProvider(null);
  };

  const handleSaveBaseUrl = (baseUrl: string) => {
    if (editingBaseUrlProvider) {
      updateProvider(editingBaseUrlProvider.id, { baseUrl });
      toast.success('Base URL updated');
    }
  };

  const handleDeleteModel = (modelId: string, modelName: string) => {
    if (confirm(`Delete model "${modelName}"?`)) { removeModel(modelId); toast.success('Model deleted'); }
  };

  const handleDeleteProvider = (providerId: string, providerName: string) => {
    if (confirm(`Delete provider "${providerName}" and all its models?`)) { removeProvider(providerId); toast.success('Provider deleted'); }
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  };

  const handleThemeChange = (theme: AppTheme) => {
    updateSettings({ appTheme: theme });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Bar with Save/Close */}
      <div style={{
        position: 'sticky',
        top: '64px',
        zIndex: 40,
        padding: '12px 0',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderRadius: '16px',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          boxShadow: hasUnsavedChanges ? '0 0 20px var(--color-accent-glow)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings2 style={{ height: '24px', width: '24px', color: 'var(--color-accent)' }} />
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Settings</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', margin: 0 }}>
                {hasUnsavedChanges ? '● Unsaved changes' : 'All changes saved'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)',
                fontSize: '13px', fontWeight: 500,
              }}
            >
              <RotateCcw style={{ height: '14px', width: '14px' }} />
              Reset
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: hasUnsavedChanges ? 'pointer' : 'default',
                backgroundColor: hasUnsavedChanges ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                color: hasUnsavedChanges ? 'white' : 'var(--color-text-dim)',
                fontSize: '13px', fontWeight: 600,
                opacity: hasUnsavedChanges ? 1 : 0.5,
              }}
            >
              <Save style={{ height: '14px', width: '14px' }} />
              Save Changes
            </button>
            <button
              onClick={handleClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171',
                fontSize: '13px', fontWeight: 500,
              }}
            >
              <XCircle style={{ height: '14px', width: '14px' }} />
              Close
            </button>
          </div>
        </div>
      </div>

      {/* App Theme Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Palette style={{ height: '20px', width: '20px', color: 'var(--color-accent)' }} />
          App Theme
        </h3>
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Choose a theme that suits your preference. The theme affects the entire application.
          </p>
          <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {APP_THEMES.map((theme) => {
              const isSelected = settings.appTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${theme.preview.accent}` : '2px solid var(--color-border)',
                    backgroundColor: theme.preview.bg,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    boxShadow: isSelected ? `0 0 20px ${theme.preview.accent}33` : 'none',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      backgroundColor: theme.preview.accent,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check style={{ height: '14px', width: '14px', color: 'white' }} />
                    </div>
                  )}
                  {/* Color preview bar */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <div style={{ width: '32px', height: '20px', borderRadius: '4px', backgroundColor: theme.preview.accent }} />
                    <div style={{ width: '32px', height: '20px', borderRadius: '4px', backgroundColor: theme.preview.card }} />
                    <div style={{ width: '32px', height: '20px', borderRadius: '4px', backgroundColor: theme.preview.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: theme.preview.text, marginBottom: '4px' }}>
                    {theme.name}
                  </span>
                  <span style={{ fontSize: '12px', color: `${theme.preview.text}99` }}>
                    {theme.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Default Provider & Model */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Star style={{ height: '20px', width: '20px', color: '#eab308' }} />
          Default Provider & Model
        </h3>
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Select the default provider and model used for OCR processing across the app.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Default Provider</label>
              <div className="relative">
                <select
                  value={settings.defaultProviderId}
                  onChange={(e) => {
                    const provId = e.target.value;
                    updateSettings({ defaultProviderId: provId });
                    const defModel = models.find(m => m.providerId === provId && m.isDefault && m.isEnabled);
                    const firstEnabled = models.find(m => m.providerId === provId && m.isEnabled);
                    if (defModel) { updateSettings({ defaultModelId: defModel.id }); }
                    else if (firstEnabled) { updateSettings({ defaultModelId: firstEnabled.id }); }
                  }}
                  className="w-full appearance-none px-4 py-3 rounded-xl pr-10"
                >
                  {providers.filter(p => p.isEnabled).map((p) => (
                    <option key={p.id} value={p.id}>{p.icon} {p.displayName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Default Model</label>
              <div className="relative">
                <select
                  value={settings.defaultModelId}
                  onChange={(e) => {
                    updateSettings({ defaultModelId: e.target.value });
                    const selectedM = models.find(m => m.id === e.target.value);
                    if (selectedM) { setDefaultModel(selectedM.providerId, selectedM.id); }
                  }}
                  className="w-full appearance-none px-4 py-3 rounded-xl pr-10"
                >
                  {models
                    .filter(m => m.providerId === settings.defaultProviderId && m.isEnabled)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.displayName} {m.isFree ? '✓ Free' : '$ Paid'} {m.isDefault ? '⭐' : ''}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none" style={{ color: 'var(--color-text-dim)' }} />
              </div>
            </div>
          </div>
          {(() => {
            const currentModel = models.find(m => m.id === settings.defaultModelId);
            const currentProv = providers.find(p => p.id === settings.defaultProviderId);
            return currentModel && currentProv ? (
              <div style={{
                marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
                backgroundColor: 'var(--color-accent-bg)', border: '1px solid var(--color-accent-border)',
              }}>
                <p className="text-sm" style={{ color: 'var(--color-accent-text)' }}>
                  <span className="font-medium">Active:</span> {currentProv.icon} {currentProv.displayName} → {currentModel.displayName}
                  {currentModel.isFree ? ' (Free)' : ' (Paid)'}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      </section>

      {/* AI Providers Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>AI Providers</h3>
          <button
            onClick={() => { setEditingProvider(null); setShowProviderModal(true); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
          >
            <Plus className="h-4 w-4" />Add Provider
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
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  backgroundColor: provider.isEnabled ? 'var(--color-bg-card)' : 'var(--color-bg-primary)',
                  opacity: provider.isEnabled ? 1 : 0.6,
                }}
              >
                {/* Provider Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{provider.icon}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{provider.displayName}</h4>
                          {provider.isLocal && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>Local</span>
                          )}
                          {providerModels.some(m => m.isFree) && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>Free Tier</span>
                          )}
                          {!provider.isBuiltIn && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}>Custom</span>
                          )}
                        </div>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {providerModels.filter(m => m.isEnabled).length} of {providerModels.length} models enabled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingBaseUrlProvider(provider); setShowBaseUrlModal(true); }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                        title="Edit Base URL"
                      ><Globe className="h-4 w-4" /></button>
                      {!provider.isBuiltIn && (
                        <>
                          <button
                            onClick={() => { setEditingProvider(provider); setShowProviderModal(true); }}
                            className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}
                          ><Edit2 className="h-4 w-4" /></button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id, provider.displayName)}
                            className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                          ><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                      <button onClick={() => toggleProvider(provider.id)}>
                        {provider.isEnabled ? (
                          <ToggleRight style={{ height: '32px', width: '32px', color: 'var(--color-accent)' }} />
                        ) : (
                          <ToggleLeft style={{ height: '32px', width: '32px', color: 'var(--color-text-dim)' }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {provider.isEnabled && (
                    <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      <Globe className="h-3 w-3" />
                      <span className="font-mono truncate">{provider.baseUrl}</span>
                    </div>
                  )}

                  {/* API Key Section */}
                  {provider.apiKeyRequired && provider.isEnabled && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-dark)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Key className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>API Key</span>
                        {hasApiKey && (
                          <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>Configured</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={showKeys[provider.id] ? 'text' : 'password'}
                            value={editingKey[provider.id] ?? (hasApiKey ? '••••••••••••••••' : '')}
                            onChange={(e) => setEditingKey(prev => ({ ...prev, [provider.id]: e.target.value }))}
                            placeholder="Enter your API key..."
                            className="w-full px-4 py-2.5 rounded-lg font-mono text-sm pr-10"
                          />
                          <button
                            onClick={() => toggleShowKey(provider.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--color-text-dim)' }}
                          >
                            {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {editingKey[provider.id] ? (
                          <button onClick={() => handleSaveKey(provider.id)}
                            className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>Save</button>
                        ) : hasApiKey ? (
                          <>
                            <button
                              onClick={() => handleTestConnection(provider.id)}
                              disabled={testingProvider === provider.id}
                              className="px-4 py-2 rounded-lg font-medium"
                              style={{ backgroundColor: status?.success ? 'rgba(34,197,94,0.2)' : 'var(--color-bg-elevated)', color: status?.success ? '#4ade80' : 'var(--color-text-primary)' }}
                            >
                              {testingProvider === provider.id ? <Loader2 className="h-4 w-4 animate-spin" /> : status?.success ? <Check className="h-4 w-4" /> : 'Test'}
                            </button>
                            <button
                              onClick={() => { removeApiKey(provider.id); toast.success('API key removed'); }}
                              className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                            ><Trash2 className="h-4 w-4" /></button>
                          </>
                        ) : null}
                      </div>
                      {provider.apiKeyUrl && (
                        <a href={provider.apiKeyUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--color-accent)' }}>
                          Get API Key <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {status && !status.success && (
                        <p className="mt-2 text-xs flex items-center gap-1" style={{ color: '#f87171' }}>
                          <X className="h-3 w-3" />{status.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Models Section */}
                {provider.isEnabled && (
                  <div style={{ borderTop: '1px solid var(--color-border-dark)' }}>
                    <button
                      onClick={() => setExpandedProvider(isExpanded ? null : provider.id)}
                      className="w-full flex items-center justify-between p-4 transition-colors"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <span className="text-sm font-medium">Manage Models ({providerModels.length})</span>
                      {isExpanded ? <ChevronDown className="h-5 w-5" style={{ color: 'var(--color-text-dim)' }} /> : <ChevronRight className="h-5 w-5" style={{ color: 'var(--color-text-dim)' }} />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 space-y-3">
                            <button
                              onClick={() => { setSelectedProviderId(provider.id); setEditingModel(null); setShowModelModal(true); }}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium"
                              style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px dashed var(--color-border)' }}
                            ><Plus className="h-4 w-4" />Add Model</button>

                            <div className="space-y-2 max-h-80 overflow-y-auto">
                              {providerModels.map((model) => (
                                <div key={model.id}
                                  style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px', borderRadius: '10px',
                                    border: '1px solid var(--color-border)',
                                    backgroundColor: model.isEnabled ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                                    opacity: model.isEnabled ? 1 : 0.5,
                                  }}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{model.displayName}</span>
                                      {model.isDefault && <span className="px-1.5 py-0.5 text-xs rounded" style={{ backgroundColor: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>Default</span>}
                                      {model.isRecommended && <Star className="h-3.5 w-3.5 text-yellow-500" />}
                                      {model.isFree && <span className="px-1.5 py-0.5 text-xs rounded" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#4ade80' }}>Free</span>}
                                    </div>
                                    <p className="text-xs mt-0.5 truncate font-mono" style={{ color: 'var(--color-text-dim)' }}>{model.modelId}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-dim)' }}><Zap className="h-3 w-3 text-yellow-500" />{model.speedRating}/5</span>
                                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-dim)' }}><Target className="h-3 w-3 text-green-500" />{model.accuracyRating}/5</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 ml-2">
                                    {!model.isDefault && model.isEnabled && (
                                      <button onClick={() => { setDefaultModel(provider.id, model.id); toast.success(`${model.displayName} set as default`); }}
                                        className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }} title="Set as default">
                                        <Star className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                    <button onClick={() => { setSelectedProviderId(provider.id); setEditingModel(model); setShowModelModal(true); }}
                                      className="p-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)' }}>
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => toggleModel(model.id)} className="p-1.5">
                                      {model.isEnabled ? <ToggleRight style={{ height: '20px', width: '20px', color: 'var(--color-accent)' }} /> : <ToggleLeft style={{ height: '20px', width: '20px', color: 'var(--color-text-dim)' }} />}
                                    </button>
                                    <button onClick={() => handleDeleteModel(model.id, model.displayName)}
                                      className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {providerModels.length === 0 && (
                                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-dim)' }}>
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
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Output Preferences</h3>
        <div style={{
          padding: '20px', borderRadius: '16px',
          backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        }}>
          <div className="space-y-6">
            {/* Auto Copy */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Auto-copy to clipboard</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Automatically copy selected format after OCR processing</p>
                </div>
                <button onClick={() => updateSettings({ autoCopyEnabled: !settings.autoCopyEnabled })}>
                  {settings.autoCopyEnabled ? <ToggleRight style={{ height: '32px', width: '32px', color: 'var(--color-accent)' }} /> : <ToggleLeft style={{ height: '32px', width: '32px', color: 'var(--color-text-dim)' }} />}
                </button>
              </div>
              {settings.autoCopyEnabled && (
                <>
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Format to auto-copy</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {outputFormats.map((format) => (
                        <button key={format.id} onClick={() => updateSettings({ autoCopyFormat: format.id })}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                            border: 'none',
                            backgroundColor: settings.autoCopyFormat === format.id ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                            color: settings.autoCopyFormat === format.id ? 'white' : 'var(--color-text-muted)',
                          }}
                        >
                          {settings.autoCopyFormat === format.id && <Check style={{ height: '14px', width: '14px' }} />}
                          {format.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>Show notification</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Display a toast when content is auto-copied</p>
                    </div>
                    <button onClick={() => updateSettings({ showAutoCopyNotification: !settings.showAutoCopyNotification })}>
                      {settings.showAutoCopyNotification ? <ToggleRight style={{ height: '24px', width: '24px', color: 'var(--color-accent)' }} /> : <ToggleLeft style={{ height: '24px', width: '24px', color: 'var(--color-text-dim)' }} />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Default Output Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Default output format</label>
              <select value={settings.defaultOutputFormat} onChange={(e) => updateSettings({ defaultOutputFormat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg">
                {outputFormats.map((format) => <option key={format.id} value={format.id}>{format.name}</option>)}
              </select>
            </div>

            {/* Selected Output Formats */}
            <div className="space-y-3">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Output formats to generate</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {outputFormats.map((format) => {
                  const isSelected = settings.selectedOutputFormats.includes(format.id);
                  return (
                    <button key={format.id}
                      onClick={() => {
                        const newFormats = isSelected
                          ? settings.selectedOutputFormats.filter(f => f !== format.id)
                          : [...settings.selectedOutputFormats, format.id];
                        updateSettings({ selectedOutputFormats: newFormats });
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        border: 'none',
                        backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                        color: isSelected ? 'white' : 'var(--color-text-muted)',
                      }}
                    >
                      {isSelected && <Check style={{ height: '14px', width: '14px' }} />}
                      {format.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Editor</h3>
        <div style={{
          padding: '20px', borderRadius: '16px',
          backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Editor Theme</label>
              <select value={settings.editorTheme} onChange={(e) => updateSettings({ editorTheme: e.target.value as 'vs-dark' | 'vs-light' })}
                className="w-full px-4 py-2.5 rounded-lg">
                <option value="vs-dark">Dark</option>
                <option value="vs-light">Light</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Editor Font Size: {settings.editorFontSize}px</label>
              <input type="range" min="10" max="24" value={settings.editorFontSize}
                onChange={(e) => updateSettings({ editorFontSize: parseInt(e.target.value) })} className="w-full mt-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ModelModal isOpen={showModelModal} onClose={() => { setShowModelModal(false); setEditingModel(null); }}
        providerId={selectedProviderId} model={editingModel} onSave={handleSaveModel} />

      <ProviderModal isOpen={showProviderModal} onClose={() => { setShowProviderModal(false); setEditingProvider(null); }}
        provider={editingProvider} onSave={handleSaveProvider} />

      {editingBaseUrlProvider && (
        <EditBaseUrlModal isOpen={showBaseUrlModal}
          onClose={() => { setShowBaseUrlModal(false); setEditingBaseUrlProvider(null); }}
          provider={editingBaseUrlProvider} onSave={handleSaveBaseUrl} />
      )}

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset to Defaults" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <p className="text-sm" style={{ color: '#fcd34d' }}>
              This will reset all providers, models, and settings to their default values. API keys will be preserved.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowResetConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}>Cancel</button>
            <button onClick={handleResetToDefaults}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: '#dc2626', color: 'white' }}>
              <RotateCcw className="h-4 w-4" />Reset
            </button>
          </div>
        </div>
      </Modal>

      {/* Spacer at bottom */}
      <div style={{ height: '40px' }} />
    </div>
  );
}
