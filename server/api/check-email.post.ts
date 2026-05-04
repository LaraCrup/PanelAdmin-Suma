import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)
  if (!email) throw createError({ statusCode: 400, message: 'Email requerido.' })

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabase.url as string
  const supabaseKey = config.supabaseServiceRoleKey as string

  if (!supabaseUrl || !supabaseKey) {
    throw createError({ statusCode: 500, message: 'Error de configuración.' })
  }

  const adminClient = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const exists = data?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase()) ?? false

  return { exists }
})
