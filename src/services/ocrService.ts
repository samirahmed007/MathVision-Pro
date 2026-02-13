import { GoogleGenAI } from '@google/genai';
import katex from 'katex';

const OCR_PROMPT = `You are an expert mathematical OCR system. Analyze the image and extract all mathematical expressions accurately.

Follow these rules strictly:
1. Output ONLY LaTeX code without any explanations, markdown formatting, or additional text.
2. Use standard LaTeX notation and commands.
3. Preserve the exact structure, symbols, and spatial relationships of the mathematical expressions.
4. For multiple equations, output each on a new line.
5. Use appropriate LaTeX environments (equation, align, matrix, bmatrix, pmatrix, cases, etc.) as needed.
6. For fractions use \\frac{}{}, for square roots use \\sqrt{}, for nth roots use \\sqrt[n]{}, for subscripts use _{}, for superscripts use ^{}, for Greek letters use their LaTeX commands, and for operators use proper LaTeX commands.
7. If any symbol is unclear or ambiguous, make your best educated guess based on mathematical context.
8. Preserve spacing and alignment as closely as possible to the original.

Return only the clean LaTeX code with no additional commentary, no markdown code blocks, no explanations.`;

export interface OCRResult {
  latex: string;
  mathml: string;
  mathml_presentation: string;
  mathml_content: string;
  asciimath: string;
  sympy: string;
  wolfram: string;
  maple: string;
  markdown: string;
  html: string;
  typst: string;
  unicode: string;
}

// Clean response to remove markdown code blocks
function cleanResponse(text: string): string {
  let cleaned = text.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:latex|tex|math)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  
  // Remove single backticks wrapping
  if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
    cleaned = cleaned.slice(1, -1);
  }
  
  return cleaned.trim();
}

// Get image MIME type from base64 or data URL
function getImageMimeType(imageData: string): string {
  if (imageData.startsWith('data:')) {
    const match = imageData.match(/^data:([^;]+);/);
    if (match) return match[1];
  }
  
  // Try to detect from base64 content
  const base64Data = imageData.replace(/^data:[^;]+;base64,/, '');
  const firstBytes = atob(base64Data.substring(0, 16));
  
  if (firstBytes.startsWith('\x89PNG')) return 'image/png';
  if (firstBytes.startsWith('\xFF\xD8\xFF')) return 'image/jpeg';
  if (firstBytes.startsWith('GIF87a') || firstBytes.startsWith('GIF89a')) return 'image/gif';
  if (firstBytes.startsWith('RIFF') && firstBytes.includes('WEBP')) return 'image/webp';
  
  return 'image/png'; // Default
}

// Extract base64 data from data URL
function extractBase64(imageData: string): string {
  if (imageData.startsWith('data:')) {
    return imageData.split(',')[1] || imageData;
  }
  return imageData;
}

// Process with Google Gemini using official SDK
async function processWithGoogleGenAI(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  
  const mimeType = getImageMimeType(imageBase64);
  const base64Data = extractBase64(imageBase64);
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: OCR_PROMPT,
          },
        ],
      },
    ],
  });
  
  const text = response.text || '';
  return cleanResponse(text);
}

// Process with OpenRouter API
async function processWithOpenRouter(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const mimeType = getImageMimeType(imageBase64);
  const base64Data = extractBase64(imageBase64);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MathVision Pro',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenRouter API error');
  }
  
  const data = await response.json();
  return cleanResponse(data.choices[0]?.message?.content || '');
}

// Process with Groq API
async function processWithGroq(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const mimeType = getImageMimeType(imageBase64);
  const base64Data = extractBase64(imageBase64);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Groq API error');
  }
  
  const data = await response.json();
  return cleanResponse(data.choices[0]?.message?.content || '');
}

// Process with OpenAI API
async function processWithOpenAI(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const mimeType = getImageMimeType(imageBase64);
  const base64Data = extractBase64(imageBase64);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }
  
  const data = await response.json();
  return cleanResponse(data.choices[0]?.message?.content || '');
}

// Process with Anthropic API
async function processWithAnthropic(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const mimeType = getImageMimeType(imageBase64) as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  const base64Data = extractBase64(imageBase64);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }
  
  const data = await response.json();
  return cleanResponse(data.content[0]?.text || '');
}

// Process with Mistral API
async function processWithMistral(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const mimeType = getImageMimeType(imageBase64);
  const base64Data = extractBase64(imageBase64);
  
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: 'text',
              text: OCR_PROMPT,
            },
          ],
        },
      ],
      max_tokens: 4096,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Mistral API error');
  }
  
  const data = await response.json();
  return cleanResponse(data.choices[0]?.message?.content || '');
}

// Process with HuggingFace API
async function processWithHuggingFace(
  imageBase64: string,
  apiKey: string,
  modelId: string
): Promise<string> {
  const base64Data = extractBase64(imageBase64);
  
  // HuggingFace Inference API
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        image: base64Data,
        text: OCR_PROMPT,
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'HuggingFace API error');
  }
  
  const data = await response.json();
  return cleanResponse(data[0]?.generated_text || data.generated_text || '');
}

// Process with Ollama (local)
async function processWithOllama(
  imageBase64: string,
  baseUrl: string,
  modelId: string
): Promise<string> {
  const base64Data = extractBase64(imageBase64);
  
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      prompt: OCR_PROMPT,
      images: [base64Data],
      stream: false,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ollama API error');
  }
  
  const data = await response.json();
  return cleanResponse(data.response || '');
}

// Main OCR function
export async function performOCR(
  imageBase64: string,
  providerId: string,
  modelId: string,
  apiKey: string,
  baseUrl?: string
): Promise<OCRResult> {
  let latex = '';
  
  // Process based on provider
  switch (providerId) {
    case 'google':
      latex = await processWithGoogleGenAI(imageBase64, apiKey, modelId);
      break;
    case 'openrouter':
      latex = await processWithOpenRouter(imageBase64, apiKey, modelId);
      break;
    case 'groq':
      latex = await processWithGroq(imageBase64, apiKey, modelId);
      break;
    case 'openai':
      latex = await processWithOpenAI(imageBase64, apiKey, modelId);
      break;
    case 'anthropic':
      latex = await processWithAnthropic(imageBase64, apiKey, modelId);
      break;
    case 'mistral':
      latex = await processWithMistral(imageBase64, apiKey, modelId);
      break;
    case 'huggingface':
      latex = await processWithHuggingFace(imageBase64, apiKey, modelId);
      break;
    case 'ollama':
      latex = await processWithOllama(imageBase64, baseUrl || 'http://localhost:11434', modelId);
      break;
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
  
  // Convert LaTeX to other formats
  return {
    latex,
    mathml: convertToMathML(latex),
    mathml_presentation: convertToMathMLPresentation(latex),
    mathml_content: convertToMathMLContent(latex),
    asciimath: convertToAsciiMath(latex),
    sympy: convertToSymPy(latex),
    wolfram: convertToWolfram(latex),
    maple: convertToMaple(latex),
    markdown: convertToMarkdown(latex),
    html: convertToHTML(latex),
    typst: convertToTypst(latex),
    unicode: convertToUnicode(latex),
  };
}

// Test provider connection
export async function testProviderConnection(
  providerId: string,
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    switch (providerId) {
      case 'google': {
        const ai = new GoogleGenAI({ apiKey });
        // Try to get model info to test connection
        await ai.models.get({ model: 'gemini-2.0-flash' });
        return { success: true, message: 'Connection successful!' };
      }
      case 'openrouter': {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return { success: true, message: 'Connection successful!' };
        }
        return { success: false, message: 'Invalid API key or connection failed' };
      }
      case 'groq': {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return { success: true, message: 'Connection successful!' };
        }
        return { success: false, message: 'Invalid API key or connection failed' };
      }
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return { success: true, message: 'Connection successful!' };
        }
        return { success: false, message: 'Invalid API key or connection failed' };
      }
      case 'anthropic': {
        // Anthropic doesn't have a simple test endpoint, so we'll just validate the key format
        if (apiKey.startsWith('sk-ant-')) {
          return { success: true, message: 'API key format is valid!' };
        }
        return { success: false, message: 'Invalid API key format' };
      }
      case 'mistral': {
        const response = await fetch('https://api.mistral.ai/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return { success: true, message: 'Connection successful!' };
        }
        return { success: false, message: 'Invalid API key or connection failed' };
      }
      case 'huggingface': {
        const response = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (response.ok) {
          return { success: true, message: 'Connection successful!' };
        }
        return { success: false, message: 'Invalid API key or connection failed' };
      }
      case 'ollama': {
        const url = baseUrl || 'http://localhost:11434';
        const response = await fetch(`${url}/api/tags`);
        if (response.ok) {
          return { success: true, message: 'Ollama is running!' };
        }
        return { success: false, message: 'Ollama is not running or not accessible' };
      }
      default:
        return { success: false, message: 'Unknown provider' };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// ============================================
// MathML Conversion using KaTeX engine
// ============================================

// Clean LaTeX for MathML conversion
function cleanLatexForMathML(latex: string): string {
  let cleaned = latex.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:latex|tex|math)?\s*\n?/i, '');
  cleaned = cleaned.replace(/\n?```\s*$/i, '');
  
  // Remove outer display math delimiters
  if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$') && cleaned.endsWith('$') && !cleaned.slice(1, -1).includes('$')) {
    cleaned = cleaned.slice(1, -1).trim();
  } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
    cleaned = cleaned.slice(2, -2).trim();
  }
  
  // Remove equation environment wrapper but keep contents
  cleaned = cleaned.replace(/\\begin\{equation\*?\}\s*([\s\S]*?)\s*\\end\{equation\*?\}/g, '$1');
  
  return cleaned.trim();
}

// Convert non-ASCII characters to hexadecimal XML entities &#x...;
function encodeNonAsciiToHex(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 127) {
      result += '&#x' + code.toString(16).toUpperCase() + ';';
    } else {
      result += str[i];
    }
  }
  return result;
}

// Format MathML XML with proper indentation
function formatMathML(xml: string, useHexEntities: boolean = true): string {
  // Remove existing whitespace between tags
  let str = xml.replace(/>\s+</g, '><').trim();
  
  const parts = str.match(/(<[^>]+>|[^<]+)/g) || [];
  let formatted = '';
  let indent = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part || !part.trim()) continue;
    const trimmed = part.trim();
    
    if (trimmed.startsWith('</')) {
      // Closing tag - decrease indent first
      indent = Math.max(0, indent - 1);
      formatted += '  '.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
      // Self-closing tag
      formatted += '  '.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<')) {
      // Opening tag
      // Check if this is an inline element: <tag>text</tag>
      if (i + 2 < parts.length) {
        const nextPart = (parts[i + 1] || '').trim();
        const afterNext = (parts[i + 2] || '').trim();
        if (nextPart && !nextPart.startsWith('<') && afterNext.startsWith('</')) {
          // Inline element like <mi>x</mi>
          const encodedContent = useHexEntities ? encodeNonAsciiToHex(nextPart) : nextPart;
          formatted += '  '.repeat(indent) + trimmed + encodedContent + afterNext + '\n';
          i += 2;
          continue;
        }
      }
      formatted += '  '.repeat(indent) + trimmed + '\n';
      indent++;
    } else {
      // Text content - encode non-ASCII if needed
      const encodedContent = useHexEntities ? encodeNonAsciiToHex(trimmed) : trimmed;
      formatted += '  '.repeat(indent) + encodedContent + '\n';
    }
  }
  
  return formatted.trimEnd();
}

// Main MathML conversion using KaTeX engine
function convertToMathML(latex: string): string {
  try {
    let processedLatex = cleanLatexForMathML(latex);
    if (!processedLatex) return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"></math>';
    
    // Check if expression has multiple lines without a wrapping environment
    const hasEnvironment = /\\begin\{(aligned|align|align\*|gathered|gather|cases|matrix|bmatrix|pmatrix|vmatrix|Bmatrix|Vmatrix|smallmatrix|array|split|multline)\}/.test(processedLatex);
    const hasNewlines = /\\\\(?!\s*\\end)/.test(processedLatex);
    
    if (hasNewlines && !hasEnvironment) {
      // Wrap multi-line expressions in aligned environment
      processedLatex = `\\begin{aligned}\n${processedLatex}\n\\end{aligned}`;
    }
    
    // Use KaTeX to generate proper MathML
    const rendered = katex.renderToString(processedLatex, {
      output: 'mathml',
      displayMode: true,
      throwOnError: false,
      strict: false,
      trust: true,
      macros: {
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
        '\\Q': '\\mathbb{Q}',
        '\\C': '\\mathbb{C}',
        '\\varphi': '\\phi',
      },
    });
    
    // Extract the <math> element from KaTeX output
    const mathMatch = rendered.match(/<math[\s\S]*?<\/math>/);
    if (!mathMatch) {
      return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mtext>${escapeXml(latex)}</mtext></mrow></math>`;
    }
    
    let mathml = mathMatch[0];
    
    // Remove <semantics> wrapper and <annotation> element for cleaner output
    mathml = mathml.replace(
      /<semantics>\s*([\s\S]*?)\s*<annotation[^>]*>[\s\S]*?<\/annotation>\s*<\/semantics>/g,
      '$1'
    );
    
    // Ensure display="block" is present
    if (!mathml.includes('display="block"') && !mathml.includes("display='block'")) {
      mathml = mathml.replace('<math', '<math display="block"');
    }
    
    // Ensure xmlns is present
    if (!mathml.includes('xmlns=')) {
      mathml = mathml.replace('<math', '<math xmlns="http://www.w3.org/1998/Math/MathML"');
    }
    
    // Format with proper indentation
    return formatMathML(mathml);
  } catch (e) {
    console.error('MathML conversion error:', e);
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">\n  <mrow>\n    <mtext>${escapeXml(latex)}</mtext>\n  </mrow>\n</math>`;
  }
}

// MathML Presentation (same as standard MathML - Presentation is the default)
function convertToMathMLPresentation(latex: string): string {
  // Presentation MathML is the default output from KaTeX
  return convertToMathML(latex);
}

// MathML Content format (semantic representation)
function convertToMathMLContent(latex: string): string {
  try {
    let processedLatex = cleanLatexForMathML(latex);
    if (!processedLatex) return '<math xmlns="http://www.w3.org/1998/Math/MathML"></math>';
    
    // First generate Presentation MathML via KaTeX
    const hasEnvironment = /\\begin\{(aligned|align|align\*|gathered|gather|cases|matrix|bmatrix|pmatrix|vmatrix|Bmatrix|Vmatrix|smallmatrix|array|split|multline)\}/.test(processedLatex);
    const hasNewlines = /\\\\(?!\s*\\end)/.test(processedLatex);
    
    if (hasNewlines && !hasEnvironment) {
      processedLatex = `\\begin{aligned}\n${processedLatex}\n\\end{aligned}`;
    }
    
    const rendered = katex.renderToString(processedLatex, {
      output: 'mathml',
      displayMode: true,
      throwOnError: false,
      strict: false,
      trust: true,
    });
    
    const mathMatch = rendered.match(/<math[\s\S]*?<\/math>/);
    if (!mathMatch) {
      return `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mtext>${escapeXml(latex)}</mtext></mrow></math>`;
    }
    
    let mathml = mathMatch[0];
    
    // Remove semantics/annotation wrapper
    mathml = mathml.replace(
      /<semantics>\s*([\s\S]*?)\s*<annotation[^>]*>[\s\S]*?<\/annotation>\s*<\/semantics>/g,
      '$1'
    );
    
    // Convert Presentation MathML to Content MathML
    // Replace presentation elements with content equivalents
    let content = mathml;
    
    // Convert <mo>+</mo> to <plus/>
    content = content.replace(/<mo[^>]*>\+<\/mo>/g, '<plus/>');
    content = content.replace(/<mo[^>]*>−<\/mo>/g, '<minus/>');
    content = content.replace(/<mo[^>]*>×<\/mo>/g, '<times/>');
    content = content.replace(/<mo[^>]*>=<\/mo>/g, '<eq/>');
    content = content.replace(/<mo[^>]*>&lt;<\/mo>/g, '<lt/>');
    content = content.replace(/<mo[^>]*>&gt;<\/mo>/g, '<gt/>');
    content = content.replace(/<mo[^>]*>≤<\/mo>/g, '<leq/>');
    content = content.replace(/<mo[^>]*>≥<\/mo>/g, '<geq/>');
    content = content.replace(/<mo[^>]*>≠<\/mo>/g, '<neq/>');
    
    // Replace <mi> with <ci> and <mn> with <cn>
    content = content.replace(/<mi([^>]*)>([\s\S]*?)<\/mi>/g, '<ci$1>$2</ci>');
    content = content.replace(/<mn([^>]*)>([\s\S]*?)<\/mn>/g, '<cn$1>$2</cn>');
    
    // Replace mfrac with apply>divide
    content = content.replace(/<mfrac>/g, '<apply><divide/>');
    content = content.replace(/<\/mfrac>/g, '</apply>');
    
    // Replace msqrt with apply>root
    content = content.replace(/<msqrt>/g, '<apply><root/>');
    content = content.replace(/<\/msqrt>/g, '</apply>');
    
    // Replace msup with apply>power
    content = content.replace(/<msup>/g, '<apply><power/>');
    content = content.replace(/<\/msup>/g, '</apply>');
    
    // Ensure xmlns
    if (!content.includes('xmlns=')) {
      content = content.replace('<math', '<math xmlns="http://www.w3.org/1998/Math/MathML"');
    }
    
    return formatMathML(content);
  } catch (e) {
    console.error('MathML Content conversion error:', e);
    return `<math xmlns="http://www.w3.org/1998/Math/MathML">\n  <mrow>\n    <mtext>${escapeXml(latex)}</mtext>\n  </mrow>\n</math>`;
  }
}

// Escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function convertToAsciiMath(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, 'root($1)($2)')
    .replace(/\^{([^}]+)}/g, '^($1)')
    .replace(/_{([^}]+)}/g, '_($1)')
    .replace(/\\alpha/g, 'alpha')
    .replace(/\\beta/g, 'beta')
    .replace(/\\gamma/g, 'gamma')
    .replace(/\\delta/g, 'delta')
    .replace(/\\theta/g, 'theta')
    .replace(/\\pi/g, 'pi')
    .replace(/\\sigma/g, 'sigma')
    .replace(/\\omega/g, 'omega')
    .replace(/\\infty/g, 'oo')
    .replace(/\\sum/g, 'sum')
    .replace(/\\prod/g, 'prod')
    .replace(/\\int/g, 'int')
    .replace(/\\pm/g, '+-')
    .replace(/\\times/g, 'xx')
    .replace(/\\div/g, '-:')
    .replace(/\\cdot/g, '*')
    .replace(/\\leq/g, '<=')
    .replace(/\\geq/g, '>=')
    .replace(/\\neq/g, '!=')
    .replace(/\\approx/g, '~~')
    .replace(/\\rightarrow/g, '->')
    .replace(/\\leftarrow/g, '<-')
    .replace(/\\Rightarrow/g, '=>')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[{}]/g, '');
}

function convertToSymPy(latex: string): string {
  let sympy = latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, 'Rational($1, $2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, 'root($2, $1)')
    .replace(/\^{([^}]+)}/g, '**($1)')
    .replace(/_{([^}]+)}/g, '_$1')
    .replace(/\\alpha/g, 'alpha')
    .replace(/\\beta/g, 'beta')
    .replace(/\\gamma/g, 'gamma')
    .replace(/\\delta/g, 'delta')
    .replace(/\\theta/g, 'theta')
    .replace(/\\pi/g, 'pi')
    .replace(/\\sigma/g, 'sigma')
    .replace(/\\omega/g, 'omega')
    .replace(/\\infty/g, 'oo')
    .replace(/\\sum/g, 'Sum')
    .replace(/\\prod/g, 'Product')
    .replace(/\\int/g, 'Integral')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\log/g, 'log')
    .replace(/\\ln/g, 'ln')
    .replace(/\\exp/g, 'exp')
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[{}]/g, '');
  
  return `from sympy import *\n\nexpr = ${sympy}`;
}

function convertToWolfram(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'Sqrt[$1]')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, 'Power[$2, 1/$1]')
    .replace(/\^{([^}]+)}/g, '^($1)')
    .replace(/_{([^}]+)}/g, 'Subscript[#, $1]&')
    .replace(/\\alpha/g, '\\[Alpha]')
    .replace(/\\beta/g, '\\[Beta]')
    .replace(/\\gamma/g, '\\[Gamma]')
    .replace(/\\delta/g, '\\[Delta]')
    .replace(/\\theta/g, '\\[Theta]')
    .replace(/\\pi/g, 'Pi')
    .replace(/\\sigma/g, '\\[Sigma]')
    .replace(/\\omega/g, '\\[Omega]')
    .replace(/\\infty/g, 'Infinity')
    .replace(/\\sum/g, 'Sum')
    .replace(/\\prod/g, 'Product')
    .replace(/\\int/g, 'Integrate')
    .replace(/\\sin/g, 'Sin')
    .replace(/\\cos/g, 'Cos')
    .replace(/\\tan/g, 'Tan')
    .replace(/\\log/g, 'Log')
    .replace(/\\ln/g, 'Log')
    .replace(/\\exp/g, 'Exp')
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[{}]/g, '');
}

function convertToMaple(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, 'root[$1]($2)')
    .replace(/\^{([^}]+)}/g, '^($1)')
    .replace(/_{([^}]+)}/g, '__$1')
    .replace(/\\alpha/g, 'alpha')
    .replace(/\\beta/g, 'beta')
    .replace(/\\gamma/g, 'gamma')
    .replace(/\\delta/g, 'delta')
    .replace(/\\theta/g, 'theta')
    .replace(/\\pi/g, 'Pi')
    .replace(/\\sigma/g, 'sigma')
    .replace(/\\omega/g, 'omega')
    .replace(/\\infty/g, 'infinity')
    .replace(/\\sum/g, 'sum')
    .replace(/\\prod/g, 'product')
    .replace(/\\int/g, 'int')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\log/g, 'log')
    .replace(/\\ln/g, 'ln')
    .replace(/\\exp/g, 'exp')
    .replace(/\\times/g, '*')
    .replace(/\\cdot/g, '*')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[{}]/g, '');
}

function convertToMarkdown(latex: string): string {
  return `$$\n${latex}\n$$`;
}

function convertToHTML(latex: string): string {
  // Generate MathML for the HTML output
  const mathml = convertToMathML(latex);
  // Flatten MathML to single line for the HTML table cell
  const mathmlOneLine = mathml.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:svg="http://www.w3.org/2000/svg" epub:prefix="index: http://www.index.com/" xml:lang="en" lang="en">
<head>
<title>MathVision Pro Output</title>
</head>
<body epub:type="bodymatter chapter">
<table border="1">
<tbody>
<tr><td style="text-align: right;"><img src="images/math-001.png" alt=""/></td><td>${mathmlOneLine}</td></tr>
</tbody>
</table>
</body>
</html>`;
}

function convertToTypst(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\^{([^}]+)}/g, '^($1)')
    .replace(/_{([^}]+)}/g, '_($1)')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, 'sum')
    .replace(/\\prod/g, 'product')
    .replace(/\\int/g, 'integral')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[{}]/g, '');
}

// Screenshot capture function
export async function captureScreenshot(): Promise<string | null> {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'monitor' } as MediaTrackConstraints,
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    
    stream.getTracks().forEach(track => track.stop());
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    return null;
  }
}

// Legacy function aliases for backward compatibility
export async function processOCR(
  imageBase64: string,
  providerId: string,
  modelId: string,
  apiKey: string,
  baseUrl?: string
): Promise<OCRResult> {
  return performOCR(imageBase64, providerId, modelId, apiKey, baseUrl);
}

export function convertLatexToFormats(latex: string): Omit<OCRResult, 'latex'> {
  return {
    mathml: convertToMathML(latex),
    mathml_presentation: convertToMathMLPresentation(latex),
    mathml_content: convertToMathMLContent(latex),
    asciimath: convertToAsciiMath(latex),
    sympy: convertToSymPy(latex),
    wolfram: convertToWolfram(latex),
    maple: convertToMaple(latex),
    markdown: convertToMarkdown(latex),
    html: convertToHTML(latex),
    typst: convertToTypst(latex),
    unicode: convertToUnicode(latex),
  };
}

function convertToUnicode(latex: string): string {
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '⁄')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\^{0}/g, '⁰')
    .replace(/\^{1}/g, '¹')
    .replace(/\^{2}/g, '²')
    .replace(/\^{3}/g, '³')
    .replace(/\^{4}/g, '⁴')
    .replace(/\^{5}/g, '⁵')
    .replace(/\^{6}/g, '⁶')
    .replace(/\^{7}/g, '⁷')
    .replace(/\^{8}/g, '⁸')
    .replace(/\^{9}/g, '⁹')
    .replace(/\^{n}/g, 'ⁿ')
    .replace(/_{0}/g, '₀')
    .replace(/_{1}/g, '₁')
    .replace(/_{2}/g, '₂')
    .replace(/_{3}/g, '₃')
    .replace(/_{4}/g, '₄')
    .replace(/_{5}/g, '₅')
    .replace(/_{6}/g, '₆')
    .replace(/_{7}/g, '₇')
    .replace(/_{8}/g, '₈')
    .replace(/_{9}/g, '₉')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\zeta/g, 'ζ')
    .replace(/\\eta/g, 'η')
    .replace(/\\theta/g, 'θ')
    .replace(/\\iota/g, 'ι')
    .replace(/\\kappa/g, 'κ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\nu/g, 'ν')
    .replace(/\\xi/g, 'ξ')
    .replace(/\\pi/g, 'π')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\upsilon/g, 'υ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\chi/g, 'χ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Gamma/g, 'Γ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Theta/g, 'Θ')
    .replace(/\\Lambda/g, 'Λ')
    .replace(/\\Xi/g, 'Ξ')
    .replace(/\\Pi/g, 'Π')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\Psi/g, 'Ψ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏')
    .replace(/\\int/g, '∫')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\equiv/g, '≡')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\nabla/g, '∇')
    .replace(/\\partial/g, '∂')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\supset/g, '⊃')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\supseteq/g, '⊇')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[{}]/g, '');
}
