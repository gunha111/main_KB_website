'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// 010-XXXX-XXXX → +8210XXXXXXXX
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    return '+82' + digits.slice(1)
  }
  return '+82' + digits
}

// 입력값 자동 포맷: 010-XXXX-XXXX
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function isValidPhone(phone: string): boolean {
  return /^010-\d{4}-\d{4}$/.test(phone)
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // 재발송 카운트다운
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown((n) => n - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // OTP 6자리 완성 시 자동 인증
  useEffect(() => {
    const code = otp.join('')
    if (code.length === 6) {
      handleVerifyOtp(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  async function handleSendOtp() {
    setError('')
    if (!isValidPhone(phone)) {
      setError('올바른 전화번호를 입력해주세요')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: toE164(phone),
    })
    setLoading(false)
    if (err) {
      setError('잠시 후 다시 시도해주세요')
      return
    }
    setStep('otp')
    setResendCooldown(60)
  }

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      setError('')
      setLoading(true)
      const { data, error: err } = await supabase.auth.verifyOtp({
        phone: toE164(phone),
        token: code,
        type: 'sms',
      })
      setLoading(false)
      if (err) {
        setError('인증번호가 맞지 않습니다')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
        return
      }
      // 프로필 존재 여부로 온보딩 분기
      const userId = data.user?.id
      if (!userId) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (profile) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    },
    [phone, router, supabase]
  )

  function handleOtpChange(index: number, value: string) {
    // 붙여넣기 처리
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = [...otp]
      digits.split('').forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d
      })
      setOtp(newOtp)
      const nextIndex = Math.min(index + digits.length, 5)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '')
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#08112A' }}
    >
      <div
        className="w-full max-w-[400px] rounded-2xl p-8"
        style={{ backgroundColor: '#0D1E3F' }}
      >
        {/* 로고 */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold" style={{ color: '#E8A020' }}>
            🔔 지원알림
          </span>
          <p className="mt-2 text-sm text-white/50">
            정부 지원사업 맞춤 알림 서비스
          </p>
        </div>

        {step === 'phone' ? (
          <>
            <label className="block text-sm text-white/70 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#E8A020] transition"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="mt-4 w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: '#E8A020' }}
            >
              {loading ? '발송 중...' : '인증번호 받기'}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-white/70 mb-1">
              <span className="text-white font-medium">{phone}</span>으로
              전송된 인증번호를 입력해주세요
            </p>
            <div className="flex gap-2 mt-4 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#E8A020] transition"
                />
              ))}
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
            )}
            {loading && (
              <p className="mt-3 text-sm text-white/50 text-center">
                인증 중...
              </p>
            )}
            <button
              onClick={() => handleSendOtp()}
              disabled={resendCooldown > 0 || loading}
              className="mt-5 w-full py-2.5 rounded-lg text-sm text-white/60 border border-white/10 hover:border-white/30 transition disabled:opacity-40"
            >
              {resendCooldown > 0
                ? `재발송 (${resendCooldown}초 후 가능)`
                : '인증번호 재발송'}
            </button>
            <button
              onClick={() => {
                setStep('phone')
                setOtp(['', '', '', '', '', ''])
                setError('')
              }}
              className="mt-2 w-full py-2 text-sm text-white/40 hover:text-white/60 transition"
            >
              전화번호 다시 입력
            </button>
          </>
        )}
      </div>
    </div>
  )
}
