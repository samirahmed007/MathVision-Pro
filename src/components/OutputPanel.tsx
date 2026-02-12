import { useState, useEffect } from 'react';
import { Copy, Check, Download, Code, FileText, Hash, Braces, FileCode2, ExternalLink } from 'lucide-react';
import { useAppStore, outputFormats } from '@/store/appStore';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Helper function to clean LaTeX for rendering
const cleanLatexForRender = (latex: string): string => {
  let clean = latex.trim();
  // Remove markdown code block markers
  clean = clean.replace(/^```latex\n?/g, '').replace(/\n?```$/g, '');
  clean = clean.replace(/^```\n?/g, '').replace(/\n?```$/g, '');
  // Remove display math delimiters
  clean = clean.replace(/^\$\$\s*/g, '').replace(/\s*\$\$$/g, '');
  clean = clean.replace(/^\$\s*/g, '').replace(/\s*\$$/g, '');
  clean = clean.replace(/^\\\[\s*/g, '').replace(/\s*\\\]$/g, '');
  clean = clean.replace(/^\\\(\s*/g, '').replace(/\s*\\\)$/g, '');
  return clean;
};

const categoryIcons: Record<string, React.ReactNode> = {
  markup: <Code className="h-3.5 w-3.5" />,
  document: <FileText className="h-3.5 w-3.5" />,
  code: <Braces className="h-3.5 w-3.5" />,
  text: <Hash className="h-3.5 w-3.5" />,
  image: <FileCode2 className="h-3.5 w-3.5" />,
};

export function OutputPanel() {
  const { currentResults, activeOutputTab, setActiveOutputTab, settings } = useAppStore();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  const selectedFormats = outputFormats.filter(f => 
    settings.selectedOutputFormats.includes(f.id)
  );

  // Render LaTeX to HTML string using KaTeX
  useEffect(() => {
    if (currentResults?.outputs?.latex) {
      try {
        const cleanLatex = cleanLatexForRender(currentResults.outputs.latex);
        
        if (!cleanLatex) {
          setRenderedHtml('');
          setRenderError(null);
          return;
        }
        
        const html = katex.renderToString(cleanLatex, {
          displayMode: true,
          throwOnError: false,
          trust: true,
          strict: false,
          output: 'html',
          macros: {
            "\\R": "\\mathbb{R}",
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\Q": "\\mathbb{Q}",
            "\\C": "\\mathbb{C}",
          }
        });
        
        setRenderedHtml(html);
        setRenderError(null);
      } catch (error) {
        console.error('KaTeX render error:', error);
        setRenderError(error instanceof Error ? error.message : 'Error rendering LaTeX');
        setRenderedHtml('');
      }
    } else {
      setRenderedHtml('');
      setRenderError(null);
    }
  }, [currentResults?.outputs?.latex]);

  const copyToClipboard = async (text: string, format: string) => {
    if (!text) return;
    
    try {
      // Try the modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }
      setCopiedFormat(format);
      toast.success(`${format.toUpperCase()} copied to clipboard`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Last resort fallback using execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopiedFormat(format);
        toast.success(`${format.toUpperCase()} copied to clipboard`);
        setTimeout(() => setCopiedFormat(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const downloadOutput = (content: string, format: typeof outputFormats[0]) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-output${format.extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${format.name}`);
  };

  const currentOutput = currentResults?.outputs?.[activeOutputTab] || '';
  const currentFormat = outputFormats.find(f => f.id === activeOutputTab);

  return (
    <div className="space-y-4">
      {/* Format Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-900/50 rounded-xl border border-gray-800">
        {selectedFormats.map((format) => (
          <button
            key={format.id}
            onClick={() => setActiveOutputTab(format.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeOutputTab === format.id
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            {categoryIcons[format.category]}
            {format.name}
          </button>
        ))}
      </div>

      {/* Output Content */}
      {currentResults ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Code Block */}
          <div className="relative group">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border border-gray-800 rounded-t-xl border-b-0">
              <span className="text-xs font-medium text-gray-400">
                {currentFormat?.name || activeOutputTab.toUpperCase()}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => copyToClipboard(currentOutput, activeOutputTab)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    copiedFormat === activeOutputTab
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  )}
                >
                  {copiedFormat === activeOutputTab ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy
                </button>
                <button
                  onClick={() => {
                    if (currentFormat) downloadOutput(currentOutput, currentFormat);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-md text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-950 rounded-b-xl border border-gray-800 border-t-0 overflow-x-auto max-h-48">
              <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
                {currentOutput || 'No output for this format'}
              </code>
            </pre>
          </div>

          {/* Preview Section */}
          <div className="p-4 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Rendered Preview
              </p>
              <a
                href={`https://www.overleaf.com/docs?snip=${encodeURIComponent(currentResults.outputs.latex)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
              >
                Open in Overleaf
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="text-gray-900 text-lg overflow-x-auto min-h-[60px] flex items-center justify-center">
              {renderError ? (
                <span className="text-red-500 text-sm">{renderError}</span>
              ) : renderedHtml ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  className="katex-display"
                />
              ) : (
                <span className="text-gray-400 text-sm">No preview available</span>
              )}
            </div>
          </div>

          {/* Quick Copy All Formats */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Quick Copy</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => {
                    const output = currentResults?.outputs?.[format.id];
                    if (output) copyToClipboard(output, format.id);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    copiedFormat === format.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  )}
                >
                  {copiedFormat === format.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {format.name}
                </button>
              ))}
            </div>
          </div>

          {/* Processing Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {currentResults.provider} • {currentResults.model}
            </span>
            <span>
              {currentResults.processingTime}ms
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800 border-dashed">
          <Code className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-base font-medium">No results yet</p>
          <p className="text-sm mt-1">Upload an image and click Process</p>
        </div>
      )}
    </div>
  );
}
