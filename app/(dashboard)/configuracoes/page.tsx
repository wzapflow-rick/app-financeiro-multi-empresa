'use client'

import { useState } from 'react'
import { Plus, Trash2, Building2, Tag } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Badge } from '@/components/ui/badge'
import {
  useEmpresas,
  useCategorias,
  createEmpresa,
  deleteEmpresa,
  createCategoria,
  deleteCategoria,
} from '@/hooks/use-data'
import { EMPRESA_COLORS } from '@/lib/format'

export default function ConfiguracoesPage() {
  const { empresas, mutate: mutateEmpresas } = useEmpresas()
  const { categorias, mutate: mutateCategorias } = useCategorias()

  // Estado para modais de empresa
  const [empresaDialogOpen, setEmpresaDialogOpen] = useState(false)
  const [novaEmpresaNome, setNovaEmpresaNome] = useState('')
  const [novaEmpresaCor, setNovaEmpresaCor] = useState(EMPRESA_COLORS[0].value)
  const [empresaDeleteId, setEmpresaDeleteId] = useState<number | null>(null)
  const [isEmpresaLoading, setIsEmpresaLoading] = useState(false)

  // Estado para modais de categoria
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false)
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('')
  const [novaCategoriaTipo, setNovaCategoriaTipo] = useState<'entrada' | 'saida'>('saida')
  const [categoriaDeleteId, setCategoriaDeleteId] = useState<number | null>(null)
  const [isCategoriaLoading, setIsCategoriaLoading] = useState(false)

  // Handlers de empresa
  const handleCreateEmpresa = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEmpresaLoading(true)
    try {
      await createEmpresa({ nome: novaEmpresaNome, cor: novaEmpresaCor })
      mutateEmpresas()
      setEmpresaDialogOpen(false)
      setNovaEmpresaNome('')
      setNovaEmpresaCor(EMPRESA_COLORS[0].value)
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
    } finally {
      setIsEmpresaLoading(false)
    }
  }

  const handleDeleteEmpresa = async () => {
    if (!empresaDeleteId) return
    try {
      await deleteEmpresa(empresaDeleteId)
      mutateEmpresas()
    } catch (error) {
      console.error('Erro ao deletar empresa:', error)
    }
    setEmpresaDeleteId(null)
  }

  // Handlers de categoria
  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCategoriaLoading(true)
    try {
      await createCategoria({ nome: novaCategoriaNome, tipo: novaCategoriaTipo })
      mutateCategorias()
      setCategoriaDialogOpen(false)
      setNovaCategoriaNome('')
      setNovaCategoriaTipo('saida')
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    } finally {
      setIsCategoriaLoading(false)
    }
  }

  const handleDeleteCategoria = async () => {
    if (!categoriaDeleteId) return
    try {
      await deleteCategoria(categoriaDeleteId)
      mutateCategorias()
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
    }
    setCategoriaDeleteId(null)
  }

  const categoriasEntrada = categorias.filter((c) => c.tipo === 'entrada')
  const categoriasSaida = categorias.filter((c) => c.tipo === 'saida')

  return (
    <>
      <AppHeader title="Configurações" showEmpresaFilter={false} />

      <div className="flex-1 overflow-auto p-3 sm:p-6">
        <Tabs defaultValue="empresas">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
            <TabsTrigger value="empresas" className="text-xs sm:text-sm">
              <Building2 className="mr-1 sm:mr-2 h-4 w-4" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="categorias" className="text-xs sm:text-sm">
              <Tag className="mr-1 sm:mr-2 h-4 w-4" />
              Categorias
            </TabsTrigger>
          </TabsList>

          {/* Tab Empresas */}
          <TabsContent value="empresas" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Empresas</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Gerencie as empresas do sistema
                    </CardDescription>
                  </div>
                  <Button onClick={() => setEmpresaDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Empresa
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {empresas.length > 0 ? (
                    empresas.map((empresa) => (
                      <div
                        key={empresa.Id}
                        className="flex items-center justify-between rounded-lg border p-3 sm:p-4"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className="h-3 w-3 sm:h-4 sm:w-4 rounded-full shrink-0"
                            style={{ backgroundColor: empresa.cor || '#3b82f6' }}
                          />
                          <span className="font-medium text-sm sm:text-base truncate">{empresa.nome}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEmpresaDeleteId(empresa.Id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 sm:py-12 text-center text-muted-foreground text-sm">
                      Nenhuma empresa cadastrada. Clique em &quot;Nova Empresa&quot; para adicionar.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Categorias */}
          <TabsContent value="categorias" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Categorias</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Gerencie as categorias de lançamentos
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCategoriaDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  {/* Categorias de Entrada */}
                  <div>
                    <h3 className="mb-2 sm:mb-3 font-medium text-emerald-500 text-sm sm:text-base">
                      Categorias de Entrada
                    </h3>
                    <div className="space-y-2">
                      {categoriasEntrada.length > 0 ? (
                        categoriasEntrada.map((cat) => (
                          <div
                            key={cat.Id}
                            className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 sm:p-3"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge
                                variant="secondary"
                                className="bg-emerald-500/10 text-emerald-500 text-xs shrink-0"
                              >
                                Entrada
                              </Badge>
                              <span className="text-sm truncate">{cat.nome}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCategoriaDeleteId(cat.Id)}
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
                          Nenhuma categoria de entrada
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Categorias de Saída */}
                  <div>
                    <h3 className="mb-2 sm:mb-3 font-medium text-red-500 text-sm sm:text-base">
                      Categorias de Saída
                    </h3>
                    <div className="space-y-2">
                      {categoriasSaida.length > 0 ? (
                        categoriasSaida.map((cat) => (
                          <div
                            key={cat.Id}
                            className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-2 sm:p-3"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge
                                variant="secondary"
                                className="bg-red-500/10 text-red-500 text-xs shrink-0"
                              >
                                Saída
                              </Badge>
                              <span className="text-sm truncate">{cat.nome}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setCategoriaDeleteId(cat.Id)}
                              className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
                          Nenhuma categoria de saída
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Nova Empresa */}
      <Dialog open={empresaDialogOpen} onOpenChange={setEmpresaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Adicione uma nova empresa ao sistema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateEmpresa} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresaNome">Nome da Empresa</Label>
              <Input
                id="empresaNome"
                value={novaEmpresaNome}
                onChange={(e) => setNovaEmpresaNome(e.target.value)}
                placeholder="Ex: Minha Empresa"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {EMPRESA_COLORS.map((cor) => (
                  <button
                    key={cor.value}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      novaEmpresaCor === cor.value
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: cor.value }}
                    onClick={() => setNovaEmpresaCor(cor.value)}
                    title={cor.name}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmpresaDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isEmpresaLoading}>
                {isEmpresaLoading ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Categoria */}
      <Dialog open={categoriaDialogOpen} onOpenChange={setCategoriaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria de lançamentos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategoria} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoriaNome">Nome da Categoria</Label>
              <Input
                id="categoriaNome"
                value={novaCategoriaNome}
                onChange={(e) => setNovaCategoriaNome(e.target.value)}
                placeholder="Ex: Aluguel"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={novaCategoriaTipo}
                onValueChange={(v) => setNovaCategoriaTipo(v as 'entrada' | 'saida')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoriaDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCategoriaLoading}>
                {isCategoriaLoading ? 'Criando...' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão de empresa */}
      <AlertDialog open={!!empresaDeleteId} onOpenChange={() => setEmpresaDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita
              e todos os lançamentos associados ficarão sem empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmpresa}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmar exclusão de categoria */}
      <AlertDialog
        open={!!categoriaDeleteId}
        onOpenChange={() => setCategoriaDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategoria}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
