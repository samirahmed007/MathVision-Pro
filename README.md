# MathVision Pro

**AI-Powered Mathematical OCR Platform** - Convert images of mathematical equations to LaTeX, MathML, SymPy, Wolfram, and 10+ other formats.

## Overview

MathVision Pro is an advanced web-based application that leverages artificial intelligence to recognize and convert mathematical expressions from images into multiple machine-readable and human-editable formats. Whether you have handwritten equations from notebooks, printed textbooks, or complex mathematical notation, MathVision Pro intelligently extracts and converts them to your preferred format.

## ✨ Key Features

- **10+ Format Output**: Convert mathematical equations to:
  - LaTeX (primary format)
  - MathML (Presentation & Content MathML)
  - AsciiMath
  - SymPy (Python)
  - Wolfram Language
  - Maple
  - Markdown
  - HTML (with embedded MathML)
  - Typst
  - Unicode (mathematical symbols)

- **8 AI Provider Support**:
  - Google Gemini (11 models including Gemini 3 Flash Preview)
  - OpenRouter (Qwen, Llama Vision, Gemma)
  - Groq (Llama 3.2 Vision models)
  - OpenAI (GPT-4o, GPT-4 Turbo)
  - Anthropic Claude (Claude Sonnet 4, Claude 3.5)
  - Mistral AI (Pixtral models)
  - Hugging Face (Qwen2 VL, Florence 2)
  - Ollama (Local models: LLaVA, Llama Vision, Moondream)

- **Powerful Features**:
  - **OCR Processing**: Extract mathematical expressions from images with high accuracy
  - **Batch Processing**: Process multiple images efficiently with progress tracking
  - **Screenshot Capture**: Built-in screen capture tool for quick equation extraction
  - **LaTeX Editor**: Monaco editor with syntax highlighting and real-time preview
  - **History Management**: Track all processed equations with search and export
  - **Real-time Preview**: Instant KaTeX rendering of mathematical expressions
  - **Format Conversion**: Convert LaTeX to 10+ formats with one click
  - **Provider Testing**: Test API connections before processing
  - **Customizable Settings**: Configure providers, models, output formats, and editor preferences
  - **Persistent Storage**: Auto-save settings, API keys, and history locally
  - **Responsive Design**: Optimized for desktop and tablet devices
  - **Smooth Animations**: Beautiful UI transitions with Framer Motion

## 🛠️ Technology Stack

### Frontend
- **React 19.2.3** - UI framework
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Lightning-fast build tool
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Framer Motion 12.34.0** - Animation library

### Libraries
- **@google/genai 1.41.0** - Google Gemini AI SDK
- **@monaco-editor/react 4.7.0** - Advanced code editor
- **KaTeX 0.16.28** - Fast LaTeX math rendering
- **Lucide React 0.563.0** - Modern icon library
- **React Hot Toast 2.6.0** - Toast notifications
- **React Dropzone 15.0.0** - Drag-and-drop file upload
- **Zustand 5.0.11** - Lightweight state management
- **JSZip 3.10.1** - Batch export compression
- **clsx & tailwind-merge** - Utility class management

### Build & Development
- **@tailwindcss/vite 4.1.17** - Tailwind CSS v4 integration
- **@vitejs/plugin-react 5.1.1** - React Fast Refresh
- **vite-plugin-singlefile 2.3.0** - Single HTML file build
- **TypeScript 5.9.3** - Type checking and compilation

## 📦 Installation

### Prerequisites
- **Node.js 18+** and npm (or yarn/pnpm)
- **API keys** for desired AI providers (optional - some providers are free)
- Modern web browser with JavaScript enabled

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/samirahmed007/MathVision-Pro.git
   cd MathVision-Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Configure API keys** (in the app)
   - Open the app in your browser
   - Navigate to **Settings** page
   - Add API keys for your preferred providers
   - Test connections to verify

### Quick Start (No Installation)
MathVision Pro can be built as a single HTML file:
```bash
npm run build
```
The `dist/index.html` file contains the entire application and can be opened directly in any browser.

## 🚀 Building & Deployment

### Development Mode
```bash
npm run dev
```
Starts Vite development server with:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Available at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Creates optimized production build:
- Output directory: `dist/`
- Single HTML file with inlined CSS and JS
- Minified and optimized for performance
- Ready for deployment to any static host

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing before deployment.

### Deployment Options

**Static Hosting** (Recommended)
- Deploy `dist/index.html` to:
  - GitHub Pages
  - Netlify
  - Vercel
  - AWS S3 + CloudFront
  - Any static file server

**Self-Hosting**
- The single HTML file can run from `file://` protocol
- Perfect for offline use or air-gapped environments
- No server required - just open in browser

**Docker** (Optional)
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
```

## 📖 Usage Guide

### Main Features

#### 1. **OCR Page** (Primary Feature)
- Upload an image containing mathematical equations (drag & drop or click)
- Select your preferred AI provider from 8 options
- Choose a specific model (40+ models available)
- Select which output formats you want (10+ formats)
- Click **Process Image** to extract the equation
- View real-time KaTeX preview of the rendered equation
- Edit the extracted LaTeX in the Monaco editor
- Copy any format to clipboard with one click
- Download individual formats or all formats as ZIP

#### 2. **Batch Processing**
- Upload multiple images at once (drag & drop supported)
- Configure provider, model, and output formats for the batch
- Process all images sequentially with progress tracking
- View status for each image (pending/processing/completed/failed)
- Download results individually or as bulk ZIP export
- Perfect for digitizing textbooks, homework, or lecture notes

#### 3. **History**
- Automatically saves all processed equations (up to 100 recent items)
- View thumbnails and results from past conversions
- Search and filter history by date or content
- Re-open past results to view all formats
- Delete individual items or clear entire history
- History persists across browser sessions

#### 4. **LaTeX Editor**
- Full-featured Monaco editor (VS Code engine)
- Syntax highlighting for LaTeX
- Real-time mathematical rendering with KaTeX
- Support for complex LaTeX expressions and environments
- Convert edited LaTeX to all 10+ formats
- Dark theme with customizable font size
- Copy and download capabilities

#### 5. **Settings**
- **Providers**: Enable/disable AI providers, configure API keys, test connections
- **Models**: Enable/disable specific models, set default models per provider
- **Output Formats**: Select which formats to generate by default
- **Editor**: Customize Monaco editor theme and font size
- **Auto-Copy**: Enable automatic clipboard copy with preferred format
- **API Keys**: Securely stored in browser localStorage
- **Reset**: Restore all settings to defaults

#### 6. **About**
- Information about MathVision Pro
- Complete feature list and capabilities
- Supported formats with descriptions
- All 8 AI providers with model counts
- Technology stack details
- Links to documentation and GitHub

### Keyboard Shortcuts
The application supports standard browser shortcuts:
- **Ctrl/Cmd + V**: Paste image from clipboard (in upload area)
- **Ctrl/Cmd + C**: Copy selected text/code
- **Ctrl/Cmd + A**: Select all in editor
- Monaco editor includes full VS Code keyboard shortcuts

## 🔑 AI Provider Configuration

### Supported Providers

1. **Google Gemini** 🔷
   - 11 models available (Gemini 3 Flash Preview recommended)
   - Free tier with generous limits
   - Excellent mathematical OCR accuracy
   - Get API key: https://aistudio.google.com/app/apikey

2. **OpenRouter** 🌐
   - Access to multiple free models (Qwen 2.5 VL 72B, Llama Vision)
   - Single API key for multiple models
   - Get API key: https://openrouter.ai/keys

3. **Groq** ⚡
   - Ultra-fast inference with Llama 3.2 Vision models
   - Free tier available
   - Get API key: https://console.groq.com/keys

4. **OpenAI** 🧠
   - GPT-4o and GPT-4 Turbo with vision
   - Premium accuracy (paid)
   - Get API key: https://platform.openai.com/api-keys

5. **Anthropic Claude** 🔮
   - Claude Sonnet 4 and Claude 3.5 models
   - Excellent reasoning capabilities (paid)
   - Get API key: https://console.anthropic.com/settings/keys

6. **Mistral AI** 🌀
   - Pixtral Large and Pixtral 12B vision models
   - European AI provider (paid)
   - Get API key: https://console.mistral.ai/api-keys

7. **Hugging Face** 🤗
   - Free inference API with Qwen2 VL and Florence 2
   - Community models
   - Get API key: https://huggingface.co/settings/tokens

8. **Ollama** 🦙
   - Run models locally (LLaVA, Llama Vision, Moondream)
   - Complete privacy, no API key needed
   - Requires Ollama installed: https://ollama.ai

### Adding API Keys
1. Navigate to **Settings** page
2. Find your desired AI provider section
3. Enter your API key in the input field
4. Click **Test Connection** to verify
5. Enable/disable specific models as needed
6. Keys are stored securely in browser local storage

## 📊 Architecture

```
MathVision-Pro/
├── src/
│   ├── components/           # React components
│   │   ├── OCRPage.tsx      # Main OCR interface with image upload
│   │   ├── BatchPage.tsx    # Batch processing with progress tracking
│   │   ├── HistoryPage.tsx  # History management and search
│   │   ├── SettingsPage.tsx # Provider/model configuration
│   │   ├── LaTeXEditor.tsx  # Monaco editor with live preview
│   │   ├── OutputPanel.tsx  # Multi-format output display
│   │   ├── ImageUpload.tsx  # Drag-and-drop upload component
│   │   ├── Header.tsx       # Navigation header
│   │   └── AboutPage.tsx    # About and documentation
│   ├── services/
│   │   └── ocrService.ts    # OCR processing engine
│   │       ├── Provider integrations (8 providers)
│   │       ├── Format converters (10+ formats)
│   │       ├── MathML generation (KaTeX-based)
│   │       └── Screenshot capture
│   ├── store/
│   │   └── appStore.ts      # Zustand state management
│   │       ├── Provider/model configuration
│   │       ├── Settings persistence
│   │       ├── History management
│   │       └── Batch processing state
│   ├── utils/
│   │   └── cn.ts            # Class name utilities
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS v4 config
└── package.json             # Dependencies and scripts
```

## 🎨 UI/UX Features

- **Modern Dark Theme**: Comfortable gray-950 dark interface optimized for extended use
- **Smooth Transitions**: Page transitions and animations powered by Framer Motion
- **Toast Notifications**: Non-intrusive status updates with custom styling
- **Responsive Layout**: Fluid design adapting to desktop and tablet (max-width: 1600px)
- **Drag & Drop**: Intuitive file upload with React Dropzone
- **Real-time Preview**: Instant KaTeX rendering with error handling
- **Monaco Editor**: Professional code editor with syntax highlighting
- **Tab Navigation**: Clean tab-based interface for different sections
- **Progress Indicators**: Visual feedback during batch processing
- **Copy to Clipboard**: One-click copy for all output formats

## 🔒 Privacy & Security

- **Local Storage**: API keys stored securely in browser localStorage
- **No Server**: All processing happens client-side or via direct API calls
- **Provider Privacy**: Images only sent to your chosen AI provider
- **Ollama Support**: Complete privacy with local model execution
- **Single-File Build**: Deploy as standalone HTML file for air-gapped environments
- **Open Source**: Full transparency with MIT license
- **No Tracking**: No analytics or telemetry

## 🐛 Troubleshooting

### Common Issues

**"API Key Invalid" or Connection Failed**
- Use the **Test Connection** button in Settings to verify
- Ensure you've entered the correct API key format
- Check that the API service is active in your provider account
- Verify rate limits haven't been exceeded
- For Ollama: Ensure Ollama is running on http://localhost:11434

**"Image Not Recognized" or Poor Results**
- Ensure the image contains clear, high-contrast mathematical notation
- Try higher resolution images (recommended: 1000px+ width)
- Supported formats: PNG, JPEG, GIF, WEBP
- Try different AI models - some excel at handwritten vs. printed math
- Use Google Gemini or OpenRouter Qwen models for best free results

**"LaTeX Output Not Rendering"**
- KaTeX may not support all LaTeX packages
- Check browser console for specific rendering errors
- Try editing the LaTeX in the Monaco editor
- Use the format converter to try alternative outputs

**"Batch Processing Stuck"**
- Check browser console for errors
- Verify API key is valid and has sufficient quota
- Try processing images individually to identify problematic files
- Reduce batch size if hitting rate limits

## 📝 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Contact & Support

For questions, suggestions, or support, please open an issue on the GitHub repository.

---

**MathVision Pro** - Making mathematics digital, one equation at a time. ✨
