import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await loginUser(email, senha)

    return NextResponse.json({ 
      success: true, 
      user: { Id: user.Id, nome: user.nome, email: user.email } 
    })
  } catch (error) {
    console.error('[Auth Login Error]', error)
    const message = error instanceof Error ? error.message : 'Erro ao fazer login'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
