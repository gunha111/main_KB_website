import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

// 클라이언트 컴포넌트용 싱글톤 Supabase 클라이언트
// 빌드 시(env 미설정)에는 호출되지 않으므로 런타임에만 초기화
export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!url || !key) {
    // 빌드 타임 prerender 시 더미 클라이언트 반환 (실제 호출 없음)
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder')
  }

  client = createBrowserClient(url, key)
  return client
}
