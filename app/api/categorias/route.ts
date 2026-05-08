import { NextResponse } from 'next/server'
import { categoriasApi } from '@/lib/nocodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    
    const params: { sort: string; where?: string } = { sort: 'nome' }
    if (tipo) {
      params.where = `(tipo,eq,${tipo})`
    }
    
    const response = await categoriasApi.list(params)
    return NextResponse.json(response.list)
  } catch (error) {
    console.error('[API] Erro ao listar categorias:', error)
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const categoria = await categoriasApi.create(data)
    return NextResponse.json(categoria)
  } catch (error) {
    console.error('[API] Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
