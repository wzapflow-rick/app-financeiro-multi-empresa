// Cliente NocoDB para API REST v2

const NOCODB_URL = process.env.NOCODB_URL || ''
const NOCODB_TOKEN = process.env.NOCODB_TOKEN || ''
const BASE_ID = 'pmzl7er3efb92bo'

// IDs das tabelas no NocoDB
export const TABLES = {
  empresas: 'mx326vhz9azmtqb',
  categorias: 'm823g548ik4f7ts',
  lancamentos: 'moyn0y59ijn5g14',
  usuarios: 'mpt32u8oxo3ue2z',
} as const

type TableName = (typeof TABLES)[keyof typeof TABLES]

interface ListParams {
  where?: string
  limit?: number
  offset?: number
  sort?: string
  fields?: string
}

interface NocoDBResponse<T> {
  list: T[]
  pageInfo: {
    totalRows: number
    page: number
    pageSize: number
    isFirstPage: boolean
    isLastPage: boolean
  }
}

async function nocoFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${NOCODB_URL}/api/v2${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'xc-token': NOCODB_TOKEN,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[NocoDB Error]', response.status, error)
    throw new Error(`NocoDB API Error: ${response.status} - ${error}`)
  }

  return response.json()
}

// Listar registros de uma tabela
export async function listRecords<T>(
  table: TableName,
  params: ListParams = {}
): Promise<NocoDBResponse<T>> {
  const searchParams = new URLSearchParams()
  
  if (params.where) searchParams.set('where', params.where)
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.offset) searchParams.set('offset', params.offset.toString())
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.fields) searchParams.set('fields', params.fields)

  const query = searchParams.toString()
  const endpoint = `/tables/${table}/records${query ? `?${query}` : ''}`
  
  return nocoFetch<NocoDBResponse<T>>(endpoint)
}

// Obter um registro específico
export async function getRecord<T>(
  table: TableName,
  id: number
): Promise<T> {
  return nocoFetch<T>(`/tables/${table}/records/${id}`)
}

// Criar um novo registro
export async function createRecord<T>(
  table: TableName,
  data: Partial<T>
): Promise<T> {
  const result = await nocoFetch<T | T[]>(`/tables/${table}/records`, {
    method: 'POST',
    body: JSON.stringify([data]),
  })
  // A API retorna um array, então pegamos o primeiro item
  return Array.isArray(result) ? result[0] : result
}

// Atualizar um registro
export async function updateRecord<T>(
  table: TableName,
  id: number,
  data: Partial<T>
): Promise<T> {
  return nocoFetch<T>(`/tables/${table}/records`, {
    method: 'PATCH',
    body: JSON.stringify([{ Id: id, ...data }]),
  })
}

// Deletar um registro
export async function deleteRecord(
  table: TableName,
  id: number
): Promise<void> {
  await nocoFetch(`/tables/${table}/records`, {
    method: 'DELETE',
    body: JSON.stringify([{ Id: id }]),
  })
}

// Criar múltiplos registros
export async function createBulkRecords<T>(
  table: TableName,
  data: Partial<T>[]
): Promise<T[]> {
  return nocoFetch<T[]>(`/tables/${table}/records`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Funções específicas para as tabelas

export const empresasApi = {
  list: (params?: ListParams) => listRecords<import('./types').Empresa>(TABLES.empresas, params),
  get: (id: number) => getRecord<import('./types').Empresa>(TABLES.empresas, id),
  create: (data: Partial<import('./types').Empresa>) => createRecord(TABLES.empresas, data),
  update: (id: number, data: Partial<import('./types').Empresa>) => updateRecord(TABLES.empresas, id, data),
  delete: (id: number) => deleteRecord(TABLES.empresas, id),
}

export const categoriasApi = {
  list: (params?: ListParams) => listRecords<import('./types').Categoria>(TABLES.categorias, params),
  get: (id: number) => getRecord<import('./types').Categoria>(TABLES.categorias, id),
  create: (data: Partial<import('./types').Categoria>) => createRecord(TABLES.categorias, data),
  update: (id: number, data: Partial<import('./types').Categoria>) => updateRecord(TABLES.categorias, id, data),
  delete: (id: number) => deleteRecord(TABLES.categorias, id),
}

export const lancamentosApi = {
  list: (params?: ListParams) => listRecords<import('./types').Lancamento>(TABLES.lancamentos, params),
  get: (id: number) => getRecord<import('./types').Lancamento>(TABLES.lancamentos, id),
  create: (data: Partial<import('./types').Lancamento>) => createRecord(TABLES.lancamentos, data),
  update: (id: number, data: Partial<import('./types').Lancamento>) => updateRecord(TABLES.lancamentos, id, data),
  delete: (id: number) => deleteRecord(TABLES.lancamentos, id),
}

export const usuariosApi = {
  list: (params?: ListParams) => listRecords<import('./types').Usuario>(TABLES.usuarios, params),
  get: (id: number) => getRecord<import('./types').Usuario>(TABLES.usuarios, id),
  create: (data: Partial<import('./types').Usuario>) => createRecord(TABLES.usuarios, data),
  update: (id: number, data: Partial<import('./types').Usuario>) => updateRecord(TABLES.usuarios, id, data),
  delete: (id: number) => deleteRecord(TABLES.usuarios, id),
}


