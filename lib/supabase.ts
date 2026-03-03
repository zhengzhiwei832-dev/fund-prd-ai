import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
export interface GenerationRecord {
  id?: string;
  user_id?: string;
  provider: string;
  model: string;
  requirement: string;
  context?: string;
  generated_content: string;
  edited_content?: string;
  edit_diff?: string;
  was_edited: boolean;
  was_exported: boolean;
  export_format?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalGenerations: number;
  totalEdited: number;
  totalExported: number;
  exportRate: number;
  dailyStats: {
    date: string;
    generated: number;
    exported: number;
    rate: number;
  }[];
  providerStats: {
    provider: string;
    count: number;
  }[];
}

// Lazy initialization of Supabase client
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Only create client if we have valid credentials
  if (!supabaseUrl || !supabaseKey) return null;
  if (supabaseUrl === 'https://your-project.supabase.co') return null;
  if (supabaseUrl === 'your_supabase_project_url') return null;
  if (supabaseKey === 'your-anon-key') return null;
  if (supabaseKey === 'your_supabase_anon_key') return null;

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  } catch {
    return null;
  }
}

// LocalStorage implementation for MVP
const STORAGE_KEY = 'fund_prd_generations';

function getLocalGenerations(): GenerationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalGenerations(generations: GenerationRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(generations));
  } catch {
    // Ignore storage errors
  }
}

// Database operations
export async function saveGeneration(record: GenerationRecord): Promise<string | null> {
  const supabase = getSupabaseClient();

  // If Supabase is configured, use it
  if (supabase) {
    const { data, error } = await supabase
      .from('generations')
      .insert(record)
      .select('id')
      .single();

    if (error) {
      console.error('Save generation error:', error);
      // Fall through to localStorage
    } else {
      return data?.id;
    }
  }

  // Fallback to localStorage
  const generations = getLocalGenerations();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);

  const newRecord = {
    ...record,
    id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  generations.unshift(newRecord);
  saveLocalGenerations(generations);
  return id;
}

export async function updateGeneration(
  id: string,
  updates: Partial<GenerationRecord>
): Promise<boolean> {
  const supabase = getSupabaseClient();

  // If Supabase is configured, use it
  if (supabase) {
    const { error } = await supabase
      .from('generations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) return true;
    // Fall through to localStorage on error
  }

  // Fallback to localStorage
  const generations = getLocalGenerations();
  const index = generations.findIndex(g => g.id === id);
  if (index === -1) return false;

  generations[index] = {
    ...generations[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveLocalGenerations(generations);
  return true;
}

export async function getGenerations(limit: number = 100): Promise<GenerationRecord[]> {
  const supabase = getSupabaseClient();

  // If Supabase is configured, use it
  if (supabase) {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) return data;
    // Fall through to localStorage on error
  }

  // Fallback to localStorage
  const generations = getLocalGenerations();
  return generations.slice(0, limit);
}

export async function getDashboardStats(days: number = 30): Promise<DashboardStats> {
  const supabase = getSupabaseClient();
  let generations: GenerationRecord[] = [];

  // If Supabase is configured, try to use it
  if (supabase) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (!error && data) {
      generations = data;
    } else {
      // Fall back to localStorage
      generations = getLocalGenerations();
    }
  } else {
    // Use localStorage
    generations = getLocalGenerations();
  }

  return calculateStats(generations, days);
}

function calculateStats(generations: GenerationRecord[], days: number): DashboardStats {
  // Calculate totals
  const totalGenerations = generations.length;
  const totalEdited = generations.filter(g => g.was_edited).length;
  const totalExported = generations.filter(g => g.was_exported).length;
  const exportRate = totalGenerations > 0 ? (totalExported / totalGenerations) * 100 : 0;

  // Daily stats
  const dailyMap = new Map<string, { generated: number; exported: number }>();

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().split('T')[0], { generated: 0, exported: 0 });
  }

  generations.forEach(g => {
    const date = g.created_at?.split('T')[0];
    if (date && dailyMap.has(date)) {
      const stats = dailyMap.get(date)!;
      stats.generated++;
      if (g.was_exported) stats.exported++;
    }
  });

  const dailyStats = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, stats]) => ({
      date,
      generated: stats.generated,
      exported: stats.exported,
      rate: stats.generated > 0 ? (stats.exported / stats.generated) * 100 : 0,
    }));

  // Provider stats
  const providerMap = new Map<string, number>();
  generations.forEach(g => {
    providerMap.set(g.provider, (providerMap.get(g.provider) || 0) + 1);
  });

  const providerStats = Array.from(providerMap.entries())
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalGenerations,
    totalEdited,
    totalExported,
    exportRate,
    dailyStats,
    providerStats,
  };
}
