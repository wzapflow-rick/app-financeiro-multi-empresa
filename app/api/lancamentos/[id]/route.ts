import { NextResponse } from 'next/server'
import { lancamentosApi } from '@/lib/nocodb'
import { getSession } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    const lancamento = await lancamentosApi.get(parseInt(id))
    
    // Verificar se pertence ao usuário
    if (lancamento.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('[API] Erro ao buscar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao buscar lançamento' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Verificar se pertence ao usuário
    const existing = await lancamentosApi.get(parseInt(id))
    if (existing.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    const data = await request.json()
    const lancamento = await lancamentosApi.update(parseInt(id), data)
    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('[API] Erro ao atualizar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao atualizar lançamento' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Verificar se pertence ao usuário
    const existing = await lancamentosApi.get(parseInt(id))
    if (existing.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    await lancamentosApi.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao deletar lançamento' }, { status: 500 })
  }
}
