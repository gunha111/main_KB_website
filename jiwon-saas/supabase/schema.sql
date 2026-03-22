-- ============================================================
-- 지원알림 (jiwon-saas) Supabase Schema
-- ============================================================

-- ─── profiles ────────────────────────────────────────────────
-- 사용자 프로필 (auth.users와 1:1 연결)
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone               TEXT,                -- 전화번호
  biz_name            TEXT,                -- 상호명
  biz_type            TEXT CHECK (biz_type IN (
                        'restaurant','retail','beauty','fitness',
                        'it','manufacturing','wholesale','service','other'
                      )),                  -- 업종
  biz_region_sido     TEXT,                -- 시·도
  biz_region_sigungu  TEXT,                -- 시·군·구
  biz_size            TEXT CHECK (biz_size IN (
                        'solo','under5','under10','over10'
                      )),                  -- 규모
  plan                TEXT NOT NULL DEFAULT 'free' CHECK (
                        plan IN ('free','basic','standard','premium')
                      ),                  -- 구독 플랜
  billing_key         TEXT,                -- 토스페이먼츠 빌링키
  kakao_consent       BOOLEAN NOT NULL DEFAULT FALSE, -- 카카오 알림톡 동의
  next_billing_date   DATE,                -- 다음 결제일
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── subsidies ───────────────────────────────────────────────
-- 기업마당에서 수집한 지원사업 공고
CREATE TABLE IF NOT EXISTS subsidies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id       TEXT NOT NULL UNIQUE,  -- 기업마당 공고 ID
  title             TEXT NOT NULL,         -- 공고명
  agency            TEXT NOT NULL,         -- 주관기관
  category          TEXT NOT NULL,         -- 분야
  target_biz_types  TEXT[],               -- 대상 업종 배열
  target_regions    TEXT[],               -- 대상 지역 배열
  support_amount    TEXT,                  -- 지원금액
  start_date        DATE,                  -- 접수 시작일
  end_date          DATE NOT NULL,         -- 마감일
  detail_url        TEXT NOT NULL,         -- 원문 URL
  raw_content       TEXT NOT NULL DEFAULT '', -- 공고 원문
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- subsidies.updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER subsidies_updated_at
  BEFORE UPDATE ON subsidies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── notifications ───────────────────────────────────────────
-- 알림 발송 로그
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subsidy_id  UUID NOT NULL REFERENCES subsidies(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('d14','d7','d3','new')), -- 알림 유형
  channel     TEXT NOT NULL,                                          -- 발송 채널 (kakao 등)
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),                     -- 발송 시각
  opened_at   TIMESTAMPTZ,                                            -- 열람 시각
  status      TEXT NOT NULL CHECK (status IN ('sent','failed','opened')) -- 상태
);

-- ─── drafts ──────────────────────────────────────────────────
-- AI 신청서 초안
CREATE TABLE IF NOT EXISTS drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subsidy_id  UUID NOT NULL REFERENCES subsidies(id) ON DELETE CASCADE,
  content     TEXT,          -- JSON string (AI 생성 초안 4개 섹션)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── payments ────────────────────────────────────────────────
-- 결제 내역
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        INTEGER NOT NULL,    -- 결제 금액 (원)
  plan          TEXT NOT NULL CHECK (plan IN ('free','basic','standard','premium')), -- 플랜
  status        TEXT NOT NULL CHECK (status IN ('success','failed','cancelled')),    -- 상태
  toss_order_id TEXT,                -- 토스 주문 ID
  retry_count   INTEGER NOT NULL DEFAULT 0, -- 재시도 횟수
  paid_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;

-- profiles: 본인만 SELECT / UPDATE
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- subsidies: 로그인 사용자 SELECT 가능 (공개 공고)
CREATE POLICY "subsidies_select_authenticated" ON subsidies
  FOR SELECT USING (auth.role() = 'authenticated');

-- notifications: 본인 것만
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- drafts: 본인 것만
CREATE POLICY "drafts_own" ON drafts
  FOR ALL USING (auth.uid() = user_id);

-- payments: 본인 것만
CREATE POLICY "payments_own" ON payments
  FOR ALL USING (auth.uid() = user_id);
