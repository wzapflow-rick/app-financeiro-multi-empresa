import { NextResponse } from 'next/server'
import { empresasDb } from '@/lib/db'
import { getRequestUser } from '@/lib/request-user'

export async function GET() {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const empresas = await empresasDb.list(user.id)
    return NextResponse.json(empresas)
  } catch (error) {
    console.error('[API] Erro ao listar empresas:', error)
    return NextResponse.json({ error: 'Erro ao listar empresas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const data = await request.json()
    const empresa = await empresasDb.create({
      ...data,
      usuario_id: user.id,
    })
    return NextResponse.json(empresa)
  } catch (error) {
    console.error('[API] Erro ao criar empresa:', error)
    return NextResponse.json({ error: 'Erro ao criar empresa' }, { status: 500 })
  }
}
