import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojdfdoyuhcshrtwibzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvamRmZG95dWhjc2hydHdpYnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDg0ODksImV4cCI6MjA3NjcyNDQ4OX0.4NNkc8B_2ZyYEsS6K9ahEc501SsDyS8GGN8iT3-g48M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
