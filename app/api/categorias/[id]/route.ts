import { NextResponse } from 'next/server'
import { categoriasDb, lancamentosDb } from '@/lib/db'
import { getRequestUser } from '@/lib/request-user'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    const categoria = await categoriasDb.get(parseInt(id))
    if (!categoria || categoria.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    return NextResponse.json(categoria)
  } catch (error) {
    console.error('[API] Erro ao buscar categoria:', error)
    return NextResponse.json({ error: 'Erro ao buscar categoria' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    const categoria = await categoriasDb.get(parseInt(id))
    if (!categoria || categoria.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    
    const data = await request.json()
    const updated = await categoriasDb.update(parseInt(id), data)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[API] Erro ao atualizar categoria:', error)
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    const categoria = await categoriasDb.get(parseInt(id))
    if (!categoria || categoria.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    
    // Verificar se há lançamentos associados
    const lancamentos = await lancamentosDb.list({ categoria_id: parseInt(id), usuario_id: user.id })
    if (lancamentos.length > 0) {
      return NextResponse.json({ 
        error: `Não é possível excluir esta categoria pois ela possui ${lancamentos.length} lançamento(s) associado(s). Exclua os lançamentos primeiro.` 
      }, { status: 400 })
    }
    
    await categoriasDb.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar categoria:', error)
    return NextResponse.json({ error: 'Erro ao deletar categoria' }, { status: 500 })
  }
}
