import { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Loader2, AlertCircle, ChevronDown, Keyboard, ChevronUp, Camera, Crop, X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { OutputPanel } from './OutputPanel';
import LaTeXEditor from './LaTeXEditor';
import { useAppStore } from '@/store/appStore';
import { processOCR, convertLatexToFormats, captureScreenshot } from '@/services/ocrService';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function OCRPage() {
  const {
    currentImage,
    setCurrentImage,
    isProcessing,
    setIsProcessing,
    setCurrentResults,
    currentResults,
    addToHistory,
    providers,
    models,
    apiKeys,
    settings,
  } = useAppStore();

  const [selectedProvider, setSelectedProvider] = useState(settings.defaultProviderId);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModelId);
  const [error, setError] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSnipTool, setShowSnipTool] = useState(false);
  const [snipImage, setSnipImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selection, setSelection] = useState<{startX: number; startY: number; endX: number; endY: number} | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editorLatex, setEditorLatex] = useState<string>('');
  const snipCanvasRef = useRef<HTMLCanvasElement>(null);
  const snipContainerRef = useRef<HTMLDivElement>(null);
  
  // Update editor when results change
  useEffect(() => {
    if (currentResults?.outputs?.latex) {
      setEditorLatex(currentResults.outputs.latex);
    }
  }, [currentResults]);

  const enabledProviders = providers.filter(p => p.isEnabled);
  const providerModels = models.filter(m => m.providerId === selectedProvider && m.isEnabled);
  const currentProvider = providers.find(p => p.id === selectedProvider);

  // Update selected model when provider changes
  useEffect(() => {
    const defaultModel = providerModels.find(m => m.isDefault) || providerModels[0];
    if (defaultModel && !providerModels.find(m => m.id === selectedModel)) {
      setSelectedModel(defaultModel.id);
    }
  }, [selectedProvider, providerModels, selectedModel]);
  
  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;
    
    if (modifier && e.key === 'Enter' && currentImage && !isProcessing) {
      e.preventDefault();
      handleProcess();
    }
    
    if (modifier && e.key === 'b') {
      e.preventDefault();
      useAppStore.getState().setActiveTab('batch');
    }
    
    if (modifier && e.key === 'h') {
      e.preventDefault();
      useAppStore.getState().setActiveTab('history');
    }
    
    if (modifier && e.key === ',') {
      e.preventDefault();
      useAppStore.getState().setActiveTab('settings');
    }

    if (modifier && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      handleScreenCapture();
    }
  }, [currentImage, isProcessing]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle screenshot capture
  const handleScreenCapture = async () => {
    setIsCapturing(true);
    try {
      const screenshot = await captureScreenshot();
      if (screenshot) {
        setSnipImage(screenshot);
        setShowSnipTool(true);
      } else {
        toast.error('Screenshot capture was cancelled or failed');
      }
    } catch {
      toast.error('Failed to capture screenshot. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Draw the snip image on canvas
  useEffect(() => {
    if (showSnipTool && snipImage && snipCanvasRef.current) {
      const canvas = snipCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Scale image to fit in viewport while maintaining aspect ratio
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.8;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = snipImage;
    }
  }, [showSnipTool, snipImage]);

  // Draw selection overlay
  useEffect(() => {
    if (showSnipTool && snipCanvasRef.current && snipImage && selection) {
      const canvas = snipCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Redraw the original image
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Clear the selected area
        const x = Math.min(selection.startX, selection.endX);
        const y = Math.min(selection.startY, selection.endY);
        const width = Math.abs(selection.endX - selection.startX);
        const height = Math.abs(selection.endY - selection.startY);
        
        if (width > 0 && height > 0) {
          ctx.clearRect(x, y, width, height);
          ctx.drawImage(img, x, y, width, height, x, y, width, height);
          
          // Draw border around selection
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x, y, width, height);
        }
      };
      img.src = snipImage;
    }
  }, [selection, showSnipTool, snipImage]);

  const handleSnipMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = snipCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({ startX: x, startY: y, endX: x, endY: y });
    setIsSelecting(true);
  };

  const handleSnipMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selection) return;
    
    const canvas = snipCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({ ...selection, endX: x, endY: y });
  };

  const handleSnipMouseUp = () => {
    setIsSelecting(false);
  };

  const handleSnipConfirm = () => {
    if (!selection || !snipCanvasRef.current || !snipImage) return;

    const canvas = snipCanvasRef.current;
    const x = Math.min(selection.startX, selection.endX);
    const y = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX);
    const height = Math.abs(selection.endY - selection.startY);

    if (width < 10 || height < 10) {
      toast.error('Selection too small. Please select a larger area.');
      return;
    }

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = width;
    cropCanvas.height = height;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Draw the original image first to get actual pixels
    const img = new Image();
    img.onload = () => {
      // Calculate scale factor
      const scaleX = img.width / canvas.width;
      const scaleY = img.height / canvas.height;

      // Source coordinates on original image
      const srcX = x * scaleX;
      const srcY = y * scaleY;
      const srcWidth = width * scaleX;
      const srcHeight = height * scaleY;

      // Set crop canvas to original resolution
      cropCanvas.width = srcWidth;
      cropCanvas.height = srcHeight;

      cropCtx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
      
      const croppedImage = cropCanvas.toDataURL('image/png');
      setCurrentImage(croppedImage);
      setShowSnipTool(false);
      setSnipImage(null);
      setSelection(null);
      toast.success('Area captured successfully!');
    };
    img.src = snipImage;
  };

  const handleSnipCancel = () => {
    setShowSnipTool(false);
    setSnipImage(null);
    setSelection(null);
  };

  const handleProcess = async () => {
    if (!currentImage) {
      toast.error('Please upload an image first');
      return;
    }

    const apiKey = apiKeys[selectedProvider];
    if (!apiKey && currentProvider?.apiKeyRequired) {
      toast.error(`Please add your ${currentProvider?.displayName} API key in Settings`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const startTime = Date.now();
      const model = models.find(m => m.id === selectedModel);
      const result = await processOCR(
        currentImage,
        selectedProvider,
        model?.modelId || '',
        apiKey || '',
        currentProvider?.baseUrl
      );

      const processingTime = Date.now() - startTime;
      const convertedFormats = convertLatexToFormats(result.latex);
      
      // Combine latex with other formats
      const outputs: Record<string, string> = {
        latex: result.latex,
        ...convertedFormats,
      };

      const ocrResult = {
        id: Date.now().toString(),
        imageUrl: currentImage,
        timestamp: new Date(),
        provider: currentProvider?.displayName || selectedProvider,
        model: model?.displayName || selectedModel,
        outputs,
        processingTime,
      };

      setCurrentResults(ocrResult);
      addToHistory(ocrResult);

      // Auto-copy with fallback for clipboard issues
      if (settings.autoCopyEnabled) {
        const autoCopyOutput = outputs[settings.autoCopyFormat];
        if (autoCopyOutput) {
          try {
            // Try the modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
              await navigator.clipboard.writeText(autoCopyOutput);
            } else {
              // Fallback using execCommand
              const textArea = document.createElement('textarea');
              textArea.value = autoCopyOutput;
              textArea.style.position = 'fixed';
              textArea.style.left = '-999999px';
              textArea.style.top = '-999999px';
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              document.execCommand('copy');
              textArea.remove();
            }
            if (settings.showAutoCopyNotification) {
              toast.success(`${settings.autoCopyFormat.toUpperCase()} copied to clipboard!`, {
                icon: '📋',
                duration: 2000,
              });
            }
          } catch (clipboardErr) {
            console.error('Auto-copy failed:', clipboardErr);
            // Try one more fallback
            try {
              const textArea = document.createElement('textarea');
              textArea.value = autoCopyOutput;
              textArea.style.position = 'fixed';
              textArea.style.left = '-999999px';
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              textArea.remove();
              if (settings.showAutoCopyNotification) {
                toast.success(`${settings.autoCopyFormat.toUpperCase()} copied to clipboard!`, {
                  icon: '📋',
                  duration: 2000,
                });
              }
            } catch {
              toast.success('OCR completed! Click copy to get the result.', {
                icon: '✓',
                duration: 2000,
              });
            }
          }
        }
      } else {
        toast.success('OCR completed successfully!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR processing failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Snip Tool Modal */}
      <AnimatePresence>
        {showSnipTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Select Area to Capture</h3>
              <p className="text-gray-400 text-sm">Click and drag to select the math equation area</p>
            </div>
            
            <div ref={snipContainerRef} className="relative max-w-full max-h-[70vh] overflow-auto">
              <canvas
                ref={snipCanvasRef}
                onMouseDown={handleSnipMouseDown}
                onMouseMove={handleSnipMouseMove}
                onMouseUp={handleSnipMouseUp}
                onMouseLeave={handleSnipMouseUp}
                className="cursor-crosshair border-2 border-gray-600 rounded-lg"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSnipCancel}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSnipConfirm}
                disabled={!selection || Math.abs(selection.endX - selection.startX) < 10}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2",
                  selection && Math.abs(selection.endX - selection.startX) >= 10
                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
              >
                <Crop className="h-5 w-5" />
                Capture Selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Page Header with Provider/Model Selection */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl">
              <Zap className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Math OCR</h2>
              <p className="text-sm text-gray-400">Convert images to LaTeX & more</p>
            </div>
          </div>

          {/* Provider & Model Selection - Inline */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Provider Select */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 hidden sm:inline">Provider:</span>
              <div className="relative">
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 cursor-pointer hover:bg-gray-750"
                >
                  {enabledProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.icon} {provider.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Model Select */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 hidden sm:inline">Model:</span>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 cursor-pointer hover:bg-gray-750 max-w-[200px]"
                >
                  {providerModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.displayName} {model.isFree ? '✓' : '$'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Screenshot Button */}
            <button
              onClick={handleScreenCapture}
              disabled={isCapturing}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              title="Capture screenshot (Ctrl+Shift+S)"
            >
              {isCapturing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Snapshot</span>
            </button>
          </div>
        </div>

        {/* API Key Warning */}
        <AnimatePresence>
          {currentProvider?.apiKeyRequired && !apiKeys[selectedProvider] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            >
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-400">
                  API Key Required for {currentProvider.displayName}
                </p>
                <p className="text-xs text-amber-400/70 mt-1">
                  Add your API key in{' '}
                  <button
                    onClick={() => useAppStore.getState().setActiveTab('settings')}
                    className="underline hover:no-underline font-medium"
                  >
                    Settings
                  </button>
                  {currentProvider.apiKeyUrl && (
                    <>
                      {' or '}
                      <a
                        href={currentProvider.apiKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline font-medium"
                      >
                        Get API Key →
                      </a>
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => useAppStore.getState().setActiveTab('settings')}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors"
              >
                Configure
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Input Image</h3>
              <span className="text-xs text-gray-500">
                Drag, paste, or capture
              </span>
            </div>

            <ImageUpload />

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={!currentImage || isProcessing}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-lg font-semibold transition-all',
                currentImage && !isProcessing
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/25'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Process OCR
                </>
              )}
            </button>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Error</p>
                    <p className="text-xs text-red-400/70 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Output</h3>
              <span className="text-xs text-gray-500">
                Multiple formats available
              </span>
            </div>

            <OutputPanel />
          </div>
        </div>

        {/* Full Width LaTeX Editor - Editable */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            LaTeX Editor
            <span className="text-xs font-normal text-gray-500">Edit and re-convert your math expressions</span>
          </h3>
          <LaTeXEditor 
            initialValue={editorLatex}
            onChange={(value) => {
              setEditorLatex(value);
            }}
            onPushToOutput={(value) => {
              // Convert LaTeX and update the Output Panel
              const convertedFormats = convertLatexToFormats(value);
              const outputs: Record<string, string> = {
                latex: value,
                ...convertedFormats,
              };
              
              if (currentResults) {
                setCurrentResults({
                  ...currentResults,
                  outputs,
                });
              } else {
                setCurrentResults({
                  id: Date.now().toString(),
                  imageUrl: currentImage || '',
                  timestamp: new Date(),
                  provider: 'Editor',
                  model: 'Manual Input',
                  outputs,
                  processingTime: 0,
                });
              }
              toast.success('LaTeX converted and pushed to Output!', { icon: '🔄', duration: 2000 });
            }}
          />
        </div>

        {/* Keyboard Shortcuts */}
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Keyboard className="h-4 w-4" />
            Keyboard Shortcuts
            {showShortcuts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <AnimatePresence>
            {showShortcuts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 text-xs">
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+V</kbd>
                    <span className="text-gray-400">Paste image</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+Enter</kbd>
                    <span className="text-gray-400">Process OCR</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+Shift+S</kbd>
                    <span className="text-gray-400">Screenshot</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+B</kbd>
                    <span className="text-gray-400">Batch mode</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+H</kbd>
                    <span className="text-gray-400">History</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-300">Ctrl+,</kbd>
                    <span className="text-gray-400">Settings</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
