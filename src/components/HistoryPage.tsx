import { useState } from 'react';
import { Clock, Copy, Trash2, Search, ChevronRight, Check, Download, History as HistoryIcon, X } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function HistoryPage() {
  const { history, clearHistory, deleteHistoryItem, setCurrentImage, setCurrentResults, setActiveTab } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredHistory = history.filter(item => {
    const latex = item.outputs?.latex || '';
    return latex.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.model.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        toast.error('Failed to copy');
      }
    }
  };

  const reprocessItem = (item: typeof history[0]) => {
    setCurrentImage(item.imageUrl);
    setCurrentResults(item);
    setActiveTab('ocr');
    toast.success('Loaded from history');
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const downloadHistory = () => {
    const content = history.map(item => {
      return `Date: ${new Date(item.timestamp).toLocaleString()}
Provider: ${item.provider}
Model: ${item.model}
Processing Time: ${item.processingTime}ms

LaTeX:
${item.outputs?.latex || 'N/A'}

---`;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mathvision-history-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <HistoryIcon className="h-7 w-7 text-violet-500" />
            History
          </h2>
          <p className="text-gray-400 mt-1">
            {history.length} items • Last 100 conversions saved
          </p>
        </div>
        
        <div className="flex gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={downloadHistory}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all history?')) {
                    clearHistory();
                    toast.success('History cleared');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by LaTeX, provider, or model..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      )}

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredHistory.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden"
              >
                <div
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/80 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt="Input"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-mono truncate">
                      {item.outputs?.latex?.slice(0, 60) || 'No output'}...
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.timestamp)}
                      </span>
                      <span>{item.provider}</span>
                      <span>{item.processingTime}ms</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.outputs?.latex || '', item.id);
                      }}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        copiedId === item.id
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      )}
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reprocessItem(item);
                      }}
                      className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistoryItem(item.id);
                        toast.success('Item deleted');
                      }}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700"
                    >
                      <div className="p-4 space-y-4">
                        {/* Full LaTeX */}
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Full LaTeX Output</p>
                          <pre className="p-3 bg-gray-900 rounded-lg text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                            {item.outputs?.latex || 'No output'}
                          </pre>
                        </div>

                        {/* Quick Copy Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.outputs || {}).map(([format, content]) => (
                            <button
                              key={format}
                              onClick={() => copyToClipboard(content, `${item.id}-${format}`)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                copiedId === `${item.id}-${format}`
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-700 text-gray-400 hover:text-white'
                              )}
                            >
                              {copiedId === `${item.id}-${format}` ? (
                                <span className="flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Copied
                                </span>
                              ) : (
                                format.toUpperCase()
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <HistoryIcon className="h-16 w-16 mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {searchQuery ? 'No matching results' : 'No history yet'}
          </p>
          <p className="text-sm">
            {searchQuery ? 'Try a different search term' : 'Process some images to see them here'}
          </p>
        </div>
      )}
    </div>
  );
}
