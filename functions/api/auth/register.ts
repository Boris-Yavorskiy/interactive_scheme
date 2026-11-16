import { Env, json, hashPassword, createSession, sessionCookie } from '../_types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ email: string; password: string }>()
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  if (!email.includes('@')) {
    return json({ success: false, code: 'invalid_email', message: 'Невірний формат email.' }, 400)
  }
  if (password.length < 6) {
    return json({ success: false, code: 'short_password', message: 'Пароль повинен містити щонайменше 6 символів.' }, 400)
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? LIMIT 1').bind(email).first()
  if (existing) {
    return json({ success: false, code: 'email_taken', message: 'Користувач із такою поштою вже зареєстрований.' }, 400)
  }

  let userId: number
  try {
    const result = await env.DB
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .bind(email, await hashPassword(password))
      .run()
    userId = result.meta.last_row_id
  } catch (error) {
    return json({ success: false, code: 'email_taken', message: 'Користувач із такою поштою вже зареєстрований.' }, 400)
  }

  const session = await createSession(env.DB, userId)

  return new Response(JSON.stringify({ success: true, user: { email } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(request, session.token, session.expires)
    }
  })
}
