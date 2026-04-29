import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { userId, brandUserId } = await readBody(event)

  if (!userId || !brandUserId) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos.' })
  }

  const adminClient = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
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
