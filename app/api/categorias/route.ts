import { NextResponse } from 'next/server'
import { categoriasDb } from '@/lib/db'
import { getRequestUser } from '@/lib/request-user'

export async function GET(request: Request) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    
    const categorias = await categoriasDb.list({ 
      tipo: tipo || undefined,
      usuarioId: user.id,
    })
    return NextResponse.json(categorias)
  } catch (error) {
    console.error('[API] Erro ao listar categorias:', error)
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const data = await request.json()
    const categoria = await categoriasDb.create({
      ...data,
      usuario_id: user.id,
    })
    return NextResponse.json(categoria)
  } catch (error) {
    console.error('[API] Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
