'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  MoreHorizontal,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { LancamentoForm } from '@/components/lancamento-form'
import { useLancamentos, useEmpresas, useCategorias, deleteLancamento } from '@/hooks/use-data'
import { formatCurrency, formatDate, getStatusBgColor } from '@/lib/format'
import type { Lancamento } from '@/lib/types'

export default function LancamentosPage() {
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null)
  const { lancamentos, isLoading, mutate } = useLancamentos({
    empresa_id: selectedEmpresa || undefined,
  })
  const { empresas } = useEmpresas()
  const { categorias } = useCategorias()
  
  const [formOpen, setFormOpen] = useState(false)
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const getEmpresaNome = (id: number) =>
    empresas.find((e) => e.Id === id)?.nome || '-'
  
  const getEmpresaCor = (id: number) =>
    empresas.find((e) => e.Id === id)?.cor || '#3b82f6'
  
  const getCategoriaNome = (id: number) =>
    categorias.find((c) => c.Id === id)?.nome || '-'

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteLancamento(deleteId)
      mutate()
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
    setDeleteId(null)
  }

  const handleEdit = (lancamento: Lancamento) => {
    setEditingLancamento(lancamento)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    mutate()
    setEditingLancamento(null)
  }

  return (
    <>
      <AppHeader
        title="Lançamentos"
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={setSelectedEmpresa}
      />

      <div className="flex-1 overflow-auto p-3 sm:p-6">
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-sm sm:text-base text-muted-foreground">
            {lancamentos.length} lançamento{lancamentos.length !== 1 ? 's' : ''}{' '}
            encontrado{lancamentos.length !== 1 ? 's' : ''}
          </p>
          <Button onClick={() => { setEditingLancamento(null); setFormOpen(true) }} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : lancamentos.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum lançamento encontrado
            </div>
          ) : (
            lancamentos.map((lancamento) => (
              <div
                key={lancamento.Id}
                className={`rounded-lg border p-3 ${
                  lancamento.tipo === 'entrada'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {lancamento.tipo === 'entrada' ? (
                      <ArrowUpCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate text-sm">{lancamento.descricao}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <div
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: getEmpresaCor(lancamento.empresa_id) }}
                        />
                        <span className="truncate">{getEmpresaNome(lancamento.empresa_id)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-semibold text-sm ${
                        lancamento.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {lancamento.tipo === 'entrada' ? '+' : '-'}
                      {formatCurrency(lancamento.valor)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(lancamento)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(lancamento.Id)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatDate(lancamento.data)}</span>
                    <Badge
                      variant="secondary"
                      className={`${getStatusBgColor(lancamento.status)} text-xs`}
                    >
                      {lancamento.status === 'pago'
                        ? 'Pago'
                        : lancamento.status === 'vencido'
                        ? 'Vencido'
                        : 'Pendente'}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">{getCategoriaNome(lancamento.categoria_id)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : lancamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    Nenhum lançamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                lancamentos.map((lancamento) => (
                  <TableRow key={lancamento.Id}>
                    <TableCell>
                      {lancamento.tipo === 'entrada' ? (
                        <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {lancamento.descricao}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getEmpresaCor(lancamento.empresa_id) }}
                        />
                        {getEmpresaNome(lancamento.empresa_id)}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoriaNome(lancamento.categoria_id)}</TableCell>
                    <TableCell>{formatDate(lancamento.data)}</TableCell>
                    <TableCell>
                      {lancamento.data_vencimento
                        ? formatDate(lancamento.data_vencimento)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusBgColor(lancamento.status)}
                      >
                        {lancamento.status === 'pago'
                          ? 'Pago'
                          : lancamento.status === 'vencido'
                          ? 'Vencido'
                          : 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        lancamento.tipo === 'entrada'
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      }`}
                    >
                      {lancamento.tipo === 'entrada' ? '+' : '-'}
                      {formatCurrency(lancamento.valor)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(lancamento)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(lancamento.Id)}
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <LancamentoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lancamento={editingLancamento}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lançamento? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
