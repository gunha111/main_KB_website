import { cookies } from 'next/headers'

export async function isAdminAuthed(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'mpg-admin-2026'
  const token = Buffer.from(adminPassword).toString('base64')
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === token
}
