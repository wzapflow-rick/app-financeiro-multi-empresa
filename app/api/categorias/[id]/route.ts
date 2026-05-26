import { NextResponse } from 'next/server'
import { categoriasDb } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoria = await categoriasDb.get(parseInt(id))
    if (!categoria) {
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
    const { id } = await params
    const data = await request.json()
    const categoria = await categoriasDb.update(parseInt(id), data)
    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    return NextResponse.json(categoria)
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
    const { id } = await params
    const deleted = await categoriasDb.delete(parseInt(id))
    if (!deleted) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar categoria:', error)
    return NextResponse.json({ error: 'Erro ao deletar categoria' }, { status: 500 })
  }
}
