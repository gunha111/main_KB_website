import type { Metadata } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_KR({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const notoSerif = Noto_Serif_KR({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: '지원알림 — 정부 지원사업 맞춤 알림',
  description: '소상공인을 위한 정부 지원사업 공고를 자동으로 수집하고, 마감 전 카카오 알림톡으로 알려드립니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: '#08112A', fontFamily: 'var(--font-sans)' }}
      >
        {children}
      </body>
    </html>
  )
}
