import { NextResponse } from 'next/server'
import { lancamentosApi } from '@/lib/nocodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id')
    const tipo = searchParams.get('tipo')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    
    const whereConditions: string[] = []
    
    if (empresa_id) {
      whereConditions.push(`(empresa_id,eq,${empresa_id})`)
    }
    if (tipo) {
      whereConditions.push(`(tipo,eq,${tipo})`)
    }
    if (status) {
      whereConditions.push(`(status,eq,${status})`)
    }
    
    const params: { sort: string; where?: string; limit?: number } = { 
      sort: '-data_vencimento' 
    }
    
    if (whereConditions.length > 0) {
      params.where = whereConditions.join('~and')
    }
    
    if (limit) {
      params.limit = parseInt(limit)
    }
    
    const response = await lancamentosApi.list(params)
    return NextResponse.json(response.list)
  } catch (error) {
    console.error('[API] Erro ao listar lançamentos:', error)
    return NextResponse.json({ error: 'Erro ao listar lançamentos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const lancamento = await lancamentosApi.create(data)
    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('[API] Erro ao criar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}
