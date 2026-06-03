import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Layers, 
  Shield, 
  Check, 
  ArrowUpRight, 
  TrendingUp, 
  Users, 
  Cpu, 
  HelpCircle, 
  Star,
  MessageSquare,
  Moon,
  Sun,
  Code,
  Terminal,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import { Agent } from '../types';

interface SardyxLandingProps {
  onGetStarted: () => void;
  onSelectAgent: (agentId: string) => void;
  agents: Agent[];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function SardyxLanding({ 
  onGetStarted, 
  onSelectAgent, 
  agents, 
  darkMode, 
  setDarkMode 
}: SardyxLandingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'agents' | 'performance' | 'security'>('agents');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [selectedAgentPreview, setSelectedAgentPreview] = useState<string>(agents[0]?.id || '');

  // Filter agents for landing preview
  const previewAgents = agents.slice(0, 4);
  const selectedAgent = agents.find(a => a.id === selectedAgentPreview) || agents[0];

  const toggleBilling = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const faqItems = [
    {
      q: "What makes Sardyx AI different from default chatbots?",
      a: "Sardyx isn't a single conversation instance; it's a modular, multi-agent AI operating platform. It features persistent agent configurations, dual standard LLM and Custom OpenRouter mapping, automated analytics tracking, and strict session guards that allow teams to build a contextual memory database for business, code, and marketing."
    },
    {
      q: "Can I connect my own custom OpenAI or OpenRouter key?",
      a: "Absolutely. Sardyx runs with a secure server-side architecture. You can supply your own custom `LLM_API_URL` and `LLM_API_KEY` environment variables. The API calls are proxy-routed server-side, protecting your credential secrets from reaching the browser completely."
    },
    {
      q: "Does my data persist between browsing sessions?",
      a: "Yes. By utilizing integrated Firestore databases and authenticated user session persistence, your agents, chat folders, and historical logs are saved securely and persistently under your unique encryption boundary."
    },
    {
      q: "How do plan message limits and usage counters operate?",
      a: "Usage counters are tracked dynamically per user document. Free users receive up to 50 server-side messages. Pro and Enterprise layers enjoy elevated limits, full custom API integration, advanced strategist units, and priority real-time stream buffers."
    },
    {
      q: "Is there any setup required to use standard tools?",
      a: "None. When you launch Sardyx, our preloaded models utilize active Gemini endpoints to serve instant response streams out-of-the-box."
    }
  ];

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-500 ${
      darkMode ? 'bg-[#050508] text-slate-200' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Ambient Glows */}
      {darkMode && (
        <>
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
        </>
      )}

      {/* Navigation Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode ? 'bg-black/10 border-white/5' : 'bg-white/80 border-zinc-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-xl text-white">
                Sardyx AI
              </span>
              <span className="text-[10px] font-mono tracking-widest block uppercase text-slate-500 -mt-1 font-bold">
                Neural Workspace
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#showcase" className={`transition-colors hover:${darkMode ? 'text-white' : 'text-zinc-950'} ${darkMode ? 'text-slate-400' : 'text-zinc-600'}`}>Workspace</a>
            <a href="#features" className={`transition-colors hover:${darkMode ? 'text-white' : 'text-zinc-950'} ${darkMode ? 'text-slate-400' : 'text-zinc-600'}`}>Features</a>
            <a href="#pricing" className={`transition-colors hover:${darkMode ? 'text-white' : 'text-zinc-950'} ${darkMode ? 'text-slate-400' : 'text-zinc-600'}`}>Pricing</a>
            <a href="#faq" className={`transition-colors hover:${darkMode ? 'text-white' : 'text-zinc-950'} ${darkMode ? 'text-slate-400' : 'text-zinc-600'}`}>FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border transition-all ${
                darkMode 
                  ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' 
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button 
              id="nav-get-started-btn"
              onClick={onGetStarted}
              className={`relative group overflow-hidden px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.25)]' 
                  : 'bg-zinc-900 text-white shadow-md'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sardyx Neural Workspace System Active</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6 font-display">
            Your Personal <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 bg-clip-text text-transparent">
              AI Workforce Platform
            </span>
          </h1>

          {/* Description */}
          <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 transition-colors duration-300 ${
            darkMode ? 'text-slate-400' : 'text-zinc-600'
          }`}>
            Automate daily development, marketing, business, and writing pipelines. A stunning UI packed with state saving, multi-agent modules, and custom enterprise metrics.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#pricing"
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold border transition-all duration-300 text-center ${
                darkMode 
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' 
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              View Pricing
            </a>
          </div>

          {/* Platform Screenshot Simulated Wireframe Card */}
          <div className={`relative rounded-3xl border p-2 md:p-3 shadow-2xl transition-all duration-500 ${
            darkMode 
              ? 'bg-black/40 border-white/5 backdrop-blur-md shadow-black/80' 
              : 'bg-white border-zinc-200 shadow-zinc-300/40'
          }`}>
            {/* Window chrome controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0a0a0f]/80 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="text-xs font-mono font-medium text-slate-500">
                https://ais-pre-sardyx.run.app/workspace
              </div>
              <div className="w-4" />
            </div>

            {/* Wireframe Workspace Design */}
            <div className="grid grid-cols-12 gap-4 p-4 min-h-[350px] text-left">
              {/* Fake Workspace sidebar */}
              <div className="col-span-3 hidden md:flex flex-col gap-6 border-r border-white/5 pr-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-xs font-mono">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
                  Sardyx AI OS
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-slate-500">Agent Units</div>
                  {previewAgents.map(agent => (
                    <div 
                      key={agent.id}
                      onClick={() => setSelectedAgentPreview(agent.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        selectedAgentPreview === agent.id
                          ? 'bg-white/5 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                          : 'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      {agent.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fake Workspace main content */}
              <div className="col-span-12 md:col-span-9 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedAgent.avatar}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{selectedAgent.name}</div>
                        <div className="text-[10px] font-mono text-blue-400 uppercase font-semibold">{selectedAgent.category}</div>
                      </div>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 font-bold uppercase font-mono tracking-wider">
                      Online
                    </div>
                  </div>

                  {/* Message bubble demo */}
                  <div className="space-y-4 font-sans max-h-[220px] overflow-y-auto">
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">👤</div>
                      <div className="flex-1 rounded-xl p-3 text-xs bg-white/[0.03] text-slate-300 border border-white/5">
                        Help me design a strategy outline for our new micro-SaaS framework.
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <span className="text-base">{selectedAgent.avatar}</span>
                      <div className="flex-1 rounded-xl p-3 text-xs bg-blue-500/5 border border-blue-500/10">
                        <div className="font-semibold text-blue-400 mb-1">
                          {selectedAgent.name} • Personality: {selectedAgent.personality}
                        </div>
                        <p className="leading-relaxed mb-2 text-slate-300">
                          Excellent inquiry. For a micro-SaaS framework, let's configure the operational blueprint:
                        </p>
                        <ul className="list-disc pl-4 space-y-1 mb-2 text-slate-300">
                          <li>Secure backend routes (never expose client keys)</li>
                          <li>Establish simple React triggers or CSS micro-animations</li>
                          <li>Activate the {selectedAgent.name} strategic prompt module</li>
                        </ul>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-slate-400 mt-1 font-bold border border-white/5">
                          <Terminal className="w-3 h-3 text-green-500" /> SYSTEM PROMPT EMBEDDED
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask standard prompt suggestion..." 
                    disabled
                    className="flex-1 rounded-lg px-3 py-2 text-xs border border-white/5 bg-black/40 text-slate-400 outline-none"
                    value={selectedAgent.promptSuggestions[0]}
                  />
                  <button 
                    id="sim-workspace-btn"
                    onClick={() => onSelectAgent(selectedAgent.id)}
                    className="px-4 py-2 text-xs bg-blue-600 text-white hover:bg-blue-500 rounded-lg font-bold flex items-center gap-1 group shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform cursor-pointer"
                  >
                    <span>Use Agent</span> <Play className="w-3 h-3 group-hover:scale-125 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className={`border-y transition-colors duration-300 ${
        darkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-100/50 border-zinc-200'
      } py-10`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              99.8%
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">API Reachability</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              &lt; 450ms
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Response Latency</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              7+ Built-In
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Expert Agents</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Unlimited
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Custom APIs Proxy</div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FEATURE SHOWCASE */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Advanced Design. <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">Extreme Flow.</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto">
            Engineered with a modular full-stack strategy to build the modern internet's fastest AI operations platform.
          </p>
        </div>

        {/* Feature Tabs */}
        <div className="flex justify-center gap-3 mb-12">
          <button 
            id="tab-agents-btn"
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'agents' 
                ? 'bg-white/5 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Sardyx Multi-Agents
          </button>
          <button 
            id="tab-perf-btn"
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'performance' 
                ? 'bg-white/5 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Optimized Execution
          </button>
          <button 
            id="tab-sec-btn"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'security' 
                ? 'bg-white/5 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            Full-Stack Cryptography
          </button>
        </div>

        {/* Dynamic Tab Pane */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-center p-8 rounded-3xl bg-[#0a0a0f] border border-white/5">
          {activeTab === 'agents' && (
            <>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4 text-white">Dedicated Digital Workforce Units</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Select and run custom agents preloaded with rigorous instruction trees for targeted results. Strategists, marketers, copywriters, and developers adjust their vocabulary based on personality keys to align to your company's guidelines.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Auto System Prompt Injectors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Role-Based Personality Adjustment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Quick-Click Command Suggestions</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {agents.slice(0, 4).map((agent) => (
                  <div 
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    className={`p-5 rounded-2xl border cursor-pointer hover:-translate-y-1 transition-all ${
                      darkMode ? 'bg-white/[0.03] border-white/5 hover:border-white/20' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{agent.avatar}</span>
                    <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-1 line-clamp-2">
                      {agent.description}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'performance' && (
            <>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4 text-white">Unprecedented Speed & Loading States</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Standard chat windows often drag because of client rendering overhead. Sardyx utilizes lazy loaded React routers paired with our server-side Node proxy so SSE-rendered tokens hit the client interface in sub-12ms streams.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Server-Sent Events (SSE) Native Stream</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Optimized UI Caching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">No-Flicker Layout Rendering</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Stream Response</span>
                    <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded font-mono font-bold border border-green-500/20">Active</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-450 w-[94%] animate-pulse" />
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Simulated Latency test</span>
                    <span className="text-[11px] font-mono text-slate-400">14ms average</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <TrendingUp className="w-4 h-4" /> Better than 98.4% of alternative LLM models
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/20">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold mb-4 text-white">Enterprise-Level Isolation</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  All requests transit server-side Express handlers. Standard Vercel, Supabase or Firebase configurations protect databases and maintain absolute security boundary isolation for folders and message pipelines.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Encrypted Firestore DB Rules Integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">API Credential Exposure Guards</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Zero-Trust Auth Token Verification</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-black/40 font-mono text-[11px] text-slate-400 border border-white/5">
                  <div className="text-blue-400 mb-1">class SecureServerProxy &#123;</div>
                  <div className="pl-4">private readonly apiKey = process.env.GEMINI_API_KEY;</div>
                  <div className="pl-4 text-green-500">// Never sent to browser client</div>
                  <div className="pl-4 text-green-500">// Fully isolated within express container</div>
                  <div className="pl-4">executeAIRequest() &#123; ... &#125;</div>
                  <div>&#125;</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                  <Code className="w-4 h-4 text-blue-500" /> Strictly isolated system-only credentials
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 font-display">
            Predictable Pricing. <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Scale Instantly.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Get started for free or unlock the full capacity of advanced agents and custom LLM keys.
          </p>

          {/* Monthly / Yearly Switch */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold text-blue-400' : 'text-slate-400'}`}>Monthly</span>
            <button 
              id="billing-toggle-btn"
              onClick={toggleBilling}
              className="w-12 h-6 rounded-full bg-white/5 p-1 relative transition-colors cursor-pointer border border-white/10"
            >
              <div className={`w-4 h-4 rounded-full bg-blue-600 transition-all ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'font-bold text-blue-400' : 'text-slate-400'}`}>
              Yearly <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold border border-blue-500/20">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FREE PLAN */}
          <div className={`p-8 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between ${
            darkMode 
              ? 'bg-white/[0.03] border-white/5 hover:border-white/20' 
              : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-300/20'
          }`}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sandbox Tier</div>
              <h3 className="text-2xl font-extrabold mb-4 text-white">Sardyx Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-sm text-slate-500">/ forever</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Perfect for testing and running standard conversations via Sardyx local simulators.
              </p>
              <div className="space-y-3 border-t border-white/5 pt-6 mb-8">
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>50 messages server limit</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Standard Chat Interface</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Interactive Agent Previews</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 text-sm italic">
                  <span>No custom API inputs</span>
                </div>
              </div>
            </div>
            <button 
              id="get-free-plan-btn"
              onClick={onGetStarted}
              className={`w-full py-3.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                darkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
              }`}
            >
              Get Free Unit
            </button>
          </div>

          {/* PRO PLAN - OPTIMIZED BEST */}
          <div className={`p-8 rounded-3xl border-2 border-blue-600 transition-all duration-300 relative flex flex-col justify-between ${
            darkMode 
              ? 'bg-[#0a0a0f] shadow-2xl shadow-blue-500/5' 
              : 'bg-white shadow-xl shadow-zinc-300/40'
          }`}>
            <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Power Workforce</div>
              <h3 className="text-2xl font-extrabold mb-4 text-white">Sardyx Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === 'monthly' ? '49' : '39'}
                </span>
                <span className="text-sm text-slate-500">/ month</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Unlock custom key proxies, custom agent setups, and unlimited persistent folders.
              </p>
              <div className="space-y-3 border-t border-white/5 pt-6 mb-8">
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-white">Unlimited Custom Keys Proxy</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Google & GitHub Auth Session Persistence</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Unlimited Chat & Folder Search</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Priority Real-time Streaming Response</span>
                </div>
              </div>
            </div>
            <button 
              id="get-pro-plan-btn"
              onClick={onGetStarted}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:scale-[1.01] transition-all text-center cursor-pointer"
            >
              Unlock Pro Operating System
            </button>
          </div>

          {/* ENTERPRISE PLAN */}
          <div className={`p-8 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between ${
            darkMode 
              ? 'bg-white/[0.03] border-white/5 hover:border-white/20' 
              : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-300/20'
          }`}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Consolidated Enterprise</div>
              <h3 className="text-2xl font-extrabold mb-4 text-white">Sardyx Scale</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === 'monthly' ? '199' : '159'}
                </span>
                <span className="text-sm text-slate-500">/ month</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Dedicated servers, custom domain mappings, white-labeled client systems.
              </p>
              <div className="space-y-3 border-t border-white/5 pt-6 mb-8">
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Dedicated high-availability load balancing</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>SLA uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Whiteglove setup & dedicated Slack channel</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited organizational seats</span>
                </div>
              </div>
            </div>
            <button 
              id="get-enterprise-plan-btn"
              onClick={onGetStarted}
              className={`w-full py-3.5 rounded-xl font-bold transition-all text-center cursor-pointer ${
                darkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
              }`}
            >
              Contact Growth Unit
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className={`py-20 transition-colors duration-300 ${
        darkMode ? 'bg-black/40 border-y border-white/5' : 'bg-zinc-100/30'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold font-sans">Trusted by Elite Founders</h2>
            <p className="text-zinc-500 mt-2 text-sm">Powering high-growth startups and developer pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-400 text-sm italic leading-relaxed mb-6">
                &quot;Sardyx completely replaced our default ChatGPT workflow. Having the ability to click and swap preset strategist, marketing, and copywriting agents with persistent memory saved us dozens of hours during our initial product launch.&quot;
              </p>
              <div>
                <div className="font-extrabold text-sm text-white">Sarah Jenkins</div>
                <div className="text-xs text-slate-500 font-medium">Founder, LinearSphere</div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-400 text-sm italic leading-relaxed mb-6">
                &quot;The design and Vercel-style UI makes working here therapeutic. Standard prompts stream with extreme latency, and we easily integrated our secure OpenRouter endpoint for deep writing models.&quot;
              </p>
              <div>
                <div className="font-extrabold text-sm text-white">Marcus Vance</div>
                <div className="text-xs text-slate-500 font-medium">CTO, DevEngine Inc.</div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center gap-1 text-yellow-500 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-400 text-sm italic leading-relaxed mb-6">
                &quot;I have tried Claude, Gemini, and ChatGPT custom setups, but Sardyx integrates them all into a cohesive workspace. The dashboard is clean, fast, and highly animated in all the right ways.&quot;
              </p>
              <div>
                <div className="font-extrabold text-sm text-white">Leila Patel</div>
                <div className="text-xs text-slate-500 font-medium">Head of Product, SaaSify</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <HelpCircle className="w-10 h-10 text-blue-400 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-white font-display">FAQ</h2>
          <p className="text-slate-400 text-sm mt-1">Everything you need to know about Sardyx AI</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className={`rounded-xl border transition-all duration-300 ${
                activeFAQ === index 
                  ? 'border-blue-500/30 bg-blue-500/5' 
                  : (darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-zinc-200/60')
              }`}
            >
              <button 
                id={`faq-btn-${index}`}
                onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                className="w-full text-left px-6 py-4 font-bold text-sm md:text-base flex items-center justify-between outline-none text-white font-display"
              >
                <span>{item.q}</span>
                <span className="text-blue-400 text-lg">{activeFAQ === index ? '−' : '+'}</span>
              </button>
              {activeFAQ === index && (
                <div className={`px-6 pb-5 pt-1 text-sm leading-relaxed transition-colors duration-300 ${
                  darkMode ? 'text-slate-400' : 'text-zinc-600'
                }`}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="py-24 relative overflow-hidden text-center max-w-7xl mx-auto px-6">
        <div className={`rounded-3xl border p-12 md:p-20 relative overflow-hidden ${
          darkMode 
            ? 'bg-[#0a0a0f] border-white/5 shadow-2xl shadow-blue-500/5' 
            : 'bg-white border-zinc-200 shadow-xl shadow-zinc-300/10'
        }`}>
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-indigo-600/5 to-transparent pointer-events-none" />

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white font-display">
            Initialize Your Sardyx Workforce Unit
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-sm md:text-base">
            Configure, manage, and scale persistent agents. Connect external compatible models server-side or launch instantly with Gemini pipelines.
          </p>

          <button 
            id="hero-final-cta-btn"
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl font-bold bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:bg-blue-500 hover:scale-[1.03] transition-all flex items-center gap-2 mx-auto group cursor-pointer"
          >
            <span>Activate Sardyx Workspace</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-12 transition-colors duration-300 ${
        darkMode ? 'bg-black/40 border-white/5 text-slate-500' : 'bg-white border-zinc-200 text-zinc-500'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-400 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white/30 rounded-full"></div>
            </div>
            <span className="font-bold text-sm tracking-tight dark:text-white text-zinc-800">Sardyx AI</span>
          </div>

          <div className="text-xs font-mono text-slate-500 font-bold">
            &copy; {new Date().getFullYear()} Sardyx AI Platforms. Designed for Next-Gen Workforce Automation.
          </div>
        </div>
      </footer>
    </div>
  );
}
