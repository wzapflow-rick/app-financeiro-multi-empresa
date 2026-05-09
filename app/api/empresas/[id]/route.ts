import { NextResponse } from 'next/server'
import { empresasApi } from '@/lib/nocodb'
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
    const empresa = await empresasApi.get(parseInt(id))
    
    // Verificar se pertence ao usuário
    if (empresa.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Verificar se pertence ao usuário
    const existing = await empresasApi.get(parseInt(id))
    if (existing.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    
    // Verificar se pertence ao usuário
    const existing = await empresasApi.get(parseInt(id))
    if (existing.usuario_id !== session.userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    
    await empresasApi.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar empresa:', error)
    return NextResponse.json({ error: 'Erro ao deletar empresa' }, { status: 500 })
  }
}
