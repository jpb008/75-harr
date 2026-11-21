import { CORS_HEADERS, error } from './lib/response.js'
import { handleSignup, handleLogin, handleSession } from './routes/auth.js'
import { handleSubscribe, handleUnsubscribe, runScheduledPush } from './routes/push.js'
import { handleGetState, handlePutState } from './routes/state.js'
import { handleGetPlan, handleGetPlanHistory, handlePostPlan } from './routes/plan.js'
import { handleGetWeeklyReview, handlePostWeeklyReview, handlePatchWeeklyReview } from './routes/weeklyReview.js'

const ROUTES = [
  ['POST', '/auth/signup', handleSignup],
  ['POST', '/auth/login', handleLogin],
  ['GET', '/auth/session', handleSession],
  ['POST', '/subscribe', handleSubscribe],
  ['POST', '/unsubscribe', handleUnsubscribe],
  ['GET', '/state', handleGetState],
  ['PUT', '/state', handlePutState],
  ['GET', '/plan', handleGetPlan],
  ['GET', '/plan/history', handleGetPlanHistory],
  ['POST', '/plan', handlePostPlan],
  ['GET', '/weekly-review', handleGetWeeklyReview],
  ['POST', '/weekly-review', handlePostWeeklyReview],
]

const WEEKLY_REVIEW_ID_RE = /^\/weekly-review\/([^/]+)$/

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    if (request.method === 'PATCH') {
      const match = url.pathname.match(WEEKLY_REVIEW_ID_RE)
      if (match) return handlePatchWeeklyReview(request, env, match[1])
    }

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
