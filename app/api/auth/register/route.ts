import { NextResponse } from 'next/server'
import { registerUser, createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, senha } = body

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const user = await registerUser(nome, email, senha)
    
    // Criar sessão automaticamente após registro
    await createSession(user.Id)

    return NextResponse.json({ 
      success: true, 
      user: { Id: user.Id, nome: user.nome, email: user.email } 
    })
  } catch (error) {
    console.error('[Auth Register Error]', error)
    const message = error instanceof Error ? error.message : 'Erro ao criar conta'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
