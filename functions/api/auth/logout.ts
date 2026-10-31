import { Env, json, getUser, clearCookie } from '../_types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(request, env.DB)
  if (user) {
    await env.DB
      .prepare('UPDATE users SET session_token = NULL, session_expires = NULL WHERE id = ?')
      .bind(user.id)
      .run()
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearCookie()
    }
  })
}
