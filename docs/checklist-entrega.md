# Checklist de entrega — PanelAdminSuma

Revisión completa del 29/07/2026. Incluye lo que ya se corrigió (y hay que
re-testear) y lo que queda pendiente de tu decisión.

---

## 1. Pendiente de tu decisión

### 1.1 Tabla `profiles` legible sin login — coordinación con el repo Suma

La policy `Enable read access for all users` sobre `public.profiles` tiene
`USING (true)` para el rol `public`, y anula a `profiles_select`. Cualquiera con
la anon key puede leer los 26 perfiles con `email`, `name` y `role` sin estar
logueado.

El repo de la app Suma ya auditó el impacto y eligió la salida: **policy
`profiles_select_public TO authenticated USING (true)` + privilegios a nivel
columna**, con RPCs `SECURITY DEFINER` para lo que quede afuera. Van a revocar el
SELECT sobre `email`, `name` y `role` para `authenticated` y `anon`.

**Este panel se ve afectado.** Lo verificado:

| Lectura | Rol | ¿Se rompía? |
|---------|-----|-------------|
| `app/stores/auth.js:22` → `select('id, role, name, display_name')` | `authenticated` (cliente) | **SÍ** — ya migrado |
| `server/api/check-email.post.ts:51` → `select('id')` filtrando por `email` y `role` | `service_role` | No |
| `server/api/create-user.post.ts:52` → `select('role')` | `service_role` | No |
| `server/api/delete-user.delete.ts:48` → `select('role')` | `service_role` | No |

Los tres endpoints de `server/api/` usan el `SUPABASE_SERVICE_ROLE_KEY`, así que
son inmunes al REVOKE. El panel **nunca leyó `profiles.email` desde el cliente**.

La única lectura cliente era la del store de auth, la que resuelve si sos
superadmin. Sin migrar, el efecto del REVOKE hubiera sido: PostgREST devuelve
`permission denied`, `profileData` queda en `null`, `isSuperAdmin` nunca es
`true`, y `middleware/auth.global.js` hace `signOut()` — el superadmin
permanentemente afuera del panel, mientras los usuarios de marca seguían
entrando por el fallback de `brand_users`.

#### Estado: migrado

`app/stores/auth.js:22` ahora usa el RPC `my_profile()`, que el repo Suma agregó
en `20260729_profiles_public_rpcs.sql`:

```js
const { data: profileData } = await supabase.rpc('my_profile')
```

Se usó `my_profile()` (y no una función propia) porque devuelve `RETURNS profiles`,
que PostgREST entrega como **objeto**. Una función `RETURNS TABLE` hubiera
llegado como array y `data.role` habría sido `undefined` → `isSuperAdmin` falso
→ `signOut()`: el mismo bug que se quería evitar, pero silencioso.

Al ser `SECURITY DEFINER`, corre con los privilegios del owner y por lo tanto
**sobrevive al revoke de columnas** del paso 4.

Verificado: la función existe, es `SECURITY DEFINER`, `anon` no tiene EXECUTE,
y simulando el JWT del superadmin devuelve la fila correcta. En `app/` ya no
queda ninguna lectura ni embed de `profiles`.

#### Orden de despliegue

1. [x] `20260729_profiles_public_rpcs.sql` aplicada
2. [x] Deployar el cliente de Suma
3. [x] **Deployar este panel**
4. [x] `20260729_profiles_column_privileges.sql` aplicada

⚠️ **Los pasos 3 y 4 se hicieron al revés.** El paso 4 ya corrió, así que
cualquier instancia del panel que esté deployada con el código viejo está rota
en este momento: la query anterior devuelve `permission denied for table
profiles` y el superadmin no puede entrar. El código local ya está migrado, así
que **el deploy del panel resuelve el problema**.

Estado verificado contra la base con los privilegios nuevos:

| Chequeo | Resultado |
|---------|-----------|
| `my_profile()` con JWT del superadmin | devuelve `role: superadmin`, `name: Lara` |
| `is_superadmin()` con JWT del superadmin | `true` (sobrevive al revoke por ser `SECURITY DEFINER`) |
| Superadmin lee brands / brand_users / news / benefits / levels / categorías | OK |
| Usuario de marca: `get_my_brand_id()` y `get_my_brand_role()` | OK (`admin`) |
| Usuario de marca ve sólo los `brand_users` de su marca | OK (2 de 28) |
| Query vieja (`select role, name from profiles`) | falla con `permission denied` — confirmado |
| Advisor de seguridad sobre `profiles` | ya no lo marca |

- [x] Probar el login del panel con el superadmin (es lo único que cambió)
- [x] Deployar el panel

#### Sobre el `INSERT` de `anon` que reportaron

Tenían razón en el GRANT, aunque para `anon` no era explotable: la policy
`Enable authenticated users to insert their own profile` tiene
`WITH CHECK (auth.uid() = id)`, y para `anon` `auth.uid()` es `NULL`, con lo cual
`NULL = id` evalúa a `NULL` y Postgres rechaza la fila. Ya está revocado:
`anon` hoy no tiene ni SELECT ni INSERT sobre `profiles`.

#### Escalada a superadmin por `INSERT` (encontrada el 30/07, corregida)

El mismo GRANT **sí era explotable para `authenticated`**, y era el agujero más
grave que quedaba. `authenticated` tenía INSERT sobre las 9 columnas, incluida
`role`, y la policy sólo exige `auth.uid() = id`. Como los usuarios de
`brand_users` **ya no tienen fila en `profiles`** (justamente por la separación
descrita más abajo), nada impedía que se insertaran la suya con
`role: 'superadmin'`.

O sea: cualquier usuario de marca, incluido un `member`, desde la consola del
navegador y con la anon key que ya tiene, se volvía superadmin del panel y ganaba
acceso total a `news`, `benefits`, `brands` y `brand_users` de **todas** las
marcas, porque esas policies cuelgan de `is_superadmin()`.

Verificado contra la base simulando el JWT de un `member`:
`INSERT PERMITIDO | is_superadmin() = true`.

Dos motivos por los que se había pasado por alto:

- El fix de "Escalada de privilegios a superadmin" (sección 2) cerró el
  **UPDATE** de `profiles.role`, no el INSERT. Y borrar las 28 filas de
  `profiles` es lo que volvió el INSERT viable: mientras cada usuario de panel
  tenía su fila, la PK lo bloqueaba.
- Probado con `Prefer: return=representation` devuelve `permission denied`,
  porque la respuesta necesita SELECT sobre `role`. Parece cerrado y no lo está:
  sin ese header el INSERT pasa.

Migración aplicada (`profiles_insert_role_privilege`):

```sql
revoke insert on public.profiles from authenticated;
grant insert (id, email, name, display_name, avatar_url, created_at,
              experience_points, current_level)
  on public.profiles to authenticated;
revoke truncate on public.profiles from anon, authenticated;
revoke delete on public.profiles from anon;
alter policy "Enable authenticated users to insert their own profile"
  on public.profiles to authenticated;
```

Sólo saca `role` del INSERT. `handle_new_user` es `SECURITY DEFINER`, así que el
registro de la app Suma no se ve afectado, y la app no inserta en `profiles`
desde el cliente (verificado en el repo Suma).

| Chequeo post-fix | Resultado |
|------------------|-----------|
| `member` inserta su perfil con `role: 'superadmin'` | `permission denied` |
| `member` inserta su perfil sin `role` | sigue funcionando |
| `my_profile()` con JWT del superadmin | `role: superadmin`, `name: Lara` |
| `is_superadmin()` con JWT de un `member` | `false` |
| `get_my_brand_role()` con JWT de un `member` | `member` |
| Filas de `profiles` | 6, sin residuos de las pruebas |

### 1.2 Otros pendientes menores

- [x] Activar **"Leaked password protection"** en Supabase → Authentication →
      Policies. Está apagado.
- [x] El README dice que los roles son `brand_admin` / `brand_member`, pero en la
      base son `admin` / `member`. Corregir la tabla del README.
- [x] Las funciones `SECURITY DEFINER` (`is_superadmin`, `get_my_brand_id`,
      `get_my_brand_role`, etc.) son ejecutables por `anon`. No es explotable
      porque todas dependen de `auth.uid()`, que es null sin sesión, pero si te
      lo preguntan en la defensa, esa es la respuesta.
- [x] Probar el deploy real, no sólo local.

---

## 2. Lo que se corrigió (hay que re-testear)

### Base de datos

| Qué | Detalle |
|-----|---------|
| **Escalada de privilegios a superadmin** | `profiles.role` ya no es actualizable por `authenticated` ni `anon`. Antes, cualquier usuario de la app Suma podía hacer un PATCH a su propio perfil poniendo `role: 'superadmin'` y entrar al panel con permisos totales. Ahora `authenticated` sólo puede actualizar `name`, `display_name`, `avatar_url`, `experience_points` y `current_level`. El mismo agujero por `INSERT` se cerró después: ver 1.1. |
| **`profiles_update` sin `WITH CHECK`** | Se recreó la policy con `WITH CHECK` explícito y se borró la duplicada `Enable authenticated users to update their own profile`. |
| **Borrado cruzado de imágenes** | La policy `Brand users delete admin-media` dejaba que un usuario de cualquier marca borrara imágenes de cualquier otra. Ahora bloquea borrar un archivo que esté referenciado por contenido de otra marca. |
| **Policies duplicadas** | Se borró `Allow read levels to authenticated users` (duplicaba `levels_select`). |
| **Usuarios del panel mezclados con usuarios de la app** | Los usuarios de `brand_users` ya **no** tienen fila en `profiles`. Ver "Separación entre `profiles` y `brand_users`" más abajo. |

⚠️ **Verificar por esto:**

- [x] En la **app Suma**: entrar a "Mi perfil → Editar", cambiar nombre y
      display_name y guardar. Debe funcionar igual que antes.
- [x] En la **app Suma**: ganar XP haciendo un hábito. El nivel y los puntos
      deben seguir actualizándose.
- [x] En la **app Suma**: buscar usuarios en la pantalla de amigos. Los 8
      usuarios del panel (`maria.adidas`, `sofia.nike`, `diego.topper`,
      `gabriela.ombu`, `vanesa.megatlon`, `florencia.yenny`, `melina.sport78`,
      `horacio.patagonia`) ahora tienen perfil y **podrían aparecer** en la
      búsqueda. Si molesta, avisame y los saco de la búsqueda.
- [x] Como usuario de marca: subir una imagen nueva a una novedad, guardar, y
      confirmar que la vieja desaparece del bucket.

### Storage

- [x] Se borraron **30 imágenes huérfanas** (9 de news, 11 de benefits, 10 de
      brands). El bucket quedó en 92 archivos, exactamente los 92 referenciados
      en la base. Verificar que **ninguna** novedad, beneficio o logo de marca
      quedó con la imagen rota.

### Código

| # | Qué se arregló | Archivo |
|---|----------------|---------|
| 4 | Borrar una novedad / beneficio / marca ahora **borra también su imagen** del bucket. Antes quedaban huérfanas para siempre. | `useNews.js`, `useBenefits.js`, `useBrand.js` |
| 5 | Aprobar y rechazar ya **muestran el error** si falla. Antes lo tragaban en silencio. | `admin/news/pendientes.vue`, `admin/benefits/pendientes.vue` |
| 6 | Un usuario `member` ya **no puede entrar** a `/marca/nuevo-usuario`. Se agregó `requiredBrandRole: 'admin'` al middleware `role`. | `middleware/role.js`, `marca/nuevo-usuario.vue` |
| 7 | **Género gramatical**: `StatusTabs` y `Badge` ahora tienen prop `genero`. Beneficios dice "Todos / Aprobados / Rechazados", novedades dice "Todas / Aprobadas / Rechazadas". | `StatusTabs.vue`, `Badge.vue`, `benefits/index.vue`, `news/index.vue`, `admin/news/[id]/editar.vue` |
| 8 | `/api/check-email` ya **no trae 1000 usuarios** en cada login fallido: consulta directo por email en `brand_users` y `profiles`. Se le agregó **rate limit** de 10 pedidos cada 5 minutos por IP (devuelve 429). | `check-email.post.ts` |
| 9 | **Borrar marca**: ver abajo, era peor de lo que parecía. | `admin/marcas/index.vue`, `useBrand.js` |
| — | `ImageUpload` ahora tiene prop `required` de verdad (antes el atributo caía suelto en un `div`). Muestra un asterisco rojo. | `ImageUpload.vue` |
| — | La imagen es **obligatoria al editar** una novedad (antes sólo al crearla). | `news/[id]/editar.vue`, `admin/news/[id]/editar.vue` |
| — | `actionLoading.includes('a')` comparaba mal (buscaba la letra "a" adentro del UUID). | `admin/benefits/pendientes.vue` |
| — | El botón de cerrar del `Modal` ahora tiene `aria-label`. | `Modal.vue` |
| — | `create-user` **ya no inserta en `profiles`**: crea el usuario de auth y la fila en `brand_users`. Si falla, hace rollback del usuario. | `create-user.post.ts` |

#### Separación entre `profiles` y `brand_users`

`profiles` es la tabla de la **app Suma** (social y gamificación: amigos,
comunidades, hábitos, XP). `brand_users` es la del **panel**. Son dos poblaciones
distintas y no hay nada en la base que las ate: `brand_users.user_id` apunta a
`auth.users`, no a `profiles`.

Aun así `create-user` insertaba una fila en `profiles` por cada usuario de panel.
Resultado: de 34 perfiles, 28 eran usuarios de panel, y aparecían en la búsqueda
de amigos de la app (`searchUsers` filtra `profiles` por `display_name`). También
forzaba un workaround por el UNIQUE de `profiles.display_name`, que podía chocar
con el nickname de un usuario real.

Se quitó el insert y se borraron las 28 filas. Se verificó antes que no colgaba
nada de ellas: 0 hábitos, 0 miembros de comunidad, 0 mensajes, 0 solicitudes de
amistad, 0 suscripciones push, 0 XP.

Lo único que sigue necesitando `profiles` es el superadmin, porque
`is_superadmin()` lee `profiles.role`. No se movió a `brand_users` a propósito:
`brand_id` es NOT NULL con FK a `brands`, así que habría que inventar una marca
fantasma, y `get_my_brand_id()` empezaría a devolverla — las policies de
`benefits` y `news` filtrarían al superadmin por marca en vez de darle acceso
total. El superadmin además es un usuario real de la app, así que su perfil es
legítimo.

Queda `profiles` con 6 filas, todas de usuarios reales de la app.

#### Sobre el punto 9 — borrar marca

Lo que decía el informe anterior estaba incompleto. Las tres foreign keys hacia
`brands` (`news`, `benefits`, `brand_users`) son **`ON DELETE CASCADE`**. O sea:
borrar una marca **nunca fallaba** — borraba en silencio todas sus novedades,
todos sus beneficios y todos sus usuarios de marca.

El modal que decía *"No se puede eliminar: la marca tiene novedades o beneficios
asociados"* era **código muerto**: no se ejecutaba nunca.

Ahora:

- Antes de confirmar, se cuenta qué se va a borrar y el modal lo dice explícito:
  *"Al eliminar la marca X también se borran 3 novedades, 5 beneficios y 2
  usuarios, junto con sus imágenes."*
- Se eliminan los usuarios de auth de esa marca (si no, quedaban cuentas que
  podían loguearse sin pertenecer a ninguna marca).
- Se borran todas las imágenes de esas novedades, beneficios y el logo.
- Si algo falla, se muestra el error real en pantalla.

⚠️ **Probá esto con una marca de prueba, no con una que quieras conservar.**

### Repo

- [x] `.claude/skills/` sacado del control de versiones y agregado al `.gitignore`
      (eran 33 archivos, incluidos 3 `.pyc` compilados).
- [x] `suma-admin.md` movido a `docs/suma-admin.md`.

---

## 3. Checklist de prueba manual

### Login y accesos

- [x] Login con email inexistente → "No existe una cuenta con ese email"
- [x] Login con contraseña incorrecta → "Contraseña incorrecta"
- [x] Login con un usuario común de la app Suma (rol `user`) → lo rechaza con
      "No tenés acceso al panel de administración"
- [x] Errar la contraseña más de 10 veces seguidas → sigue funcionando el login
      (el rate limit sólo afecta al mensaje diferenciado, no al login en sí)
- [x] Refrescar (F5) estando logueada en una página interna → no te expulsa
- [x] Entrar a `/admin/marcas` con un usuario de marca → redirige a `/news`
- [x] Entrar a `/news` con el superadmin → redirige a `/admin/news/pendientes`
- [x] Cerrar sesión y volver atrás con el botón del navegador → no entra

### Superadmin — novedades

> **Antes de empezar:** hoy las 23 novedades y los 49 beneficios de la base están
> todos en `approved`. No hay nada `pending` ni `rejected`, así que las pantallas
> de Pendientes y Rechazadas van a estar vacías. Para probar el circuito de
> aprobación tenés que entrar primero como usuario de marca y crear contenido.

- [x] Aprobar una novedad → desaparece de Pendientes y aparece en Activas
- [x] Rechazar sin escribir motivo → el botón está deshabilitado
- [x] Rechazar con motivo → aparece en Rechazadas con el motivo visible
- [x] Ver el detalle (modal) de una pendiente, una activa y una rechazada
- [x] Editar una novedad ya aprobada → guarda y vuelve a Activas (no a Pendientes)
- [x] Editar una novedad y borrarle la imagen → no deja guardar
- [x] Filtrar por marca en Activas y en Rechazadas
- [x] **Verificar que la novedad aprobada aparece en la app Suma**

### Superadmin — beneficios

- [x] El botón Aprobar está deshabilitado hasta elegir nivel
- [x] Aprobar con nivel → aparece en Activos con ese nivel
- [x] Los tabs dicen "Todos / Aprobados / Rechazados" (masculino)
- [x] Filtrar por marca **y** por nivel al mismo tiempo en Activos
- [x] Editar un beneficio aprobado → aparece el selector de Nivel; editar uno
      pendiente → no aparece
- [x] **Verificar que el beneficio aprobado aparece en la app Suma con el nivel
      correcto**

### Superadmin — marcas

- [x] Crear marca sin logo → se ve la inicial en un círculo
- [x] Crear marca con sitio web → el link abre en pestaña nueva
- [x] Borrar una marca **sin** contenido → el modal dice sólo "no se puede
      deshacer"
- [x] Borrar una marca **con** contenido → el modal enumera cuántas novedades,
      beneficios y usuarios se van a borrar
- [x] Después de borrar una marca con contenido: sus usuarios **ya no pueden
      loguearse** y sus imágenes desaparecieron del bucket

### Superadmin — usuarios

- [x] Crear usuario con contraseña floja → checklist en rojo y no deja enviar
- [x] Crear usuario con un email ya existente → "Ya existe un usuario registrado
      con ese email"
- [x] **El usuario recién creado puede loguearse**
- [x] El usuario recién creado **no tiene fila en `profiles`** y no aparece en la
      búsqueda de amigos de la app Suma
- [x] Eliminar un usuario → desaparece de la lista **y ya no puede loguearse**

### Marca

> **Cómo se reparten los permisos de marca:** sobre `news` y `benefits` las
> policies filtran sólo por marca (`brand_id = get_my_brand_id()`), no por rol de
> marca. O sea que **`admin` y `member` pueden hacer exactamente lo mismo con el
> contenido**: crear, editar mientras esté pendiente y eliminar. La única
> diferencia entre los dos roles es la **gestión de usuarios** en `/marca`. Está
> hecho a propósito; si te lo preguntan en la defensa, esa es la respuesta.
>
> Usuarios de prueba: `test.admin@suma-demo.com` (admin) y
> `test.member@suma-demo.com` (member), los dos de la misma marca.

#### Admin de marca — contenido

- [x] Crear novedad sin imagen → "La imagen es obligatoria"
- [x] **Editar** novedad y borrarle la imagen → "La imagen es obligatoria"
- [x] Subir una imagen de más de 2MB → error de tamaño
- [x] Subir un PDF o un GIF → error de formato
- [x] Fecha de publicación futura → el input no lo permite
- [x] Crear beneficio con "Válido hasta" = hoy → el input no lo permite
- [x] Editar una novedad **pendiente** → funciona
- [x] Editar una **aprobada** → el botón Editar no aparece; entrar por URL a mano
      redirige a la lista
- [x] Los tabs Todas/Pendientes/Aprobadas/Rechazadas muestran los contadores bien
- [x] En Rechazadas se ve la columna "Motivo de rechazo"
- [x] Eliminar una novedad → sale el modal de confirmación, y **la imagen
      desaparece del bucket**

#### Admin de marca — usuarios

- [x] Ves el botón "+ Nuevo usuario" y los selectores de rol de cada fila
- [x] Crear un usuario nuevo de tu marca → **puede loguearse** y ve el panel de
      tu marca
- [x] Cambiar el rol de otro usuario a Miembro → el cambio persiste al refrescar
- [x] No podés cambiar tu propio rol ni eliminarte (aparece el chip "Vos")
- [x] Eliminar a otro usuario de tu marca → desaparece de la lista **y ya no
      puede loguearse** (verificado en la base: se borró la fila de `brand_users`
      **y** el usuario de `auth.users`)
- [x] Solo ves usuarios de tu marca, no de otras

#### Member — contenido

Mismo circuito que el admin de marca, para confirmar que el rol no le recorta
nada del contenido:

- [x] Crear una novedad y un beneficio → quedan en Pendiente
- [x] Editar tu novedad **pendiente** → funciona
- [x] Editar una **aprobada** → el botón Editar no aparece; entrar por URL a mano
      redirige a la lista
- [x] Eliminar una novedad propia → sale el modal y la imagen desaparece del
      bucket
- [x] Las validaciones de imagen y de fechas se comportan igual que con el admin

#### Member — usuarios

- [x] Ves la lista de usuarios de tu marca, pero **sin** el botón "+ Nuevo
      usuario" y **sin** los selectores de rol
- [x] No aparece el botón de eliminar en ninguna fila
- [x] Entrar a `/marca/nuevo-usuario` escribiendo la URL → **te rebota a
      `/marca`**
- [x] Solo ves usuarios de tu marca, no de otras

### Visual y responsive

- [x] Sidebar en mobile: abre, cierra con la X, cierra con el overlay, cierra al
      navegar
- [x] Todas las tablas scrollean horizontal en mobile sin romper la página
- [x] Los modales no se cortan con contenido largo (probá una novedad con mucho
      texto)
- [x] Se cargan las fuentes Montserrat Alternates y Quicksand
- [x] El favicon y el título de la pestaña cambian bien en cada página
- [x] Estados vacíos: creá un filtro sin resultados y mirá el `EmptyState`
- [x] Zoom al 200% → no se rompe nada

### Antes de entregar

- [x] `npm run build` sin errores
- [x] `.env` **no** está en el repo (verificado: nunca se commiteó)
- [x] Commitear los cambios de `.gitignore` y el borrado de `.claude/skills`
- [x] Resolver el punto 1.1 (policy de `profiles`)
- [x] Corregir la tabla de roles del README

---

## 4. Lo que ya estaba bien

Por si te lo preguntan en la defensa:

- Build de producción limpio, sin warnings propios.
- Cero secretos en el historial de git. `.env` ignorado desde el primer commit.
- Cero comentarios en el código, cero `TODO`, cero `console.log` de debug.
- RLS activo en las 18 tablas del proyecto.
- Un usuario de marca **no puede auto-aprobarse** contenido: las policies
  `news_update` y `benefits_update` heredan el `USING` como `WITH CHECK`, que
  exige `status = 'pending'`.
- `/api/create-user` y `/api/delete-user` validan el rol del lado del servidor,
  no confían en el cliente.
- El `SUPABASE_SERVICE_ROLE_KEY` sólo se usa en `server/api/`, nunca se expone
  al cliente.
- Datos consistentes: 0 beneficios aprobados sin nivel, 0 vencidos activos,
  0 rechazos sin motivo, 0 emails duplicados, 0 usuarios en dos marcas.
