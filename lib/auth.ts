import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { usuariosDb } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zapflow-financas-secret-key-2024'
)

export interface UserSession {
  id: number
  nome: string
  email: string
}

// Criar token JWT
export async function createToken(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

// Verificar token JWT
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserSession
  } catch {
    return null
  }
}

// Login do usuário
export async function loginUser(email: string, senha: string): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  const usuario = await usuariosDb.findByEmail(email)
  
  if (!usuario) {
    return { success: false, error: 'E-mail ou senha incorretos' }
  }
  
  // Verificar senha (pode ser hash bcrypt ou texto plano para dados antigos)
  let senhaValida = false
  
  // Tentar verificar como hash bcrypt
  if (usuario.senha.startsWith('$2')) {
    senhaValida = await bcrypt.compare(senha, usuario.senha)
  } else {
    // Comparar como texto plano (dados migrados do NocoDB)
    senhaValida = usuario.senha === senha
    
    // Se a senha está correta mas em texto plano, atualizar para hash
    if (senhaValida) {
      const hashedSenha = await bcrypt.hash(senha, 10)
      await usuariosDb.update(usuario.id, { senha: hashedSenha })
    }
  }
  
  if (!senhaValida) {
    return { success: false, error: 'E-mail ou senha incorretos' }
  }
  
  const userSession: UserSession = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  }
  
  // Criar token e salvar no cookie
  const token = await createToken(userSession)
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
  
  return { success: true, user: userSession }
}

// Logout do usuário
export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Obter sessão atual
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

// Registrar novo usuário
export async function registerUser(nome: string, email: string, senha: string): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  // Verificar se e-mail já existe
  const existente = await usuariosDb.findByEmail(email)
  if (existente) {
    return { success: false, error: 'Este e-mail já está cadastrado' }
  }
  
  // Hash da senha
  const hashedSenha = await bcrypt.hash(senha, 10)
  
  // Criar usuário
  const usuario = await usuariosDb.create({
    nome,
    email,
    senha: hashedSenha,
  })
  
  const userSession: UserSession = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  }
  
  // Criar token e salvar no cookie
  const token = await createToken(userSession)
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
  
  return { success: true, user: userSession }
}
