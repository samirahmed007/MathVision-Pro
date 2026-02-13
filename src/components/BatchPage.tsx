import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Play, Pause, Trash2, Download, Check, Loader2, AlertCircle, ChevronDown, FileImage, RotateCcw, FileText, Archive } from 'lucide-react';
import { useAppStore, outputFormats, BatchItem } from '@/store/appStore';
import { processOCR, convertLatexToFormats } from '@/services/ocrService';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import JSZip from 'jszip';

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
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [maxRetries, setMaxRetries] = useState(3);
  const [delayBetween, setDelayBetween] = useState(1000);

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

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const processItem = async (
    item: BatchItem,
    modelObj: { modelId: string } | undefined,
    apiKey: string
  ): Promise<{ success: boolean; outputs?: Record<string, string>; error?: string }> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const imageBase64 = item.file ? await readFileAsDataURL(item.file) : item.imageUrl;
        const result = await processOCR(
          imageBase64,
          selectedProvider,
          modelObj?.modelId || '',
          apiKey || '',
          currentProvider?.baseUrl
        );

        const convertedFormats = convertLatexToFormats(result.latex);
        const outputs: Record<string, string> = {
          latex: result.latex,
          ...convertedFormats,
        };
        return { success: true, outputs };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Processing failed';
        
        const isRateLimited = message.toLowerCase().includes('rate') || 
                              message.toLowerCase().includes('quota') ||
                              message.toLowerCase().includes('429') ||
                              message.toLowerCase().includes('exceeded');
        
        if (attempt < maxRetries) {
          const retryDelay = isRateLimited 
            ? Math.min(delayBetween * Math.pow(2, attempt), 30000)
            : delayBetween * attempt;
          
          updateBatchItem(item.id, { 
            status: 'processing', 
            error: `Attempt ${attempt}/${maxRetries} failed: ${message}. Retrying in ${Math.round(retryDelay/1000)}s...` 
          });
          
          await sleep(retryDelay);
        } else {
          return { success: false, error: `Failed after ${maxRetries} attempts: ${message}` };
        }
      }
    }
    return { success: false, error: 'Unexpected error' };
  };

  const processBatch = async () => {
    const apiKey = apiKeys[selectedProvider];
    if (!apiKey && currentProvider?.apiKeyRequired) {
      toast.error(`Please add your ${currentProvider?.displayName} API key in Settings`);
      return;
    }

    setIsProcessing(true);
    isPausedRef.current = false;
    isCancelledRef.current = false;
    setIsPaused(false);

    const model = models.find(m => m.id === selectedModel);
    let completedSoFar = 0;
    let failedSoFar = 0;

    for (let i = 0; i < currentBatch.length; i++) {
      if (isCancelledRef.current) {
        toast('Batch processing cancelled', { icon: '🛑' });
        break;
      }

      while (isPausedRef.current) {
        await sleep(500);
        if (isCancelledRef.current) break;
      }

      const item = currentBatch[i];
      if (item.status === 'completed') {
        completedSoFar++;
        continue;
      }

      updateBatchItem(item.id, { status: 'processing', error: undefined });

      const result = await processItem(item, model, apiKey || '');
      
      if (result.success && result.outputs) {
        updateBatchItem(item.id, { status: 'completed', outputs: result.outputs, error: undefined });
        completedSoFar++;
      } else {
        updateBatchItem(item.id, { status: 'failed', error: result.error });
        failedSoFar++;
      }

      if (i < currentBatch.length - 1 && !isCancelledRef.current) {
        await sleep(delayBetween);
      }
    }

    setIsProcessing(false);
    
    if (!isCancelledRef.current) {
      if (failedSoFar === 0) {
        toast.success(`Batch completed! All ${completedSoFar} items processed successfully.`);
      } else {
        toast.success(`Batch completed: ${completedSoFar} succeeded, ${failedSoFar} failed.`);
      }
    }
  };

  const retryFailed = async () => {
    const failedItems = currentBatch.filter(item => item.status === 'failed');
    if (failedItems.length === 0) return;

    const apiKey = apiKeys[selectedProvider];
    if (!apiKey && currentProvider?.apiKeyRequired) {
      toast.error(`Please add your ${currentProvider?.displayName} API key in Settings`);
      return;
    }

    setIsProcessing(true);
    isPausedRef.current = false;
    isCancelledRef.current = false;

    const model = models.find(m => m.id === selectedModel);
    let retried = 0;
    let succeeded = 0;

    for (const item of failedItems) {
      if (isCancelledRef.current) break;

      updateBatchItem(item.id, { status: 'processing', error: undefined });
      retried++;

      const result = await processItem(item, model, apiKeys[selectedProvider] || '');
      
      if (result.success && result.outputs) {
        updateBatchItem(item.id, { status: 'completed', outputs: result.outputs, error: undefined });
        succeeded++;
      } else {
        updateBatchItem(item.id, { status: 'failed', error: result.error });
      }

      if (!isCancelledRef.current) {
        await sleep(delayBetween);
      }
    }

    setIsProcessing(false);
    toast.success(`Retried ${retried} items: ${succeeded} succeeded.`);
  };

  const handlePauseToggle = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused(!isPaused);
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    setIsPaused(false);
    setIsProcessing(false);
  };

  // Generate HTML output in the specific XHTML/EPUB format
  const generateBatchHTML = (completedItems: BatchItem[]): string => {
    const rows = completedItems.map((item) => {
      const mathml = item.outputs?.mathml || '';
      const mathmlOneLine = mathml.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();
      const imgSrc = `images/${item.filename || 'image.png'}`;
      return `<tr><td style="text-align: right;"><img src="${imgSrc}" alt=""/></td><td>${mathmlOneLine}</td></tr>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:svg="http://www.w3.org/2000/svg" epub:prefix="index: http://www.index.com/" xml:lang="en" lang="en">
<head>
<title>MathVision Pro - Batch Output</title>
</head>
<body epub:type="bodymatter chapter">
<table border="1">
<tbody>
${rows.join('\n')}
</tbody>
</table>
</body>
</html>`;
  };

  const downloadResults = () => {
    const completedItems = currentBatch.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      toast.error('No completed items to download');
      return;
    }

    let content = '';
    completedItems.forEach((item, index) => {
      content += `=== ${item.filename || `Image ${index + 1}`} ===\n\n`;
      selectedFormats.forEach(formatId => {
        if (formatId === 'html') return;
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
    toast.success('Results downloaded!');
  };

  const downloadHTML = () => {
    const completedItems = currentBatch.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      toast.error('No completed items to download');
      return;
    }

    const htmlContent = generateBatchHTML(completedItems);
    const blob = new Blob([htmlContent], { type: 'application/xhtml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-mathml-${new Date().toISOString().slice(0, 10)}.xhtml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('XHTML with MathML downloaded!');
  };

  // Download XHTML + images as ZIP
  const downloadXHTMLZip = async () => {
    const completedItems = currentBatch.filter(item => item.status === 'completed');
    if (completedItems.length === 0) {
      toast.error('No completed items to download');
      return;
    }

    const loadingToast = toast.loading('Creating ZIP with XHTML and images...');

    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder('images');

      // Add images to the images/ folder
      for (const item of completedItems) {
        if (item.file) {
          const arrayBuffer = await readFileAsArrayBuffer(item.file);
          const filename = item.filename || 'image.png';
          imagesFolder!.file(filename, arrayBuffer);
        } else if (item.imageUrl) {
          // For blob URLs, try to fetch
          try {
            const response = await fetch(item.imageUrl);
            const blob = await response.blob();
            const filename = item.filename || 'image.png';
            imagesFolder!.file(filename, blob);
          } catch {
            // Skip if can't fetch
            console.warn(`Could not fetch image for ${item.filename}`);
          }
        }
      }

      // Generate the XHTML file
      const htmlContent = generateBatchHTML(completedItems);
      zip.file('output.xhtml', htmlContent);

      // Generate the ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mathvision-batch-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success('ZIP downloaded with XHTML + images!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to create ZIP: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const completedCount = currentBatch.filter(i => i.status === 'completed').length;
  const failedCount = currentBatch.filter(i => i.status === 'failed').length;
  const pendingCount = currentBatch.filter(i => i.status === 'pending').length;
  const processingCount = currentBatch.filter(i => i.status === 'processing').length;

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
            Process up to 100 images simultaneously with auto-retry
          </p>
        </div>
        
        {currentBatch.length > 0 && (
          <button
            onClick={clearBatch}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-white">
              Queue ({currentBatch.length} images)
            </h3>
            <div className="flex items-center gap-4 text-sm">
              {completedCount > 0 && <span className="text-green-400">✓ {completedCount} completed</span>}
              {failedCount > 0 && <span className="text-red-400">✗ {failedCount} failed</span>}
              {processingCount > 0 && <span className="text-violet-400">⟳ {processingCount} processing</span>}
              {pendingCount > 0 && <span className="text-gray-400">○ {pendingCount} pending</span>}
            </div>
          </div>

          {/* Progress Bar */}
          {(isProcessing || completedCount > 0) && (
            <div className="space-y-2">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
                {completedCount > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedCount / currentBatch.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                )}
                {failedCount > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(failedCount / currentBatch.length) * 100}%` }}
                    className="h-full bg-red-500"
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {isProcessing 
                    ? `Processing ${completedCount + failedCount + 1} of ${currentBatch.length}...`
                    : `${completedCount} of ${currentBatch.length} completed`
                  }
                </span>
                <span>
                  {Math.round(((completedCount + failedCount) / currentBatch.length) * 100)}%
                </span>
              </div>
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
                  title={item.error || item.filename || ''}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.filename}
                    className={cn(
                      'w-full h-full object-cover rounded-lg border-2 transition-all',
                      item.status === 'completed' && 'border-green-500',
                      item.status === 'failed' && 'border-red-500',
                      item.status === 'processing' && 'border-violet-500 animate-pulse',
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
                  {!isProcessing && (
                    <button
                      onClick={() => removeBatchItem(item.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
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

          {/* Retry Settings */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Max Retries per Image
            </label>
            <div className="relative">
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                disabled={isProcessing}
                className="w-full appearance-none px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-10 disabled:opacity-50"
              >
                <option value={1}>1 attempt (no retry)</option>
                <option value={2}>2 attempts</option>
                <option value={3}>3 attempts (recommended)</option>
                <option value={5}>5 attempts</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Delay Between Requests */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Delay Between Requests
            </label>
            <div className="relative">
              <select
                value={delayBetween}
                onChange={(e) => setDelayBetween(Number(e.target.value))}
                disabled={isProcessing}
                className="w-full appearance-none px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-violet-500 pr-10 disabled:opacity-50"
              >
                <option value={500}>0.5 seconds</option>
                <option value={1000}>1 second (recommended)</option>
                <option value={2000}>2 seconds</option>
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds (rate limit safe)</option>
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
            <>
              <button
                onClick={processBatch}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-lg font-semibold hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/25 transition-all"
              >
                <Play className="h-5 w-5" />
                Start Processing
              </button>

              {failedCount > 0 && (
                <button
                  onClick={retryFailed}
                  className="flex items-center gap-2 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                  Retry Failed ({failedCount})
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handlePauseToggle}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-xl text-lg font-semibold transition-colors",
                  isPaused ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
                )}
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </>
          )}

          {completedCount > 0 && (
            <>
              <button
                onClick={downloadResults}
                className="flex items-center gap-2 px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
              >
                <Download className="h-5 w-5" />
                Download All
              </button>
              <button
                onClick={downloadHTML}
                className="flex items-center gap-2 px-6 py-4 bg-blue-700 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
                title="Download as XHTML with MathML table"
              >
                <FileText className="h-5 w-5" />
                XHTML Only
              </button>
              <button
                onClick={downloadXHTMLZip}
                className="flex items-center gap-2 px-6 py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors"
                title="Download ZIP with XHTML + images folder"
              >
                <Archive className="h-5 w-5" />
                XHTML + Images (ZIP)
              </button>
            </>
          )}
        </div>
      )}

      {/* Failed Items Details */}
      {failedCount > 0 && !isProcessing && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
          <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Failed Items ({failedCount})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {currentBatch
              .filter(item => item.status === 'failed')
              .map(item => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img src={item.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                  <span className="text-gray-300 font-medium">{item.filename}</span>
                  <span className="text-red-400 flex-1 truncate">{item.error}</span>
                </div>
              ))}
          </div>
          <button
            onClick={retryFailed}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry All Failed Items
          </button>
        </div>
      )}
    </div>
  );
}
