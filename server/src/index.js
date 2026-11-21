import { CORS_HEADERS, error } from './lib/response.js'
import { handleSignup, handleLogin, handleSession } from './routes/auth.js'
import { handleSubscribe, handleUnsubscribe, runScheduledPush } from './routes/push.js'

const ROUTES = [
  ['POST', '/auth/signup', handleSignup],
  ['POST', '/auth/login', handleLogin],
  ['GET', '/auth/session', handleSession],
  ['POST', '/subscribe', handleSubscribe],
  ['POST', '/unsubscribe', handleUnsubscribe],
]

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    for (const [method, path, handler] of ROUTES) {
      if (request.method === method && url.pathname === path) {
        return handler(request, env)
      }
    }
    return error('Not found', 404)
  },

  async scheduled(_event, env) {
    await runScheduledPush(env)
  },
}
