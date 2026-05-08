'use client'

import useSWR from 'swr'
import type { Empresa, Categoria, Lancamento, DashboardStats, FluxoCaixaMensal, DespesaCategoria } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Hook para empresas
export function useEmpresas() {
  const { data, error, isLoading, mutate } = useSWR<Empresa[]>('/api/empresas', fetcher)
  
  return {
    empresas: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook para categorias
export function useCategorias(tipo?: 'entrada' | 'saida') {
  const url = tipo ? `/api/categorias?tipo=${tipo}` : '/api/categorias'
  const { data, error, isLoading, mutate } = useSWR<Categoria[]>(url, fetcher)
  
  return {
    categorias: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook para lançamentos
interface UseLancamentosParams {
  empresa_id?: number
  tipo?: 'entrada' | 'saida'
  status?: 'pago' | 'pendente' | 'vencido'
  limit?: number
}

export function useLancamentos(params: UseLancamentosParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.empresa_id) searchParams.set('empresa_id', params.empresa_id.toString())
  if (params.tipo) searchParams.set('tipo', params.tipo)
  if (params.status) searchParams.set('status', params.status)
  if (params.limit) searchParams.set('limit', params.limit.toString())
  
  const query = searchParams.toString()
  const url = `/api/lancamentos${query ? `?${query}` : ''}`
  
  const { data, error, isLoading, mutate } = useSWR<Lancamento[]>(url, fetcher)
  
  return {
    lancamentos: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Hook para dashboard
interface DashboardData {
  stats: DashboardStats
  fluxoCaixa: FluxoCaixaMensal[]
  despesasPorCategoria: DespesaCategoria[]
  contasProximas: Lancamento[]
  empresas: Empresa[]
  categorias: Categoria[]
}

export function useDashboard(empresa_id?: number) {
  const url = empresa_id ? `/api/dashboard?empresa_id=${empresa_id}` : '/api/dashboard'
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(url, fetcher)
  
  return {
    data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Funções de mutação
export async function createEmpresa(data: Partial<Empresa>) {
  const res = await fetch('/api/empresas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateEmpresa(id: number, data: Partial<Empresa>) {
  const res = await fetch(`/api/empresas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteEmpresa(id: number) {
  const res = await fetch(`/api/empresas/${id}`, { method: 'DELETE' })
  return res.json()
}

export async function createCategoria(data: Partial<Categoria>) {
  const res = await fetch('/api/categorias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteCategoria(id: number) {
  const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
  return res.json()
}

export async function createLancamento(data: Partial<Lancamento>) {
  const res = await fetch('/api/lancamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateLancamento(id: number, data: Partial<Lancamento>) {
  const res = await fetch(`/api/lancamentos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteLancamento(id: number) {
  const res = await fetch(`/api/lancamentos/${id}`, { method: 'DELETE' })
  return res.json()
}
