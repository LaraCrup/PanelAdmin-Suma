import { createClient } from '@supabase/supabase-js'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  let caller = null
  try {
    caller = await serverSupabaseUser(event)
  } catch (e) {
    console.error('[delete-user] serverSupabaseUser error:', e)
  }
  const callerId = caller?.sub ?? caller?.id

  if (!callerId) {
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

  const { data: targetBrandUser } = await adminClient
    .from('brand_users')
    .select('brand_id')
    .eq('id', brandUserId)
    .maybeSingle()

  if (!targetBrandUser) {
    throw createError({ statusCode: 404, message: 'Usuario no encontrado.' })
  }

  const { data: callerProfile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', callerId)
    .maybeSingle()

  if (callerProfile?.role !== 'superadmin') {
    const { data: callerBrandUser } = await adminClient
      .from('brand_users')
      .select('id')
      .eq('user_id', callerId)
      .eq('brand_id', targetBrandUser.brand_id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!callerBrandUser) {
      throw createError({ statusCode: 403, message: 'No autorizado.' })
    }
  }

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
