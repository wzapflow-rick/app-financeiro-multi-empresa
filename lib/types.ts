// Tipos do App Financeiro

export interface Empresa {
  Id: number
  nome: string
  cor: string
  usuario_id: number
  created_at?: string
}

export interface Usuario {
  Id: number
  nome: string
  email: string
  senha?: string
  created_at?: string
}

export interface Categoria {
  Id: number
  nome: string
  tipo: 'entrada' | 'saida'
  icone?: string
  usuario_id: number
  created_at?: string
}

export interface Lancamento {
  Id: number
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  data: string
  data_vencimento?: string
  status: 'pago' | 'pendente' | 'vencido'
  empresa_id: number
  categoria_id: number
  usuario_id: number
  observacoes?: string
  created_at?: string
  // Relacionamentos (populated)
  empresa?: Empresa
  categoria?: Categoria
}

export interface DashboardStats {
  totalEntradas: number
  totalSaidas: number
  saldo: number
  // Saldo Real = apenas transações com status "pago"
  saldoReal: number
  // Saldo Previsto = saldo real + entradas pendentes - saídas pendentes
  saldoPrevisto: number
  // Totais pendentes
  entradasPendentes: number
  saidasPendentes: number
  contasPendentes: number
  contasVencidas: number
  contasAReceber: number
  contasAReceberVencidas: number
}

export interface FluxoCaixaMensal {
  mes: string
  entradas: number
  saidas: number
}

export interface DespesaCategoria {
  categoria: string
  valor: number
  cor: string
}

// NocoDB API Types
export interface NocoDBListResponse<T> {
  list: T[]
  pageInfo: {
    totalRows: number
    page: number
    pageSize: number
    isFirstPage: boolean
    isLastPage: boolean
  }
}

export interface NocoDBRecord {
  Id: number
  created_at?: string
  updated_at?: string
}
