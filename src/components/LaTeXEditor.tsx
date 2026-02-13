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
  X,
  ArrowUpRight,
  RotateCcw,
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LaTeXEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onClose?: () => void;
  onPushToOutput?: (latex: string) => void;
}

interface SymbolItem {
  latex: string;
  display: string;
  name: string;
  wide?: boolean; // for items that need more width
}

interface SymbolCategory {
  name: string;
  icon: string;
  columns?: number; // override default grid columns
  symbols: SymbolItem[];
}

// Symbol categories with extensive symbols like MathType
const symbolCategories: SymbolCategory[] = [
  {
    name: 'Greek Letters',
    icon: 'α',
    columns: 7,
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
    columns: 7,
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
    columns: 7,
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
    columns: 7,
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
    columns: 6,
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
    columns: 6,
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
    columns: 5,
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
      { latex: "\\frac{\\mathrm{d}}{\\mathrm{d}x}", display: 'd/dx', name: 'derivative', wide: true },
      { latex: "\\frac{\\partial}{\\partial x}", display: '∂/∂x', name: 'partial derivative', wide: true },
    ]
  },
  {
    name: 'Functions',
    icon: 'f(x)',
    columns: 4,
    symbols: [
      { latex: '\\sin', display: 'sin', name: 'sine', wide: true },
      { latex: '\\cos', display: 'cos', name: 'cosine', wide: true },
      { latex: '\\tan', display: 'tan', name: 'tangent', wide: true },
      { latex: '\\cot', display: 'cot', name: 'cotangent', wide: true },
      { latex: '\\sec', display: 'sec', name: 'secant', wide: true },
      { latex: '\\csc', display: 'csc', name: 'cosecant', wide: true },
      { latex: '\\arcsin', display: 'arcsin', name: 'arcsine', wide: true },
      { latex: '\\arccos', display: 'arccos', name: 'arccosine', wide: true },
      { latex: '\\arctan', display: 'arctan', name: 'arctangent', wide: true },
      { latex: '\\sinh', display: 'sinh', name: 'hyperbolic sine', wide: true },
      { latex: '\\cosh', display: 'cosh', name: 'hyperbolic cosine', wide: true },
      { latex: '\\tanh', display: 'tanh', name: 'hyperbolic tangent', wide: true },
      { latex: '\\log', display: 'log', name: 'logarithm', wide: true },
      { latex: '\\ln', display: 'ln', name: 'natural log', wide: true },
      { latex: '\\lg', display: 'lg', name: 'log base 2', wide: true },
      { latex: '\\exp', display: 'exp', name: 'exponential', wide: true },
      { latex: '\\det', display: 'det', name: 'determinant', wide: true },
      { latex: '\\dim', display: 'dim', name: 'dimension', wide: true },
      { latex: '\\ker', display: 'ker', name: 'kernel', wide: true },
      { latex: '\\gcd', display: 'gcd', name: 'gcd', wide: true },
      { latex: '\\min', display: 'min', name: 'minimum', wide: true },
      { latex: '\\max', display: 'max', name: 'maximum', wide: true },
      { latex: '\\sup', display: 'sup', name: 'supremum', wide: true },
      { latex: '\\inf', display: 'inf', name: 'infimum', wide: true },
    ]
  },
  {
    name: 'Structures',
    icon: '√',
    columns: 3,
    symbols: [
      { latex: '\\frac{a}{b}', display: 'a/b', name: 'fraction', wide: true },
      { latex: '\\sqrt{x}', display: '√x', name: 'square root', wide: true },
      { latex: '\\sqrt[n]{x}', display: 'ⁿ√x', name: 'nth root', wide: true },
      { latex: 'x^{n}', display: 'xⁿ', name: 'power', wide: true },
      { latex: 'x_{n}', display: 'xₙ', name: 'subscript', wide: true },
      { latex: 'x^{a}_{b}', display: 'xᵃᵦ', name: 'super and sub', wide: true },
      { latex: '\\binom{n}{k}', display: '(n k)', name: 'binomial', wide: true },
      { latex: '\\sum_{i=1}^{n}', display: 'Σᵢ₌₁ⁿ', name: 'sum with limits', wide: true },
      { latex: '\\prod_{i=1}^{n}', display: '∏ᵢ₌₁ⁿ', name: 'product with limits', wide: true },
      { latex: '\\int_{a}^{b}', display: '∫ₐᵇ', name: 'definite integral', wide: true },
      { latex: '\\lim_{x \\to a}', display: 'limₓ→ₐ', name: 'limit notation', wide: true },
      { latex: '\\overline{x}', display: 'x̄', name: 'overline', wide: true },
      { latex: '\\underline{x}', display: 'x̲', name: 'underline', wide: true },
      { latex: '\\hat{x}', display: 'x̂', name: 'hat', wide: true },
      { latex: '\\tilde{x}', display: 'x̃', name: 'tilde', wide: true },
      { latex: '\\vec{x}', display: 'x⃗', name: 'vector', wide: true },
      { latex: '\\dot{x}', display: 'ẋ', name: 'dot', wide: true },
      { latex: '\\ddot{x}', display: 'ẍ', name: 'double dot', wide: true },
      { latex: '\\bar{x}', display: 'x̄', name: 'bar', wide: true },
    ]
  },
  {
    name: 'Matrices',
    icon: '▦',
    columns: 2,
    symbols: [
      { latex: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', display: 'plain matrix', name: 'matrix', wide: true },
      { latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', display: '( matrix )', name: 'pmatrix', wide: true },
      { latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', display: '[ matrix ]', name: 'bmatrix', wide: true },
      { latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', display: '| matrix |', name: 'vmatrix', wide: true },
      { latex: '\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}', display: '‖ matrix ‖', name: 'Vmatrix', wide: true },
      { latex: '\\begin{cases} a & \\text{if } x > 0 \\\\ b & \\text{otherwise} \\end{cases}', display: '{ cases', name: 'cases', wide: true },
      { latex: '\\begin{array}{cc} a & b \\\\ c & d \\end{array}', display: 'array', name: 'array', wide: true },
      { latex: '\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}', display: 'aligned', name: 'aligned', wide: true },
    ]
  },
  {
    name: 'Brackets',
    icon: '( )',
    columns: 6,
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
      { latex: '\\left( \\right)', display: 'auto ( )', name: 'auto paren', wide: true },
      { latex: '\\left[ \\right]', display: 'auto [ ]', name: 'auto bracket', wide: true },
      { latex: '\\left\\{ \\right\\}', display: 'auto { }', name: 'auto brace', wide: true },
    ]
  },
  {
    name: 'Dots & Accents',
    icon: '⋯',
    columns: 6,
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
    columns: 2,
    symbols: [
      { latex: '\\,', display: 'thin space  \\,', name: 'thin space (3/18 em)', wide: true },
      { latex: '\\:', display: 'medium space  \\:', name: 'medium space (4/18 em)', wide: true },
      { latex: '\\;', display: 'thick space  \\;', name: 'thick space (5/18 em)', wide: true },
      { latex: '\\!', display: 'neg thin space  \\!', name: 'negative thin space (-3/18 em)', wide: true },
      { latex: '\\quad', display: 'quad space  \\quad', name: 'quad (1 em)', wide: true },
      { latex: '\\qquad', display: 'double quad  \\qquad', name: 'double quad (2 em)', wide: true },
      { latex: '~', display: 'non-breaking  ~', name: 'non-breaking space', wide: true },
      { latex: '\\text{ }', display: 'text space  \\text{ }', name: 'text space', wide: true },
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

const LaTeXEditor: React.FC<LaTeXEditorProps> = ({ initialValue = '', onChange, onClose, onPushToOutput }) => {
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
        let cleanedLatex = latex.trim();
        cleanedLatex = cleanedLatex.replace(/```latex\n?/g, '').replace(/```\n?/g, '');
        cleanedLatex = cleanedLatex.replace(/^\$\$([\s\S]*)\$\$$/g, '$1');
        cleanedLatex = cleanedLatex.replace(/^\$(.*)$$/g, '$1');
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
      
      let insertText = template;
      if (selectedText) {
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

  // Get grid class based on column count
  const getGridClass = (cols: number) => {
    switch (cols) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      case 7: return 'grid-cols-7';
      default: return 'grid-cols-6';
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
            {onPushToOutput && (
              <button
                onClick={() => {
                  if (latex.trim()) {
                    onPushToOutput(latex);
                  }
                }}
                disabled={!latex.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Convert & push to Output Panel"
              >
                <ArrowUpRight className="w-4 h-4" />
                Push to Output
              </button>
            )}
            {onPushToOutput && (
              <button
                onClick={() => {
                  handleChange('');
                }}
                className="p-2 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                title="Clear editor"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
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
        <div className="lg:w-72 bg-gray-850 border-b lg:border-b-0 lg:border-r border-gray-700 max-h-96 lg:max-h-[500px] overflow-y-auto symbol-palette-scroll">
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
                    <span className="w-6 text-center text-sm flex-shrink-0">{category.icon}</span>
                    <span className="text-gray-200">{category.name}</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${expandedCategory === category.name ? 'rotate-90' : ''}`} />
                </button>
                {expandedCategory === category.name && (
                  <div 
                    className={`grid ${getGridClass(category.columns || 6)} gap-0.5 p-1.5 bg-gray-800/80 rounded-lg mt-1 border border-gray-700/50`}
                  >
                    {category.symbols.map((symbol, idx) => (
                      <button
                        key={`${symbol.latex}-${idx}`}
                        onClick={() => insertSymbol(symbol.latex)}
                        className={`
                          hover:bg-violet-600/40 rounded transition-colors text-center border border-transparent hover:border-violet-500/50
                          ${symbol.wide 
                            ? 'px-2 py-1.5 text-xs font-mono whitespace-nowrap overflow-hidden text-ellipsis' 
                            : 'p-1.5 text-base'
                          }
                        `}
                        title={`${symbol.name}\n${symbol.latex}`}
                      >
                        <span className={symbol.wide ? 'text-xs' : 'text-base'}>
                          {symbol.display}
                        </span>
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
