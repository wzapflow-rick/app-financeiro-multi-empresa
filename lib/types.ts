// Tipos do App Financeiro

export interface Empresa {
  id: number
  nome: string
  cor: string | null
  usuario_id: number | null
  created_at?: Date | null
  updated_at?: Date | null
}

export interface Usuario {
  id: number
  nome: string
  email: string
  senha?: string
  created_at?: Date | null
  updated_at?: Date | null
}

export interface Categoria {
  id: number
  nome: string
  tipo: 'entrada' | 'saida' | string | null
  usuario_id?: number | null
  created_at?: Date | null
  updated_at?: Date | null
}

export interface Lancamento {
  id: number
  descricao: string | null
  valor: number | null
  tipo: 'entrada' | 'saida' | string | null
  data: string | Date | null
  data_vencimento: string | Date | null
  status: 'pago' | 'pendente' | 'vencido' | string | null
  empresa_id: number | null
  categoria_id: number | null
  observacoes: string | null
  usuario_id: number | null
  created_at?: Date | null
  updated_at?: Date | null
  // Relacionamentos (populated)
  empresa?: Empresa
  categoria?: Categoria
}

export interface DashboardStats {
  totalEntradas: number
  totalSaidas: number
  saldo: number
  contasPendentes: number
  contasVencidas: number
}

export interface FluxoCaixaMensal {
  mes: string
  entradas: number
  saidas: number
}

export interface DespesaCategoria {
  categoria: string
  valor: number
  cor?: string
}
