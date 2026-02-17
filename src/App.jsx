import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { 
  Calculator, Activity, FlaskConical, BookOpen, Settings, 
  ChevronDown, Send, Menu, X, Sigma, FunctionSquare,
  Binary, TrendingUp, Info, GraduationCap, LayoutGrid, X as CloseIcon 
} from 'lucide-react';

/**
 * AXIOM GRAPHICAL CALCULATOR - PHASE 1 (WEB)
 * ------------------------------------------
 * A curriculum-aware educational tool.
 */

// --- 1. CURRICULUM INTELLIGENCE ENGINE ---

const CURRICULA = {
  DEFAULT: {
    id: 'default',
    label: 'Standard (Axiom)',
    color: 'indigo',
    config: {
      precision: 4,
      g: 9.81, // Standard Physics
      chem_notation: 'IUPAC'
    },
    guidelines: "Standard scientific notation. No specific rounding enforcement."
  },
  CAPS: {
    id: 'caps',
    label: 'South Africa (DBE CAPS)',
    color: 'emerald',
    config: {
      precision: 2, // CAPS strictly emphasizes 2 decimal places
      g: 9.8, // DBE uses 9.8 exactly
      chem_notation: 'Standard'
    },
    guidelines: "Round to 2 decimal places. Show formula substitution steps. Physics g = 9.8 m/s²."
  },
  CAMBRIDGE: {
    id: 'cambridge',
    label: 'Cambridge Int. (AS/A Level)',
    color: 'rose',
    config: {
      precision: 3, // Significant figures focus
      g: 9.81, 
      chem_notation: 'A-Level'
    },
    guidelines: "Final answers to 3 significant figures. Use g = 9.81 m/s². Working must show method marks (M1)."
  },
  IEB: {
    id: 'ieb',
    label: 'IEB (Independent)',
    color: 'amber',
    config: {
      precision: 2,
      g: 9.8,
      chem_notation: 'Standard'
    },
    guidelines: "Critical thinking focus. Rounding applies to final answer only."
  }
};

// --- 2. HELPER FUNCTIONS (MATH ENGINE) ---

// A safe math evaluator for the demo
const safeEvaluate = (expression) => {
  try {
    // Basic sanitization
    const sanitized = expression
      .replace(/x/g, '1') // For simple calc, replace variable with 1
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/pi/g, 'Math.PI')
      .replace(/sqrt/g, 'Math.sqrt');
    
    // eslint-disable-next-line
    const result = Function(`"use strict"; return (${sanitized})`)();
    return result;
  } catch (e) {
    return "Err";
  }
};

// Generates simulated "Step-by-Step" LaTeX style instructions
const generateAIProof = (expression, result, curriculum) => {
  const precision = CURRICULA[curriculum].config.precision;
  
  return [
    { type: 'text', content: 'Identify the operation:' },
    { type: 'math', content: `f(x) = ${expression}` },
    { type: 'text', content: 'Apply order of operations (BODMAS):' },
    { type: 'math', content: `= ${result}` }, // Simplified for demo
    { type: 'text', content: `Apply ${CURRICULA[curriculum].label} rounding rules:` },
    { type: 'final', content: typeof result === 'number' ? result.toFixed(precision) : result }
  ];
};

// --- 3. SUB-COMPONENTS ---

// LaTeX-styled Text Component
const LatexText = ({ children, className = "", isDisplay = false }) => (
  <span 
    className={`${className} ${isDisplay ? 'text-2xl block my-2 text-center' : ''}`} 
    style={{ fontFamily: '"Times New Roman", Times, serif', fontStyle: 'italic' }}
  >
    {children}
  </span>
);

// Scientific Calculator Module
const ScientificModule = ({ curriculum }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [currentSteps, setCurrentSteps] = useState([]);

  const handleCalc = () => {
    const res = safeEvaluate(input);
    const steps = generateAIProof(input, res, curriculum);
    setHistory([{ exp: input, res }, ...history]);
    setCurrentSteps(steps);
    setShowSteps(true);
  };

  const keys = [
    'sin', 'cos', 'tan', '(', ')', 'AC',
    '7', '8', '9', '÷', 'DEL', 'sqrt',
    '4', '5', '6', '×', '^', 'log',
    '1', '2', '3', '-', 'pi', 'ln',
    '0', '.', '=', '+', 'ans', 'exp'
  ];

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Calculator Body */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-w-2xl mx-auto">
        <div className="bg-slate-50 p-6 flex-1 flex flex-col justify-end text-right border-b border-slate-100">
          <div className="text-slate-400 font-mono text-sm h-6">{history[0]?.exp}</div>
          <input 
            className="w-full bg-transparent text-4xl font-serif text-slate-800 text-right outline-none placeholder-slate-200"
            placeholder="0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-6 gap-px bg-slate-100">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => {
                if(key === '=') handleCalc();
                else if(key === 'AC') setInput('');
                else if(key === 'DEL') setInput(input.slice(0,-1));
                else if(key === '÷') setInput(input + '/');
                else if(key === '×') setInput(input + '*');
                else setInput(input + key);
              }}
              className={`
                h-16 text-lg font-medium transition-colors
                ${['=', 'AC', 'DEL'].includes(key) ? 'bg-indigo-50 text-indigo-600 font-bold' : 'bg-white text-slate-600 hover:bg-slate-50'}
              `}
            >
              <LatexText>{key}</LatexText>
            </button>
          ))}
        </div>
      </div>

      {/* AI Steps Panel */}
      {showSteps && (
        <div className="w-80 bg-white rounded-3xl shadow-lg border border-indigo-100 p-6 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <GraduationCap size={20} />
            <span className="font-bold text-sm uppercase tracking-wider">Solution Steps</span>
          </div>
          <div className="space-y-4">
            {currentSteps.map((step, i) => (
              <div key={i} className="text-slate-700">
                {step.type === 'text' && <p className="text-xs text-slate-400 font-sans mb-1">{step.content}</p>}
                {step.type === 'math' && <LatexText isDisplay>{step.content}</LatexText>}
                {step.type === 'final' && (
                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                    <span className="text-xs text-indigo-400 uppercase font-bold block mb-1">Final Answer</span>
                    <LatexText className="text-3xl text-indigo-700 font-bold">{step.content}</LatexText>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Graphing Module
const GraphingModule = () => {
  const [func, setFunc] = useState('x^2 - 4');
  const [data, setData] = useState([]);

  useEffect(() => {
    const pts = [];
    for(let x = -10; x <= 10; x+=0.5) {
      try {
        // Safe plotting eval
        const val = safeEvaluate(func.replace(/x/g, `(${x})`));
        pts.push({ x, y: val });
      } catch(e) {}
    }
    setData(pts);
  }, [func]);

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-serif italic font-bold">f(x)</div>
        <input 
          value={func}
          onChange={(e) => setFunc(e.target.value)}
          className="flex-1 text-xl font-serif outline-none text-slate-700"
          placeholder="Enter function..."
        />
        <div className="flex gap-2">
           {['x^2', 'sin(x)', 'x^3'].map(f => (
             <button key={f} onClick={() => setFunc(f)} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono hover:bg-slate-200">{f}</button>
           ))}
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="x" type="number" domain={[-10, 10]} allowDataOverflow={false} tickCount={10} />
            <YAxis domain={['auto', 'auto']} allowDataOverflow={false} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <ReferenceLine x={0} stroke="#94a3b8" />
            <Line type="monotone" dataKey="y" stroke="#4f46e5" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Physics Sandbox
const PhysicsModule = ({ curriculum }) => {
  const [v0, setV0] = useState(50);
  const [theta, setTheta] = useState(45);
  const g = CURRICULA[curriculum].config.g; // Logic hook

  const data = useMemo(() => {
    const pts = [];
    const rad = theta * Math.PI / 180;
    const totalTime = (2 * v0 * Math.sin(rad)) / g;
    
    for(let t=0; t<=totalTime; t+=totalTime/50) {
      pts.push({
        x: (v0 * Math.cos(rad) * t).toFixed(2),
        y: ((v0 * Math.sin(rad) * t) - (0.5 * g * t * t)).toFixed(2)
      });
    }
    return pts;
  }, [v0, theta, g]);

  return (
    <div className="flex h-full p-4 gap-4">
      {/* Controls */}
      <div className="w-80 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-8">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
            <Settings size={16} /> Variables
          </h3>
          <p className="text-xs text-slate-400">Curriculum Constant g = {g}</p>
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
            Initial Velocity (v)
            <span className="text-indigo-600 font-mono">{v0} m/s</span>
          </label>
          <input type="range" min="10" max="100" value={v0} onChange={e=>setV0(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
            Angle (θ)
            <span className="text-indigo-600 font-mono">{theta}°</span>
          </label>
          <input type="range" min="0" max="90" value={theta} onChange={e=>setTheta(Number(e.target.value))} className="w-full accent-indigo-600" />
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-auto">
          <h4 className="font-bold text-xs text-slate-400 uppercase mb-2">Calculated Max Height</h4>
          <LatexText className="text-2xl text-slate-800 block">
            {((Math.pow(v0 * Math.sin(theta * Math.PI / 180), 2)) / (2 * g)).toFixed(2)} m
          </LatexText>
        </div>
      </div>

      {/* Sandbox View */}
      <div className="flex-1 bg-slate-900 rounded-2xl shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="x" type="number" hide />
            <YAxis dataKey="y" type="number" domain={[0, 'auto']} hide />
            <Line type="monotone" dataKey="y" stroke="#818cf8" strokeWidth={4} dot={false} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-xs text-white border border-white/10">
          Simulation Mode: Projectile Motion
        </div>
      </div>
    </div>
  );
};

// Curriculum Info Page
const InfoModule = ({ curriculum }) => {
  const c = CURRICULA[curriculum];
  
  return (
    <div className="h-full p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className={`bg-${c.color}-600 text-white p-10 rounded-3xl shadow-lg mb-8`}>
          <h2 className="text-4xl font-serif font-bold mb-2">{c.label}</h2>
          <p className="opacity-90 text-lg">Official Syllabus Guidelines (2025-2027)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <BookOpen size={20} className={`text-${c.color}-600`} />
              Assessment Standards
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {c.guidelines}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Binary size={20} className={`text-${c.color}-600`} />
              Calculator Configuration
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Decimal Precision</span>
                <span className="font-mono font-bold text-slate-800">{c.config.precision} Places</span>
              </li>
              <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Gravitational Constant (g)</span>
                <span className="font-mono font-bold text-slate-800">{c.config.g} m/s²</span>
              </li>
              <li className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-500">Chemistry Notation</span>
                <span className="font-mono font-bold text-slate-800">{c.config.chem_notation}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. MAIN APP CONTROLLER (ENTRY POINT) ---

export default function App() {
  const [activeTab, setActiveTab] = useState('scientific');
  const [curriculum, setCurriculum] = useState('DEFAULT');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const CurrentIcon = {
    scientific: Calculator,
    graph: TrendingUp,
    physics: Activity,
    info: BookOpen
  }[activeTab];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col h-screen overflow-hidden">
      
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg z-20 flex justify-between items-center h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold font-serif text-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            A
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">AXIOM</span>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 border border-slate-700">
            Phase 1
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Curriculum Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
            >
              <span className="text-slate-400 hidden sm:inline">Curriculum:</span>
              <span className={`font-bold text-${CURRICULA[curriculum].color}-400`}>
                {CURRICULA[curriculum].label}
              </span>
              <ChevronDown size={14} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {Object.values(CURRICULA).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCurriculum(c.id.toUpperCase());
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center justify-between
                      ${curriculum === c.id.toUpperCase() ? `bg-${c.color}-50 text-${c.color}-700 font-bold` : 'text-slate-600'}
                    `}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 shrink-0 z-10">
          {[
            { id: 'scientific', icon: Calculator, label: 'Calc' },
            { id: 'graph', icon: FunctionSquare, label: 'Graph' },
            { id: 'physics', icon: Activity, label: 'Phys' },
            { id: 'info', icon: BookOpen, label: 'Info' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 w-14 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}
              `}
            >
              <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Workspace */}
        <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-50">
          <div className="h-14 border-b border-slate-200 bg-white flex justify-between items-center px-6 shrink-0">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2 capitalize">
              <CurrentIcon size={20} className="text-indigo-500"/> 
              {activeTab === 'scientific' ? 'Scientific Calculator' : 
               activeTab === 'graph' ? 'Graphical Engine' : 
               activeTab === 'physics' ? 'Physics Sandbox' : 'Curriculum Info'}
            </h2>
          </div>

          <div className="flex-1 p-0 overflow-hidden">
            {activeTab === 'scientific' && <ScientificModule curriculum={curriculum} />}
            {activeTab === 'graph' && <GraphingModule />}
            {activeTab === 'physics' && <PhysicsModule curriculum={curriculum} />}
            {activeTab === 'info' && <InfoModule curriculum={curriculum} />}
          </div>
        </main>
      </div>
    </div>
  );
}
