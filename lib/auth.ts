import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { usuariosApi } from './nocodb'
import type { Usuario } from './types'

const SESSION_COOKIE_NAME = 'zapflow_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

// Criar hash da senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Criar sessão (cookie simples com ID do usuário codificado)
export async function createSession(userId: number): Promise<void> {
  const cookieStore = await cookies()
  
  // Codificar o ID do usuário em base64 (em produção, use JWT ou outra solução mais segura)
  const sessionData = Buffer.from(JSON.stringify({ userId, createdAt: Date.now() })).toString('base64')
  
  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

// Obter sessão atual
export async function getSession(): Promise<{ userId: number } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    return { userId: sessionData.userId }
  } catch {
    return null
  }
}

// Destruir sessão
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Obter usuário atual
export async function getCurrentUser(): Promise<Usuario | null> {
  const session = await getSession()
  
  if (!session) {
    return null
  }
  
  try {
    const user = await usuariosApi.get(session.userId)
    // Não retornar a senha
    const { senha, ...userWithoutPassword } = user
    return userWithoutPassword as Usuario
  } catch {
    return null
  }
}

// Registrar novo usuário
export async function registerUser(nome: string, email: string, password: string): Promise<Usuario> {
  // Verificar se email já existe
  const existingUsers = await usuariosApi.list({ where: `(email,eq,${email})` })
  
  if (existingUsers.list.length > 0) {
    throw new Error('Este e-mail já está cadastrado')
  }
  
  // Criar hash da senha
  const hashedPassword = await hashPassword(password)
  
  // Criar usuário
  const user = await usuariosApi.create({
    nome,
    email,
    senha: hashedPassword,
  })
  
  return user
}

// Login
export async function loginUser(email: string, password: string): Promise<Usuario> {
  // Buscar usuário pelo email
  const users = await usuariosApi.list({ where: `(email,eq,${email})` })
  
  if (users.list.length === 0) {
    throw new Error('E-mail ou senha incorretos')
  }
  
  const user = users.list[0]
  
  // Verificar senha
  const isValidPassword = await verifyPassword(password, user.senha || '')
  
  if (!isValidPassword) {
    throw new Error('E-mail ou senha incorretos')
  }
  
  // Criar sessão
  await createSession(user.Id)
  
  // Retornar usuário sem a senha
  const { senha, ...userWithoutPassword } = user
  return userWithoutPassword as Usuario
}

// Logout
export async function logoutUser(): Promise<void> {
  await destroySession()
}
