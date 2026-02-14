import { Scan, History, Settings, Layers, Menu, X, Sparkles, Info } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useState } from 'react';

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
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid #1f2937',
      backgroundColor: 'rgba(3, 7, 18, 0.95)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        <div style={{
          display: 'flex',
          height: '64px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              height: '40px',
              width: '40px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'linear-gradient(to bottom right, #8b5cf6, #4f46e5)',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
            }}>
              <Sparkles style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'white',
                margin: 0,
                lineHeight: '1.2',
              }}>MathVision Pro</h1>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.2',
              }}>AI Math OCR</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            padding: '4px',
            borderRadius: '12px',
          }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? '#7c3aed' : 'transparent',
                    color: isActive ? 'white' : '#9ca3af',
                    boxShadow: isActive ? '0 4px 14px rgba(124, 58, 237, 0.25)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.backgroundColor = '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#9ca3af';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <tab.icon style={{ height: '16px', width: '16px' }} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="header-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              color: '#9ca3af',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <X style={{ height: '24px', width: '24px' }} /> : <Menu style={{ height: '24px', width: '24px' }} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav style={{
            padding: '16px 0',
            borderTop: '1px solid #1f2937',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#7c3aed' : 'rgba(31, 41, 55, 0.5)',
                      color: isActive ? 'white' : '#9ca3af',
                    }}
                  >
                    <tab.icon style={{ height: '20px', width: '20px' }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>

      {/* Responsive styles - embedded to survive purging */}
      <style>{`
        @media (max-width: 767px) {
          .header-desktop-nav {
            display: none !important;
          }
          .header-mobile-btn {
            display: block !important;
          }
        }
        @media (min-width: 768px) {
          .header-desktop-nav {
            display: flex !important;
          }
          .header-mobile-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
