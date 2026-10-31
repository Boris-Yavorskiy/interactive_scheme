import { Env, json, generateToken, hashPassword, sessionCookie } from '../_types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ email: string; password: string }>()
  const email = (body.email || '').trim().toLowerCase()
  const password = (body.password || '').trim()

  if (!email.includes('@')) {
    return json({ success: false, message: 'Невірний формат email.' }, 400)
  }
  if (password.length < 6) {
    return json({ success: false, message: 'Пароль повинен містити щонайменше 6 символів.' }, 400)
  }

  const existing = await env.DB
    .prepare('SELECT id FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first()
  if (existing) {
    return json({ success: false, message: 'Користувач із такою поштою вже зареєстрований.' }, 400)
  }

  const hash = await hashPassword(password)
  const token = generateToken()
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30

  await env.DB
    .prepare('INSERT INTO users (email, password_hash, session_token, session_expires) VALUES (?, ?, ?, ?)')
    .bind(email, hash, token, expires)
    .run()

  return new Response(JSON.stringify({ success: true, user: { email } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(token, expires)
    }
  })
}
