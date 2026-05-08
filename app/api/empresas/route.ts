import { NextResponse } from 'next/server'
import { empresasApi } from '@/lib/nocodb'

export async function GET() {
  try {
    const response = await empresasApi.list({ sort: 'nome' })
    return NextResponse.json(response.list)
  } catch (error) {
    console.error('[API] Erro ao listar empresas:', error)
    return NextResponse.json({ error: 'Erro ao listar empresas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const empresa = await empresasApi.create(data)
    return NextResponse.json(empresa)
  } catch (error) {
    console.error('[API] Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }
}
