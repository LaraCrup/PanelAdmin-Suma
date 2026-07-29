import { createClient } from '@supabase/supabase-js'

const WINDOW_MS = 5 * 60 * 1000
const MAX_REQUESTS = 10
const attempts = new Map<string, { count: number, resetAt: number }>()

function rateLimit(ip: string) {
  const now = Date.now()

  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key)
  }

  const current = attempts.get(ip)
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  current.count += 1
  return current.count <= MAX_REQUESTS
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'desconocida'
  if (!rateLimit(ip)) {
    throw createError({ statusCode: 429, message: 'Demasiados intentos, esperá unos minutos.' })
  }

  const { email } = await readBody(event)
  if (!email || typeof email !== 'string') {
    throw createError({ statusCode: 400, message: 'Email requerido.' })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabase.url as string
  const supabaseKey = config.supabaseServiceRoleKey as string

  if (!supabaseUrl || !supabaseKey) {
    throw createError({ statusCode: 500, message: 'Error de configuración.' })
  }

  const adminClient = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const normalized = email.trim().toLowerCase()

  const [brandUser, superadmin] = await Promise.all([
    adminClient.from('brand_users').select('id').ilike('email', normalized).maybeSingle(),
    adminClient.from('profiles').select('id').ilike('email', normalized).eq('role', 'superadmin').maybeSingle(),
  ])

  return { exists: Boolean(brandUser.data || superadmin.data) }
})
