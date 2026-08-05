import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dzfpymaahnavhldjmsyw.supabase.co'
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

if (!supabasePublishableKey) {
  console.warn('Missing Supabase key. Set VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey || 'placeholder-key')

export default supabase
