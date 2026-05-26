import { NextResponse } from 'next/server'
import { lancamentosDb } from '@/lib/db'

export async function GET(request: Request) {
  try {
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
    })
    
    return NextResponse.json(lancamentos)
  } catch (error) {
    console.error('[API] Erro ao listar lançamentos:', error)
    return NextResponse.json({ error: 'Erro ao listar lançamentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const lancamento = await lancamentosDb.create(data)
    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('[API] Erro ao criar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}
