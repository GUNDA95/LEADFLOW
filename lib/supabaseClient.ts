import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuwspoojhwdapczmrtsb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1d3Nwb29qaHdkYXBjem1ydHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzEzODksImV4cCI6MjA4MDMwNzM4OX0.xEb0buGlUp03xD4erno-UC-5UOR3cSBybnV7jAc1mtE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);