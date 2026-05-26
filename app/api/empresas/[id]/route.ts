import { NextResponse } from 'next/server'
import { empresasDb } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const empresa = await empresasDb.get(parseInt(id))
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }
    return NextResponse.json(empresa)
  } catch (error) {
    console.error('[API] Erro ao buscar empresa:', error)
    return NextResponse.json({ error: 'Erro ao buscar empresa' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const empresa = await empresasDb.update(parseInt(id), data)
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }
    return NextResponse.json(empresa)
  } catch (error) {
    console.error('[API] Erro ao atualizar empresa:', error)
    return NextResponse.json({ error: 'Erro ao atualizar empresa' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await empresasDb.delete(parseInt(id))
    if (!deleted) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar empresa:', error)
    return NextResponse.json({ error: 'Erro ao deletar empresa' }, { status: 500 })
  }
}
