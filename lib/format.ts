// Funções de formatação para valores monetários e datas

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`
  }
  return formatCurrency(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(d)
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(d)
}

export function getDaysUntilDue(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getStatusFromDueDate(dueDate: string, isPaid: boolean): 'pago' | 'pendente' | 'vencido' {
  if (isPaid) return 'pago'
  const days = getDaysUntilDue(dueDate)
  return days < 0 ? 'vencido' : 'pendente'
}

export function getStatusColor(status: 'pago' | 'pendente' | 'vencido'): string {
  switch (status) {
    case 'pago':
      return 'text-emerald-500'
    case 'pendente':
      return 'text-amber-500'
    case 'vencido':
      return 'text-red-500'
    default:
      return 'text-muted-foreground'
  }
}

export function getStatusBgColor(status: 'pago' | 'pendente' | 'vencido'): string {
  switch (status) {
    case 'pago':
      return 'bg-emerald-500/10 text-emerald-500'
    case 'pendente':
      return 'bg-amber-500/10 text-amber-500'
    case 'vencido':
      return 'bg-red-500/10 text-red-500'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// Cores para empresas
export const EMPRESA_COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Roxo', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Amarelo', value: '#eab308' },
]

// Cores para categorias de gráfico
export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
