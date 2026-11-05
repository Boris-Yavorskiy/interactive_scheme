import { Env, json, getUser, Scheme } from '../_types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(request, env.DB)
  if (!user) return json({ success: false, code: 'unauthorized', message: 'Потрібна авторизація.' }, 401)

  const id = Number(params.id)
  const scheme = await env.DB
    .prepare('SELECT * FROM schemes WHERE id = ? AND user_id = ? LIMIT 1')
    .bind(id, user.id)
    .first<Scheme>()

  if (!scheme) return json({ success: false, code: 'not_found', message: 'Схему не знайдено.' }, 404)

  return json({
    success: true,
    scheme: {
      id: scheme.id,
      title: scheme.title,
      data: JSON.parse(scheme.data),
      createdAt: new Date(scheme.created_at * 1000).toISOString(),
      updatedAt: new Date(scheme.updated_at * 1000).toISOString()
    }
  })
}

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(request, env.DB)
  if (!user) return json({ success: false, code: 'unauthorized', message: 'Потрібна авторизація.' }, 401)

  const id = Number(params.id)
  const body = await request.json<{ title: string; data: unknown }>()
  const title = (body.title || 'Без назви').trim().slice(0, 190)
  const data = JSON.stringify(body.data || {})
  const now = Math.floor(Date.now() / 1000)

  const result = await env.DB
    .prepare('UPDATE schemes SET title = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?')
    .bind(title, data, now, id, user.id)
    .run()

  if (result.meta.changes === 0) return json({ success: false, code: 'not_found', message: 'Схему не знайдено.' }, 404)

  return json({ success: true })
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const user = await getUser(request, env.DB)
  if (!user) return json({ success: false, code: 'unauthorized', message: 'Потрібна авторизація.' }, 401)

  const id = Number(params.id)
  await env.DB
    .prepare('DELETE FROM schemes WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .run()

  return json({ success: true })
}
