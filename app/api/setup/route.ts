import { NextResponse } from 'next/server'

const NOCODB_URL = process.env.NOCODB_URL || ''
const NOCODB_TOKEN = process.env.NOCODB_TOKEN || ''
const BASE_ID = 'pmzl7er3efb92bo'

// Este endpoint verifica a conexão e retorna informações sobre as tabelas
export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!NOCODB_URL || !NOCODB_TOKEN) {
      return NextResponse.json({
        status: 'error',
        message: 'Variáveis de ambiente NOCODB_URL e NOCODB_TOKEN não configuradas',
        config: {
          hasUrl: !!NOCODB_URL,
          hasToken: !!NOCODB_TOKEN,
        },
      })
    }

    // Tentar listar as tabelas da base
    const response = await fetch(`${NOCODB_URL}/api/v2/meta/bases/${BASE_ID}/tables`, {
      headers: {
        'xc-token': NOCODB_TOKEN,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({
        status: 'error',
        message: `Erro ao conectar com NocoDB: ${response.status}`,
        error,
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexão estabelecida com sucesso!',
      baseId: BASE_ID,
      tables: data.list?.map((t: { title: string; id: string }) => ({
        name: t.title,
        id: t.id,
      })) || [],
      requiredTables: ['empresas', 'categorias', 'lancamentos', 'usuarios'],
    })
  } catch (error) {
    console.error('[Setup] Erro:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao verificar conexão',
      error: String(error),
    })
  }
}
