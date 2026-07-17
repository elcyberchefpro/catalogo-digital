# Catálogo Digital con Pedido por WhatsApp 🛍️

Tu catálogo digital listo para usar. Los clientes navegan, filtran, guardan favoritos y consultan por WhatsApp. El dueño gestiona productos desde un panel admin con drag & drop.

---

## Stack

- **Frontend:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Backend/DB:** Supabase (Postgres + Auth + Storage)
- **Imágenes:** Supabase Storage
- **Botón WhatsApp:** wa.me (gratis, sin API)
- **Hosting:** Vercel (gratis)

---

## Setup local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Completá los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
NEXT_PUBLIC_WHATSAPP_NUMBER=5491112345678
```

### 3. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** → ejecutar el contenido de `supabase-schema.sql`
3. En **Storage** → crear bucket `productos-fotos` → marcar como **público**
4. En **Authentication** → crear usuario admin para el panel

### 4. Correr en local

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel (gratis)

1. Subir código a GitHub
2. Ir a [vercel.com/new](https://vercel.com/new) → conectar repo
3. Agregar las 3 variables de entorno
4. Deploy! URL tipo `tu-catalogo.vercel.app`

---

## Estructura del proyecto

```
catalogo-digital/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Catálogo público
│   │   ├── admin/
│   │   │   ├── page.tsx           # Login
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx # Dashboard admin
│   │   │   ├── productos/[id]/    # Form producto (crear/editar)
│   │   │   ├── categorias/        # Gestionar categorías
│   │   │   └── config/            # Config WhatsApp
│   ├── components/
│   │   ├── AuthProvider.tsx        # Provider de auth Supabase
│   │   └── ImageUploader.tsx      # Drag & drop para fotos
│   └── lib/
│       ├── supabase.ts            # Cliente Supabase
│       └── types.ts               # Tipos TypeScript
├── supabase-schema.sql            # Schema de la DB (ejecutar en Supabase)
└── README.md
```

---

## Agregar un producto nuevo (panel admin)

1. Ir a `/admin` → loguearse
2. Click en **Nuevo Producto**
3. Completar nombre, precio, categoría, talles, colores
4. **Arrastrar fotos** a la caja de drag & drop
5. Guardar

---

## Cambiar estado de un producto

Desde el dashboard admin, cada producto tiene un badge de estado (disponible / nuevo / agotado). Click en **editar** para cambiarlo.

---

## Restaurar backup de la DB

Desde Supabase → SQL Editor, ejecutar el dump de la base de datos. El schema está en `supabase-schema.sql`.

---

¡Listo! Si necesitás ayuda con el deploy, decime. 🐱
