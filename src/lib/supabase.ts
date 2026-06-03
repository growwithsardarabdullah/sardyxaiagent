import { createClient } from '@supabase/supabase-js';
import { Conversation, ChatFolder, UserPlan, ErrorLog, UsageRecord } from '../types';

/**
 * SQL SCHEMA FOR SUPABASE SQL EDITOR
 * 
 * -- 1. Folders table
 * CREATE TABLE IF NOT EXISTS public.folders (
 *     id TEXT PRIMARY KEY,
 *     user_email TEXT NOT NULL,
 *     name TEXT NOT NULL,
 *     icon TEXT,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- 2. Conversations table
 * CREATE TABLE IF NOT EXISTS public.conversations (
 *     id TEXT PRIMARY KEY,
 *     user_email TEXT NOT NULL,
 *     title TEXT NOT NULL,
 *     agent_id TEXT NOT NULL,
 *     folder_id TEXT,
 *     messages JSONB DEFAULT '[]'::jsonb NOT NULL,
 *     created_at TEXT NOT NULL,
 *     updated_at TEXT NOT NULL,
 *     starred BOOLEAN DEFAULT false,
 *     active_model TEXT DEFAULT 'gemini-3.5-flash' NOT NULL
 * );
 * 
 * -- 3. User Plans table
 * CREATE TABLE IF NOT EXISTS public.user_plans (
 *     user_email TEXT PRIMARY KEY,
 *     tier TEXT DEFAULT 'Free'::text NOT NULL,
 *     message_limit INTEGER DEFAULT 50 NOT NULL,
 *     messages_used INTEGER DEFAULT 0 NOT NULL,
 *     price_value INTEGER DEFAULT 0 NOT NULL,
 *     billing_cycle TEXT DEFAULT 'monthly'::text NOT NULL,
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- 4. Error Logs table
 * CREATE TABLE IF NOT EXISTS public.error_logs (
 *     id TEXT PRIMARY KEY,
 *     user_email TEXT,
 *     timestamp TEXT NOT NULL,
 *     error TEXT NOT NULL,
 *     service TEXT NOT NULL,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- 5. Usage metrics table
 * CREATE TABLE IF NOT EXISTS public.usage (
 *     id TEXT PRIMARY KEY,
 *     user_email TEXT NOT NULL,
 *     date_label TEXT NOT NULL,
 *     tokens_used INTEGER DEFAULT 0 NOT NULL,
 *     active_chats_count INTEGER DEFAULT 0 NOT NULL,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
 * );
 * 
 * -- Enable RLS (Row Level Security) and rules can be set based on user_email
 */

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'MY_SUPABASE_URL' &&
    supabaseUrl.trim() !== '' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'MY_SUPABASE_ANON_KEY' &&
    supabaseAnonKey.trim() !== ''
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// FOLDERS DB SYNCHRONIZERS
export async function dbFetchFolders(email: string): Promise<ChatFolder[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_email', email)
      .order('id', { ascending: true });

    if (error) throw error;
    return (data || []) as ChatFolder[];
  } catch (err) {
    console.warn('[Supabase Sync Warn] Error fetching folders:', err);
    return null;
  }
}

export async function dbUpsertFolder(email: string, folder: ChatFolder): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('folders')
      .upsert({
        id: folder.id,
        user_email: email,
        name: folder.name,
        icon: folder.icon || ''
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error saving folder:', err);
    return false;
  }
}

export async function dbDeleteFolder(folderId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error deleting folder:', err);
    return false;
  }
}

// CONVERSATIONS DB SYNCHRONIZERS
export async function dbFetchConversations(email: string): Promise<Conversation[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_email', email)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      agentId: item.agent_id,
      folderId: item.folder_id || undefined,
      messages: Array.isArray(item.messages) ? item.messages : [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      starred: !!item.starred,
      activeModel: item.active_model
    })) as Conversation[];
  } catch (err) {
    console.warn('[Supabase Sync Warn] Error fetching conversations:', err);
    return null;
  }
}

export async function dbUpsertConversation(email: string, chat: Conversation): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .upsert({
        id: chat.id,
        user_email: email,
        title: chat.title,
        agent_id: chat.agentId,
        folder_id: chat.folderId || null,
        messages: chat.messages,
        created_at: chat.createdAt,
        updated_at: chat.updatedAt,
        starred: !!chat.starred,
        active_model: chat.activeModel
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error saving conversation:', err);
    return false;
  }
}

export async function dbDeleteConversation(chatId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', chatId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error deleting conversation:', err);
    return false;
  }
}

export async function dbClearAllConversations(email: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_email', email);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error flushing conversations history:', err);
    return false;
  }
}

// USER PLAN DB SYNCHRONIZERS
export async function dbFetchPlan(email: string): Promise<UserPlan | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_email', email)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      tier: data.tier,
      messageLimit: data.message_limit,
      messagesUsed: data.messages_used,
      priceValue: data.price_value,
      billingCycle: data.billing_cycle
    } as UserPlan;
  } catch (err) {
    console.warn('[Supabase Sync Warn] Error fetching user plan:', err);
    return null;
  }
}

export async function dbUpsertPlan(email: string, plan: UserPlan): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('user_plans')
      .upsert({
        user_email: email,
        tier: plan.tier,
        message_limit: plan.messageLimit,
        messages_used: plan.messagesUsed,
        price_value: plan.priceValue,
        billing_cycle: plan.billingCycle,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error saving plan:', err);
    return false;
  }
}

// ERROR LOGS DB SYNCHRONIZERS
export async function dbFetchErrorLogs(email: string): Promise<ErrorLog[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .or(`user_email.eq.${email},user_email.is.null`)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      timestamp: item.timestamp,
      error: item.error,
      service: item.service,
      userEmail: item.user_email || undefined
    })) as ErrorLog[];
  } catch (err) {
    console.warn('[Supabase Sync Warn] Error fetching error logs:', err);
    return null;
  }
}

export async function dbInsertErrorLog(email: string, log: ErrorLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('error_logs')
      .insert({
        id: log.id,
        user_email: email,
        timestamp: log.timestamp,
        error: log.error,
        service: log.service
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error inserting error log:', err);
    return false;
  }
}

// USAGE METRICS SYNCHRONIZERS
export async function dbFetchUsageData(email: string): Promise<UsageRecord[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      user_email: item.user_email,
      date_label: item.date_label,
      tokens_used: item.tokens_used,
      active_chats_count: item.active_chats_count,
      created_at: item.created_at
    })) as UsageRecord[];
  } catch (err) {
    console.warn('[Supabase Sync Warn] Error fetching usage data:', err);
    return null;
  }
}

export async function dbUpsertUsageRecord(email: string, record: UsageRecord): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('usage')
      .upsert({
        id: record.id,
        user_email: email,
        date_label: record.date_label,
        tokens_used: record.tokens_used,
        active_chats_count: record.active_chats_count,
        created_at: record.created_at || new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[Supabase Error] Error upserting usage record:', err);
    return false;
  }
}
