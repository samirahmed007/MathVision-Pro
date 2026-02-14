import React from 'react';
import { 
  User, Mail, Github, Linkedin, Globe, Heart, Sparkles,
  Zap, Shield, Code, Camera, FileText, Cpu, Cloud, Star, ExternalLink
} from 'lucide-react';

const PROVIDER_LINKS: { name: string; emoji: string; url: string; description: string }[] = [
  { name: 'Google Gemini', emoji: '🔷', url: 'https://ai.google.dev/', description: 'Google\'s multimodal AI models' },
  { name: 'OpenRouter', emoji: '🌐', url: 'https://openrouter.ai/', description: 'Unified API for 100+ AI models' },
  { name: 'Groq', emoji: '⚡', url: 'https://groq.com/', description: 'Ultra-fast LPU inference engine' },
  { name: 'OpenAI', emoji: '🧠', url: 'https://openai.com/', description: 'GPT-4o and advanced AI models' },
  { name: 'Anthropic', emoji: '🔮', url: 'https://anthropic.com/', description: 'Claude family of AI assistants' },
  { name: 'Mistral AI', emoji: '🌀', url: 'https://mistral.ai/', description: 'European open-weight AI models' },
  { name: 'Hugging Face', emoji: '🤗', url: 'https://huggingface.co/', description: 'Open-source AI model hub' },
  { name: 'Ollama', emoji: '🦙', url: 'https://ollama.com/', description: 'Run AI models locally offline' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '80px', height: '80px', borderRadius: '20px',
          background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-accent-secondary))',
          marginBottom: '16px', boxShadow: '0 8px 24px var(--color-accent-glow)',
        }}>
          <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 800,
          background: 'linear-gradient(to right, var(--color-accent), var(--color-accent-secondary))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          MathVision Pro
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontSize: '18px' }}>
          Advanced AI-Powered Mathematical OCR Platform
        </p>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', marginTop: '4px' }}>Version 1.0.0</p>
      </div>

      {/* Features */}
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
      }}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Star style={{ width: '20px', height: '20px', color: '#eab308' }} />
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard icon={<Camera className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />}
            title="Multiple Input Methods"
            description="Drag & drop, paste, screenshot capture, camera, URL import, and handwriting canvas" />
          <FeatureCard icon={<FileText className="w-5 h-5" style={{ color: '#4ade80' }} />}
            title="15+ Output Formats"
            description="LaTeX, MathML, AsciiMath, SymPy, Wolfram, Typst, Markdown, HTML, SVG, PNG, PDF and more" />
          <FeatureCard icon={<Cpu className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />}
            title="Multiple AI Providers"
            description="Support for Google Gemini, OpenRouter, Groq, OpenAI, Anthropic, Mistral, HuggingFace" />
          <FeatureCard icon={<Cloud className="w-5 h-5" style={{ color: '#22d3ee' }} />}
            title="Local LLM Support"
            description="Ollama integration for offline use with vision-capable models" />
          <FeatureCard icon={<Zap className="w-5 h-5" style={{ color: '#eab308' }} />}
            title="Batch Processing"
            description="Process up to 100 images simultaneously with parallel processing" />
          <FeatureCard icon={<Shield className="w-5 h-5" style={{ color: '#f87171' }} />}
            title="Secure & Private"
            description="API keys stored locally, no data sent to third parties except chosen AI provider" />
          <FeatureCard icon={<Code className="w-5 h-5" style={{ color: '#fb923c' }} />}
            title="Advanced LaTeX Editor"
            description="Full-featured editor with symbol palette, templates, and live preview" />
          <FeatureCard icon={<Sparkles className="w-5 h-5" style={{ color: '#f472b6' }} />}
            title="Auto-Copy & Export"
            description="Automatic clipboard copy, one-click export in any format" />
        </div>
      </div>

      {/* Developer Info */}
      <div style={{
        padding: '24px', borderRadius: '16px',
        background: 'linear-gradient(to bottom right, var(--color-bg-card), var(--color-bg-primary))',
        border: '1px solid var(--color-border)',
      }}>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <User style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
          About the Developer
        </h2>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div style={{
            width: '128px', height: '128px', borderRadius: '50%',
            background: 'linear-gradient(to bottom right, var(--color-accent), var(--color-accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--color-accent-glow)', flexShrink: 0,
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white' }}>SA</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Samir Uddin Ahmed</h3>
            <p style={{ color: 'var(--color-accent)', marginBottom: '12px' }}>Full-Stack Developer & AI Enthusiast</p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.625 }}>
              Passionate about creating innovative solutions that bridge the gap between artificial intelligence 
              and everyday productivity. MathVision Pro represents a commitment to making mathematical 
              expression recognition accessible, accurate, and powerful for students, researchers, educators, 
              and professionals worldwide.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <SocialLink icon={<Mail className="w-4 h-4" />} label="Email" href="mailto:samir@example.com" />
              <SocialLink icon={<Github className="w-4 h-4" />} label="GitHub" href="https://github.com/samiruddinahmed" />
              <SocialLink icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" href="https://linkedin.com/in/samiruddinahmed" />
              <SocialLink icon={<Globe className="w-4 h-4" />} label="Website" href="https://samiruddinahmed.com" />
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
      }}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Code style={{ width: '20px', height: '20px', color: '#4ade80' }} />
          Technology Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { name: 'React 18', color: '#3b82f6' },
            { name: 'TypeScript', color: '#3b82f6' },
            { name: 'Vite', color: '#a78bfa' },
            { name: 'Tailwind CSS', color: '#22d3ee' },
            { name: 'Zustand', color: '#fb923c' },
            { name: 'KaTeX', color: '#4ade80' },
            { name: 'Google GenAI', color: '#f87171' },
            { name: 'Lucide Icons', color: '#eab308' },
          ].map((tech) => (
            <div key={tech.name} style={{
              padding: '10px 16px', borderRadius: '10px', textAlign: 'center',
              fontSize: '13px', fontWeight: 600,
              backgroundColor: `${tech.color}22`, color: tech.color,
              border: `1px solid ${tech.color}33`,
            }}>
              {tech.name}
            </div>
          ))}
        </div>
      </div>

      {/* Supported AI Providers - with links */}
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
      }}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Cpu style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
          Supported AI Providers
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Click on any provider to visit their website and learn more about their AI services.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {PROVIDER_LINKS.map((provider) => (
            <a
              key={provider.name}
              href={provider.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '16px', borderRadius: '12px', textDecoration: 'none',
                backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px var(--color-accent-glow)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>{provider.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {provider.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', textAlign: 'center', marginBottom: '8px' }}>
                {provider.description}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', color: 'var(--color-accent)', fontWeight: 500,
              }}>
                Visit Site <ExternalLink style={{ height: '10px', width: '10px' }} />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{
        padding: '24px', borderRadius: '16px',
        backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
      }}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          ⌨️ Keyboard Shortcuts
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
          {[
            { keys: 'Alt + 1', action: 'Go to OCR page' },
            { keys: 'Alt + 2', action: 'Go to Batch page' },
            { keys: 'Alt + 3', action: 'Go to History page' },
            { keys: 'Alt + 4', action: 'Go to Settings page' },
            { keys: 'Alt + 5', action: 'Go to About page' },
            { keys: 'Ctrl + V', action: 'Paste image from clipboard' },
            { keys: 'Ctrl + Shift + S', action: 'Screenshot capture' },
            { keys: 'Ctrl + O', action: 'Open file picker' },
            { keys: 'Ctrl + Enter', action: 'Process OCR' },
            { keys: 'Ctrl + C', action: 'Copy current output' },
          ].map((shortcut) => (
            <div key={shortcut.keys} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: '8px',
              backgroundColor: 'var(--color-bg-tertiary)',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{shortcut.action}</span>
              <kbd style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                fontFamily: 'monospace',
                backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-accent)',
                border: '1px solid var(--color-border)',
              }}>
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Credits */}
      <div className="text-center py-4" style={{ color: 'var(--color-text-dim)' }}>
        <p className="flex items-center justify-center gap-2">
          Made with <Heart style={{ width: '16px', height: '16px', color: '#ef4444', fill: '#ef4444' }} /> by Samir Uddin Ahmed
        </p>
        <p className="text-sm mt-2">© 2024 MathVision Pro. All rights reserved.</p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div style={{
    padding: '16px', borderRadius: '10px',
    backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
  }}>
    <div className="flex items-start gap-3">
      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--color-bg-elevated)' }}>{icon}</div>
      <div>
        <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
    </div>
  </div>
);

const SocialLink: React.FC<{ icon: React.ReactNode; label: string; href: string }> = ({ icon, label, href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
      backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)',
      fontSize: '13px', transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)'; }}
  >
    {icon}{label}
  </a>
);

export default AboutPage;
