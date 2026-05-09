import { NextResponse } from 'next/server'
import { lancamentosApi } from '@/lib/nocodb'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id')
    const tipo = searchParams.get('tipo')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit')
    
    // Sempre filtrar por usuario_id
    const whereConditions: string[] = [`(usuario_id,eq,${session.userId})`]
    
    if (empresa_id) {
      whereConditions.push(`(empresa_id,eq,${empresa_id})`)
    }
    if (tipo) {
      whereConditions.push(`(tipo,eq,${tipo})`)
    }
    if (status) {
      whereConditions.push(`(status,eq,${status})`)
    }
    
    const params: { sort: string; where: string; limit?: number } = { 
      sort: '-data_vencimento',
      where: whereConditions.join('~and')
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
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const data = await request.json()
    const lancamento = await lancamentosApi.create({
      ...data,
      usuario_id: session.userId
    })
    
    // Se o NocoDB não retornar o objeto, buscar pelo mais recente
    if (!lancamento || !lancamento.Id) {
      const lancamentos = await lancamentosApi.list({ 
        where: `(usuario_id,eq,${session.userId})~and(descricao,eq,${data.descricao})`,
        sort: '-Id',
        limit: 1
      })
      if (lancamentos.list.length > 0) {
        return NextResponse.json(lancamentos.list[0])
      }
    }
    
    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('[API] Erro ao criar lançamento:', error)
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 })
  }
}
