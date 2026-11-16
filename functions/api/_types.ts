export interface Env {
  DB: D1Database
}

export interface User {
  id: number
  email: string
  password_hash: string
}

export interface Scheme {
  id: number
  user_id: number
  title: string
  data: string
  created_at: number
  updated_at: number
}

const SESSION_SECONDS = 60 * 60 * 24 * 30

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
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

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return toHex(new Uint8Array(digest))
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

export function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(/sb_session=([a-f0-9]+)/)
  return match ? match[1] : null
}

export async function createSession(db: D1Database, userId: number): Promise<{ token: string; expires: number }> {
  const token = generateToken()
  const now = Math.floor(Date.now() / 1000)
  const expires = now + SESSION_SECONDS

  await db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now).run()
  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await hashToken(token), userId, expires)
    .run()

  return { token, expires }
}

export async function deleteSession(db: D1Database, token: string) {
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await hashToken(token)).run()
}

export async function getUser(request: Request, db: D1Database): Promise<User | null> {
  const token = getSessionToken(request)
  if (!token) return null

  const now = Math.floor(Date.now() / 1000)
  const user = await db
    .prepare(
      'SELECT users.id, users.email, users.password_hash FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ? LIMIT 1'
    )
    .bind(await hashToken(token), now)
    .first<User>()

  return user ?? null
}

export function sessionCookie(request: Request, token: string, expires: number): string {
  const date = new Date(expires * 1000).toUTCString()
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  return 'sb_session=' + token + '; Path=/; HttpOnly; SameSite=Lax; Expires=' + date + secure
}

export function clearCookie(): string {
  return 'sb_session=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
}
