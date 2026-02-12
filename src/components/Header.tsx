import { Scan, History, Settings, Layers, Menu, X, Sparkles, Info } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useState } from 'react';
import { cn } from '@/utils/cn';

export function Header() {
  const { activeTab, setActiveTab } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'ocr' as const, label: 'OCR', icon: Scan, description: 'Convert images to LaTeX' },
    { id: 'batch' as const, label: 'Batch', icon: Layers, description: 'Process multiple images' },
    { id: 'history' as const, label: 'History', icon: History, description: 'View past conversions' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, description: 'Configure providers' },
    { id: 'about' as const, label: 'About', icon: Info, description: 'About MathVision Pro' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">MathVision Pro</h1>
              <p className="text-xs text-gray-500">AI Math OCR</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-violet-600 text-white'
                      : 'text-gray-400 bg-gray-800/50 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
