import { NextResponse } from 'next/server'
import { empresasApi } from '@/lib/nocodb'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const empresa = await empresasApi.get(parseInt(id))
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
    const empresa = await empresasApi.update(parseInt(id), data)
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
    await empresasApi.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar empresa:', error)
    return NextResponse.json({ error: 'Erro ao deletar empresa' }, { status: 500 })
  }
}
