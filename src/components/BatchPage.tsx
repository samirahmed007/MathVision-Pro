import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Play, Pause, Trash2, Download, Check, Loader2, AlertCircle, ChevronDown, FileImage } from 'lucide-react';
import { useAppStore, outputFormats, BatchItem } from '@/store/appStore';
import { processOCR, convertLatexToFormats } from '@/services/ocrService';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function BatchPage() {
  const {
    currentBatch,
    addToBatch,
    clearBatch,
    removeBatchItem,
    updateBatchItem,
    providers,
    models,
    apiKeys,
    settings,
  } = useAppStore();

  const [selectedProvider, setSelectedProvider] = useState(settings.defaultProviderId);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModelId);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(settings.selectedOutputFormats);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [, setProgress] = useState({ completed: 0, failed: 0, total: 0 });

  const enabledProviders = providers.filter(p => p.isEnabled);
  const providerModels = models.filter(m => m.providerId === selectedProvider && m.isEnabled);
  const currentProvider = providers.find(p => p.id === selectedProvider);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: BatchItem[] = acceptedFiles.slice(0, 100 - currentBatch.length).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      imageUrl: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending' as const,
    }));
    addToBatch(newItems);
  }, [addToBatch, currentBatch.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
    },
    multiple: true,
    maxFiles: 100,
  });

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processBatch = async () => {
    const apiKey = apiKeys[selectedProvider];
    if (!apiKey && currentProvider?.apiKeyRequired) {
      toast.error(`Please add your ${currentProvider?.displayName} API key in Settings`);
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    setProgress({ completed: 0, failed: 0, total: currentBatch.length });

    const model = models.find(m => m.id === selectedModel);

    for (let i = 0; i < currentBatch.length; i++) {
      if (isPaused) break;

      const item = currentBatch[i];
      if (item.status === 'completed') continue;

      updateBatchItem(item.id, { status: 'processing' });

      try {
        const imageBase64 = item.file ? await readFileAsDataURL(item.file) : item.imageUrl;
        const result = await processOCR(
          imageBase64,
          selectedProvider,
          model?.modelId || '',
          apiKey || ''
        );

        const outputs = convertLatexToFormats(result.latex);
        updateBatchItem(item.id, { status: 'completed', outputs });
        setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Processing failed';
        updateBatchItem(item.id, { status: 'failed', error: message });
        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setIsProcessing(false);
    toast.success('Batch processing completed!');
  };

  const downloadResults = () => {
    const completedItems = currentBatch.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      toast.error('No completed items to download');
      return;
    }

    let content = '';
    completedItems.forEach((item, index) => {
      content += `=== ${item.filename} ===\n\n`;
      selectedFormats.forEach(formatId => {
        const format = outputFormats.find(f => f.id === formatId);
        if (format && item.outputs?.[formatId]) {
          content += `--- ${format.name} ---\n`;
          content += item.outputs[formatId] + '\n\n';
        }
      });
      if (index < completedItems.length - 1) {
        content += '\n' + '='.repeat(50) + '\n\n';
      }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-results-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = currentBatch.filter(i => i.status === 'completed').length;
  const failedCount = currentBatch.filter(i => i.status === 'failed').length;
  const pendingCount = currentBatch.filter(i => i.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileImage className="h-7 w-7 text-violet-500" />
            Batch Processing
          </h2>
          <p className="text-gray-400 mt-1">
            Process up to 100 images simultaneously
          </p>
        </div>
        
        {currentBatch.length > 0 && (
          <button
            onClick={clearBatch}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-gray-700 hover:border-violet-500/50 hover:bg-gray-800/50'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-violet-500/10 rounded-full">
              <Upload className="h-8 w-8 text-violet-500" />
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop images here' : 'Drag & drop multiple images'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or click to browse • Up to 100 images • {currentBatch.length}/100 added
            </p>
          </div>
        </div>
      </div>

      {/* Batch Queue */}
      {currentBatch.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Queue ({currentBatch.length} images)
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-400">✓ {completedCount} completed</span>
              <span className="text-red-400">✗ {failedCount} failed</span>
              <span className="text-gray-400">○ {pendingCount} pending</span>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((completedCount + failedCount) / currentBatch.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                />
              </div>
              <p className="text-sm text-gray-400 text-center">
                Processing {completedCount + failedCount + 1} of {currentBatch.length}...
              </p>
            </div>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-1">
            <AnimatePresence>
              {currentBatch.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.filename}
                    className={cn(
                      'w-full h-full object-cover rounded-lg border-2 transition-all',
                      item.status === 'completed' && 'border-green-500',
                      item.status === 'failed' && 'border-red-500',
                      item.status === 'processing' && 'border-violet-500',
                      item.status === 'pending' && 'border-gray-700'
                    )}
                  />
                  
                  {/* Status Overlay */}
                  <div className={cn(
                    'absolute inset-0 rounded-lg flex items-center justify-center',
                    item.status === 'processing' && 'bg-violet-500/50',
                    item.status === 'completed' && 'bg-green-500/30',
                    item.status === 'failed' && 'bg-red-500/30'
                  )}>
                    {item.status === 'processing' && (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    )}
                    {item.status === 'completed' && (
                      <Check className="h-6 w-6 text-white" />
                    )}
                    {item.status === 'failed' && (
                      <AlertCircle className="h-6 w-6 text-white" />
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeBatchItem(item.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Configuration */}
      {currentBatch.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 p-5 bg-gray-800/50 rounded-2xl border border-gray-700">
          {/* Provider Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              AI Provider
            </label>
            <div className="relative">
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  const firstModel = models.find(m => m.providerId === e.target.value && m.isDefault);
                  if (firstModel) setSelectedModel(firstModel.id);
                }}
                disabled={isProcessing}
                className="w-full appearance-none px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-10 disabled:opacity-50"
              >
                {enabledProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.icon} {provider.displayName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Model Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Model
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isProcessing}
                className="w-full appearance-none px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-10 disabled:opacity-50"
              >
                {providerModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.displayName} {model.isFree && '(Free)'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Output Formats */}
          <div className="sm:col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Output Formats
            </label>
            <div className="flex flex-wrap gap-2">
              {outputFormats.map((format) => {
                const isSelected = selectedFormats.includes(format.id);
                return (
                  <button
                    key={format.id}
                    onClick={() => {
                      setSelectedFormats(prev =>
                        isSelected
                          ? prev.filter(f => f !== format.id)
                          : [...prev, format.id]
                      );
                    }}
                    disabled={isProcessing}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50',
                      isSelected
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    )}
                  >
                    {format.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {currentBatch.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {!isProcessing ? (
            <button
              onClick={processBatch}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-lg font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/25 transition-all"
            >
              <Play className="h-5 w-5" />
              Start Processing
            </button>
          ) : (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-amber-600 text-white rounded-xl text-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              <Pause className="h-5 w-5" />
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
            >
              <Download className="h-5 w-5" />
              Download Results
            </button>
          )}
        </div>
      )}
    </div>
  );
}
