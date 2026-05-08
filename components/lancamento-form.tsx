'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useEmpresas, useCategorias, createLancamento, updateLancamento } from '@/hooks/use-data'
import type { Lancamento } from '@/lib/types'

interface LancamentoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lancamento?: Lancamento | null
  onSuccess?: () => void
}

export function LancamentoForm({
  open,
  onOpenChange,
  lancamento,
  onSuccess,
}: LancamentoFormProps) {
  const { empresas } = useEmpresas()
  const { categorias } = useCategorias()
  const [isLoading, setIsLoading] = useState(false)
  
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(lancamento?.tipo || 'saida')
  const [descricao, setDescricao] = useState(lancamento?.descricao || '')
  const [valor, setValor] = useState(lancamento?.valor?.toString() || '')
  const [data, setData] = useState<Date | undefined>(
    lancamento?.data ? new Date(lancamento.data) : new Date()
  )
  const [dataVencimento, setDataVencimento] = useState<Date | undefined>(
    lancamento?.data_vencimento ? new Date(lancamento.data_vencimento) : undefined
  )
  const [empresaId, setEmpresaId] = useState(lancamento?.empresa_id?.toString() || '')
  const [categoriaId, setCategoriaId] = useState(lancamento?.categoria_id?.toString() || '')
  const [status, setStatus] = useState<'pago' | 'pendente'>(
    lancamento?.status === 'pago' ? 'pago' : 'pendente'
  )
  const [observacoes, setObservacoes] = useState(lancamento?.observacoes || '')

  const filteredCategorias = categorias.filter((c) => c.tipo === tipo)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        tipo,
        descricao,
        valor: parseFloat(valor),
        data: data?.toISOString().split('T')[0],
        data_vencimento: dataVencimento?.toISOString().split('T')[0],
        empresa_id: parseInt(empresaId),
        categoria_id: parseInt(categoriaId),
        status,
        observacoes,
      }

      if (lancamento?.Id) {
        await updateLancamento(lancamento.Id, payload)
      } else {
        await createLancamento(payload)
      }

      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setTipo('saida')
    setDescricao('')
    setValor('')
    setData(new Date())
    setDataVencimento(undefined)
    setEmpresaId('')
    setCategoriaId('')
    setStatus('pendente')
    setObservacoes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do lançamento financeiro
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as 'entrada' | 'saida')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'pago' | 'pendente')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Pagamento de aluguel"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select value={empresaId} onValueChange={setEmpresaId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.Id} value={empresa.Id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: empresa.cor || '#3b82f6' }}
                        />
                        {empresa.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !data && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dataVencimento && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataVencimento
                      ? format(dataVencimento, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecione'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataVencimento}
                    onSelect={setDataVencimento}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategorias.map((categoria) => (
                  <SelectItem key={categoria.Id} value={categoria.Id.toString()}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : lancamento ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
