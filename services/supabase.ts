import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://yqqyhhbeeypjhfjnakdd.supabase.co';
const supabaseKey = 'sb_publishable_hmcDsOh0XabuN9sUvyVwLw_nIHLYHDi';

export const supabase = createClient(supabaseUrl, supabaseKey);