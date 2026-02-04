import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdjynjmomsaqiptbundx.supabase.co'
const supabaseAnonKey = 'sb_publishable_jhVzDp3glxiS9W3wmw2LHA_FYtuFwlg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
