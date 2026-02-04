import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdjynjmomsaqiptbundx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkanluam1vbXNhcWlwdGJ1bmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjM1MDUsImV4cCI6MjA4NTc5OTUwNX0._JBuF7S25A3tZuKgWerihJqsH7zXRtNPhZum5DSZeLc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
