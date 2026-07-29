# suma-admin

Panel de administración web (desktop) para las marcas que publican contenido
en la app SUMA. Proyecto Nuxt 4 separado que comparte el mismo proyecto
Supabase que la app principal (`suma`).

## Stack

- Nuxt 4 + Vue 3
- @nuxtjs/supabase (mismo proyecto Supabase que `suma`)
- TailwindCSS (colores de marca iguales a `suma`)
- Pinia

## Arrancar el proyecto

```bash
npm install
npm run dev

Requiere un .env con:


SUPABASE_URL=...
SUPABASE_KEY=...          # anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY=...  # solo para el server route de creación de usuarios
Roles de usuario
Los roles se determinan al iniciar sesión leyendo la DB:

Rol	Condición	Acceso
SuperAdmin	profiles.role = 'superadmin'	Rutas /admin/*
Brand Admin	entrada en brand_users con role = 'admin'	/marca, /news, /benefits + gestión de usuarios de su marca
Brand Member	entrada en brand_users con role = 'member'	/news, /benefits (solo sus propios registros pendientes)
Después del login, pages/index.vue redirige automáticamente al panel correcto.

Tablas principales (Supabase)
Tablas nuevas de este proyecto (compartidas con suma):

brands — marcas/organizaciones
brand_users — vincula usuarios Supabase con una marca y un rol
news — novedades/artículos (status: pending → approved/rejected)
news_categories — Tips, Últimas Novedades, Eventos, Comunidad
benefits — beneficios con descuento (status: pending → approved/rejected; level asignado por superadmin al aprobar, referencia levels.level_number)
Tabla modificada:

profiles — se le agregó columna role text DEFAULT 'user' (valores: 'user' | 'superadmin')
Todas las tablas tienen RLS habilitada. Las políticas siguen este patrón:

SuperAdmin: acceso total via profiles.role = 'superadmin'
Brand user: solo lee/escribe registros de su propia marca (brand_users join)
Editar/borrar: solo registros propios mientras status = 'pending'
Estructura de páginas

/login                          → auth layout, público
/                               → redirige según rol

/marca                          → perfil de marca + lista de usuarios (brand admin/member)
/news                           → lista de news con badges de estado
/news/nueva                     → formulario crear
/news/[id]/editar               → formulario editar (solo pendientes)
/benefits                       → lista de benefits (activos/pendientes/rechazados)
/benefits/nuevo                 → formulario crear
/benefits/[id]/editar           → formulario editar (solo pendientes)

/admin/news/pendientes          → cola de aprobación (superadmin)
/admin/news/activas             → tabla con filtro por marca (superadmin)
/admin/benefits/pendientes      → cola de aprobación + asignar nivel (superadmin)
/admin/benefits/activos         → tabla con filtro por marca/nivel (superadmin)
/admin/usuarios                 → todos los usuarios con filtro por marca (superadmin)
/admin/marcas                   → lista de marcas (superadmin)
/admin/marcas/nueva             → formulario crear marca (superadmin)
/admin/usuarios/nuevo           → formulario crear usuario + asignar a marca (superadmin)
Layouts
auth.vue — centrado, card blanca sobre fondo gradiente verde de SUMA, solo para /login
dashboard.vue — sidebar fijo izquierdo (240px) + topbar + área principal scrollable
El sidebar muestra nav diferente según authStore.profile.role:

Brand: Marca, Novedades, Beneficios
Superadmin: Novedades Pendientes, Novedades Activas, Beneficios Pendientes, Beneficios Activos, Usuarios, Marcas
Composables principales
useAuth.js — wraps authStore: login, logout, detectar rol y brand membership
useBrand.js — leer y actualizar datos de la marca, subir imagen
useBrandUsers.js — listar, eliminar y cambiar rol de usuarios de la marca
useNews.js — CRUD news (brand-scoped) + approve/reject (superadmin)
useBenefits.js — CRUD benefits (brand-scoped) + approveBenefit(id, level) / reject (superadmin)
useImageUpload.js — sube/borra archivos del bucket admin-media en Supabase Storage
useLevels.js — trae levels table para el selector al aprobar un benefit
Creación de usuarios (server route)
Crear un usuario de Supabase Auth con contraseña requiere la service role key, que nunca se expone al cliente. Usar el server route:


POST /api/create-user
Body: { email, password, name, displayName, brandId, brandRole }
El server route (server/api/create-user.post.ts) llama a supabase.auth.admin.createUser con SUPABASE_SERVICE_ROLE_KEY y luego inserta en profiles y brand_users.

Imágenes
Bucket Supabase Storage: admin-media (público).
Carpetas internas: brands/, news/, benefits/.

El composable useImageUpload.uploadImage(file, folder):

Valida tipo (jpg/png/webp) y tamaño (max 2MB)
Genera path único: ${folder}/${Date.now()}-${uuid}.ext
Devuelve la URL pública CDN
Al reemplazar imagen en edición: llamar deleteImage(oldUrl) antes de guardar la nueva.

Middleware
middleware/auth.global.js — si no hay sesión Supabase, redirige a /login
middleware/role.js — named middleware, leer definePageMeta({ requiredRole }):
'superadmin' → redirige a /news si no es superadmin
'brand' → redirige a /admin/news/pendientes si es superadmin
Convenciones
Todos los Supabase calls son client-side via composables, excepto la creación de usuarios (server route)
El estado global vive en authStore (user, profile, brandId, brandRole)
Los formularios usan componentes de components/form/ (TextField, TextareaField, SelectField, DateField, ImageUpload)
Los badges de estado: pending=amarillo, approved=verde, rejected=rojo (componente ui/Badge.vue)
El campo level de benefits no aparece en el formulario de la marca; solo el superadmin lo asigna al aprobar
Novedades/beneficios aprobados o rechazados no se pueden editar (sin botón de edición, ruta bloqueada por middleware)
Login por email (no por username como en la app principal)


---

Eso es todo lo que necesitás para arrancar. Cuando quieras que arranquemos a implementar confirmame el plan y empezamos.

## Diseño

### Paleta de colores

```css
/* Marca SUMA */
--color-primary: #157A6E;       /* verde SUMA — sidebar, headers */
--color-accent: #D7F560;        /* lima SUMA — CTAs, link activo, hovers */

/* Superficies */
--color-bg: #F5F5F5;            /* fondo general del dashboard */
--color-surface: #FFFFFF;       /* cards, tablas, modales */
--color-border: #E5E7EB;        /* bordes sutiles */

/* Texto */
--color-text: #1A1A2E;
--color-text-muted: #6B7280;

/* Status */
--color-pending-bg: #FEF3C7;    --color-pending-text: #D97706;
--color-approved-bg: #D1FAE5;   --color-approved-text: #059669;
--color-rejected-bg: #FEE2E2;   --color-rejected-text: #DC2626;

Tipografía
Headings y títulos: Montserrat Alternates (igual que la app principal)
Cuerpo, tablas, labels, inputs: Montserrat (sin Alternates, más legible en texto denso)
Bordes y radios
Cards y paneles: rounded-2xl
Inputs y botones: rounded-xl
Badges de estado: rounded-full
Sombras: shadow-sm en cards, shadow-lg en modales
Botones
Primary: fondo #D7F560, texto #1A1A2E (igual al botón de la app)
Secondary: borde #157A6E, fondo transparente
Danger: rojo, para eliminar o rechazar
Status badges
Componente ui/Badge.vue con prop status:

Valor	Fondo	Texto
pending	#FEF3C7	#D97706
approved	#D1FAE5	#059669
rejected	#FEE2E2	#DC2626
Sidebar oscuro
El sidebar usa fondo #157A6E (verde primario SUMA) con texto blanco.
El link activo tiene fondo #D7F560 y texto #1A1A2E.
Contrasta con el área de contenido blanca/gris clara a la derecha.


<!-- Clases Tailwind de referencia -->
<aside class="w-60 h-screen bg-[#157A6E] flex flex-col">
  <!-- Link activo -->
  <a class="bg-[#D7F560] text-[#1A1A2E] font-semibold rounded-xl px-4 py-2">...</a>
  <!-- Link inactivo -->
  <a class="text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-4 py-2">...</a>
</aside>
Identidad de la marca en el panel
El header del sidebar muestra el logo y nombre de la marca activa (tomado de authStore.brand).
Para el superadmin muestra el isotipo de SUMA con el texto "SUMA Admin".


┌─────────────────────┐
│  [logo]  Adidas     │  ← brand admin
│  powered by SUMA    │
├─────────────────────┤
│  Marca              │
│  Novedades          │
│  Beneficios         │
└─────────────────────┘

┌─────────────────────┐
│  [isotipo]  Admin   │  ← superadmin
├─────────────────────┤
│  Novedades          │
│  Beneficios         │
│  Usuarios           │
│  Marcas             │
└─────────────────────┘
Dashboard de inicio
La página / (después del redirect de rol) muestra una pantalla de bienvenida con stats cards antes de ir a las listas.

Brand user ve:

Novedades activas / pendientes / rechazadas
Beneficios activos / pendientes / rechazados
Superadmin ve los mismos contadores pero globales, con un breakdown por marca.

Las stats cards siguen el estilo general: bg-white rounded-2xl shadow-sm p-6, número grande en #157A6E, label en text-muted.
