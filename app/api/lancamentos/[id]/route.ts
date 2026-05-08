import { NextResponse } from 'next/server'
import { lancamentosApi } from '@/lib/nocodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lancamento = await lancamentosApi.get(parseInt(id))
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
    const { id } = await params
    await lancamentosApi.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao deletar lançamento' }, { status: 500 })
  }
}
