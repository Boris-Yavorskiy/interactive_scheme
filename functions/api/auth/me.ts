import { Env, json, getUser } from '../_types'

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const user = await getUser(request, env.DB)
  if (!user) {
    return json({ loggedIn: false })
  }
  return json({ loggedIn: true, email: user.email })
}
