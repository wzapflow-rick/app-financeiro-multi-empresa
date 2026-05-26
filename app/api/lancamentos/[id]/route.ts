import { NextResponse } from 'next/server'
import { lancamentosDb } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lancamento = await lancamentosDb.get(parseInt(id))
    if (!lancamento) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
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
    const { id } = await params
    const data = await request.json()
    const lancamento = await lancamentosDb.update(parseInt(id), data)
    if (!lancamento) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }
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
    const { id } = await params
    const deleted = await lancamentosDb.delete(parseInt(id))
    if (!deleted) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao deletar lançamento' }, { status: 500 })
  }
}
