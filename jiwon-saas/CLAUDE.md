# 지원알림 (jiwon-saas)

## 서비스 개요
소상공인이 업종·지역·규모를 설정하면
기업마당 공공 API에서 맞춤 정부 지원사업 공고를 수집해서
카카오 알림톡으로 마감 D-14, D-7, D-3일 전에 자동 발송하는 월 구독 SaaS.

## 기술 스택
- Framework: Next.js 14 (App Router)
- Language: TypeScript (strict)
- Styling: Tailwind CSS + shadcn/ui
- Database + Auth: Supabase (@supabase/ssr)
- Hosting: Netlify (Scheduled Functions)
- 결제: 토스페이먼츠 (자동결제 빌링)
- 메시징: 솔라피 (카카오 알림톡)
- AI: Anthropic Claude API (신청서 초안)

## 구독 플랜
- free: 0원, 공고 3건만, 알림 없음
- basic: 29,000원/월, 알림 무제한
- standard: 59,000원/월, AI 초안 월 5건
- premium: 99,000원/월, AI 초안 무제한

## 폴더 구조
app/
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (dashboard)/dashboard/page.tsx
  (dashboard)/subsidies/[id]/page.tsx
  (dashboard)/draft/[id]/page.tsx
  (dashboard)/mypage/page.tsx
  (dashboard)/mypage/settings/page.tsx
  onboarding/page.tsx
  page.tsx
  layout.tsx
  api/subsidies/route.ts
  api/billing/register/route.ts
  api/billing/cancel/route.ts
  api/billing/history/route.ts
  api/draft/route.ts
  api/profile/kakao-consent/route.ts
components/
  SubsidyCard.tsx
  DashboardStats.tsx
  FilterBar.tsx
  PlanSelector.tsx
  CancelModal.tsx
  KakaoToggle.tsx
lib/
  supabase/server.ts
  supabase/client.ts
  supabase/types.ts
  bizinfo-api.ts
  solapi.ts
  toss.ts
  claude.ts
  plans.ts
netlify/functions/
  cron-sync-subsidies.ts
  cron-send-notifications.ts
  cron-billing.ts
supabase/
  schema.sql

## 디자인 시스템
- 배경: #08112A (다크 네이비)
- 카드 배경: #0D1E3F
- 포인트: #E8A020 (골드)
- 폰트: Noto Serif KR (제목) + Noto Sans KR (본문)
- Tailwind CSS만 사용 (외부 UI 라이브러리 없이)

## 환경변수 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BIZINFO_API_KEY=
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_PFID=
SOLAPI_TEMPLATE_D14=
SOLAPI_TEMPLATE_D7=
SOLAPI_TEMPLATE_D3=
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
