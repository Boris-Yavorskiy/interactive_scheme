import { Env, json, generateToken, checkPassword, sessionCookie, User } from '../_types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ email: string; password: string }>()
  const email = (body.email || '').trim().toLowerCase()
  const password = (body.password || '').trim()

  const user = await env.DB
    .prepare('SELECT * FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<User>()

  if (!user || !(await checkPassword(password, user.password_hash))) {
    return json({ success: false, code: 'bad_credentials', message: 'Неправильна пошта або пароль.' }, 400)
  }

  const token = generateToken()
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30

  await env.DB
    .prepare('UPDATE users SET session_token = ?, session_expires = ? WHERE id = ?')
    .bind(token, expires, user.id)
    .run()

  return new Response(JSON.stringify({ success: true, user: { email: user.email } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(token, expires)
    }
  })
}
