import { Env, json, checkPassword, createSession, sessionCookie, User } from '../_types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ email: string; password: string }>()
  const email = (body.email || '').trim().toLowerCase()
  const password = body.password || ''

  const user = await env.DB
    .prepare('SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1')
    .bind(email)
    .first<User>()

  if (!user || !(await checkPassword(password, user.password_hash))) {
    return json({ success: false, code: 'bad_credentials', message: 'Неправильна пошта або пароль.' }, 400)
  }

  const session = await createSession(env.DB, user.id)

  return new Response(JSON.stringify({ success: true, user: { email: user.email } }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': sessionCookie(request, session.token, session.expires)
    }
  })
}
