import { NextResponse } from 'next/server'
import { categoriasApi } from '@/lib/nocodb'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    
    const whereConditions: string[] = [`(usuario_id,eq,${session.userId})`]
    
    if (tipo) {
      whereConditions.push(`(tipo,eq,${tipo})`)
    }
    
    const response = await categoriasApi.list({ 
      sort: 'nome',
      where: whereConditions.join('~and')
    })
    return NextResponse.json(response.list)
  } catch (error) {
    console.error('[API] Erro ao listar categorias:', error)
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const data = await request.json()
    const categoria = await categoriasApi.create({
      ...data,
      usuario_id: session.userId
    })
    
    // Se o NocoDB não retornar o objeto, buscar pelo nome
    if (!categoria || !categoria.Id) {
      const categorias = await categoriasApi.list({ 
        where: `(usuario_id,eq,${session.userId})~and(nome,eq,${data.nome})`,
        sort: '-Id',
        limit: 1
      })
      if (categorias.list.length > 0) {
        return NextResponse.json(categorias.list[0])
      }
    }
    
    return NextResponse.json(categoria)
  } catch (error) {
    console.error('[API] Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
