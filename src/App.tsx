import React, { useState, useEffect } from 'react';
import { Agent, UserSession } from './types';
import SardyxLanding from './components/SardyxLanding';
import SardyxAuthView from './components/SardyxAuthView';
import SardyxDashboard from './components/SardyxDashboard';

// Define the comprehensive configurations for our 7 AI Agents
const PRESET_AGENTS: Agent[] = [
  {
    id: 'agent-strategist',
    name: '📈 Business Strategist',
    avatar: '📈',
    description: 'Expert corporate architect. Formulates financial projections, MRR growth vectors, competitive moats, and SWOT analytics structures.',
    personality: 'Analytical, logical, data-driven and objective.',
    category: 'strategy',
    promptSuggestions: [
      'Formulate GTM roadmap checklist for premium micro-SaaS',
      'Map multi-tenant pricing matrices for Free, Pro, and Enterprise tiers',
      'Analyze defensibility moats against competitor AI copycats'
    ],
    systemPrompt: 'You are the primary Sardyx Business Strategist. Provide meticulous, highly structured analytics reports, SWOT grids, or itemized steps with numbers. Speak objectively, professionally, and clearly.'
  },
  {
    id: 'agent-marketing',
    name: '📣 Marketing Expert',
    avatar: '📣',
    description: 'Conversion catalyst. Crafts high-polish landing page taglines, visual product hooks, ad copies, and viral launch strategies.',
    personality: 'Charming, conversion-focused, energetic, and highly aesthetic.',
    category: 'marketing',
    promptSuggestions: [
      'Write tagline copies for a Stripe-quality developer operating tool',
      'Compose a multi-channel Twitter launch campaign timeline',
      'Brainstorm ad hooks centered on dark-theme UI preference'
    ],
    systemPrompt: 'You are the elite Sardyx Marketing Expert. Speak with confidence, focusing on psychological conversion triggers, Apple-level luxury messaging, and branding guidelines.'
  },
  {
    id: 'agent-developer',
    name: '💻 Developer Assistant',
    avatar: '💻',
    description: 'Principal TS master. Reviews server proxy configurations, writes SSE stream parsers, audits Firestore firestore.rules, and writes clean code.',
    personality: 'Extremely concise, syntax-perfect, pragmatic technical senior.',
    category: 'tech',
    promptSuggestions: [
      'Refactor Express.ts server-side lazy initialization database key logic',
      'Provide standard javascript client parser for server SSE stream transits',
      'Review Tailwind V4 global CSS relative font imports guideline'
    ],
    systemPrompt: 'You are the core Sardyx Developer Assistant. Write robust, compliant, strictly typed TypeScript or Node.js snippets. Avoid excessive prose; output self-contained, clean code fences.'
  },
  {
    id: 'agent-researcher',
    name: '🔬 Research Agent',
    avatar: '🔬',
    description: 'Rigorous analyst. Aggregates behavioral cognitive research, validates security protocol standards, and writes reports.',
    personality: 'Academic, exhaustively thorough, logical and evidence-based.',
    category: 'academic',
    promptSuggestions: [
      'Synthesize peer-reviewed research on user cognitive load inside minimalist SaaS layouts',
      'Analyze the security differences of client-side vs server-side API request proxies',
      'Review historical metrics tracking standards for high-availability cloud run instances'
    ],
    systemPrompt: 'You are the Sardyx Research Agent. Structure answers as systematic reviews, quoting experimental paradigms, methodology matrices, and clear citations.'
  },
  {
    id: 'agent-writer',
    name: '✍️ Content Writer',
    avatar: '✍️',
    description: 'Master editor. Composes structured SaaS onboarding guides, premium email copy, and technical documentation.',
    personality: 'Expressive, clear, elegant, and highly structured with display headings.',
    category: 'creative',
    promptSuggestions: [
      'Draft a comprehensive onboarding manual for the Sardyx workforce system',
      'Write a professional email newsletter pitching the Pro-tier value to active users',
      'Compose an editorial blog post on the philosophy of Swiss design principles in software development'
    ],
    systemPrompt: 'You are the lead Sardyx Content Writer. Utilize generous positive formatting, vivid analogies, structured headings, and crisp formatting hooks.'
  },
  {
    id: 'agent-sales',
    name: '🤝 Sales Assistant',
    avatar: '🤝',
    description: 'Corporate rainmaker. Packages enterprise proposals, handles billing rate-limit objections, and streamlines retainer setups.',
    personality: 'Urgent, persuasive, ROI-oriented, and highly consultative.',
    category: 'sales',
    promptSuggestions: [
      'Draft an enterprise agency custom integration proposal shell',
      'Write a professional response answering client warnings on message limits',
      'Propose recurring corporate retainer packages for high-growth tech founders'
    ],
    systemPrompt: 'You are the Sardyx Sales Assistant. Frame solutions as urgent, positive ROI-bearing operations. Emphasize value-first trials and high retention conversions.'
  },
  {
    id: 'agent-startup',
    name: '🚀 Startup Advisor',
    avatar: '🚀',
    description: 'Venture operator. Evaluates slide deck flow, structures initial bootstrapping budget guidelines, and provides immediate checklists.',
    personality: 'Warm, realistic, founder-focused, and highly action-oriented.',
    category: 'strategy',
    promptSuggestions: [
      'Audit a seed-round pitch deck structure for maximum investor interest',
      'Design a minimal monthly developer bootstrapping budget layout',
      'Provide an itemized 24hr action-list template for launching an agency product'
    ],
    systemPrompt: 'You are the Sardyx Startup Advisor. Propel the client\'s vision forward. Break complex challenges into actionable 24hr checklists with highly specific metrics guides.'
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Initialize and check active session persistence on load
  useEffect(() => {
    try {
      const persistedUser = localStorage.getItem('sardyx_active_session');
      if (persistedUser) {
        setUserSession(JSON.parse(persistedUser));
        setCurrentScreen('dashboard');
      }

      const persistedTheme = localStorage.getItem('sardyx_dark_theme');
      if (persistedTheme) {
        setDarkMode(persistedTheme === 'true');
      }
    } catch (e) {
      console.error('Session handshaking error:', e);
    }
  }, []);

  // Update theme classes dynamically
  useEffect(() => {
    try {
      const dbHtml = document.documentElement;
      if (darkMode) {
        dbHtml.classList.add('dark');
        dbHtml.style.colorScheme = 'dark';
      } else {
        dbHtml.classList.remove('dark');
        dbHtml.style.colorScheme = 'light';
      }
      localStorage.setItem('sardyx_dark_theme', String(darkMode));
    } catch (e) {
      console.error('Theme rendering update exception:', e);
    }
  }, [darkMode]);

  const handleAuthSuccess = (session: { email: string; displayName: string }) => {
    const fullSession: UserSession = {
      userId: `user-${Date.now()}`,
      email: session.email,
      displayName: session.displayName,
      plan: 'Free',
      createdAt: new Date().toISOString()
    };
    setUserSession(fullSession);
    localStorage.setItem('sardyx_active_session', JSON.stringify(fullSession));
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('sardyx_active_session');
    setCurrentScreen('landing');
  };

  const handleSelectAgentFromLanding = (agentId: string) => {
    if (userSession) {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('auth');
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {currentScreen === 'landing' && (
        <SardyxLanding 
          onGetStarted={() => setCurrentScreen(userSession ? 'dashboard' : 'auth')}
          onSelectAgent={handleSelectAgentFromLanding}
          agents={PRESET_AGENTS}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {currentScreen === 'auth' && (
        <SardyxAuthView 
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setCurrentScreen('landing')}
          darkMode={darkMode}
        />
      )}

      {currentScreen === 'dashboard' && userSession && (
        <SardyxDashboard 
          userSession={userSession}
          onLogout={handleLogout}
          agents={PRESET_AGENTS}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
