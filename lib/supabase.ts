import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
  throw new Error('Falta a variável de ambiente NEXT_PUBLIC_SUPABASE_URL')
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  throw new Error('Falta a variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey) 