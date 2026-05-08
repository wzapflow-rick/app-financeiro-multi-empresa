import { NextResponse } from 'next/server'
import { categoriasApi } from '@/lib/nocodb'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await categoriasApi.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar categoria:', error)
    return NextResponse.json({ error: 'Erro ao deletar categoria' }, { status: 500 })
  }
}
