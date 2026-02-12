import React from 'react';
import { 
  User, 
  Mail, 
  Github, 
  Linkedin, 
  Globe, 
  Heart,
  Sparkles,
  Zap,
  Shield,
  Code,
  Camera,
  FileText,
  Cpu,
  Cloud,
  Star
} from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          MathVision Pro
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Advanced AI-Powered Mathematical OCR Platform</p>
        <p className="text-gray-500 text-sm mt-1">Version 1.0.0</p>
      </div>

      {/* Features */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Camera className="w-5 h-5 text-blue-400" />}
            title="Multiple Input Methods"
            description="Drag & drop, paste, screenshot capture, camera, URL import, and handwriting canvas"
          />
          <FeatureCard
            icon={<FileText className="w-5 h-5 text-green-400" />}
            title="15+ Output Formats"
            description="LaTeX, MathML, AsciiMath, SymPy, Wolfram, Typst, Markdown, HTML, SVG, PNG, PDF and more"
          />
          <FeatureCard
            icon={<Cpu className="w-5 h-5 text-purple-400" />}
            title="Multiple AI Providers"
            description="Support for Google Gemini, OpenRouter, Groq, OpenAI, Anthropic, Mistral, HuggingFace"
          />
          <FeatureCard
            icon={<Cloud className="w-5 h-5 text-cyan-400" />}
            title="Local LLM Support"
            description="Ollama integration for offline use with vision-capable models"
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
            title="Batch Processing"
            description="Process up to 100 images simultaneously with parallel processing"
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5 text-red-400" />}
            title="Secure & Private"
            description="API keys stored locally, no data sent to third parties except chosen AI provider"
          />
          <FeatureCard
            icon={<Code className="w-5 h-5 text-orange-400" />}
            title="Advanced LaTeX Editor"
            description="Full-featured editor with symbol palette, templates, and live preview"
          />
          <FeatureCard
            icon={<Sparkles className="w-5 h-5 text-pink-400" />}
            title="Auto-Copy & Export"
            description="Automatic clipboard copy, one-click export in any format"
          />
        </div>
      </div>

      {/* Developer Info */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          About the Developer
        </h2>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">SA</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">Samir Uddin Ahmed</h3>
            <p className="text-blue-400 mb-3">Full-Stack Developer & AI Enthusiast</p>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Passionate about creating innovative solutions that bridge the gap between artificial intelligence 
              and everyday productivity. MathVision Pro represents a commitment to making mathematical 
              expression recognition accessible, accurate, and powerful for students, researchers, educators, 
              and professionals worldwide.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <SocialLink 
                icon={<Mail className="w-4 h-4" />} 
                label="Email" 
                href="mailto:samir@example.com"
              />
              <SocialLink 
                icon={<Github className="w-4 h-4" />} 
                label="GitHub" 
                href="https://github.com/samiruddinahmed"
              />
              <SocialLink 
                icon={<Linkedin className="w-4 h-4" />} 
                label="LinkedIn" 
                href="https://linkedin.com/in/samiruddinahmed"
              />
              <SocialLink 
                icon={<Globe className="w-4 h-4" />} 
                label="Website" 
                href="https://samiruddinahmed.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-green-400" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TechBadge name="React 18" color="blue" />
          <TechBadge name="TypeScript" color="blue" />
          <TechBadge name="Vite" color="purple" />
          <TechBadge name="Tailwind CSS" color="cyan" />
          <TechBadge name="Zustand" color="orange" />
          <TechBadge name="KaTeX" color="green" />
          <TechBadge name="Google GenAI" color="red" />
          <TechBadge name="Lucide Icons" color="yellow" />
        </div>
      </div>

      {/* Supported AI Providers */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          Supported AI Providers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ProviderBadge name="Google Gemini" emoji="🔮" />
          <ProviderBadge name="OpenRouter" emoji="🌐" />
          <ProviderBadge name="Groq" emoji="⚡" />
          <ProviderBadge name="OpenAI" emoji="🤖" />
          <ProviderBadge name="Anthropic" emoji="🧠" />
          <ProviderBadge name="Mistral" emoji="🌊" />
          <ProviderBadge name="HuggingFace" emoji="🤗" />
          <ProviderBadge name="Ollama" emoji="🦙" />
        </div>
      </div>

      {/* Credits */}
      <div className="text-center text-gray-500 py-4">
        <p className="flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Samir Uddin Ahmed
        </p>
        <p className="text-sm mt-2">© 2024 MathVision Pro. All rights reserved.</p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ 
  icon, 
  title, 
  description 
}) => (
  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-800 rounded-lg">{icon}</div>
      <div>
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  </div>
);

const SocialLink: React.FC<{ icon: React.ReactNode; label: string; href: string }> = ({ 
  icon, 
  label, 
  href 
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
  >
    {icon}
    {label}
  </a>
);

const TechBadge: React.FC<{ name: string; color: string }> = ({ name, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  return (
    <div className={`px-3 py-2 rounded-lg border text-center text-sm font-medium ${colorClasses[color] || colorClasses.blue}`}>
      {name}
    </div>
  );
};

const ProviderBadge: React.FC<{ name: string; emoji: string }> = ({ name, emoji }) => (
  <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 text-center hover:bg-gray-700 transition-colors">
    <span className="text-2xl mb-1 block">{emoji}</span>
    <span className="text-sm text-gray-300">{name}</span>
  </div>
);

export default AboutPage;
