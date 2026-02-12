import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Undo, 
  Redo, 
  Type,
  Superscript,
  Subscript,
  Divide,
  Sigma,
  Infinity,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LaTeXEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onClose?: () => void;
}

// Symbol categories with extensive symbols like MathType
const symbolCategories = [
  {
    name: 'Greek Letters',
    icon: 'α',
    symbols: [
      { latex: '\\alpha', display: 'α', name: 'alpha' },
      { latex: '\\beta', display: 'β', name: 'beta' },
      { latex: '\\gamma', display: 'γ', name: 'gamma' },
      { latex: '\\delta', display: 'δ', name: 'delta' },
      { latex: '\\epsilon', display: 'ε', name: 'epsilon' },
      { latex: '\\varepsilon', display: 'ε', name: 'varepsilon' },
      { latex: '\\zeta', display: 'ζ', name: 'zeta' },
      { latex: '\\eta', display: 'η', name: 'eta' },
      { latex: '\\theta', display: 'θ', name: 'theta' },
      { latex: '\\vartheta', display: 'ϑ', name: 'vartheta' },
      { latex: '\\iota', display: 'ι', name: 'iota' },
      { latex: '\\kappa', display: 'κ', name: 'kappa' },
      { latex: '\\lambda', display: 'λ', name: 'lambda' },
      { latex: '\\mu', display: 'μ', name: 'mu' },
      { latex: '\\nu', display: 'ν', name: 'nu' },
      { latex: '\\xi', display: 'ξ', name: 'xi' },
      { latex: '\\pi', display: 'π', name: 'pi' },
      { latex: '\\varpi', display: 'ϖ', name: 'varpi' },
      { latex: '\\rho', display: 'ρ', name: 'rho' },
      { latex: '\\varrho', display: 'ϱ', name: 'varrho' },
      { latex: '\\sigma', display: 'σ', name: 'sigma' },
      { latex: '\\varsigma', display: 'ς', name: 'varsigma' },
      { latex: '\\tau', display: 'τ', name: 'tau' },
      { latex: '\\upsilon', display: 'υ', name: 'upsilon' },
      { latex: '\\phi', display: 'φ', name: 'phi' },
      { latex: '\\varphi', display: 'ϕ', name: 'varphi' },
      { latex: '\\chi', display: 'χ', name: 'chi' },
      { latex: '\\psi', display: 'ψ', name: 'psi' },
      { latex: '\\omega', display: 'ω', name: 'omega' },
      { latex: '\\Gamma', display: 'Γ', name: 'Gamma' },
      { latex: '\\Delta', display: 'Δ', name: 'Delta' },
      { latex: '\\Theta', display: 'Θ', name: 'Theta' },
      { latex: '\\Lambda', display: 'Λ', name: 'Lambda' },
      { latex: '\\Xi', display: 'Ξ', name: 'Xi' },
      { latex: '\\Pi', display: 'Π', name: 'Pi' },
      { latex: '\\Sigma', display: 'Σ', name: 'Sigma' },
      { latex: '\\Upsilon', display: 'Υ', name: 'Upsilon' },
      { latex: '\\Phi', display: 'Φ', name: 'Phi' },
      { latex: '\\Psi', display: 'Ψ', name: 'Psi' },
      { latex: '\\Omega', display: 'Ω', name: 'Omega' },
    ]
  },
  {
    name: 'Operators',
    icon: '±',
    symbols: [
      { latex: '+', display: '+', name: 'plus' },
      { latex: '-', display: '−', name: 'minus' },
      { latex: '\\pm', display: '±', name: 'plus-minus' },
      { latex: '\\mp', display: '∓', name: 'minus-plus' },
      { latex: '\\times', display: '×', name: 'times' },
      { latex: '\\div', display: '÷', name: 'divide' },
      { latex: '\\cdot', display: '·', name: 'cdot' },
      { latex: '\\ast', display: '∗', name: 'asterisk' },
      { latex: '\\star', display: '⋆', name: 'star' },
      { latex: '\\circ', display: '∘', name: 'circ' },
      { latex: '\\bullet', display: '•', name: 'bullet' },
      { latex: '\\oplus', display: '⊕', name: 'oplus' },
      { latex: '\\ominus', display: '⊖', name: 'ominus' },
      { latex: '\\otimes', display: '⊗', name: 'otimes' },
      { latex: '\\oslash', display: '⊘', name: 'oslash' },
      { latex: '\\odot', display: '⊙', name: 'odot' },
      { latex: '\\dagger', display: '†', name: 'dagger' },
      { latex: '\\ddagger', display: '‡', name: 'ddagger' },
      { latex: '\\amalg', display: '⨿', name: 'amalg' },
    ]
  },
  {
    name: 'Relations',
    icon: '=',
    symbols: [
      { latex: '=', display: '=', name: 'equals' },
      { latex: '\\neq', display: '≠', name: 'not equal' },
      { latex: '<', display: '<', name: 'less than' },
      { latex: '>', display: '>', name: 'greater than' },
      { latex: '\\leq', display: '≤', name: 'less or equal' },
      { latex: '\\geq', display: '≥', name: 'greater or equal' },
      { latex: '\\ll', display: '≪', name: 'much less' },
      { latex: '\\gg', display: '≫', name: 'much greater' },
      { latex: '\\equiv', display: '≡', name: 'equivalent' },
      { latex: '\\approx', display: '≈', name: 'approximately' },
      { latex: '\\cong', display: '≅', name: 'congruent' },
      { latex: '\\sim', display: '∼', name: 'similar' },
      { latex: '\\simeq', display: '≃', name: 'similar or equal' },
      { latex: '\\propto', display: '∝', name: 'proportional' },
      { latex: '\\perp', display: '⊥', name: 'perpendicular' },
      { latex: '\\parallel', display: '∥', name: 'parallel' },
      { latex: '\\asymp', display: '≍', name: 'asymptotic' },
      { latex: '\\doteq', display: '≐', name: 'dot equal' },
      { latex: '\\prec', display: '≺', name: 'precedes' },
      { latex: '\\succ', display: '≻', name: 'succeeds' },
      { latex: '\\preceq', display: '⪯', name: 'precedes or equal' },
      { latex: '\\succeq', display: '⪰', name: 'succeeds or equal' },
    ]
  },
  {
    name: 'Set Theory',
    icon: '∈',
    symbols: [
      { latex: '\\in', display: '∈', name: 'in' },
      { latex: '\\notin', display: '∉', name: 'not in' },
      { latex: '\\ni', display: '∋', name: 'contains' },
      { latex: '\\subset', display: '⊂', name: 'subset' },
      { latex: '\\supset', display: '⊃', name: 'superset' },
      { latex: '\\subseteq', display: '⊆', name: 'subset or equal' },
      { latex: '\\supseteq', display: '⊇', name: 'superset or equal' },
      { latex: '\\subsetneq', display: '⊊', name: 'proper subset' },
      { latex: '\\supsetneq', display: '⊋', name: 'proper superset' },
      { latex: '\\cup', display: '∪', name: 'union' },
      { latex: '\\cap', display: '∩', name: 'intersection' },
      { latex: '\\setminus', display: '∖', name: 'set minus' },
      { latex: '\\emptyset', display: '∅', name: 'empty set' },
      { latex: '\\varnothing', display: '∅', name: 'empty set' },
      { latex: '\\mathbb{N}', display: 'ℕ', name: 'naturals' },
      { latex: '\\mathbb{Z}', display: 'ℤ', name: 'integers' },
      { latex: '\\mathbb{Q}', display: 'ℚ', name: 'rationals' },
      { latex: '\\mathbb{R}', display: 'ℝ', name: 'reals' },
      { latex: '\\mathbb{C}', display: 'ℂ', name: 'complex' },
    ]
  },
  {
    name: 'Logic',
    icon: '∀',
    symbols: [
      { latex: '\\forall', display: '∀', name: 'for all' },
      { latex: '\\exists', display: '∃', name: 'exists' },
      { latex: '\\nexists', display: '∄', name: 'not exists' },
      { latex: '\\neg', display: '¬', name: 'not' },
      { latex: '\\land', display: '∧', name: 'and' },
      { latex: '\\lor', display: '∨', name: 'or' },
      { latex: '\\Rightarrow', display: '⇒', name: 'implies' },
      { latex: '\\Leftarrow', display: '⇐', name: 'implied by' },
      { latex: '\\Leftrightarrow', display: '⇔', name: 'iff' },
      { latex: '\\rightarrow', display: '→', name: 'to' },
      { latex: '\\leftarrow', display: '←', name: 'from' },
      { latex: '\\leftrightarrow', display: '↔', name: 'left right' },
      { latex: '\\therefore', display: '∴', name: 'therefore' },
      { latex: '\\because', display: '∵', name: 'because' },
      { latex: '\\top', display: '⊤', name: 'top' },
      { latex: '\\bot', display: '⊥', name: 'bottom' },
      { latex: '\\vdash', display: '⊢', name: 'proves' },
      { latex: '\\models', display: '⊨', name: 'models' },
    ]
  },
  {
    name: 'Arrows',
    icon: '→',
    symbols: [
      { latex: '\\rightarrow', display: '→', name: 'right arrow' },
      { latex: '\\leftarrow', display: '←', name: 'left arrow' },
      { latex: '\\uparrow', display: '↑', name: 'up arrow' },
      { latex: '\\downarrow', display: '↓', name: 'down arrow' },
      { latex: '\\leftrightarrow', display: '↔', name: 'left right arrow' },
      { latex: '\\updownarrow', display: '↕', name: 'up down arrow' },
      { latex: '\\Rightarrow', display: '⇒', name: 'double right' },
      { latex: '\\Leftarrow', display: '⇐', name: 'double left' },
      { latex: '\\Uparrow', display: '⇑', name: 'double up' },
      { latex: '\\Downarrow', display: '⇓', name: 'double down' },
      { latex: '\\Leftrightarrow', display: '⇔', name: 'double left right' },
      { latex: '\\Updownarrow', display: '⇕', name: 'double up down' },
      { latex: '\\mapsto', display: '↦', name: 'maps to' },
      { latex: '\\longmapsto', display: '⟼', name: 'long maps to' },
      { latex: '\\longrightarrow', display: '⟶', name: 'long right' },
      { latex: '\\longleftarrow', display: '⟵', name: 'long left' },
      { latex: '\\hookrightarrow', display: '↪', name: 'hook right' },
      { latex: '\\hookleftarrow', display: '↩', name: 'hook left' },
      { latex: '\\nearrow', display: '↗', name: 'north east' },
      { latex: '\\searrow', display: '↘', name: 'south east' },
      { latex: '\\swarrow', display: '↙', name: 'south west' },
      { latex: '\\nwarrow', display: '↖', name: 'north west' },
    ]
  },
  {
    name: 'Calculus',
    icon: '∫',
    symbols: [
      { latex: '\\int', display: '∫', name: 'integral' },
      { latex: '\\iint', display: '∬', name: 'double integral' },
      { latex: '\\iiint', display: '∭', name: 'triple integral' },
      { latex: '\\oint', display: '∮', name: 'contour integral' },
      { latex: '\\partial', display: '∂', name: 'partial' },
      { latex: '\\nabla', display: '∇', name: 'nabla' },
      { latex: '\\sum', display: '∑', name: 'sum' },
      { latex: '\\prod', display: '∏', name: 'product' },
      { latex: '\\coprod', display: '∐', name: 'coproduct' },
      { latex: '\\lim', display: 'lim', name: 'limit' },
      { latex: '\\infty', display: '∞', name: 'infinity' },
      { latex: '\\mathrm{d}x', display: 'dx', name: 'dx' },
      { latex: '\\mathrm{d}y', display: 'dy', name: 'dy' },
      { latex: '\\mathrm{d}t', display: 'dt', name: 'dt' },
      { latex: "\\frac{\\mathrm{d}}{\\mathrm{d}x}", display: 'd/dx', name: 'derivative' },
      { latex: "\\frac{\\partial}{\\partial x}", display: '∂/∂x', name: 'partial derivative' },
    ]
  },
  {
    name: 'Functions',
    icon: 'f',
    symbols: [
      { latex: '\\sin', display: 'sin', name: 'sine' },
      { latex: '\\cos', display: 'cos', name: 'cosine' },
      { latex: '\\tan', display: 'tan', name: 'tangent' },
      { latex: '\\cot', display: 'cot', name: 'cotangent' },
      { latex: '\\sec', display: 'sec', name: 'secant' },
      { latex: '\\csc', display: 'csc', name: 'cosecant' },
      { latex: '\\arcsin', display: 'arcsin', name: 'arcsine' },
      { latex: '\\arccos', display: 'arccos', name: 'arccosine' },
      { latex: '\\arctan', display: 'arctan', name: 'arctangent' },
      { latex: '\\sinh', display: 'sinh', name: 'hyperbolic sine' },
      { latex: '\\cosh', display: 'cosh', name: 'hyperbolic cosine' },
      { latex: '\\tanh', display: 'tanh', name: 'hyperbolic tangent' },
      { latex: '\\log', display: 'log', name: 'logarithm' },
      { latex: '\\ln', display: 'ln', name: 'natural log' },
      { latex: '\\lg', display: 'lg', name: 'log base 2' },
      { latex: '\\exp', display: 'exp', name: 'exponential' },
      { latex: '\\det', display: 'det', name: 'determinant' },
      { latex: '\\dim', display: 'dim', name: 'dimension' },
      { latex: '\\ker', display: 'ker', name: 'kernel' },
      { latex: '\\gcd', display: 'gcd', name: 'gcd' },
      { latex: '\\min', display: 'min', name: 'minimum' },
      { latex: '\\max', display: 'max', name: 'maximum' },
      { latex: '\\sup', display: 'sup', name: 'supremum' },
      { latex: '\\inf', display: 'inf', name: 'infimum' },
    ]
  },
  {
    name: 'Structures',
    icon: '√',
    symbols: [
      { latex: '\\frac{a}{b}', display: 'a/b', name: 'fraction' },
      { latex: '\\sqrt{x}', display: '√x', name: 'square root' },
      { latex: '\\sqrt[n]{x}', display: 'ⁿ√x', name: 'nth root' },
      { latex: 'x^{n}', display: 'xⁿ', name: 'power' },
      { latex: 'x_{n}', display: 'xₙ', name: 'subscript' },
      { latex: 'x^{a}_{b}', display: 'xᵃᵦ', name: 'super and sub' },
      { latex: '\\binom{n}{k}', display: '(n k)', name: 'binomial' },
      { latex: '\\sum_{i=1}^{n}', display: 'Σᵢ₌₁ⁿ', name: 'sum with limits' },
      { latex: '\\prod_{i=1}^{n}', display: '∏ᵢ₌₁ⁿ', name: 'product with limits' },
      { latex: '\\int_{a}^{b}', display: '∫ₐᵇ', name: 'definite integral' },
      { latex: '\\lim_{x \\to a}', display: 'limₓ→ₐ', name: 'limit notation' },
      { latex: '\\overline{x}', display: 'x̄', name: 'overline' },
      { latex: '\\underline{x}', display: 'x̲', name: 'underline' },
      { latex: '\\hat{x}', display: 'x̂', name: 'hat' },
      { latex: '\\tilde{x}', display: 'x̃', name: 'tilde' },
      { latex: '\\vec{x}', display: 'x⃗', name: 'vector' },
      { latex: '\\dot{x}', display: 'ẋ', name: 'dot' },
      { latex: '\\ddot{x}', display: 'ẍ', name: 'double dot' },
      { latex: '\\bar{x}', display: 'x̄', name: 'bar' },
    ]
  },
  {
    name: 'Matrices',
    icon: '[ ]',
    symbols: [
      { latex: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', display: 'matrix', name: 'matrix' },
      { latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '(matrix)', name: 'pmatrix' },
      { latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', display: '[matrix]', name: 'bmatrix' },
      { latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', display: '|matrix|', name: 'vmatrix' },
      { latex: '\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}', display: '‖matrix‖', name: 'Vmatrix' },
      { latex: '\\begin{cases} a & \\text{if } x > 0 \\\\ b & \\text{otherwise} \\end{cases}', display: 'cases', name: 'cases' },
      { latex: '\\begin{array}{cc} a & b \\\\ c & d \\end{array}', display: 'array', name: 'array' },
    ]
  },
  {
    name: 'Brackets',
    icon: '( )',
    symbols: [
      { latex: '(', display: '(', name: 'left paren' },
      { latex: ')', display: ')', name: 'right paren' },
      { latex: '[', display: '[', name: 'left bracket' },
      { latex: ']', display: ']', name: 'right bracket' },
      { latex: '\\{', display: '{', name: 'left brace' },
      { latex: '\\}', display: '}', name: 'right brace' },
      { latex: '\\langle', display: '⟨', name: 'left angle' },
      { latex: '\\rangle', display: '⟩', name: 'right angle' },
      { latex: '|', display: '|', name: 'vertical bar' },
      { latex: '\\|', display: '‖', name: 'double bar' },
      { latex: '\\lfloor', display: '⌊', name: 'left floor' },
      { latex: '\\rfloor', display: '⌋', name: 'right floor' },
      { latex: '\\lceil', display: '⌈', name: 'left ceiling' },
      { latex: '\\rceil', display: '⌉', name: 'right ceiling' },
      { latex: '\\left( \\right)', display: '( )', name: 'auto paren' },
      { latex: '\\left[ \\right]', display: '[ ]', name: 'auto bracket' },
      { latex: '\\left\\{ \\right\\}', display: '{ }', name: 'auto brace' },
    ]
  },
  {
    name: 'Dots & Accents',
    icon: '⋯',
    symbols: [
      { latex: '\\cdots', display: '⋯', name: 'center dots' },
      { latex: '\\ldots', display: '…', name: 'lower dots' },
      { latex: '\\vdots', display: '⋮', name: 'vertical dots' },
      { latex: '\\ddots', display: '⋱', name: 'diagonal dots' },
      { latex: '\\prime', display: '′', name: 'prime' },
      { latex: "''", display: '″', name: 'double prime' },
      { latex: '\\degree', display: '°', name: 'degree' },
      { latex: '\\angle', display: '∠', name: 'angle' },
      { latex: '\\sphericalangle', display: '∢', name: 'spherical angle' },
      { latex: '\\triangle', display: '△', name: 'triangle' },
      { latex: '\\square', display: '□', name: 'square' },
      { latex: '\\diamond', display: '◇', name: 'diamond' },
      { latex: '\\checkmark', display: '✓', name: 'checkmark' },
      { latex: '\\ell', display: 'ℓ', name: 'ell' },
      { latex: '\\hbar', display: 'ℏ', name: 'h-bar' },
      { latex: '\\imath', display: 'ı', name: 'dotless i' },
      { latex: '\\jmath', display: 'ȷ', name: 'dotless j' },
    ]
  },
  {
    name: 'Spacing',
    icon: '⎵',
    symbols: [
      { latex: '\\,', display: '(thin)', name: 'thin space' },
      { latex: '\\:', display: '(med)', name: 'medium space' },
      { latex: '\\;', display: '(thick)', name: 'thick space' },
      { latex: '\\!', display: '(neg)', name: 'negative space' },
      { latex: '\\quad', display: '(quad)', name: 'quad' },
      { latex: '\\qquad', display: '(qquad)', name: 'double quad' },
      { latex: '~', display: '(nbsp)', name: 'non-breaking' },
      { latex: '\\text{ }', display: '(text)', name: 'text space' },
    ]
  },
];

// Template structures
const templates = [
  { name: 'Fraction', latex: '\\frac{numerator}{denominator}', icon: '½' },
  { name: 'Square Root', latex: '\\sqrt{expression}', icon: '√' },
  { name: 'Power', latex: 'base^{exponent}', icon: 'xⁿ' },
  { name: 'Subscript', latex: 'base_{subscript}', icon: 'xₙ' },
  { name: 'Sum', latex: '\\sum_{i=1}^{n} expression', icon: 'Σ' },
  { name: 'Product', latex: '\\prod_{i=1}^{n} expression', icon: '∏' },
  { name: 'Integral', latex: '\\int_{a}^{b} f(x) \\, dx', icon: '∫' },
  { name: 'Limit', latex: '\\lim_{x \\to a} f(x)', icon: 'lim' },
  { name: 'Derivative', latex: '\\frac{d}{dx} f(x)', icon: 'd/dx' },
  { name: 'Partial', latex: '\\frac{\\partial f}{\\partial x}', icon: '∂' },
  { name: '2x2 Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', icon: '⌈⌉' },
  { name: '3x3 Matrix', latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', icon: '⊞' },
  { name: 'Cases', latex: '\\begin{cases} x & \\text{if } x \\geq 0 \\\\ -x & \\text{if } x < 0 \\end{cases}', icon: '{' },
  { name: 'Binomial', latex: '\\binom{n}{k}', icon: '(ⁿₖ)' },
  { name: 'System', latex: '\\begin{aligned} x + y &= 1 \\\\ x - y &= 2 \\end{aligned}', icon: '≡' },
];

const LaTeXEditor: React.FC<LaTeXEditorProps> = ({ initialValue = '', onChange, onClose }) => {
  const [latex, setLatex] = useState(initialValue);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Greek Letters');
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLatex(initialValue);
    setHistory([initialValue]);
    setHistoryIndex(0);
  }, [initialValue]);

  useEffect(() => {
    if (latex.trim()) {
      try {
        // Clean the LaTeX before rendering
        let cleanedLatex = latex.trim();
        // Remove markdown code blocks
        cleanedLatex = cleanedLatex.replace(/```latex\n?/g, '').replace(/```\n?/g, '');
        // Remove display math delimiters
        cleanedLatex = cleanedLatex.replace(/^\$\$([\s\S]*)\$\$$/g, '$1');
        cleanedLatex = cleanedLatex.replace(/^\$(.*)\$$/g, '$1');
        cleanedLatex = cleanedLatex.replace(/^\\\[([\s\S]*)\\\]$/g, '$1');
        cleanedLatex = cleanedLatex.replace(/^\\\((.*)\\\)$/g, '$1');
        cleanedLatex = cleanedLatex.trim();

        const html = katex.renderToString(cleanedLatex, {
          throwOnError: false,
          displayMode: true,
          strict: false,
          output: 'html',
          trust: true,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
            '\\Q': '\\mathbb{Q}',
            '\\C': '\\mathbb{C}',
          },
        });
        setRenderedHtml(html);
        setRenderError(null);
      } catch (error) {
        setRenderError(error instanceof Error ? error.message : 'Render error');
        setRenderedHtml('');
      }
    } else {
      setRenderedHtml('');
      setRenderError(null);
    }
  }, [latex]);

  const handleChange = (newValue: string) => {
    setLatex(newValue);
    onChange?.(newValue);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = latex.substring(0, start) + symbol + latex.substring(end);
      handleChange(newValue);
      
      // Set cursor position after the inserted symbol
      setTimeout(() => {
        textarea.focus();
        const newPos = start + symbol.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    } else {
      handleChange(latex + symbol);
    }
  };

  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = latex.substring(start, end);
      
      // If there's selected text, try to use it in the template
      let insertText = template;
      if (selectedText) {
        // Replace first placeholder with selected text
        insertText = template.replace(/expression|numerator|base|f\(x\)|a/, selectedText);
      }
      
      const newValue = latex.substring(0, start) + insertText + latex.substring(end);
      handleChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
      }, 0);
    } else {
      handleChange(latex + template);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLatex(history[historyIndex - 1]);
      onChange?.(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLatex(history[historyIndex + 1]);
      onChange?.(history[historyIndex + 1]);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(latex);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = latex;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 border-b border-gray-700 p-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button
              onClick={() => insertSymbol('^{}')}
              className="p-2 hover:bg-gray-700 rounded"
              title="Superscript"
            >
              <Superscript className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSymbol('_{}')}
              className="p-2 hover:bg-gray-700 rounded"
              title="Subscript"
            >
              <Subscript className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSymbol('\\frac{}{}')}
              className="p-2 hover:bg-gray-700 rounded"
              title="Fraction"
            >
              <Divide className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSymbol('\\sqrt{}')}
              className="p-2 hover:bg-gray-700 rounded text-lg font-serif"
              title="Square Root"
            >
              √
            </button>
            <button
              onClick={() => insertSymbol('\\sum_{i=1}^{n}')}
              className="p-2 hover:bg-gray-700 rounded"
              title="Sum"
            >
              <Sigma className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSymbol('\\int_{a}^{b}')}
              className="p-2 hover:bg-gray-700 rounded text-lg"
              title="Integral"
            >
              ∫
            </button>
            <button
              onClick={() => insertSymbol('\\infty')}
              className="p-2 hover:bg-gray-700 rounded"
              title="Infinity"
            >
              <Infinity className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertSymbol('\\rightarrow')}
              className="p-2 hover:bg-gray-700 rounded"
              title="Arrow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${showTemplates ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              <Type className="w-4 h-4" />
              Templates
              <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded ${showPreview ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-700 rounded"
              title="Copy LaTeX"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                title="Close Editor"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Templates dropdown */}
        {showTemplates && (
          <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-gray-600">
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-1">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => {
                    insertTemplate(template.latex);
                    setShowTemplates(false);
                  }}
                  className="p-2 hover:bg-gray-700 rounded text-center"
                  title={template.name}
                >
                  <span className="text-lg block">{template.icon}</span>
                  <span className="text-xs text-gray-400 truncate block">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Symbol Panel */}
        <div className="lg:w-64 bg-gray-850 border-b lg:border-b-0 lg:border-r border-gray-700 max-h-96 lg:max-h-[500px] overflow-y-auto">
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Symbol Palette
            </h3>
            {symbolCategories.map((category) => (
              <div key={category.name} className="mb-1">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category.name ? null : category.name)}
                  className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-700 rounded text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-center text-base">{category.icon}</span>
                    <span>{category.name}</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedCategory === category.name ? 'rotate-90' : ''}`} />
                </button>
                {expandedCategory === category.name && (
                  <div className="grid grid-cols-6 gap-0.5 p-1 bg-gray-800 rounded mt-1">
                    {category.symbols.map((symbol) => (
                      <button
                        key={symbol.latex}
                        onClick={() => insertSymbol(symbol.latex)}
                        className="p-1.5 hover:bg-gray-600 rounded text-center text-lg transition-colors"
                        title={`${symbol.name} (${symbol.latex})`}
                      >
                        {symbol.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-[300px]">
          {/* Text Editor */}
          <div className="flex-1 p-2">
            <textarea
              ref={textareaRef}
              value={latex}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter or edit LaTeX code here..."
              className="w-full h-full min-h-[150px] bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
              style={{ fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace' }}
            />
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="border-t border-gray-700 p-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Live Preview
              </div>
              <div className="bg-white rounded-lg p-4 min-h-[60px] flex items-center justify-center overflow-x-auto">
                {renderError ? (
                  <span className="text-red-500 text-sm">{renderError}</span>
                ) : renderedHtml ? (
                  <div 
                    className="katex-preview text-black"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm italic">Preview will appear here...</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-900 border-t border-gray-700 px-3 py-1.5 flex items-center justify-between text-xs text-gray-500">
        <span>{latex.length} characters</span>
        <span>LaTeX Editor • MathVision Pro</span>
      </div>
    </div>
  );
};

export default LaTeXEditor;
