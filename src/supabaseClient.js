import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdjynjmomsaqiptbundx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jhVzDp3glxiS9W3wmw2LHA_FYtuFwlg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
