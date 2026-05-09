import { NextResponse } from 'next/server'
import { lancamentosApi, empresasApi, categoriasApi } from '@/lib/nocodb'
import type { Lancamento, Empresa, Categoria, DashboardStats } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const empresa_id = searchParams.get('empresa_id')
    
    // Buscar todos os dados em paralelo
    const [lancamentosRes, empresasRes, categoriasRes] = await Promise.all([
      lancamentosApi.list({ limit: 1000 }),
      empresasApi.list(),
      categoriasApi.list(),
    ])
    
    let lancamentos = lancamentosRes.list as Lancamento[]
    const empresas = empresasRes.list as Empresa[]
    const categorias = categoriasRes.list as Categoria[]
    
    // Filtrar por empresa se especificado
    if (empresa_id) {
      lancamentos = lancamentos.filter(l => l.empresa_id === parseInt(empresa_id))
    }
    
    // Calcular estatísticas
    // Entradas e saídas PAGAS (efetivadas)
    const totalEntradas = lancamentos
      .filter(l => l.tipo === 'entrada' && l.status === 'pago')
      .reduce((sum, l) => sum + (l.valor || 0), 0)
    
    const totalSaidas = lancamentos
      .filter(l => l.tipo === 'saida' && l.status === 'pago')
      .reduce((sum, l) => sum + (l.valor || 0), 0)
    
    // Entradas e saídas PENDENTES
    const entradasPendentes = lancamentos
      .filter(l => l.tipo === 'entrada' && l.status !== 'pago')
      .reduce((sum, l) => sum + (l.valor || 0), 0)
    
    const saidasPendentes = lancamentos
      .filter(l => l.tipo === 'saida' && l.status !== 'pago')
      .reduce((sum, l) => sum + (l.valor || 0), 0)
    
    // Saldo Real = apenas transações pagas
    const saldoReal = totalEntradas - totalSaidas
    
    // Saldo Previsto = saldo real + entradas pendentes - saídas pendentes
    const saldoPrevisto = saldoReal + entradasPendentes - saidasPendentes
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Contas a Vencer (saídas pendentes)
    const contasPendentes = lancamentos.filter(l => {
      if (l.status === 'pago' || l.tipo !== 'saida') return false
      const vencimento = new Date(l.data_vencimento || l.data)
      return vencimento >= today
    }).length
    
    // Contas Vencidas (saídas vencidas)
    const contasVencidas = lancamentos.filter(l => {
      if (l.status === 'pago' || l.tipo !== 'saida') return false
      const vencimento = new Date(l.data_vencimento || l.data)
      return vencimento < today
    }).length
    
    // Contas a Receber (entradas pendentes)
    const contasAReceber = lancamentos.filter(l => {
      if (l.status === 'pago' || l.tipo !== 'entrada') return false
      const vencimento = new Date(l.data_vencimento || l.data)
      return vencimento >= today
    }).length
    
    // Contas a Receber Vencidas
    const contasAReceberVencidas = lancamentos.filter(l => {
      if (l.status === 'pago' || l.tipo !== 'entrada') return false
      const vencimento = new Date(l.data_vencimento || l.data)
      return vencimento < today
    }).length
    
    const stats: DashboardStats = {
      totalEntradas,
      totalSaidas,
      saldo: saldoReal,
      saldoReal,
      saldoPrevisto,
      entradasPendentes,
      saidasPendentes,
      contasPendentes,
      contasVencidas,
      contasAReceber,
      contasAReceberVencidas,
    }
    
    // Fluxo de caixa dos últimos 6 meses
    const fluxoCaixa = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const mes = date.toISOString().slice(0, 7) // YYYY-MM
      
      const entradasMes = lancamentos
        .filter(l => l.tipo === 'entrada' && l.status === 'pago' && l.data?.startsWith(mes))
        .reduce((sum, l) => sum + (l.valor || 0), 0)
      
      const saidasMes = lancamentos
        .filter(l => l.tipo === 'saida' && l.status === 'pago' && l.data?.startsWith(mes))
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
          .filter(l => l.categoria_id === cat.Id && l.tipo === 'saida' && l.status === 'pago')
          .reduce((sum, l) => sum + (l.valor || 0), 0)
        return {
          categoria: cat.nome,
          valor,
        }
      })
      .filter(d => d.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5)
    
    // Contas a Vencer (saídas) nos próximos 7 dias
    const seteDias = new Date()
    seteDias.setDate(seteDias.getDate() + 7)
    
    const contasAVencer = lancamentos
      .filter(l => {
        if (l.status === 'pago' || l.tipo !== 'saida') return false
        const vencimento = new Date(l.data_vencimento || l.data)
        return vencimento >= today && vencimento <= seteDias
      })
      .sort((a, b) => {
        const dataA = new Date(a.data_vencimento || a.data)
        const dataB = new Date(b.data_vencimento || b.data)
        return dataA.getTime() - dataB.getTime()
      })
      .slice(0, 5)
    
    // Contas a Receber (entradas) nos próximos 7 dias
    const contasAReceberProximas = lancamentos
      .filter(l => {
        if (l.status === 'pago' || l.tipo !== 'entrada') return false
        const vencimento = new Date(l.data_vencimento || l.data)
        return vencimento >= today && vencimento <= seteDias
      })
      .sort((a, b) => {
        const dataA = new Date(a.data_vencimento || a.data)
        const dataB = new Date(b.data_vencimento || b.data)
        return dataA.getTime() - dataB.getTime()
      })
      .slice(0, 5)
    
    return NextResponse.json({
      stats,
      fluxoCaixa,
      despesasPorCategoria,
      contasAVencer,
      contasAReceberProximas,
      empresas,
      categorias,
    })
  } catch (error) {
    console.error('[API] Erro ao buscar dashboard:', error)
    return NextResponse.json({ error: 'Erro ao buscar dashboard' }, { status: 500 })
  }
}
