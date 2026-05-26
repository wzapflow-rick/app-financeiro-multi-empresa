import { NextResponse } from 'next/server'
import { empresasDb } from '@/lib/db'

export async function GET() {
  try {
    const empresas = await empresasDb.list()
    return NextResponse.json(empresas)
  } catch (error) {
    console.error('[API] Erro ao listar empresas:', error)
    return NextResponse.json({ error: 'Erro ao listar empresas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const empresa = await empresasDb.create(data)
    return NextResponse.json(empresa)
  } catch (error) {
    console.error('[API] Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }
}
