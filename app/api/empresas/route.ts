import { NextResponse } from 'next/server'
import { empresasApi } from '@/lib/nocodb'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const response = await empresasApi.list({ 
      sort: 'nome',
      where: `(usuario_id,eq,${session.userId})`
    })
    return NextResponse.json(response.list)
  } catch (error) {
    console.error('[API] Erro ao listar empresas:', error)
    return NextResponse.json({ error: 'Erro ao listar empresas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const data = await request.json()
    const empresa = await empresasApi.create({
      ...data,
      usuario_id: session.userId
    })
    
    // Se o NocoDB não retornar o objeto, buscar pelo nome
    if (!empresa || !empresa.Id) {
      const empresas = await empresasApi.list({ 
        where: `(usuario_id,eq,${session.userId})~and(nome,eq,${data.nome})`,
        sort: '-Id',
        limit: 1
      })
      if (empresas.list.length > 0) {
        return NextResponse.json(empresas.list[0])
      }
    }
    
    return NextResponse.json(empresa)
  } catch (error) {
    console.error('[API] Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }
}
