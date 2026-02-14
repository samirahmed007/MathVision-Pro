import { Scan, History, Settings, Layers, Menu, X, Sparkles, Info } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useState, useEffect, useRef } from 'react';

export function Header() {
  const { activeTab, setActiveTab } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const tabs = [
    { id: 'ocr' as const, label: 'OCR', icon: Scan, shortcut: 'Alt+1', description: 'Convert images to math (Alt+1)' },
    { id: 'batch' as const, label: 'Batch', icon: Layers, shortcut: 'Alt+2', description: 'Batch process images (Alt+2)' },
    { id: 'history' as const, label: 'History', icon: History, shortcut: 'Alt+3', description: 'View past conversions (Alt+3)' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, shortcut: 'Alt+4', description: 'Configure providers (Alt+4)' },
    { id: 'about' as const, label: 'About', icon: Info, shortcut: 'Alt+5', description: 'About MathVision Pro (Alt+5)' },
  ];

  // Keyboard shortcuts for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const tabMap: Record<string, typeof tabs[0]['id']> = {
          '1': 'ocr',
          '2': 'batch',
          '3': 'history',
          '4': 'settings',
          '5': 'about',
        };
        const tab = tabMap[e.key];
        if (tab) {
          e.preventDefault();
          setActiveTab(tab);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  const handleMouseEnter = (tabId: string) => {
    setHoveredTab(tabId);
    tooltipTimerRef.current = setTimeout(() => {
      setShowTooltip(tabId);
    }, 500);
  };

  const handleMouseLeave = () => {
    setHoveredTab(null);
    setShowTooltip(null);
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-header-bg)',
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
              background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-accent-secondary))',
              boxShadow: '0 4px 14px var(--color-accent-glow)',
            }}>
              <Sparkles style={{ height: '20px', width: '20px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: '1.2',
              }}>MathVision Pro</h1>
              <p style={{
                fontSize: '12px',
                color: 'var(--color-text-dim)',
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
            backgroundColor: 'var(--color-nav-bg)',
            padding: '4px',
            borderRadius: '12px',
          }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;
              return (
                <div key={tab.id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={() => handleMouseEnter(tab.id)}
                    onMouseLeave={handleMouseLeave}
                    title={tab.description}
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
                      backgroundColor: isActive ? 'var(--color-accent)' : (isHovered ? 'var(--color-nav-hover)' : 'transparent'),
                      color: isActive ? 'white' : (isHovered ? 'var(--color-text-primary)' : 'var(--color-text-muted)'),
                      boxShadow: isActive ? '0 4px 14px var(--color-accent-glow)' : 'none',
                    }}
                  >
                    <tab.icon style={{ height: '16px', width: '16px' }} />
                    {tab.label}
                  </button>
                  {/* Tooltip */}
                  {showTooltip === tab.id && !isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      zIndex: 100,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {tab.description}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        marginTop: '2px',
                        padding: '1px 6px',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-accent)',
                        fontFamily: 'monospace',
                      }}>
                        {tab.shortcut}
                      </div>
                      {/* Arrow */}
                      <div style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--color-bg-elevated)',
                        borderTop: '1px solid var(--color-border)',
                        borderLeft: '1px solid var(--color-border)',
                      }} />
                    </div>
                  )}
                </div>
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
              color: 'var(--color-text-muted)',
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
            borderTop: '1px solid var(--color-border)',
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
                      backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-nav-bg)',
                      color: isActive ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    <tab.icon style={{ height: '20px', width: '20px' }} />
                    <span>{tab.label}</span>
                    <span style={{ fontSize: '10px', opacity: 0.6 }}>{tab.shortcut}</span>
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
