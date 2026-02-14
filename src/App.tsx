import { useEffect } from 'react';
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
  const { activeTab, settings } = useAppStore();

  // Apply theme data attribute to html element
  useEffect(() => {
    const theme = settings.appTheme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    // Also set body and root backgrounds
    document.body.style.backgroundColor = 'var(--color-bg-primary)';
    document.body.style.color = 'var(--color-text-primary)';
  }, [settings.appTheme]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-accent)',
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
      
      <main style={{ flex: 1, width: '100%' }}>
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
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
      }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--color-text-dim)' }}>
            <p>
              MathVision Pro • AI-Powered Mathematical OCR Platform
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span>8 AI Providers</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-text-dim)' }} />
              <span>10+ Output Formats</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-text-dim)' }} />
              <span>Batch Processing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
