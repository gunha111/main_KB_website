export const PLANS = {
  free:     { price: 0,      name: '무료',     draftLimit: 0 },
  basic:    { price: 29000,  name: '베이직',   draftLimit: 0 },
  standard: { price: 59000,  name: '스탠다드', draftLimit: 5 },
  premium:  { price: 99000,  name: '프리미엄', draftLimit: Infinity },
} as const

export type PlanType = keyof typeof PLANS
