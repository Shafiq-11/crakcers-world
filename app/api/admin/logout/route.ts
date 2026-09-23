import { NextResponse } from 'next/server'
import { destroyAdminSession } from '@/lib/auth'

export async function POST() {
  try {
    await destroyAdminSession()
    return NextResponse.json({ success: true, message: 'Logged out' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    )
  }
}
