import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE_NAME = 'zapflow_session'

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/auth/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Verificar se é um asset estático
  const isStaticAsset = pathname.startsWith('/_next') || 
                         pathname.startsWith('/favicon') ||
                         pathname.startsWith('/logo') ||
                         pathname.includes('.')
  
  if (isPublicRoute || isStaticAsset) {
    return NextResponse.next()
  }
  
  // Verificar se tem sessão
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie?.value) {
    // Redirecionar para login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Validar formato básico do cookie
  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    if (!sessionData.userId) {
      throw new Error('Invalid session')
    }
  } catch {
    // Cookie inválido, redirecionar para login
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete(SESSION_COOKIE_NAME)
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
