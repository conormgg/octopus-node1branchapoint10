// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://igzgxtjkaaabziccoofe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnemd4dGprYWFhYnppY2Nvb2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDUzODAsImV4cCI6MjA2MTQyMTM4MH0.JsZKaHVbcPlM7MFLynJi89cISdn5Y73A6560-ez2YuI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});