export function useImageUpload() {
  const supabase = useSupabaseClient()
  const BUCKET = 'admin-media'
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE = 2 * 1024 * 1024

  async function uploadImage(file, folder) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { url: null, error: 'Solo se permiten imágenes JPG, PNG o WebP.' }
    }
    if (file.size > MAX_SIZE) {
      return { url: null, error: 'La imagen no puede superar los 2MB.' }
    }

    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false })

    if (uploadError) return { url: null, error: uploadError.message }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl, error: null }
  }

  async function deleteImage(publicUrl) {
    if (!publicUrl) return
    const marker = `/${BUCKET}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return
    const path = publicUrl.slice(idx + marker.length)
    await supabase.storage.from(BUCKET).remove([path])
  }

  return { uploadImage, deleteImage }
}
