'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// 회원가입은 전화번호 OTP 로그인과 동일 흐름 — /login으로 리다이렉트
export default function SignupPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/login') }, [router])
  return null
}
