# MathVision Pro

**AI-Powered Mathematical OCR Platform** - Convert images of mathematical equations to LaTeX, MathML, SymPy, Wolfram, and 10+ other formats.

## Overview

MathVision Pro is an advanced web-based application that leverages artificial intelligence to recognize and convert mathematical expressions from images into multiple machine-readable and human-editable formats. Whether you have handwritten equations from notebooks, printed textbooks, or complex mathematical notation, MathVision Pro intelligently extracts and converts them to your preferred format.

## ✨ Key Features

- **Multi-Format Output**: Convert mathematical equations to:
  - LaTeX (primary format)
  - MathML (Presentation & Content)
  - AsciiMath
  - SymPy (Python)
  - Wolfram Language
  - Maple
  - Markdown
  - HTML
  - Typst
  - Unicode

- **8 AI Provider Support**:
  - Google Gemini
  - OpenAI GPT-4
  - Anthropic Claude
  - Local models via Ollama
  - And more intelligent backends

- **Powerful Features**:
  - **OCR Processing**: Extract mathematical expressions from images with high accuracy
  - **Batch Processing**: Process multiple images efficiently in one operation
  - **Screenshot Capture Tool**: Capture equations directly from your screen
  - **LaTeX Editor**: Built-in Monaco editor for fine-tuning extracted LaTeX code
  - **History**: Keep track of all processed equations
  - **Real-time Preview**: See rendered mathematical output instantly
  - **Format Conversion**: Convert between multiple mathematical notation formats
  - **Customizable Settings**: Configure default AI providers, output formats, and more
  - **Responsive Design**: Works seamlessly on desktop and tablet devices
  - **Smooth Animations**: Beautiful UI with Framer Motion animations

## 🛠️ Technology Stack

### Frontend
- **React 19.2.3** - UI framework
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.4** - Lightning-fast build tool
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Framer Motion 12.34.0** - Animation library

### Libraries
- **@google/genai** - Google AI integration
- **@monaco-editor/react** - Advanced code editor
- **KaTeX 0.16.28** - LaTeX math rendering
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **React Dropzone** - File upload handling
- **Zustand** - State management

### Build & Development
- **Tailwind CSS Vite plugin** - CSS processing
- **Vite React plugin** - React support
- **Vite Single File plugin** - Single-file build output

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
- API keys for desired AI providers (Google Gemini, OpenAI, Anthropic, etc.)

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

3. **Create environment configuration** (Optional)
   - Configure API keys in the Settings page of the application

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 🚀 Building & Deployment

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module reload.

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `dist` directory. The app is bundled as a single HTML file for easy deployment.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

## 📖 Usage Guide

### Main Features

#### 1. **OCR Page** (Primary Feature)
- Upload an image containing mathematical equations
- Select your preferred AI provider and model
- Choose which output formats you want
- The AI processes the image and extracts the mathematical notation
- View rendered preview of the equation
- Edit the extracted LaTeX in the built-in editor

#### 2. **Batch Processing**
- Upload multiple images at once
- Process all images sequentially
- Download results in bulk
- Great for digitizing textbooks or assignment sheets

#### 3. **History**
- View all previously processed equations
- Search and filter past conversions
- Re-process past images with different settings
- Export history data

#### 4. **LaTeX Editor**
- Built-in Monaco editor with syntax highlighting
- Real-time mathematical rendering
- Support for complex LaTeX expressions
- Format conversion from the editor

#### 5. **Settings**
- Configure default AI provider and model
- Set preferred output formats
- Manage API keys securely
- Customize application behavior
- Control image processing options

#### 6. **About**
- Information about MathVision Pro
- Feature highlights
- Supported formats and providers
- Version and credits

### Keyboard Shortcuts
The application includes helpful keyboard shortcuts for power users (accessible via the "?" help button).

## 🔑 AI Provider Configuration

### Supported Providers

1. **Google Gemini** - Free tier available, excellent for mathematical content
2. **OpenAI GPT-4** - Premium accuracy, fast processing
3. **Anthropic Claude** - Cross-platform compatibility
4. **Local Models (Ollama)** - Privacy-focused, run models on your machine
5. **Additional providers** - Easy to add new providers

### Adding API Keys
1. Navigate to Settings
2. Find your desired provider
3. Enter your API key
4. Save and verify

## 📊 Architecture

```
MathVision Pro
├── src/
│   ├── components/        # React components
│   │   ├── OCRPage.tsx   # Main OCR interface
│   │   ├── BatchPage.tsx # Batch processing
│   │   ├── HistoryPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── LaTeXEditor.tsx
│   │   └── ...
│   ├── services/         # Business logic
│   │   └── ocrService.ts # OCR processing and format conversion
│   ├── store/           # State management
│   │   └── appStore.ts  # Zustand store
│   ├── utils/           # Utility functions
│   └── main.tsx         # App entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Project metadata
```

## 🎨 UI/UX Features

- **Dark Theme**: Comfortable dark interface for extended use
- **Smooth Transitions**: Animated page transitions with Framer Motion
- **Toast Notifications**: Non-intrusive status updates
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Support for keyboard navigation and screen readers
- **Real-time Preview**: Instant mathematical rendering with KaTeX

## 🔒 Privacy & Security

- API keys are stored locally in your browser
- No equations are stored on external servers except through AI providers
- Single-file build option for easy self-hosting
- Open-source codebase for transparency

## 🐛 Troubleshooting

### Common Issues

**"API Key Invalid"**
- Ensure you've entered the correct API key
- Check that the API service is active in your provider account
- Verify rate limits haven't been exceeded

**"Image Not Recognized"**
- Ensure the image contains clear mathematical notation
- Try higher resolution images
- Check that the provider supports the image format

**"LaTeX Output Not Rendering"**
- Verify the LaTeX syntax is correct
- Try using standard LaTeX commands
- Check browser console for error messages

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
