export const TOSS_BASE = 'https://api.tosspayments.com/v1'

export function tossAuthHeader(): string {
  const encoded = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString('base64')
  return `Basic ${encoded}`
}

export interface BillingResult {
  success: boolean
  orderId?: string
  error?: string
}

export async function chargeBilling(
  billingKey: string,
  customerKey: string,
  amount: number,
  orderName: string
): Promise<BillingResult> {
  const orderId = `order_${Date.now()}_${customerKey.slice(0, 8)}`
  try {
    const res = await fetch(`${TOSS_BASE}/billing/${billingKey}`, {
      method: 'POST',
      headers: {
        Authorization: tossAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerKey, amount, orderId, orderName }),
    })
    if (!res.ok) {
      const err = await res.json()
      return { success: false, orderId, error: err.message }
    }
    return { success: true, orderId }
  } catch (e) {
    return { success: false, error: String(e) }
  }
}
