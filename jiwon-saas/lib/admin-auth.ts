import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

export function makeSessionToken(password: string): string {
  return createHmac('sha256', password).update('admin_session').digest('hex')
}

export async function isAdminAuthed(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  const expected = makeSessionToken(adminPassword)
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === expected
}
