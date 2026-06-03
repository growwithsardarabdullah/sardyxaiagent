export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  tokens?: number;
  thinkingTime?: string; // e.g. "0.8s"
  isStreaming?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  personality: string;
  category: 'strategy' | 'marketing' | 'tech' | 'creative' | 'sales' | 'academic';
  promptSuggestions: string[];
}

export interface ChatFolder {
  id: string;
  name: string;
  icon?: string;
}

export interface Conversation {
  id: string;
  title: string;
  agentId: string;
  folderId?: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  starred?: boolean;
  activeModel: string;
}

export interface UserPlan {
  tier: 'Free' | 'Pro' | 'Enterprise';
  messageLimit: number;
  messagesUsed: number;
  priceValue: number; // e.g. 0, 49, 199
  billingCycle: 'monthly' | 'yearly';
}

export interface AdminStats {
  totalUsers: number;
  totalMessages: number;
  activeNow: number;
  avgResponseTime: number; // in ms
  revenue: number;
  cpuLoad: number; // simulated SaaS health status
  apiSuccessRate: number; // e.g. 99.8%
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  error: string;
  service: string;
  userEmail?: string;
}

export interface UserSession {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  user_email: string;
  date_label: string; // e.g., "Jan", "Feb", "Mar" or daily "June 01"
  tokens_used: number;
  active_chats_count: number;
  created_at?: string;
}
