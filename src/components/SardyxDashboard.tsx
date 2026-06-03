import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MessageSquare, 
  Folder, 
  FolderPlus, 
  Settings, 
  Search, 
  Plus, 
  Trash, 
  Star, 
  TrendingUp, 
  Users, 
  Cpu, 
  ChevronRight, 
  Check, 
  Activity, 
  LogOut, 
  Edit2, 
  Copy, 
  ShieldAlert, 
  Zap, 
  ArrowUpRight, 
  X,
  Play,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  Cloud,
  Mic,
  MicOff
} from 'lucide-react';
import { Message, Agent, ChatFolder, Conversation, UserPlan, AdminStats, ErrorLog } from '../types';
import { 
  isSupabaseConfigured,
  dbFetchFolders,
  dbUpsertFolder,
  dbDeleteFolder,
  dbFetchConversations,
  dbUpsertConversation,
  dbDeleteConversation,
  dbClearAllConversations,
  dbFetchPlan,
  dbUpsertPlan,
  dbFetchErrorLogs,
  dbInsertErrorLog,
  dbFetchUsageData
} from '../lib/supabase';
import SardyxAnalytics from './SardyxAnalytics';

interface SardyxDashboardProps {
  userSession: { email: string; displayName: string };
  onLogout: () => void;
  agents: Agent[];
  darkMode: boolean;
}

export default function SardyxDashboard({ 
  userSession, 
  onLogout, 
  agents, 
  darkMode 
}: SardyxDashboardProps) {
  // Active screen tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'agents' | 'analytics' | 'admin'>('chat');
  
  // Conversations and Folders
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [folders, setFolders] = useState<ChatFolder[]>([
    { id: 'fold-1', name: '💼 Strategy & Board' },
    { id: 'fold-2', name: '🚀 Launch & GTM' },
    { id: 'fold-3', name: '🛠️ Code Sandbox' }
  ]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Folder management
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [selectedFolderForActiveChat, setSelectedFolderForActiveChat] = useState<string>('');

  // Active Agent details
  const [activeAgentId, setActiveAgentId] = useState<string>(agents[0].id);

  // Chat input and typing simulation states
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [showThinkingPanel, setShowThinkingPanel] = useState(false);
  const [streamingMessageText, setStreamingMessageText] = useState('');

  // Pricing configuration tier and current limit progress indicators
  const [userPlan, setUserPlan] = useState<UserPlan>({
    tier: 'Free',
    messageLimit: 50,
    messagesUsed: 12,
    priceValue: 0,
    billingCycle: 'monthly'
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone access blocked by browser.');
        } else {
          setSpeechError(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(prev => {
            const separator = prev.endsWith(' ') || prev === '' ? '' : ' ';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition handle bounce:', err);
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 150);
        } catch (e) {
          setSpeechError('Failed to start microphone streaming.');
        }
      }
    }
  };

  // Error boundary log files tracker
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([
    { id: 'err-1', timestamp: '13:28:02', error: 'Database handshake timeout - retried successfully', service: 'Firestore' },
    { id: 'err-2', timestamp: '13:02:14', error: 'LLM Key validation failure on invalid region selector', service: 'Custom-API-Proxy' }
  ]);

  // Editing direct chat title
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Supabase Side-Panel states
  const [showSupabasePanel, setShowSupabasePanel] = useState(false);
  const [supabaseHistory, setSupabaseHistory] = useState<Conversation[]>([]);
  const [isLoadingSupabaseHistory, setIsLoadingSupabaseHistory] = useState(false);
  const [supabaseSuccessMessage, setSupabaseSuccessMessage] = useState<string | null>(null);

  // Toast Warnings for Monthly Token Limits
  const [toasts, setToasts] = useState<{
    id: string;
    type: 'warning' | 'alert' | 'success' | 'info';
    title: string;
    message: string;
    percentage: number;
    tokensUsed: number;
    limit: number;
  }[]>([]);

  const checkTokenUsageLimits = async (currentTier: string) => {
    let limit = 50000;
    if (currentTier === 'Pro') limit = 500000;
    if (currentTier === 'Enterprise') limit = 5000000;

    let tokensUsed = 0;

    if (isSupabaseConfigured()) {
      try {
        const fetchedUsage = await dbFetchUsageData(userSession.email);
        if (fetchedUsage && fetchedUsage.length > 0) {
          tokensUsed = fetchedUsage.reduce((acc, curr) => acc + curr.tokens_used, 0);
        } else {
          // Connected but empty table, use standard fallback stats
          tokensUsed = 12500 + 19800 + 35000 + 28400 + 48900 + 62000;
        }
      } catch (err) {
        console.warn('Could not read Supabase usage table logs:', err);
        tokensUsed = currentTier === 'Free' ? 41500 : 415000;
      }
    } else {
      // Local Sandbox simulation values (83% of standard limit)
      tokensUsed = currentTier === 'Free' ? 41500 : currentTier === 'Pro' ? 415000 : 4150000;
    }

    const percentage = Math.round((tokensUsed / limit) * 100);

    if (percentage >= 80) {
      const toastId = `token-limit-${currentTier}-${Date.now()}`;
      
      // Auto-insert if no token toast currently exists
      setToasts(prev => {
        if (prev.some(t => t.id.startsWith('token-limit'))) return prev;
        return [
          ...prev,
          {
            id: toastId,
            type: percentage >= 95 ? 'alert' : 'warning',
            title: percentage >= 95 ? '⚡ Critical Token Threshold Reached' : '⚠️ Approaching Monthly Token Limit',
            message: `You have consumed ${tokensUsed.toLocaleString()} / ${limit.toLocaleString()} space tokens (${percentage}%). Please upgrade your workspace or limit heavy queries.`,
            percentage,
            tokensUsed,
            limit
          }
        ];
      });
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchSupabaseHistory = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingSupabaseHistory(true);
    try {
      const dbChats = await dbFetchConversations(userSession.email);
      if (dbChats) {
        setSupabaseHistory(dbChats);
      }
    } catch (err) {
      console.error('Error fetching Supabase history:', err);
    } finally {
      setIsLoadingSupabaseHistory(false);
    }
  };

  // Automatically fetch history whenever panel opens
  useEffect(() => {
    if (showSupabasePanel) {
      fetchSupabaseHistory();
    }
  }, [showSupabasePanel]);

  const handleSwitchToPastChat = (chat: Conversation) => {
    // Check if the chat is already in our local conversations list
    const exists = conversations.find(c => c.id === chat.id);
    if (!exists) {
      const updated = [chat, ...conversations];
      setConversations(updated);
      saveStateToStorage(updated);
    }
    setActiveConversationId(chat.id);
    setActiveTab('chat');
    // Set a quick visual success feedback
    setSupabaseSuccessMessage(`Successfully switched to chat: "${chat.title}"`);
    setTimeout(() => setSupabaseSuccessMessage(null), 3000);
  };

  const handleDeleteSupabaseHistoryChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this chat session from Supabase cloud storage?')) return;
    try {
      if (isSupabaseConfigured()) {
        await dbDeleteConversation(chatId);
        setSupabaseHistory(prev => prev.filter(c => c.id !== chatId));
        
        // If it also exists in local conversations, delete it from there too
        if (conversations.find(c => c.id === chatId)) {
          const updated = conversations.filter(c => c.id !== chatId);
          setConversations(updated);
          saveStateToStorage(updated);
          if (activeConversationId === chatId) {
            if (updated.length > 0) {
              setActiveConversationId(updated[0].id);
            } else {
              setActiveConversationId('');
            }
          }
        }
        
        setSupabaseSuccessMessage('Session deleted successfully from cloud storage.');
        setTimeout(() => setSupabaseSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to delete history chat:', err);
    }
  };

  // Refs for scroll alignment
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active selected conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const activeAgent = agents.find(a => a.id === (activeConversation?.agentId || activeAgentId)) || agents[0];

  // Load persistence configurations from localStorage / Supabase
  useEffect(() => {
    const initializeData = async () => {
      let loadedChats: Conversation[] = [];
      let loadedFolders: ChatFolder[] = [];
      let loadedPlan: UserPlan | null = null;
      let loadedErrorLogs: ErrorLog[] = [];

      // Flag to track if we pulled from database
      let pulledFromSupabase = false;

      if (isSupabaseConfigured()) {
        try {
          const [dbChats, dbFolders, dbPlan, dbErrLogs] = await Promise.all([
            dbFetchConversations(userSession.email),
            dbFetchFolders(userSession.email),
            dbFetchPlan(userSession.email),
            dbFetchErrorLogs(userSession.email)
          ]);

          if (dbChats !== null) {
            loadedChats = dbChats;
            pulledFromSupabase = true;
          }
          if (dbFolders !== null) {
            loadedFolders = dbFolders;
          }
          if (dbPlan !== null) {
            loadedPlan = dbPlan;
          }
          if (dbErrLogs !== null) {
            loadedErrorLogs = dbErrLogs;
          }
        } catch (dbErr) {
          console.error('[Supabase Onboarding Sync Issue]:', dbErr);
        }
      }

      // If we couldn't load from Supabase (or not configured), fall back to localStorage
      if (!pulledFromSupabase) {
        try {
          const storedChats = localStorage.getItem(`sardyx_chats_${userSession.email}`);
          if (storedChats) {
            loadedChats = JSON.parse(storedChats);
          }
        } catch (_) {}
      }

      if (loadedFolders.length === 0) {
        try {
          const storedFolders = localStorage.getItem(`sardyx_folders_${userSession.email}`);
          if (storedFolders) {
            loadedFolders = JSON.parse(storedFolders);
          } else {
            // Default setup folders
            loadedFolders = [
              { id: 'fold-1', name: '💼 Strategy & Board' },
              { id: 'fold-2', name: '🚀 Launch & GTM' },
              { id: 'fold-3', name: '🛠️ Code Sandbox' }
            ];
            // Write them to database if DB is configured
            if (isSupabaseConfigured()) {
              loadedFolders.forEach(f => dbUpsertFolder(userSession.email, f));
            }
          }
        } catch (_) {}
      }

      if (!loadedPlan) {
        try {
          const storedPlan = localStorage.getItem(`sardyx_plan_${userSession.email}`);
          if (storedPlan) {
            loadedPlan = JSON.parse(storedPlan);
          } else {
            loadedPlan = {
              tier: 'Free',
              messageLimit: 50,
              messagesUsed: 12,
              priceValue: 0,
              billingCycle: 'monthly'
            };
          }
        } catch (_) {}
      }

      // If Supabase has no error logs but configured, insert initial mock ones
      if (loadedErrorLogs.length === 0) {
        loadedErrorLogs = [
          { id: 'err-1', timestamp: '13:28:02', error: 'Database handshake timeout - retried successfully', service: 'Firestore' },
          { id: 'err-2', timestamp: '13:02:14', error: 'LLM Key validation failure on invalid region selector', service: 'Custom-API-Proxy' }
        ];
        if (isSupabaseConfigured()) {
          loadedErrorLogs.forEach(log => dbInsertErrorLog(userSession.email, log));
        }
      }

      // Apply states
      if (loadedChats.length > 0) {
        setConversations(loadedChats);
        setActiveConversationId(loadedChats[0].id);
      } else {
        // Initial first onboarding conversation preset
        const defaultChat: Conversation = {
          id: 'chat-init',
          title: '✨ Sardyx Operating Manual',
          agentId: agents[0].id,
          folderId: 'fold-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activeModel: 'gemini-3.5-flash',
          messages: [
            {
              id: 'msg-init-1',
              role: 'assistant',
              content: `Welcome to **Sardyx AI Platforms**. I am your primary business strategist.

Here is a quick overview of how to navigate this SaaS Workspace:

1. **Modular Agent Routing**: On the left navigation sidebar (or Agents tab), click to swap between our pre-configured expert units (Strategists, Tech Developers, Writing Assistants).
2. **Persistent Folders**: Organise independent chat histories using custom folder tags.
3. **Dual Model Architecture**: Standard requests are stream-processed over your secure Gemini models. Click standard questions or type in custom commands to trigger live responses.
4. **Usage Metering**: Free accounts can send up to 50 server queries. Upgrade to Pro anytime to bypass rate-limits and proxy custom OpenAI / OpenRouter tokens securely.

Let me know if you would like me to draft your startup launch plan!`,
              timestamp: new Date().toISOString()
            }
          ]
        };
        setConversations([defaultChat]);
        setActiveConversationId(defaultChat.id);
        if (isSupabaseConfigured()) {
          dbUpsertConversation(userSession.email, defaultChat);
        }
      }

      setFolders(loadedFolders);
      if (loadedPlan) {
        setUserPlan(loadedPlan);
        if (isSupabaseConfigured()) {
          dbUpsertPlan(userSession.email, loadedPlan);
        }
      }
      setErrorLogs(loadedErrorLogs);
    };

    initializeData();
  }, [userSession.email, agents]);

  // Check token limits automatically checking against Supabase usage indexes
  useEffect(() => {
    const timer = setTimeout(() => {
      checkTokenUsageLimits(userPlan.tier);
    }, 1200);
    return () => clearTimeout(timer);
  }, [userPlan.tier, userSession.email]);

  // Persist files state on updates
  const saveStateToStorage = (updatedChats: Conversation[], updatedFolders?: ChatFolder[], updatedPlan?: UserPlan) => {
    try {
      localStorage.setItem(`sardyx_chats_${userSession.email}`, JSON.stringify(updatedChats));
      if (updatedFolders) {
        localStorage.setItem(`sardyx_folders_${userSession.email}`, JSON.stringify(updatedFolders));
      }
      if (updatedPlan) {
        localStorage.setItem(`sardyx_plan_${userSession.email}`, JSON.stringify(updatedPlan));
      }

      // Sync to Supabase if active
      if (isSupabaseConfigured()) {
        if (updatedFolders) {
          updatedFolders.forEach(folder => {
            dbUpsertFolder(userSession.email, folder);
          });
        }
        if (updatedPlan) {
          dbUpsertPlan(userSession.email, updatedPlan);
        }
        if (updatedChats && updatedChats.length > 0) {
          const activeConvo = updatedChats.find(c => c.id === activeConversationId);
          if (activeConvo) {
            dbUpsertConversation(userSession.email, activeConvo);
          }
        }
      }
    } catch (e) {
      console.error('Storage writer exception:', e);
    }
  };

  // Auto-scroll inside chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId, streamingMessageText, isStreaming]);

  // Handlers for conversations
  const handleCreateNewChat = (customAgentId?: string, explicitFolderId?: string) => {
    const aid = customAgentId || activeAgentId;
    const fid = explicitFolderId || selectedFolderForActiveChat || undefined;
    
    const newChat: Conversation = {
      id: `chat-${Date.now()}`,
      title: `⚡ New ${agents.find(a => a.id === aid)?.name || 'Agent'} Session`,
      agentId: aid,
      folderId: fid,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeModel: 'gemini-3.5-flash'
    };

    const updated = [newChat, ...conversations];
    setConversations(updated);
    setActiveConversationId(newChat.id);
    saveStateToStorage(updated);
    setActiveTab('chat');
    
    if (isSupabaseConfigured()) {
      dbUpsertConversation(userSession.email, newChat);
    }
  };

  const handleDeleteChat = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = conversations.filter(c => c.id !== chatId);
    setConversations(updated);
    if (activeConversationId === chatId) {
      if (updated.length > 0) {
        setActiveConversationId(updated[0].id);
      } else {
        setActiveConversationId('');
      }
    }
    saveStateToStorage(updated);
    
    if (isSupabaseConfigured()) {
      dbDeleteConversation(chatId);
    }
  };

  const handleToggleStar = (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updated = conversations.map(c => {
      if (c.id === chatId) {
        const item = { ...c, starred: !c.starred };
        if (isSupabaseConfigured()) {
          dbUpsertConversation(userSession.email, item);
        }
        return item;
      }
      return c;
    });
    setConversations(updated);
    saveStateToStorage(updated);
  };

  // Editing Conversation title in sidebar
  const startEditingTitle = (chatId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitleText(currentTitle);
  };

  const saveEditedTitle = (chatId: string) => {
    if (!editingTitleText.trim()) return;
    const updated = conversations.map(c => {
      if (c.id === chatId) {
        const item = { ...c, title: editingTitleText.trim() };
        if (isSupabaseConfigured()) {
          dbUpsertConversation(userSession.email, item);
        }
        return item;
      }
      return c;
    });
    setConversations(updated);
    setEditingChatId(null);
    saveStateToStorage(updated);
  };

  // Folder modification handles
  const handleAddNewFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: ChatFolder = {
      id: `fold-${Date.now()}`,
      name: `📁 ${newFolderName.trim()}`
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    setNewFolderName('');
    setIsCreatingFolder(false);
    saveStateToStorage(conversations, updatedFolders);
    
    if (isSupabaseConfigured()) {
      dbUpsertFolder(userSession.email, newFolder);
    }
  };

  const handleAssignChatToFolder = (chatId: string, folderId: string | undefined) => {
    const updated = conversations.map(c => {
      if (c.id === chatId) {
        const item = { ...c, folderId };
        if (isSupabaseConfigured()) {
          dbUpsertConversation(userSession.email, item);
        }
        return item;
      }
      return c;
    });
    setConversations(updated);
    saveStateToStorage(updated);
  };

  // Plan upgrades trigger Mock Payment completing flow
  const handleSimulateUpgradePlan = (tier: 'Pro' | 'Enterprise') => {
    const price = tier === 'Pro' ? 49 : 199;
    const updatedPlan: UserPlan = {
      tier,
      messageLimit: tier === 'Pro' ? 9999 : 99999,
      messagesUsed: userPlan.messagesUsed,
      priceValue: price,
      billingCycle: 'monthly'
    };
    setUserPlan(updatedPlan);
    setShowUpgradeModal(false);
    
    // Add dynamic automated error system message validating setup
    const upgradeLog: ErrorLog = {
      id: `err-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      error: `Upgrade pipeline complete. Active tier switched to: ${tier}`,
      service: 'Billing'
    };
    setErrorLogs([upgradeLog, ...errorLogs]);
    saveStateToStorage(conversations, folders, updatedPlan);
    
    if (isSupabaseConfigured()) {
      dbUpsertPlan(userSession.email, updatedPlan);
      dbInsertErrorLog(userSession.email, upgradeLog);
    }
  };

  // CORE CHAT EXPERIENCES - CALLING BACKEND API STREAM CHAT OR offline simulation
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isStreaming) return;

    // Plan threshold guard
    if (userPlan.messagesUsed >= userPlan.messageLimit) {
      setShowUpgradeModal(true);
      return;
    }

    // Capture active or create a new one if empty
    let currentConversation = activeConversation;
    if (!currentConversation) {
      const newId = `chat-${Date.now()}`;
      const defaultTitle = text.length > 20 ? `${text.substring(0, 20)}...` : text;
      currentConversation = {
        id: newId,
        title: `⚡ ${defaultTitle}`,
        agentId: activeAgentId,
        folderId: selectedFolderForActiveChat || undefined,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activeModel: 'gemini-3.5-flash'
      };
      conversations.unshift(currentConversation);
      setConversations([...conversations]);
      setActiveConversationId(newId);
    }

    // Append user message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const updatedConvoMessages = [...currentConversation.messages, userMsg];
    currentConversation.messages = updatedConvoMessages;
    currentConversation.updatedAt = new Date().toISOString();
    
    // Increment message count
    const updatedPlan = {
      ...userPlan,
      messagesUsed: userPlan.messagesUsed + 1
    };
    setUserPlan(updatedPlan);

    setConversations([...conversations]);
    if (!textToSend) setInputText('');
    setIsStreaming(true);
    setStreamingMessageText('');
    setShowThinkingPanel(true);

    if (isSupabaseConfigured()) {
      dbUpsertConversation(userSession.email, currentConversation);
      dbUpsertPlan(userSession.email, updatedPlan);
    }

    // Dynamic Step Indicators
    setThinkingSteps(['Initiating Sardyx routing handshake...', 'Loading agent prompt instructions...']);
    await new Promise(r => setTimeout(r, 450));
    setThinkingSteps(prev => [...prev, `Context successfully mapped to Agent Unit: ${activeAgent.name}`]);
    await new Promise(r => setTimeout(r, 400));
    setThinkingSteps(prev => [...prev, 'Executing server side Express proxy target...']);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedConvoMessages,
          systemInstruction: activeAgent.systemPrompt,
          modelName: currentConversation.activeModel
        })
      });

      if (!response.ok) {
        throw new Error('Inference pipeline response returned invalid header');
      }

      setThinkingSteps(prev => [...prev, 'Live streaming token matrix stream acquired. Decoding...']);
      await new Promise(r => setTimeout(r, 300));
      setShowThinkingPanel(false);

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Empty API read response body');
      }

      const decoder = new TextDecoder('utf-8');
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.substring(6).trim();
            if (rawJson === '[DONE]') {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(rawJson);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setStreamingMessageText(accumulatedText);
              }
            } catch (jsonErr) {
              // Ignore partial JSON blocks
            }
          }
        }
      }

      // Finish streaming, commit final message
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: accumulatedText || 'Inference success with no return characters.',
        timestamp: new Date().toISOString(),
        model: currentConversation.activeModel,
        thinkingTime: '0.8s'
      };

      currentConversation.messages = [...updatedConvoMessages, assistantMsg];
      setConversations([...conversations]);
      saveStateToStorage([...conversations], folders, updatedPlan);

      if (isSupabaseConfigured()) {
        dbUpsertConversation(userSession.email, currentConversation);
      }

    } catch (apiErr: any) {
      console.error('Chat API stream crash:', apiErr);
      
      // Fallback fallback simulated UI response log and show alert
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `### ⚠️ Connection Diagnostic Offline
        
Sardyx AI was unable to resolve standard streaming tokens from the backend. 
- **Inference Server**: Offline sandbox
- **Local Cache Mode**: Activated
- **Reason**: ${apiErr.message}

Please inspect your **Settings > Secrets** panel in AI Studio to ensure your **GEMINI_API_KEY** is configured and active.`,
        timestamp: new Date().toISOString()
      };

      currentConversation.messages = [...updatedConvoMessages, errorMsg];
      setConversations([...conversations]);
      saveStateToStorage([...conversations], folders, updatedPlan);

      // Create admin error logs tracker
      const dynamicError: ErrorLog = {
        id: `err-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        error: apiErr.message || 'Stream processing connection terminated',
        service: 'Core-Inference'
      };
      setErrorLogs([dynamicError, ...errorLogs]);

      if (isSupabaseConfigured()) {
        dbUpsertConversation(userSession.email, currentConversation);
        dbInsertErrorLog(userSession.email, dynamicError);
      }
    } finally {
      setIsStreaming(false);
      setStreamingMessageText('');
      setShowThinkingPanel(false);
    }
  };

  // Regeneration Handler
  const handleRegenerateLastMessage = () => {
    if (!activeConversation || activeConversation.messages.length < 2 || isStreaming) return;
    
    // Remove last assistant message
    const lastMsg = activeConversation.messages[activeConversation.messages.length - 1];
    if (lastMsg.role === 'assistant') {
      activeConversation.messages.pop();
    }
    
    // Fetch last user text
    const lastUserMsg = activeConversation.messages[activeConversation.messages.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      const textToResend = lastUserMsg.content;
      // Truncate last user message dynamically and resend
      activeConversation.messages.pop();
      setConversations([...conversations]);
      handleSendMessage(textToResend);
    }
  };

  // Copy message text helper
  const handleCopyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    // Visual alert feedback
    const originalText = e.currentTarget.innerHTML;
    e.currentTarget.innerHTML = "Copied! ✓";
    const refCurrent = e.currentTarget;
    setTimeout(() => {
      refCurrent.innerHTML = originalText;
    }, 1500);
  };

  // Clear entire conversations logs
  const handleClearAllWorkspaceChats = () => {
    if (window.confirm('Are you absolutely sure you want to flush all current operations logs? This cannot be undone.')) {
      setConversations([]);
      setActiveConversationId('');
      saveStateToStorage([]);
      if (isSupabaseConfigured()) {
        dbClearAllConversations(userSession.email);
      }
    }
  };

  // Filters chats list against search queries
  const filteredChats = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agents.find(a => a.id === c.agentId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 overflow-hidden ${
      darkMode ? 'bg-[#050508] text-slate-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`w-80 shrink-0 border-r flex flex-col justify-between transition-all duration-300 relative z-20 ${
        darkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-100 border-zinc-200'
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800/10 dark:border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm block dark:text-zinc-200 text-zinc-900 font-mono tracking-tight">Sardyx OS</span>
                <span className="text-[9px] font-mono tracking-wider block text-zinc-500 uppercase font-bold -mt-1">Active Sandbox</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                userPlan.tier === 'Free' 
                  ? 'bg-zinc-550/10 text-zinc-500 bg-zinc-500/10' 
                  : 'bg-indigo-500/10 text-indigo-400'
              }`}>
                {userPlan.tier}
              </span>
            </div>
          </div>

          {/* Quick Sandbox Controls */}
          <button 
            id="sidebar-new-chat-btn"
            onClick={() => handleCreateNewChat()}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Session</span>
          </button>
        </div>

        {/* Saved Conversations / Folders Scroll section */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          
          {/* Search container */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search chat sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                darkMode 
                  ? 'bg-[#050508] border-white/5 text-white focus:border-white/10' 
                  : 'bg-white border-zinc-200 text-zinc-800 focus:border-zinc-300'
              }`}
            />
          </div>

          {/* Directory folders list */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-slate-500">Directories</span>
              <button 
                id="create-folder-toggle-btn"
                onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                className="text-slate-500 hover:text-blue-400 transition-all cursor-pointer"
                title="Create Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Creating Folder prompt */}
            {isCreatingFolder && (
              <div className="flex gap-1.5 p-1">
                <input 
                  type="text" 
                  placeholder="Folder Name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={`flex-1 px-2 py-1 text-xs outline-none border rounded ${
                    darkMode ? 'bg-black border-white/5 text-slate-300 focus:border-white/20' : 'bg-white border-zinc-200'
                  }`}
                />
                <button 
                  id="submit-folder-btn"
                  onClick={handleAddNewFolder}
                  className="px-2 py-1 rounded bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-500 cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {folders.map(folder => (
                <div 
                  key={folder.id} 
                  onClick={() => setSelectedFolderForActiveChat(folder.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                    selectedFolderForActiveChat === folder.id
                      ? 'bg-blue-500/10 text-blue-400 font-bold'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="truncate text-slate-300">{folder.name}</span>
                  {selectedFolderForActiveChat === folder.id && (
                    <span 
                      className="text-[9px] font-bold text-slate-400 hover:text-red-400 font-mono" 
                      onClick={(e) => { e.stopPropagation(); setSelectedFolderForActiveChat(''); }}
                    >
                      CLEAR
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Sessions list */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mr-1">
              <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-slate-500">Workforce History</span>
              <button
                id="sidebar-cloud-toggle-btn"
                onClick={() => setShowSupabasePanel(!showSupabasePanel)}
                className="text-slate-400 hover:text-blue-400 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-mono border border-white/5 hover:border-blue-500/20 px-1.5 py-0.5 rounded bg-[#09090d]"
                title="View Supabase Backup Archive"
              >
                <Database className="w-2.5 h-2.5 text-blue-400" />
                <span>Cloud</span>
              </button>
            </div>
            
            {filteredChats.length === 0 ? (
              <div className="text-center py-6 text-slate-550 text-xs italic">No session logs matched.</div>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {filteredChats.map(chat => {
                    const chatAgent = agents.find(a => a.id === chat.agentId);
                    const isEditing = editingChatId === chat.id;

                    return (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        layout
                        onClick={() => { setActiveConversationId(chat.id); setActiveTab('chat'); }}
                        className={`group p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                          activeConversationId === chat.id
                            ? 'bg-blue-600/5 border-blue-500/20 text-blue-400'
                            : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm shrink-0">{chatAgent?.avatar || '🤖'}</span>
                          
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={editingTitleText}
                                onChange={(e) => setEditingTitleText(e.target.value)}
                                onBlur={() => saveEditedTitle(chat.id)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEditedTitle(chat.id)}
                                autoFocus
                                className="w-full bg-transparent border-b border-indigo-500 text-xs outline-none text-zinc-800 dark:text-white"
                              />
                            ) : (
                              <>
                                <div className="text-xs font-bold truncate">{chat.title}</div>
                                <span className="text-[9px] text-zinc-500 font-mono tracking-wide capitalize">
                                  {chat.activeModel} • {chatAgent?.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Hover Action controls */}
                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => startEditingTitle(chat.id, chat.title, e)} 
                              className="p-1 hover:text-indigo-400 text-zinc-500"
                              title="Edit Title"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => handleToggleStar(chat.id, e)} 
                              className={`p-1 text-zinc-500 ${chat.starred ? 'text-yellow-400 hover:text-yellow-500' : 'hover:text-yellow-400'}`}
                              title="Star Chat"
                            >
                              <Star className={`w-3 h-3 ${chat.starred ? 'fill-current' : ''}`} />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteChat(chat.id, e)} 
                              className="p-1 hover:text-red-500 text-zinc-500"
                              title="Delete Chat"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Settings, Plan Usage and User Profile footer container */}
        <div className="p-4 border-t border-zinc-805/10 dark:border-white/5 bg-white/[0.01] space-y-3">
          
          {/* Plan Usage Slider */}
          <div className="p-3 rounded-xl border border-zinc-805/10 dark:border-white/5 bg-black/40 text-left">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-1.5">
              <span>Operational Bandwidth</span>
              <span>{userPlan.messagesUsed} / {userPlan.messageLimit === 9999 ? 'Unlimited' : userPlan.messageLimit}</span>
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-2">
              <div 
                className={`h-full ${userPlan.tier === 'Free' ? 'bg-blue-600' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (userPlan.messagesUsed / userPlan.messageLimit) * 100)}%` }}
              />
            </div>

            {userPlan.tier === 'Free' && (
              <button 
                id="sidebar-upgrade-btn"
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                <span>Upgrade SaaS Tier</span>
              </button>
            )}
          </div>

          {/* User Logged Info */}
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shrink-0 flex items-center justify-center font-bold text-sm text-white font-mono shadow-md shadow-violet-600/15">
                {userSession.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate dark:text-zinc-200 text-zinc-900">{userSession.displayName}</div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">{userSession.email}</div>
              </div>
            </div>

            <button 
              id="logout-btn"
              onClick={onLogout}
              className="p-2 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Terminate Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* CHAT/WORKSPACE AREA */}
      <main className="flex-1 flex flex-col justify-between overflow-hidden relative min-w-0">
        
        {/* Workspace Top Menu Header */}
        <header className={`h-16 shrink-0 border-b flex items-center justify-between px-6 z-10 select-none ${
          darkMode ? 'bg-black/40 border-white/5' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex items-center gap-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xl shrink-0">{activeAgent.avatar}</span>
              <div>
                <h2 className="text-xs font-bold dark:text-white text-zinc-950 uppercase tracking-wider font-display">{activeAgent.name}</h2>
                <p className="text-[10px] font-mono text-slate-500 -mt-0.5">Custom Prompt Unit Mapping</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <span className="text-slate-500 text-xs">/</span>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{activeAgent.category}</span>
            </div>
          </div>

          {/* Workspace Switch Tabs */}
          <div className="flex items-center gap-2">
            <button 
              id="header-supabase-history-toggle-btn"
              onClick={() => setShowSupabasePanel(!showSupabasePanel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showSupabasePanel 
                  ? 'bg-blue-600 border-blue-500 text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'border-white/5 text-slate-400 hover:bg-white/[0.04]'
              }`}
              title="Toggle Supabase Cloud Archive History Log"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Supabase Archive</span>
            </button>

            <button 
              id="top-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'chat' 
                  ? 'bg-zinc-900 text-white dark:bg-blue-600 dark:text-white' 
                  : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              Chat
            </button>
            <button 
              id="top-tab-agents"
              onClick={() => setActiveTab('agents')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'agents' 
                  ? 'bg-zinc-900 text-white dark:bg-blue-600 dark:text-white' 
                  : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              Agents
            </button>
            <button 
              id="top-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'analytics' 
                  ? 'current bg-zinc-900 text-white dark:bg-blue-600 dark:text-white' 
                  : 'text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              Analytics
            </button>
            <button 
              id="top-tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                activeTab === 'admin' 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold' 
                  : 'border-transparent text-slate-400 hover:bg-white/[0.04]'
              }`}
            >
              Admin System
            </button>
          </div>
        </header>

        {/* SCREEN SECTION VIEWPORT */}
        <div className="flex-1 overflow-y-auto relative p-6">
          
          {/* TAB 1: CORE CHAT CONTAINER */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col justify-between">
              
              {/* Message scroll log */}
              <div className="flex-1 overflow-y-auto space-y-6 max-w-4xl mx-auto w-full pr-2">
                
                {(!activeConversation || activeConversation.messages.length === 0) ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 text-indigo-500 flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-8 h-8 animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight mb-2">Configure Work Prompt</h3>
                    <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                      Type directly or choose one of the preloaded suggest commands under the {activeAgent.name} pipeline.
                    </p>

                    {/* Preloaded suggested prompts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                      {activeAgent.promptSuggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className={`p-4 rounded-xl border cursor-pointer hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-xs font-medium leading-relaxed flex items-center justify-between gap-3 ${
                            darkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
                          }`}
                        >
                          <span>{suggestion}</span>
                          <ArrowUpRight className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-indigo-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-20">
                    {activeConversation.messages.map((message) => {
                      const isUser = message.role === 'user';
                      
                      return (
                        <div 
                          key={message.id}
                          className={`flex gap-4 p-5 rounded-2xl border transition-all text-left ${
                            isUser 
                              ? (darkMode ? 'bg-zinc-900/30 border-zinc-850/60' : 'bg-white border-zinc-200/50')
                              : (darkMode ? 'bg-zinc-900 border-zinc-800/80 shadow-lg shadow-black/30' : 'bg-white border-zinc-250 shadow-md shadow-zinc-200/20')
                          }`}
                        >
                          {/* Avatar icon */}
                          <div className="shrink-0">
                            {isUser ? (
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono text-sm font-bold flex items-center justify-center">
                                US
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-zinc-500/10 text-xl flex items-center justify-center border border-zinc-500/15">
                                {activeAgent.avatar}
                              </div>
                            )}
                          </div>

                          {/* Content space */}
                          <div className="flex-1 space-y-3 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase">
                                {isUser ? "Authorized User" : activeAgent.name}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button 
                                  onClick={(e) => handleCopyToClipboard(message.content, e)}
                                  className="p-1 rounded hover:bg-zinc-500/10 text-zinc-500 transition-colors"
                                  title="Copy text"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Markdown-style content support mapping */}
                            <div className="text-sm leading-relaxed prose dark:prose-invert max-w-none break-words">
                              {message.content.split('\n').map((paragraph, index) => {
                                // Formatting check: lists
                                if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                                  return (
                                    <li key={index} className="list-disc pl-2 ml-4 my-1 text-zinc-800 dark:text-zinc-300">
                                      {paragraph.replace(/^[-*]\s+/, '')}
                                    </li>
                                  );
                                }
                                
                                // Formatting check: headings
                                if (paragraph.trim().startsWith('### ')) {
                                  return (
                                    <h4 key={index} className="text-base font-extrabold tracking-tight text-indigo-500 mt-4 mb-2">
                                      {paragraph.replace(/^###\s+/, '')}
                                    </h4>
                                  );
                                }

                                if (paragraph.trim().startsWith('## ')) {
                                  return (
                                    <h3 key={index} className="text-lg font-extrabold tracking-tight text-indigo-500 mt-4 mb-2">
                                      {paragraph.replace(/^##\s+/, '')}
                                    </h3>
                                  );
                                }

                                // Formatting check: Code fences support
                                if (paragraph.trim().startsWith('```')) {
                                  return null; // Skip code blocks wrap for simple line mapping
                                }

                                return <p key={index} className="my-1.5">{paragraph}</p>;
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Active streaming message preview */}
                    {isStreaming && streamingMessageText && (
                      <div className={`flex gap-4 p-5 rounded-2xl border transition-all text-left ${
                        darkMode ? 'bg-zinc-900 border-zinc-800/80 shadow-lg' : 'bg-white border-zinc-200'
                      }`}>
                        <div className="shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-500/10 text-xl flex items-center justify-center">
                            {activeAgent.avatar}
                          </div>
                        </div>
                        <div className="flex-1 space-y-3 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase animate-pulse">Sardyx Token Pipeline Transiting</span>
                          </div>
                          <div className="text-sm leading-relaxed transition-all whitespace-pre-wrap">
                            {streamingMessageText}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Thinking Panel Indicator */}
                    {showThinkingPanel && (
                      <div className={`p-4 rounded-xl border text-left font-mono text-xs ${
                        darkMode ? 'bg-zinc-950 border-zinc-850 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-650'
                      }`}>
                        <div className="flex items-center gap-2 mb-2 text-indigo-500 font-bold">
                          <Cpu className="w-4 h-4 animate-spin" />
                          <span>PULSING NEURAL SYNAPSE CORES</span>
                        </div>
                        <div className="space-y-1">
                          {thinkingSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {idx === thinkingSteps.length - 1 ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                              )}
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat action footer bar input panel */}
              <div className="max-w-4xl mx-auto w-full pt-4">
                <div className={`p-1.5 rounded-2xl border transition-all flex items-center gap-2 ${
                  darkMode ? 'bg-black/60 border-white/5 focus-within:border-blue-500/30' : 'bg-white border-zinc-200'
                }`}>
                  <input 
                    type="text" 
                    placeholder="Describe workforce task here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isStreaming}
                    className="flex-1 bg-transparent border-none text-sm outline-none px-4 py-3 text-white"
                  />
                  
                  <div className="flex items-center gap-2 pr-2">
                    {/* Voice Recognition Button */}
                    <button
                      id="speech-mic-toggle-btn"
                      onClick={toggleListening}
                      type="button"
                      className={`p-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isListening 
                          ? 'text-red-400 bg-red-500/10 border border-red-500/30' 
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                      }`}
                      title={isListening ? "Stop voice input" : "Start voice input (Hands-free prompt)"}
                    >
                      {isListening ? (
                        <motion.div
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        >
                          <Mic className="w-4 h-4 text-red-500" />
                        </motion.div>
                      ) : (
                        <MicOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Clear history tool */}
                    {activeConversation && activeConversation.messages.length > 0 && (
                      <button 
                        onClick={handleRegenerateLastMessage}
                        disabled={isStreaming}
                        className="p-2.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/[0.04] cursor-pointer"
                        title="Regenerate last response"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    <button 
                      id="dashboard-send-chat-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isStreaming}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.25)] disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{isStreaming ? "Streaming" : "Submit"}</span>
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] font-mono text-zinc-500 mt-2">
                  {isListening ? (
                    <span className="text-red-400 flex items-center gap-1.5 font-bold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      🎤 Voice active: Speak now... Click mic to stop
                    </span>
                  ) : speechError ? (
                    <span className="text-amber-500 flex items-center gap-1">
                      ⚠️ {speechError}
                    </span>
                  ) : (
                    <span>Press **Enter** to submit standard request</span>
                  )}
                  <span>Sardyx proxy: Validated server-side active</span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AGENTS DIRECTORY SHOWCASE */}
          {activeTab === 'agents' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white font-display">Expert Workforce Units</h3>
                <p className="text-slate-400 text-sm mt-1">Configure and assign custom intelligence to map your targets.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {agents.map((agent) => {
                  const isActive = activeAgentId === agent.id;

                  return (
                    <div 
                      key={agent.id}
                      className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${
                        isActive 
                          ? 'border-blue-500/30 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                          : (darkMode ? 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]' : 'bg-white border-zinc-200 hover:shadow-lg hover:shadow-zinc-300/25')
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl">{agent.avatar}</span>
                          <span className="text-[10px] font-mono font-extrabold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase">
                            {agent.category}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base text-white">{agent.name}</h4>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">{agent.description}</p>
                        
                        <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-slate-300">
                          <strong>Vibe</strong>: {agent.personality}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5">
                        <button 
                          id={`activate-agent-btn-${agent.id}`}
                          onClick={() => {
                            setActiveAgentId(agent.id);
                            handleCreateNewChat(agent.id);
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                              : (darkMode ? 'bg-white/5 hover:bg-white/10 text-slate-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800')
                          }`}
                        >
                          {isActive ? "Active Unit" : "Initialize New Chat Session"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS PREVIEW TRACKER */}
          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
              <SardyxAnalytics userEmail={userSession.email} darkMode={darkMode} />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-red-500 flex items-center gap-2 font-display">
                    <Activity className="w-6 h-6 animate-pulse" />
                    <span>Sardyx Admin Console</span>
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Global SaaS health, metrics monitor, and security audit logs.</p>
                </div>
                
                <button 
                  id="flush-chats-btn"
                  onClick={handleClearAllWorkspaceChats}
                  className="px-4 py-2 text-xs bg-red-650 hover:bg-red-650 text-white rounded-lg font-bold transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                >
                  Clear Platform History Logs
                </button>
              </div>

              {/* Admin metrics logs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-5 rounded-xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-250'}`}>
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Simulated MRR Revenue</div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-display">$18,450</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2">+12.4% during active fortnight</div>
                </div>
                <div className={`p-5 rounded-xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-250'}`}>
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Global Active Accounts</div>
                  <div className="text-3xl font-extrabold text-blue-400 font-display">1,420 users</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2">Handshakes transited securely</div>
                </div>
                <div className={`p-5 rounded-xl border ${darkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-zinc-250'}`}>
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Handshake Success Reach</div>
                  <div className="text-3xl font-extrabold text-indigo-400 font-display">99.8%</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2">Zero packet drop limit reached</div>
                </div>
              </div>

              {/* Diagnostics trace system logs console */}
              <div className="rounded-xl border border-red-500/20 bg-black/60 p-6 font-mono text-xs text-slate-300 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 text-slate-200">
                  <span className="flex items-center gap-2 font-bold text-red-400">
                    <ShieldAlert className="w-4 h-4" /> SECURE CONSOLE ERROR HANDSHAKE MONITOR
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">SECURE AES-256 CONTEXT</span>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {errorLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded bg-red-500/5 border border-red-500/10 space-y-1">
                      <div className="flex justify-between text-[10px] pb-1 border-b border-white/5">
                        <span className="text-red-400 font-extrabold uppercase">Service: {log.service}</span>
                        <span className="text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-mono">{log.error}</p>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-zinc-500 text-center">Diagnostics telemetry active on server process port: 3000</div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* SUPABASE CLOUD ARCHIVE INTEGRATED SIDEPANEL */}
      {showSupabasePanel && (
        <div 
          onClick={() => setShowSupabasePanel(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-96 z-50 transition-all duration-300 ease-in-out border-l transform shadow-2xl flex flex-col ${
        showSupabasePanel ? 'translate-x-0' : 'translate-x-full'
      } ${
        darkMode ? 'bg-[#08080c] border-white/5 text-slate-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
      }`}>
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-850 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm tracking-tight font-display text-white">Supabase Cloud History</h3>
              <span className="text-[9px] font-mono tracking-wider text-slate-500 uppercase font-bold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                {isSupabaseConfigured() ? 'Connected Schema synced' : 'Simulated Sandbox Mode'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="refresh-supabase-history-btn"
              disabled={isLoadingSupabaseHistory}
              onClick={fetchSupabaseHistory}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                isLoadingSupabaseHistory ? 'animate-spin text-blue-400' : ''
              }`}
              title="Sync_Refresh cloud database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="close-supabase-panel-btn"
              onClick={() => setShowSupabasePanel(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-4 bg-blue-500/5 border-b border-blue-500/10 text-left text-[11px] leading-relaxed text-slate-400 flex gap-2">
          <Cloud className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            Every message triggers clean saving of workspaces to your Supabase tables. Fetch logs to restore any past session logs instantly.
          </div>
        </div>

        {/* Custom Toast Messages */}
        {supabaseSuccessMessage && (
          <div className="p-3 mx-4 mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-left flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4 shrink-0" />
            <span>{supabaseSuccessMessage}</span>
          </div>
        )}

        {/* Drawer Scroll History Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-500 text-left">Supabase Database Indexes</div>
          
          {isLoadingSupabaseHistory ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <span className="text-xs font-mono tracking-wider">Querying cloud tables...</span>
            </div>
          ) : supabaseHistory.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/5 bg-white/[0.01]">
              <Database className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <h4 className="text-xs font-bold text-slate-350">No cloud archive entries found</h4>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">
                {isSupabaseConfigured() 
                  ? 'There are no conversations synced to your database. Submit a message in chat to auto-upload logs.'
                  : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to unlock secure cloud storage.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {supabaseHistory.map((chat) => {
                const isCurrentlyActiveInWorkspace = conversations.some(c => c.id === chat.id);
                const chatAgent = agents.find(a => a.id === chat.agentId) || agents[0];
                const dateStr = new Date(chat.updatedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSwitchToPastChat(chat)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-2 relative group ${
                      activeConversationId === chat.id
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : isCurrentlyActiveInWorkspace
                          ? 'bg-white/[0.02] border-white/10 hover:border-white/15'
                          : 'bg-[#0a0a0f] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{chatAgent.avatar}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold truncate text-slate-100 group-hover:text-blue-400 transition-colors">
                            {chat.title}
                          </h4>
                          <span className="text-[9px] font-mono text-zinc-500 block">
                            {chatAgent.name} • {chat.activeModel}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSupabaseHistoryChat(chat.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete permanently from Supabase"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-2 border-t border-white/5">
                      <span>{dateStr}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isCurrentlyActiveInWorkspace 
                          ? 'bg-[#10b981]/15 text-[#10b981]' 
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {isCurrentlyActiveInWorkspace ? 'Active Workspace' : 'Cloud Remote'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick instructions panel for provisioning */}
          <div className="pt-4 border-t border-white/5 text-left space-y-2">
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">Database Handshake Diagnostics</span>
            <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono leading-relaxed text-slate-400 space-y-1.5">
              <div className="flex justify-between font-mono text-[9px] text-slate-500">
                <span>DATABASE DIALECT</span>
                <span className="text-blue-400">POSTGRESQL</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-300 block">Required Schema Schema Tables:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[9px]">
                  <li><code>conversations</code> (JSONB history logs)</li>
                  <li><code>folders</code> (directories context)</li>
                  <li><code>user_plans</code> (limits bandwidth)</li>
                  <li><code>error_logs</code> (fault codes tracker)</li>
                </ul>
              </div>
              <p className="text-[9px] text-slate-500 italic mt-2">
                * Handshake handles atomic upserts directly over standard Postgres REST API.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM SAAS UPGRADE MODAL FLOATING PANEL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6 select-none animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl border p-8 transition-all relative ${
            darkMode ? 'bg-[#08080c] border-white/5 text-slate-100' : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl'
          }`}>
            {/* Close button */}
            <button 
              id="close-upgrade-modal-btn"
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Description */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 animate-pulse">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white font-display">Upgrade Workplace Node</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm">Unlock absolute model capabilities, priority streaming pipeline and custom API keys proxies completely.</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all border-blue-500/30 bg-blue-500/5`}>
                <div className="text-left">
                  <div className="font-bold text-sm text-white">Sardyx Core Pro Edition</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">Custom key mapping, unlimited folder logs.</p>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-white">$49/mo</div>
                  <div className="text-[9px] text-blue-400 font-bold uppercase font-mono tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded">Best Seller</div>
                </div>
              </div>

              <div 
                onClick={() => handleSimulateUpgradePlan('Enterprise')}
                className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all hover:border-white/10 ${
                  darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-200">Sardyx Scale Enterprise</div>
                  <p className="text-slate-400 text-[11px] mt-0.5">SLA uptime, fully managed priority gateways.</p>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-200">$199/mo</div>
                  <div className="text-[10px] text-slate-400 font-mono">Dedicated Server</div>
                </div>
              </div>
            </div>

            {/* Direct execution triggers mock checkout */}
            <button
              id="checkout-sim-btn"
              onClick={() => handleSimulateUpgradePlan('Pro')}
              className="w-full py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Activate Standard License Upgrade</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 w-96 max-w-[calc(100vw-3rem)]">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              layout
              className={`p-4 rounded-xl border-l-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border flex flex-col gap-2.5 relative leading-normal text-left transition-all backdrop-blur-md ${
                darkMode 
                  ? 'bg-[#09090dd8] border-white/10 text-slate-100 shadow-xl' 
                  : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-xl'
              } ${
                toast.type === 'alert' 
                  ? 'border-l-rose-500' 
                  : toast.type === 'warning' 
                    ? 'border-l-amber-500' 
                    : 'border-l-blue-500'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Dismiss warning"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5 pr-6">
                <div className="mt-0.5 shrink-0">
                  {toast.type === 'alert' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black tracking-tight">{toast.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>

              {/* Progress visual indicator inside Toast */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500">
                  <span>METRIC RATIO INDEX</span>
                  <span className={toast.percentage >= 95 ? 'text-rose-500' : 'text-amber-500'}>
                    {toast.percentage}% CONSUMED
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${toast.percentage}%` }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className={`h-full rounded-full ${
                      toast.percentage >= 95 
                        ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                  />
                </div>
              </div>

              {/* Inline Action helper button */}
              <div className="flex justify-end gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={() => {
                    removeToast(toast.id);
                    setActiveTab('analytics');
                  }}
                  className="px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/5 rounded-md border border-white/5 transition-all cursor-pointer font-mono"
                >
                  Inspect Analytics
                </button>
                {userPlan.tier === 'Free' && (
                  <button
                    onClick={() => {
                      removeToast(toast.id);
                      setShowUpgradeModal(true);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-all flex items-center gap-1 cursor-pointer font-mono"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>Upgrade</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
