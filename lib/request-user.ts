import { headers } from 'next/headers'

export interface RequestUser {
  id: number
  email: string
  nome: string
}

// Obter usuário da requisição (set pelo middleware)
export async function getRequestUser(): Promise<RequestUser | null> {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const email = headersList.get('x-user-email')
  const nome = headersList.get('x-user-nome')
  
  if (!userId) {
    return null
  }
  
  return {
    id: parseInt(userId),
    email: email || '',
    nome: nome || '',
  }
}
