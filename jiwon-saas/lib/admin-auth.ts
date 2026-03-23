import { cookies } from 'next/headers'

export function isAdminAuthed(): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'mpg-admin-2026'
  const token = Buffer.from(adminPassword).toString('base64')
  const cookieStore = cookies()
  return cookieStore.get('admin_session')?.value === token
}
