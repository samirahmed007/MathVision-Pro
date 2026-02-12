import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Clipboard, Link, Pencil, Image, X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export function ImageUpload() {
  const { currentImage, setCurrentImage } = useAppStore();
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setCurrentImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
    },
    multiple: false,
  });

  // Clipboard paste handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              setCurrentImage(reader.result as string);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setCurrentImage]);

  const handleUrlImport = () => {
    if (urlInput.trim()) {
      // For URL import, we'll load the image and convert to base64
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        setCurrentImage(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        // If CORS fails, just set the URL directly
        setCurrentImage(urlInput);
      };
      img.src = urlInput;
      setShowUrlInput(false);
      setUrlInput('');
    }
  };

  // Canvas drawing
  const initCanvas = (canvas: HTMLCanvasElement | null) => {
    if (canvas && !canvasRef) {
      setCanvasRef(canvas);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
  };

  const useCanvasImage = () => {
    if (!canvasRef) return;
    const dataUrl = canvasRef.toDataURL('image/png');
    setCurrentImage(dataUrl);
    setShowCanvas(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = () => setCurrentImage(reader.result as string);
          reader.readAsDataURL(blob);
          return;
        }
      }
    } catch {
      // Clipboard API might not be available or permission denied
      console.log('Clipboard access not available');
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[200px] flex items-center justify-center',
          isDragActive
            ? 'border-violet-500 bg-violet-500/10'
            : 'border-gray-700 hover:border-violet-500/50 hover:bg-gray-800/50',
          currentImage && 'border-solid border-violet-500/50 bg-gray-900/50'
        )}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {currentImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full"
            >
              <img
                src={currentImage}
                alt="Uploaded"
                className="max-h-56 mx-auto rounded-lg shadow-xl object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImage(null);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs text-gray-400 mt-3">Click or drag to replace</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <Upload className="h-7 w-7 text-violet-500" />
                </div>
              </div>
              <div>
                <p className="text-base font-medium text-white">
                  {isDragActive ? 'Drop image here' : 'Drag & drop an image'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or click to browse
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
          }}
          className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition-colors"
        >
          <Image className="h-4 w-4" />
          <span>Upload</span>
        </button>

        <button
          onClick={handlePasteFromClipboard}
          className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-medium text-gray-300 hover:text-white transition-colors"
        >
          <Clipboard className="h-4 w-4" />
          <span>Paste</span>
        </button>

        <button
          onClick={() => {
            setShowUrlInput(!showUrlInput);
            setShowCanvas(false);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
            showUrlInput
              ? "bg-violet-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
          )}
        >
          <Link className="h-4 w-4" />
          <span>URL</span>
        </button>

        <button
          onClick={() => {
            setShowCanvas(!showCanvas);
            setShowUrlInput(false);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors",
            showCanvas
              ? "bg-violet-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
          )}
        >
          <Pencil className="h-4 w-4" />
          <span>Draw</span>
        </button>
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"
              />
              <button
                onClick={handleUrlImport}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors text-sm"
              >
                Import
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawing Canvas */}
      <AnimatePresence>
        {showCanvas && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              <canvas
                ref={initCanvas}
                width={800}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full bg-white rounded-lg cursor-crosshair border-2 border-gray-700"
                style={{ touchAction: 'none' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={useCanvasImage}
                  className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  Use Drawing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcut Hint */}
      <p className="text-center text-xs text-gray-500">
        Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Ctrl+V</kbd> to paste • <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Ctrl+Shift+S</kbd> for screenshot
      </p>
    </div>
  );
}
