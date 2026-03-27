import type { Metadata } from 'next'
import { Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google'
import Script from 'next/script'
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
      <Script id="clarity" strategy="afterInteractive">{`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "w27xdppr1n");
      `}</Script>
      <body
        className="min-h-screen antialiased flex flex-col"
        style={{ backgroundColor: '#08112A', fontFamily: 'var(--font-sans)' }}
      >
        <div className="flex-1">{children}</div>
        <footer className="border-t border-white/5 py-8 px-6" style={{ backgroundColor: '#08112A' }}>
          <div className="max-w-4xl mx-auto text-xs text-white/30 space-y-1">
            <p className="font-medium text-white/50">지원알림</p>
            <p>상호명: 유얼애니멀(youranimal) | 대표자: 백건하 | 사업자등록번호: 135-64-00782</p>
            <p>주소: 서울특별시 강남구 봉은사로 307</p>
            <p>이메일: kunha0303@gmail.com</p>
            <p className="pt-2">© {new Date().getFullYear()} 지원알림. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
