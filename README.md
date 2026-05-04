# PanelAdminSuma

Panel de administración web para marcas que publican contenido en la plataforma **SUMA**.

## Stack

- [Nuxt 4](https://nuxt.com) + Vue 3
- [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage)
- [Tailwind CSS](https://tailwindcss.com)
- [Pinia](https://pinia.vuejs.org)

## Roles

| Rol | Acceso |
|-----|--------|
| `superadmin` | Aprueba/rechaza contenido, gestiona marcas y usuarios |
| `brand_admin` | Gestiona contenido y usuarios de su marca |
| `brand_member` | Gestiona contenido de su marca (sin gestión de usuarios) |

## Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> `SUPABASE_SERVICE_ROLE_KEY` se usa server-side para crear y eliminar usuarios de Supabase Auth. Nunca se expone al cliente.

## Setup

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:3000`.

## Build de producción

```bash
npm run build
npm run preview
```
