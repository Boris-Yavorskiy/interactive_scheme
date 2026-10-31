export interface Env {
  DB: D1Database
}

export interface User {
  id: number
  email: string
  password_hash: string
  session_token: string | null
  session_expires: number | null
}

export interface Scheme {
  id: number
  user_id: number
  title: string
  data: string
  created_at: number
  updated_at: number
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(/sb_session=([a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

export async function getUser(request: Request, db: D1Database): Promise<User | null> {
  const token = getSessionToken(request)
  if (!token) return null
  const now = Math.floor(Date.now() / 1000)
  const user = await db
    .prepare('SELECT * FROM users WHERE session_token = ? AND session_expires > ? LIMIT 1')
    .bind(token, now)
    .first<User>()
  return user ?? null
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(text.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  const hash = await deriveKey(password, salt)
  return toHex(salt) + ':' + toHex(hash)
}

export async function checkPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':')
  if (parts.length !== 2) return false
  const hash = await deriveKey(password, fromHex(parts[0]))
  return toHex(hash) === parts[1]
}

export function generateToken(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function sessionCookie(token: string, expires: number): string {
  const date = new Date(expires * 1000).toUTCString()
  return `sb_session=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${date}`
}

export function clearCookie(): string {
  return 'sb_session=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
}
