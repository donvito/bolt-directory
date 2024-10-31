import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  username: string;
  avatarUrl: string;
  isAuthenticated: boolean;
  // ... any other custom fields
} 