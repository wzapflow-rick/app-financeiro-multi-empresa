import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json()
    
    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }
    
    const result = await loginUser(email, senha)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
    
    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error('[API] Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
