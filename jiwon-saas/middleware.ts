import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

function makeSessionToken(password: string): string {
  return createHmac('sha256', password).update('admin_session').digest('hex')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin/dashboard')) {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) return NextResponse.redirect(new URL('/admin', request.url))

    const session = request.cookies.get('admin_session')?.value
    if (session !== makeSessionToken(adminPassword)) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
