export type BizType =
  | 'restaurant'
  | 'retail'
  | 'beauty'
  | 'fitness'
  | 'it'
  | 'manufacturing'
  | 'wholesale'
  | 'service'
  | 'other'

export type BizSize = 'solo' | 'under5' | 'under10' | 'over10'

export type PlanType = 'free' | 'basic' | 'standard' | 'premium'

export type NotificationType = 'd14' | 'd7' | 'd3' | 'new'

export type NotificationStatus = 'sent' | 'failed' | 'opened'

export type PaymentStatus = 'success' | 'failed' | 'cancelled'

// ─── profiles ──────────────────────────────────────────────
export interface Profile {
  id: string                       // auth.uid()
  phone: string | null             // 전화번호
  biz_name: string | null          // 상호명
  biz_type: BizType | null         // 업종
  biz_region_sido: string | null   // 시·도
  biz_region_sigungu: string | null // 시·군·구
  biz_size: BizSize | null         // 규모
  plan: PlanType                   // 구독 플랜
  billing_key: string | null       // 토스 빌링키
  kakao_consent: boolean           // 카카오 알림톡 동의
  next_billing_date: string | null // 다음 결제일 YYYY-MM-DD
  created_at: string
}

export interface ProfileInsert {
  id: string
  phone?: string | null
  biz_name?: string | null
  biz_type?: BizType | null
  biz_region_sido?: string | null
  biz_region_sigungu?: string | null
  biz_size?: BizSize | null
  plan?: PlanType
  billing_key?: string | null
  kakao_consent?: boolean
  next_billing_date?: string | null
}

export interface ProfileUpdate {
  phone?: string | null
  biz_name?: string | null
  biz_type?: BizType | null
  biz_region_sido?: string | null
  biz_region_sigungu?: string | null
  biz_size?: BizSize | null
  plan?: PlanType
  billing_key?: string | null
  kakao_consent?: boolean
  next_billing_date?: string | null
}

// ─── subsidies ─────────────────────────────────────────────
export interface Subsidy {
  id: string
  external_id: string               // 기업마당 공고 ID
  title: string                     // 공고명
  agency: string                    // 기관명
  category: string                  // 분야
  target_biz_types: string[] | null // 대상 업종
  target_regions: string[] | null   // 대상 지역
  support_amount: string | null     // 지원금액
  start_date: string | null         // 접수 시작일
  end_date: string                  // 마감일 YYYY-MM-DD
  detail_url: string                // 원문 URL
  raw_content: string               // 공고 원문
  created_at: string
  updated_at: string
}

export interface SubsidyInsert {
  external_id: string
  title: string
  agency: string
  category: string
  target_biz_types?: string[] | null
  target_regions?: string[] | null
  support_amount?: string | null
  start_date?: string | null
  end_date: string
  detail_url: string
  raw_content: string
}

export interface SubsidyUpdate {
  title?: string
  agency?: string
  category?: string
  target_biz_types?: string[] | null
  target_regions?: string[] | null
  support_amount?: string | null
  start_date?: string | null
  end_date?: string
  detail_url?: string
  raw_content?: string
  updated_at?: string
}

// ─── notifications ─────────────────────────────────────────
export interface Notification {
  id: string
  user_id: string
  subsidy_id: string
  type: NotificationType
  channel: string
  sent_at: string
  opened_at: string | null
  status: NotificationStatus
}

export interface NotificationInsert {
  user_id: string
  subsidy_id: string
  type: NotificationType
  channel: string
  sent_at?: string
  opened_at?: string | null
  status: NotificationStatus
}

export interface NotificationUpdate {
  opened_at?: string | null
  status?: NotificationStatus
}

// ─── drafts ────────────────────────────────────────────────
export interface Draft {
  id: string
  user_id: string
  subsidy_id: string
  content: string | null   // JSON string (AI 생성 초안)
  created_at: string
}

export interface DraftInsert {
  user_id: string
  subsidy_id: string
  content?: string | null
}

export interface DraftUpdate {
  content?: string | null
}

// ─── payments ──────────────────────────────────────────────
export interface Payment {
  id: string
  user_id: string
  amount: number
  plan: PlanType
  status: PaymentStatus
  toss_order_id: string | null
  retry_count: number
  paid_at: string
}

export interface PaymentInsert {
  user_id: string
  amount: number
  plan: PlanType
  status: PaymentStatus
  toss_order_id?: string | null
  retry_count?: number
  paid_at?: string
}

export interface PaymentUpdate {
  status?: PaymentStatus
  retry_count?: number
}

// ─── Database 타입 맵 ───────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      subsidies: {
        Row: Subsidy
        Insert: SubsidyInsert
        Update: SubsidyUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      drafts: {
        Row: Draft
        Insert: DraftInsert
        Update: DraftUpdate
      }
      payments: {
        Row: Payment
        Insert: PaymentInsert
        Update: PaymentUpdate
      }
    }
  }
}
