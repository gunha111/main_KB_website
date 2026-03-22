import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// 클라이언트 컴포넌트용 싱글톤 Supabase 클라이언트
let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (client) return client

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}
