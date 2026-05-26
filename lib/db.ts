// Cliente PostgreSQL para conexão direta com o banco

import { Pool, QueryResult } from 'pg'

// Pool de conexões compartilhado
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Função helper para executar queries
export async function query<T>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  const start = Date.now()
  try {
    const result = await pool.query<T>(text, params)
    const duration = Date.now() - start
    console.log('[DB] Executed query', { text: text.slice(0, 50), duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('[DB] Query error', { text: text.slice(0, 100), error })
    throw error
  }
}

// Helper para obter uma conexão do pool
export async function getClient() {
  const client = await pool.connect()
  return client
}

// Tipos das tabelas baseados no schema PostgreSQL
export interface DBEmpresa {
  id: number
  created_at: Date | null
  updated_at: Date | null
  created_by: string | null
  updated_by: string | null
  nc_order: number | null
  nome: string
  cor: string | null
  usuario_id: number | null
}

export interface DBCategoria {
  id: number
  created_at: Date | null
  updated_at: Date | null
  created_by: string | null
  updated_by: string | null
  nc_order: number | null
  nome: string
  tipo: string | null
  usuario_id: number | null
}

export interface DBLancamento {
  id: number
  created_at: Date | null
  updated_at: Date | null
  created_by: string | null
  updated_by: string | null
  nc_order: number | null
  descricao: string | null
  valor: number | null
  tipo: string | null
  data_vencimento: Date | null
  data: Date | null
  status: string | null
  empresa_id: number | null
  categoria_id: number | null
  observacoes: string | null
  usuario_id: number | null
}

export interface DBUsuario {
  id: number
  created_at: Date | null
  updated_at: Date | null
  created_by: string | null
  updated_by: string | null
  nc_order: number | null
  nome: string
  email: string
  senha: string
}

// ==================== API Empresas ====================

export const empresasDb = {
  async list(usuarioId?: number): Promise<DBEmpresa[]> {
    let sql = 'SELECT * FROM empresas'
    const params: unknown[] = []
    
    if (usuarioId) {
      sql += ' WHERE usuario_id = $1'
      params.push(usuarioId)
    }
    
    sql += ' ORDER BY nome ASC'
    
    const result = await query<DBEmpresa>(sql, params)
    return result.rows
  },

  async get(id: number): Promise<DBEmpresa | null> {
    const result = await query<DBEmpresa>(
      'SELECT * FROM empresas WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async create(data: Partial<DBEmpresa>): Promise<DBEmpresa> {
    const result = await query<DBEmpresa>(
      `INSERT INTO empresas (nome, cor, usuario_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [data.nome, data.cor, data.usuario_id]
    )
    return result.rows[0]
  },

  async update(id: number, data: Partial<DBEmpresa>): Promise<DBEmpresa | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`)
      values.push(data.nome)
    }
    if (data.cor !== undefined) {
      fields.push(`cor = $${paramIndex++}`)
      values.push(data.cor)
    }
    
    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query<DBEmpresa>(
      `UPDATE empresas SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM empresas WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

// ==================== API Categorias ====================

export const categoriasDb = {
  async list(params?: { tipo?: string; usuarioId?: number }): Promise<DBCategoria[]> {
    let sql = 'SELECT * FROM categorias WHERE 1=1'
    const values: unknown[] = []
    let paramIndex = 1

    if (params?.tipo) {
      sql += ` AND tipo = $${paramIndex++}`
      values.push(params.tipo)
    }
    if (params?.usuarioId) {
      sql += ` AND usuario_id = $${paramIndex++}`
      values.push(params.usuarioId)
    }

    sql += ' ORDER BY nome ASC'

    const result = await query<DBCategoria>(sql, values)
    return result.rows
  },

  async get(id: number): Promise<DBCategoria | null> {
    const result = await query<DBCategoria>(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async create(data: Partial<DBCategoria>): Promise<DBCategoria> {
    const result = await query<DBCategoria>(
      `INSERT INTO categorias (nome, tipo, usuario_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [data.nome, data.tipo, data.usuario_id]
    )
    return result.rows[0]
  },

  async update(id: number, data: Partial<DBCategoria>): Promise<DBCategoria | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`)
      values.push(data.nome)
    }
    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramIndex++}`)
      values.push(data.tipo)
    }
    
    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query<DBCategoria>(
      `UPDATE categorias SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM categorias WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

// ==================== API Lancamentos ====================

// Helper para converter valor de string (numeric) para number
function normalizeLancamento(row: DBLancamento): DBLancamento {
  return {
    ...row,
    valor: row.valor !== null ? parseFloat(String(row.valor)) : null
  }
}

export const lancamentosDb = {
  async list(params?: {
    empresaId?: number
    tipo?: string
    status?: string
    usuarioId?: number
    limit?: number
  }): Promise<DBLancamento[]> {
    let sql = 'SELECT * FROM lancamentos WHERE 1=1'
    const values: unknown[] = []
    let paramIndex = 1

    if (params?.empresaId) {
      sql += ` AND empresa_id = $${paramIndex++}`
      values.push(params.empresaId)
    }
    if (params?.tipo) {
      sql += ` AND tipo = $${paramIndex++}`
      values.push(params.tipo)
    }
    if (params?.status) {
      sql += ` AND status = $${paramIndex++}`
      values.push(params.status)
    }
    if (params?.usuarioId) {
      sql += ` AND usuario_id = $${paramIndex++}`
      values.push(params.usuarioId)
    }

    sql += ' ORDER BY data_vencimento DESC NULLS LAST'

    if (params?.limit) {
      sql += ` LIMIT $${paramIndex++}`
      values.push(params.limit)
    }

    const result = await query<DBLancamento>(sql, values)
    return result.rows.map(normalizeLancamento)
  },

  async get(id: number): Promise<DBLancamento | null> {
    const result = await query<DBLancamento>(
      'SELECT * FROM lancamentos WHERE id = $1',
      [id]
    )
    return result.rows[0] ? normalizeLancamento(result.rows[0]) : null
  },

  async create(data: Partial<DBLancamento>): Promise<DBLancamento> {
    const result = await query<DBLancamento>(
      `INSERT INTO lancamentos (
        descricao, valor, tipo, data_vencimento, data, status,
        empresa_id, categoria_id, observacoes, usuario_id,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        data.descricao,
        data.valor,
        data.tipo,
        data.data_vencimento,
        data.data,
        data.status || 'pendente',
        data.empresa_id,
        data.categoria_id,
        data.observacoes,
        data.usuario_id,
      ]
    )
    return normalizeLancamento(result.rows[0])
  },

  async update(id: number, data: Partial<DBLancamento>): Promise<DBLancamento | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramIndex++}`)
      values.push(data.descricao)
    }
    if (data.valor !== undefined) {
      fields.push(`valor = $${paramIndex++}`)
      values.push(data.valor)
    }
    if (data.tipo !== undefined) {
      fields.push(`tipo = $${paramIndex++}`)
      values.push(data.tipo)
    }
    if (data.data_vencimento !== undefined) {
      fields.push(`data_vencimento = $${paramIndex++}`)
      values.push(data.data_vencimento)
    }
    if (data.data !== undefined) {
      fields.push(`data = $${paramIndex++}`)
      values.push(data.data)
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(data.status)
    }
    if (data.empresa_id !== undefined) {
      fields.push(`empresa_id = $${paramIndex++}`)
      values.push(data.empresa_id)
    }
    if (data.categoria_id !== undefined) {
      fields.push(`categoria_id = $${paramIndex++}`)
      values.push(data.categoria_id)
    }
    if (data.observacoes !== undefined) {
      fields.push(`observacoes = $${paramIndex++}`)
      values.push(data.observacoes)
    }

    if (fields.length === 0) return null

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query<DBLancamento>(
      `UPDATE lancamentos SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] ? normalizeLancamento(result.rows[0]) : null
  },

  async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM lancamentos WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

// ==================== API Usuarios ====================

export const usuariosDb = {
  async findByEmail(email: string): Promise<DBUsuario | null> {
    const result = await query<DBUsuario>(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  },

  async get(id: number): Promise<DBUsuario | null> {
    const result = await query<DBUsuario>(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async create(data: { nome: string; email: string; senha: string }): Promise<DBUsuario> {
    const result = await query<DBUsuario>(
      `INSERT INTO usuarios (nome, email, senha, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [data.nome, data.email, data.senha]
    )
    return result.rows[0]
  },

  async update(id: number, data: Partial<DBUsuario>): Promise<DBUsuario | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramIndex++}`)
      values.push(data.nome)
    }
    if (data.email !== undefined) {
      fields.push(`email = $${paramIndex++}`)
      values.push(data.email)
    }
    if (data.senha !== undefined) {
      fields.push(`senha = $${paramIndex++}`)
      values.push(data.senha)
    }

    if (fields.length === 0) return null

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query<DBUsuario>(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )
    return result.rows[0] || null
  },
}
