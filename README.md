# MathVision Pro

<div align="center">

![MathVision Pro](https://img.shields.io/badge/MathVision-Pro-7c3aed?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTMgM2gxOHYxOEgzeiIvPjxwYXRoIGQ9Ik04IDEybDMgM2w1LTUiLz48L3N2Zz4=)

**Advanced AI-Powered Mathematical OCR Platform**

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-0.16-green?style=flat-square)](https://katex.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [AI Providers](#-supported-ai-providers) • [Output Formats](#-output-formats) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [Themes](#-themes) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**MathVision Pro** is a comprehensive, production-ready web application that converts mathematical expressions from images into multiple digital formats using AI-powered Optical Character Recognition (OCR). It supports 8 AI providers (including local LLM via Ollama), 15+ output formats, batch processing, and a full-featured LaTeX editor with 300+ mathematical symbols.

Built with modern web technologies and designed for researchers, students, educators, and professionals who work with mathematical content.

---

## ✨ Features

### 🔍 AI-Powered Math OCR
- **Multi-provider support** — Use Google Gemini, OpenRouter, Groq, OpenAI, Anthropic, Mistral AI, HuggingFace, or Ollama (local)
- **Vision AI models** — Leverage state-of-the-art vision-language models for accurate math recognition
- **Smart error handling** — Automatic retry with exponential backoff for rate-limited requests
- **Configurable prompts** — Optimized system prompts for maximum OCR accuracy

### 📸 Multiple Input Methods
- **Drag & Drop** — Drop images directly onto the upload zone
- **File Picker** — Browse and select image files (PNG, JPG, JPEG, GIF, BMP, WebP, TIFF)
- **Clipboard Paste** — Press `Ctrl+V` to paste images from clipboard
- **Screenshot Capture** — Built-in screen capture tool (like Mathpix Snip) with area selection
- **Camera Capture** — Use webcam or mobile camera to capture equations
- **URL Import** — Import images from remote URLs
- **Handwriting Canvas** — Draw equations directly on a canvas (coming soon)

### 📝 15+ Output Formats
| Category | Formats |
|----------|---------|
| **Markup** | LaTeX, MathML, MathML (Presentation), MathML (Content), AsciiMath, Typst |
| **Document** | Markdown, HTML (XHTML/EPUB), PDF |
| **Code** | SymPy (Python), Wolfram Language, Maple |
| **Image** | SVG, PNG |
| **Text** | Unicode Mathematical Symbols |

### 🔤 MathML Output
- **MS Word Compatible** — Generates proper MathML that can be pasted directly into Microsoft Word
- **Hexadecimal Entities** — All non-ASCII characters encoded as `&#x...;` for maximum compatibility
- **Presentation & Content MathML** — Both visual and semantic MathML variants
- **Proper Structure** — Uses `<mtable>`, `<mfrac>`, `<msup>`, `<msubsup>`, `<munderover>`, etc.

### 📊 Batch Processing
- **Process up to 100 images** simultaneously
- **Configurable concurrency** — Set delay between requests (0.5s to 5s)
- **Retry logic** — Automatic retry (1-5 attempts) with exponential backoff
- **Real-time progress** — Live progress bar with success/failure counts
- **Pause/Resume/Cancel** — Full control over batch jobs
- **Retry failed items** — Retry only the failed images after completion
- **Multiple download options:**
  - Download All (text file with all results)
  - XHTML Only (MS Word compatible table format)
  - XHTML + Images (ZIP) — Complete package with images in `images/` folder

### ✏️ Advanced LaTeX Editor
- **Full-featured editor** with syntax highlighting
- **300+ mathematical symbols** organized in 13 categories:
  - Greek Letters (α, β, γ, Γ, Δ, Θ, etc.)
  - Operators (+, −, ±, ×, ÷, ⊕, ⊗, etc.)
  - Relations (=, ≠, ≤, ≥, ≡, ≈, ∼, etc.)
  - Set Theory (∈, ⊂, ∪, ∩, ∅, ℕ, ℤ, ℝ, etc.)
  - Logic (∀, ∃, ¬, ∧, ∨, ⇒, ⇔, etc.)
  - Arrows (→, ←, ↑, ⇒, ⇐, ↦, etc.)
  - Calculus (∫, ∬, ∂, ∇, Σ, ∏, lim, etc.)
  - Functions (sin, cos, tan, log, exp, det, etc.)
  - Structures (fractions, roots, powers, matrices, etc.)
  - Matrices (matrix, pmatrix, bmatrix, vmatrix, cases)
  - Brackets (parentheses, floor, ceiling, angle, etc.)
  - Dots & Accents (⋯, …, hat, tilde, bar, vec, etc.)
  - Spacing (thin, medium, thick, quad, etc.)
- **Template toolbar** — Quick insert for common structures
- **Live preview** — Real-time KaTeX rendering as you type
- **Push to Output** — Convert editor content to all formats with one click
- **Undo/Redo** — Full history support
- **Character count** — Shows current LaTeX length

### ⚙️ Provider & Model Management
- **8 pre-configured AI providers** with 30+ models
- **Add custom providers** — Configure any OpenAI-compatible API
- **Add/Edit/Remove models** — Full CRUD for models per provider
- **Edit base URLs** — Customize API endpoints for proxies or custom servers
- **API key management** — Secure storage with show/hide toggle
- **Connection testing** — Verify API keys and provider accessibility
- **Enable/Disable** — Toggle individual providers and models
- **Set default model** — Choose your preferred model for OCR
- **Speed & accuracy ratings** — Visual indicators for each model
- **Free/Paid indicators** — Clear pricing information

### 📋 Auto-Copy
- **Automatic clipboard copy** after OCR conversion
- **Configurable format** — Choose which format to auto-copy (LaTeX, MathML, AsciiMath, etc.)
- **Toast notifications** — Optional notification when content is copied
- **Fallback method** — Uses `execCommand('copy')` when `navigator.clipboard` is blocked

### 📜 History
- **Persistent history** — All OCR results saved locally
- **Search & filter** — Find previous conversions
- **Re-use results** — Copy any format from history
- **Delete entries** — Remove individual history items
- **Timestamps** — Track when each conversion was made

### 🎨 Themes
Four beautiful built-in themes:
- **Dark** — Deep dark background with violet accents (default)
- **Light** — Clean white background with purple accents
- **Midnight Blue** — Navy blue tones with cyan accents
- **Forest Green** — Deep green tones with emerald accents

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | Switch to OCR tab |
| `Ctrl+2` | Switch to Batch tab |
| `Ctrl+3` | Switch to History tab |
| `Ctrl+4` | Switch to Settings tab |
| `Ctrl+5` | Switch to About tab |
| `Ctrl+V` | Paste image from clipboard |
| `Ctrl+Shift+S` | Screenshot capture |
| `Ctrl+O` | Open file picker |
| `Ctrl+Enter` | Process OCR |
| `Ctrl+E` | Export menu |

---

## 🚀 Demo

### OCR Processing
1. Upload or paste a math image
2. Select your AI provider and model
3. Click "Process OCR" or press `Ctrl+Enter`
4. Get results in 15+ formats instantly
5. Edit in the LaTeX Editor if needed
6. Copy or export in your preferred format

### Batch Processing
1. Upload up to 100 images
2. Configure output formats and provider
3. Set retry attempts and delay
4. Start processing with real-time progress
5. Download results as text, XHTML, or ZIP

---

## 📦 Installation

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or higher
- npm or yarn package manager

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/mathvision-pro.git
cd mathvision-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

No environment variables are required. API keys are configured directly in the application's Settings page and stored securely in the browser's local storage.

---

## 🔧 Usage

### 1. Configure an AI Provider

1. Open the **Settings** tab (`Ctrl+4`)
2. Find your preferred provider (e.g., Google Gemini)
3. Click the key icon and enter your API key
4. Click **Test Connection** to verify
5. Set your preferred model as default
6. Click **Save Changes**

### 2. Get an API Key

| Provider | Free Tier | Get API Key |
|----------|-----------|-------------|
| [Google Gemini](https://ai.google.dev/) | ✅ Yes | [Get Key](https://aistudio.google.com/app/apikey) |
| [OpenRouter](https://openrouter.ai/) | ✅ Yes | [Get Key](https://openrouter.ai/keys) |
| [Groq](https://groq.com/) | ✅ Yes | [Get Key](https://console.groq.com/keys) |
| [HuggingFace](https://huggingface.co/) | ✅ Yes | [Get Key](https://huggingface.co/settings/tokens) |
| [OpenAI](https://openai.com/) | ❌ Paid | [Get Key](https://platform.openai.com/api-keys) |
| [Anthropic](https://anthropic.com/) | ❌ Paid | [Get Key](https://console.anthropic.com/settings/keys) |
| [Mistral AI](https://mistral.ai/) | ❌ Paid | [Get Key](https://console.mistral.ai/api-keys) |
| [Ollama](https://ollama.ai/) | ✅ Local | [Download](https://ollama.ai/download) |

### 3. Process an Image

```
1. Go to OCR tab
2. Drop an image or click Upload
3. Select provider & model from dropdowns
4. Click "Process OCR"
5. View results in Output panel
6. Copy or export as needed
```

### 4. Batch Process Multiple Images

```
1. Go to Batch tab
2. Drop up to 100 images
3. Select output formats
4. Configure retry attempts & delay
5. Click "Start Batch"
6. Download results when complete
```

---

## 🤖 Supported AI Providers

### Google Gemini
- **Models:** Gemini 3 Flash Preview, Gemini 2.5 Flash Lite, Gemini 2.5 Pro Preview, Gemini 2.0 Flash, and more
- **Free tier:** Yes (with rate limits)
- **API:** Google GenAI SDK (`@google/genai`)
- **Best for:** High accuracy, free usage

### OpenRouter
- **Models:** Qwen 2.5 VL 72B, Qwen 2.5 VL 32B, Gemma 3 27B, Llama 3.2 11B Vision, Mistral Small 3.1
- **Free tier:** Yes (free models available)
- **API:** OpenAI-compatible
- **Best for:** Access to multiple model providers through one API

### Groq
- **Models:** Llama 3.2 90B Vision, Llama 3.2 11B Vision
- **Free tier:** Yes
- **API:** OpenAI-compatible
- **Best for:** Ultra-fast inference speed

### HuggingFace
- **Models:** Qwen2 VL 72B, Florence 2 Large
- **Free tier:** Yes
- **API:** Inference API
- **Best for:** Open-source models

### OpenAI
- **Models:** GPT-4o, GPT-4o Mini
- **Free tier:** No (paid)
- **API:** OpenAI API
- **Best for:** Highest accuracy on complex expressions

### Anthropic
- **Models:** Claude Sonnet 4, Claude 3.5 Haiku
- **Free tier:** No (paid)
- **API:** Anthropic API
- **Best for:** Detailed analysis and explanation

### Mistral AI
- **Models:** Pixtral Large, Pixtral 12B
- **Free tier:** No (paid)
- **API:** Mistral API
- **Best for:** European AI provider, good accuracy

### Ollama (Local)
- **Models:** LLaVA 34B/13B/7B, Llama 3.2 Vision 11B, Moondream
- **Free tier:** Yes (runs locally)
- **API:** Ollama REST API
- **Best for:** Offline usage, privacy, no API costs

---

## 📤 Output Formats

### Markup Formats
- **LaTeX** — Standard mathematical typesetting (`\frac{a}{b}`, `\int_0^1`, etc.)
- **MathML** — XML-based math markup, MS Word compatible with hex entities
- **MathML (Presentation)** — Visual rendering MathML
- **MathML (Content)** — Semantic meaning MathML
- **AsciiMath** — Simple text-based math notation
- **Typst** — Modern typesetting system markup

### Document Formats
- **Markdown** — With LaTeX math blocks (`$$...$$`)
- **HTML** — XHTML/EPUB format with embedded MathML
- **PDF** — Document generation (via browser print)

### Code Formats
- **SymPy** — Python symbolic math expressions
- **Wolfram** — Mathematica language syntax
- **Maple** — Maple CAS expressions

### Image Formats
- **SVG** — Scalable vector graphics
- **PNG** — Raster image export

### Text Formats
- **Unicode** — Mathematical Unicode symbols (∫, ∑, √, etc.)

---

## ⌨️ Keyboard Shortcuts

### Navigation
| Shortcut | Action |
|----------|--------|
| `Ctrl+1` | OCR tab |
| `Ctrl+2` | Batch Processing tab |
| `Ctrl+3` | History tab |
| `Ctrl+4` | Settings tab |
| `Ctrl+5` | About tab |

### OCR Operations
| Shortcut | Action |
|----------|--------|
| `Ctrl+V` | Paste image from clipboard |
| `Ctrl+Shift+S` | Screenshot capture |
| `Ctrl+O` | Open file picker |
| `Ctrl+Enter` | Process OCR |
| `Ctrl+E` | Export menu |

### Editor
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copy selected |

---

## 🎨 Themes

MathVision Pro includes 4 built-in themes:

| Theme | Description |
|-------|-------------|
| 🌙 **Dark** | Deep dark background with violet accents (default) |
| ☀️ **Light** | Clean white background with purple accents |
| 🌊 **Midnight Blue** | Navy blue tones with cyan accents |
| 🌲 **Forest Green** | Deep green tones with emerald accents |

Change themes in **Settings** → **App Theme** section.

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript 5.6](https://www.typescriptlang.org/) | Type safety |
| [Vite 6](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management with persistence |
| [KaTeX](https://katex.org/) | LaTeX rendering & MathML generation |
| [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) | Google Gemini API |
| [JSZip](https://stuk.github.io/jszip/) | ZIP file generation |
| [Lucide React](https://lucide.dev/) | Icon library |

---

## 📁 Project Structure

```
mathvision-pro/
├── public/                  # Static assets
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Navigation bar with shortcuts & tooltips
│   │   ├── ImageUpload.tsx  # Drag & drop, paste, camera, URL input
│   │   ├── OutputPanel.tsx  # Multi-format output with copy & export
│   │   ├── LaTeXEditor.tsx  # Full editor with 300+ symbols
│   │   ├── OCRPage.tsx      # Main OCR processing page
│   │   ├── BatchPage.tsx    # Batch processing with retry logic
│   │   ├── HistoryPage.tsx  # OCR history with search
│   │   ├── SettingsPage.tsx # Provider, model & theme settings
│   │   └── AboutPage.tsx    # About with linked providers
│   ├── services/
│   │   └── ocrService.ts   # AI provider integration & format conversion
│   ├── store/
│   │   └── useStore.ts     # Zustand state management
│   ├── App.tsx             # Root component with theme support
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles & theme variables
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel auto-detects Vite — no configuration needed
5. Click **Deploy**

The `vercel.json` file is already configured for SPA routing.

### Manual Build

```bash
# Build the project
npm run build

# The output is in the dist/ folder
# Serve with any static file server
npx serve dist
```

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔒 Security

- **API keys** are stored in browser's local storage (never sent to any server)
- **No backend server** — All processing happens client-side via direct API calls
- **CORS-safe** — Uses provider APIs directly from the browser
- **No telemetry** — No data collection or tracking

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Samir Uddin Ahmed**

Full-Stack Developer & AI Enthusiast

- 📧 Email: [samiruddinahmed@example.com](mailto:samiruddinahmed@example.com)
- 🐙 GitHub: [github.com/samiruddinahmed](https://github.com/samiruddinahmed)
- 💼 LinkedIn: [linkedin.com/in/samiruddinahmed](https://linkedin.com/in/samiruddinahmed)
- 🌐 Website: [samiruddinahmed.dev](https://samiruddinahmed.dev)

---

## 🙏 Acknowledgments

- [KaTeX](https://katex.org/) — Fast math typesetting for the web
- [Google Gemini](https://ai.google.dev/) — AI vision models
- [Lucide](https://lucide.dev/) — Beautiful open-source icons
- [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight state management
- [Vite](https://vitejs.dev/) — Next-generation build tool

---

<div align="center">

**Made with ❤️ by Samir Uddin Ahmed**

⭐ Star this repo if you find it useful!

</div>
