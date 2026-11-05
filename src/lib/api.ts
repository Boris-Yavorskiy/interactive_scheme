import type { SavedScheme, SchemeData } from '../types'

export interface ApiResponse {
  success?: boolean
  code?: string
  message?: string
  loggedIn?: boolean
  email?: string
  user?: { email: string }
  id?: number
  schemes?: SavedScheme[]
  scheme?: { id: number; title: string; data: SchemeData }
}

export async function api(method: string, path: string, body?: unknown): Promise<ApiResponse> {
  const options: RequestInit = {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)

  try {
    const response = await fetch('/api' + path, options)
    return (await response.json()) as ApiResponse
  } catch (error) {
    return { success: false, code: 'network' }
  }
}
