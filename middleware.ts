import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zapflow-financas-secret-key-2024'
)

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/registro', '/api/auth/login', '/api/auth/register', '/api/auth/logout']

// Middleware de autenticacao - compatibilidade com Next.js 16
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Permitir arquivos estáticos
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Verificar token de autenticação
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    // Redirecionar para login se não tem token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // Verificar token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Adicionar usuário ao header para as APIs
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', String(payload.id))
    requestHeaders.set('x-user-email', String(payload.email))
    requestHeaders.set('x-user-nome', String(payload.nome))
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch {
    // Token inválido
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
    
    // Limpar cookie inválido e redirecionar para login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
