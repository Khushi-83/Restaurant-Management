import { createClient } from '@supabase/supabase-js';

// Type-safe environment variables
const env = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  socket: process.env.NEXT_PUBLIC_SOCKET_SERVER
};

// Debug output (remove in production)
console.log('[ENV] Supabase Config:', {
  url: env.url ? '✔ Present' : '✖ Missing',
  key: env.key ? '✔ Present (truncated)' : '✖ Missing',
  keyEnd: env.key?.slice(-4) // Show last 4 chars for verification
});

// Validation with helpful errors
if (!env.url) throw new Error(`
  Missing Supabase URL. Please verify:
  1. .env.local exists in project root
  2. Contains NEXT_PUBLIC_SUPABASE_URL
  3. Next.js server was restarted after changes
`);

if (!env.key) throw new Error(`
  Missing Supabase Anon Key. Please verify:
  1. Key is copied exactly from Supabase dashboard
  2. No trailing whitespace in .env.local
  3. File uses LF line endings (not CRLF)
`);

// Initialize with enhanced config
export const supabase = createClient(env.url, env.key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'nextjs/v13'
    }
  }
});


// Connection test (dev-only)
if (process.env.NODE_ENV === 'development') {
  supabase
    .from('fooditems')
    .select('*', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) console.error('🔴 Supabase connection failed:', error.message);
      else console.log('🟢 Supabase connected successfully. Tables:', count);
    });
}