import { NextResponse } from 'next/server'
import { lancamentosDb, empresasDb, categoriasDb } from '@/lib/db'
import { getRequestUser } from '@/lib/request-user'
import type { DashboardStats } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const user = await getRequestUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id')
    
    // Buscar todos os dados em paralelo (filtrados por usuário)
    const [lancamentos, empresas, categorias] = await Promise.all([
      lancamentosDb.list({ 
        empresaId: empresa_id ? parseInt(empresa_id) : undefined,
        usuarioId: user.id,
      }),
      empresasDb.list(user.id),
      categoriasDb.list({ usuarioId: user.id }),
    ])
    
    // Calcular estatísticas
    const totalEntradas = lancamentos
      .filter(l => l.tipo === 'entrada' && l.status === 'pago')
      .reduce((sum, l) => sum + (l.valor || 0), 0)
    
    const totalSaidas = lancamentos
      .filter(l => l.tipo === 'saida' && l.status === 'pago')
      .reduce((sum, l) => sum + (l.valor || 0), 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const contasPendentes = lancamentos.filter(l => {
      if (l.status === 'pago') return false
      const vencimento = new Date(l.data_vencimento || l.data || new Date())
      return vencimento >= today
    }).length
    
    const contasVencidas = lancamentos.filter(l => {
      if (l.status === 'pago') return false
      const vencimento = new Date(l.data_vencimento || l.data || new Date())
      return vencimento < today
    }).length
    
    const stats: DashboardStats = {
      totalEntradas,
      totalSaidas,
      saldo: totalEntradas - totalSaidas,
      contasPendentes,
      contasVencidas,
    }
    
    // Fluxo de caixa dos últimos 6 meses
    const fluxoCaixa = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const mes = date.toISOString().slice(0, 7) // YYYY-MM
      
      const entradasMes = lancamentos
        .filter(l => {
          if (l.tipo !== 'entrada' || l.status !== 'pago') return false
          const dataLanc = l.data ? new Date(l.data).toISOString().slice(0, 7) : null
          return dataLanc === mes
        })
        .reduce((sum, l) => sum + (l.valor || 0), 0)
      
      const saidasMes = lancamentos
        .filter(l => {
          if (l.tipo !== 'saida' || l.status !== 'pago') return false
          const dataLanc = l.data ? new Date(l.data).toISOString().slice(0, 7) : null
          return dataLanc === mes
        })
        .reduce((sum, l) => sum + (l.valor || 0), 0)
      
      fluxoCaixa.push({
        mes: new Date(date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        entradas: entradasMes,
        saidas: saidasMes,
      })
    }
    
    // Despesas por categoria
    const despesasPorCategoria = categorias
      .filter(c => c.tipo === 'saida')
      .map(cat => {
        const valor = lancamentos
          .filter(l => l.categoria_id === cat.id && l.tipo === 'saida' && l.status === 'pago')
          .reduce((sum, l) => sum + (l.valor || 0), 0)
        return {
          categoria: cat.nome,
          valor,
        }
      })
      .filter(d => d.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
    
    // Contas a vencer nos próximos 7 dias
    const seteDias = new Date()
    seteDias.setDate(seteDias.getDate() + 7)
    
    const contasProximas = lancamentos
      .filter(l => {
        if (l.status === 'pago') return false
        const vencimento = new Date(l.data_vencimento || l.data || new Date())
        return vencimento >= today && vencimento <= seteDias
      })
      .slice(0, 5)
    
    return NextResponse.json({
      stats,
      fluxoCaixa,
      despesasPorCategoria,
      contasProximas,
      empresas,
      categorias,
    })
  } catch (error) {
    console.error('[API] Erro ao buscar dashboard:', error)
    return NextResponse.json({ error: 'Erro ao buscar dashboard' }, { status: 500 })
  }
}
