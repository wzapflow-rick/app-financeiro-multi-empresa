import { NextResponse } from 'next/server'
import { categoriasApi } from '@/lib/nocodb'
import { getSession } from '@/lib/auth'

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
    const existing = await categoriasApi.get(parseInt(id))
    if (existing.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    await categoriasApi.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar categoria:', error)
    return NextResponse.json({ error: 'Erro ao deletar categoria' }, { status: 500 })
  }
}
