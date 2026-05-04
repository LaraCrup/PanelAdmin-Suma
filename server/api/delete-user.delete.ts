import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let caller = null
  try {
    caller = await serverSupabaseUser(event)
  } catch (e) {
    console.error('[delete-user] serverSupabaseUser error:', e)
  }
  if (!caller) {
    throw createError({ statusCode: 401, message: 'No autorizado.' })
  }

  const config = useRuntimeConfig()
  const { userId, brandUserId } = await readBody(event)

  if (!userId || !brandUserId) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos.' })
  }

  const supabaseUrl = config.public.supabase.url as string
  const supabaseKey = config.supabaseServiceRoleKey as string

  if (!supabaseUrl || !supabaseKey) {
    console.error('[delete-user] Missing Supabase URL or service role key')
    throw createError({ statusCode: 500, message: 'Error de configuración del servidor.' })
  }

  const adminClient = createClient(
    supabaseUrl,
    supabaseKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error: brandUserError } = await adminClient
    .from('brand_users')
    .delete()
    .eq('id', brandUserId)

  if (brandUserError) {
    console.error('[delete-user] brand_users error:', brandUserError.message)
    throw createError({ statusCode: 500, message: 'Error al eliminar el usuario de la marca.' })
  }

  const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

  if (authError) {
    console.error('[delete-user] auth error:', authError.message)
    throw createError({ statusCode: 500, message: 'Error al eliminar el usuario de autenticación.' })
  }

  return { success: true }
})
