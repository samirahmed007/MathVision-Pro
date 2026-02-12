import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { OCRPage } from '@/components/OCRPage';
import { BatchPage } from '@/components/BatchPage';
import { HistoryPage } from '@/components/HistoryPage';
import { SettingsPage } from '@/components/SettingsPage';
import AboutPage from '@/components/AboutPage';
import { useAppStore } from '@/store/appStore';
import { motion, AnimatePresence } from 'framer-motion';

export function App() {
  const { activeTab } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#8b5cf6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header />
      
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="min-h-[calc(100vh-180px)]"
            >
              {activeTab === 'ocr' && <OCRPage />}
              {activeTab === 'batch' && <BatchPage />}
              {activeTab === 'history' && <HistoryPage />}
              {activeTab === 'settings' && <SettingsPage />}
              {activeTab === 'about' && <AboutPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              MathVision Pro • AI-Powered Mathematical OCR Platform
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span>8 AI Providers</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>10+ Output Formats</span>
              <span className="w-1 h-1 rounded-full bg-gray-600" />
              <span>Batch Processing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
