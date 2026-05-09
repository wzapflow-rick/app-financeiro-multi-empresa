import { NextResponse } from 'next/server'
import { logoutUser } from '@/lib/auth'

export async function POST() {
  try {
    await logoutUser()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Auth Logout Error]', error)
    return NextResponse.json({ error: 'Erro ao fazer logout' }, { status: 500 })
  }
}
