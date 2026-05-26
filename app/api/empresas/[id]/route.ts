import { NextResponse } from 'next/server'
import { empresasDb } from '@/lib/db'
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
    const empresa = await empresasDb.get(parseInt(id))
    if (!empresa || empresa.usuario_id !== user.id) {
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
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    const empresa = await empresasDb.get(parseInt(id))
    if (!empresa || empresa.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }
    
    const data = await request.json()
    const updated = await empresasDb.update(parseInt(id), data)
    return NextResponse.json(updated)
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
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { id } = await params
    const empresa = await empresasDb.get(parseInt(id))
    if (!empresa || empresa.usuario_id !== user.id) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }
    
    await empresasDb.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Erro ao deletar empresa:', error)
    return NextResponse.json({ error: 'Erro ao deletar empresa' }, { status: 500 })
  }
}
