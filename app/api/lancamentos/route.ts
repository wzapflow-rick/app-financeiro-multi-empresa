import { NextResponse } from 'next/server'
import { lancamentosDb } from '@/lib/db'
import { getRequestUser } from '@/lib/request-user'

export async function GET(request: Request) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id')
    const tipo = searchParams.get('tipo')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    
    const lancamentos = await lancamentosDb.list({
      empresaId: empresa_id ? parseInt(empresa_id) : undefined,
      tipo: tipo || undefined,
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      usuarioId: user.id,
    })
    
    return NextResponse.json(lancamentos)
  } catch (error) {
    console.error('[API] Erro ao listar lançamentos:', error)
    return NextResponse.json({ error: 'Erro ao listar lançamentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const data = await request.json()
    const lancamento = await lancamentosDb.create({
      ...data,
      usuario_id: user.id,
    })
    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('[API] Erro ao criar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}
