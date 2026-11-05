import { Env, json, getUser, Scheme } from '../_types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(request, env.DB)
  if (!user) return json({ success: false, code: 'unauthorized', message: 'Потрібна авторизація.' }, 401)

  const rows = await env.DB
    .prepare('SELECT id, title, created_at, updated_at FROM schemes WHERE user_id = ? ORDER BY updated_at DESC')
    .bind(user.id)
    .all<Pick<Scheme, 'id' | 'title' | 'created_at' | 'updated_at'>>()

  const schemes = (rows.results || []).map(r => ({
    id: r.id,
    title: r.title,
    createdAt: new Date(r.created_at * 1000).toISOString(),
    updatedAt: new Date(r.updated_at * 1000).toISOString()
  }))

  return json({ success: true, schemes })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(request, env.DB)
  if (!user) return json({ success: false, code: 'unauthorized', message: 'Потрібна авторизація.' }, 401)

  const body = await request.json<{ title: string; data: unknown }>()
  const title = (body.title || 'Без назви').trim().slice(0, 190)
  const data = JSON.stringify(body.data || {})
  const now = Math.floor(Date.now() / 1000)

  const result = await env.DB
    .prepare('INSERT INTO schemes (user_id, title, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .bind(user.id, title, data, now, now)
    .run()

  return json({ success: true, id: result.meta.last_row_id })
}
