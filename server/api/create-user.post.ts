import { createClient } from '@supabase/supabase-js'

const AUTH_ERRORS: Record<string, string> = {
  'A user with this email address has already been registered': 'Ya existe un usuario registrado con ese email.',
  'User already registered': 'Ya existe un usuario registrado con ese email.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'Invalid email': 'El email ingresado no es válido.',
  'Email rate limit exceeded': 'Demasiados intentos, esperá unos minutos.',
  'Unable to validate email address: invalid format': 'El formato del email no es válido.',
}

function mapError(message: string): string {
  return AUTH_ERRORS[message] ?? 'Ocurrió un error al crear el usuario.'
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { email, password, name, brandId, brandRole } = body

  if (!email || !password || !brandId || !brandRole) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos.' })
  }

  const adminClient = createClient(
    process.env.SUPABASE_URL!,
    config.supabaseServiceRoleKey as string,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: name ?? '',
    },
  })

  if (authError) {
    console.error('[create-user] auth error:', authError.message)
    throw createError({ statusCode: 400, message: mapError(authError.message) })
  }

  const userId = authData.user.id

  const { error: brandUserError } = await adminClient.from('brand_users').insert({
    user_id: userId,
    brand_id: brandId,
    role: brandRole,
    name: name ?? '',
    email,
  })

  if (brandUserError) {
    console.error('[create-user] brand_users error:', brandUserError.message)
    await adminClient.auth.admin.deleteUser(userId)
    throw createError({ statusCode: 400, message: mapError(brandUserError.message) })
  }

  return { success: true, userId }
})
