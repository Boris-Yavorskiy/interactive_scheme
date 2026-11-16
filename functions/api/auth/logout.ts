import { Env, deleteSession, getSessionToken, clearCookie } from '../_types'

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const token = getSessionToken(request)
  if (token) await deleteSession(env.DB, token)

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearCookie()
    }
  })
}
