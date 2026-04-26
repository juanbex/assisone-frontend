# assisone-frontend

SPA de AssisOne — interfaz operativa para coordinadores y administradores. Construida con React 18, Vite y TypeScript.

## Stack

- **Framework:** React 18 + React Router 6
- **Build:** Vite 5
- **Estado cliente:** Zustand
- **Estado servidor:** TanStack Query 5
- **HTTP:** axios (instancia compartida)
- **Estilos:** Tailwind CSS + estilos inline con paleta de marca

## Requisitos

- Node.js 20+
- Backend `assisone-backend` corriendo (default `http://localhost:3000`)

## Setup

```bash
npm install
cp .env.example .env       # ajustar VITE_API_URL si el backend no está en :3000
npm run dev                # arranca Vite en :5173
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite con HMR |
| `npm run build` | `tsc && vite build` — typecheck + build de producción a `dist/` |
| `npm run preview` | Sirve el build de producción localmente |

## Variables de entorno

- `VITE_API_URL` — URL base del backend. En desarrollo, Vite también proxea `/api` a este destino (ver `vite.config.ts`).

## Arquitectura

### Estructura

```
src/
├── App.tsx                      # tabla de rutas + PrivateRoute / AppShell
├── main.tsx                     # entrypoint React
├── modules/
│   ├── auth/LoginPage.tsx
│   └── services/ServicesPage.tsx
└── shared/
    ├── api/client.ts            # axios singleton con interceptores
    ├── stores/auth.store.ts     # Zustand auth store
    ├── components/              # AppShell, Sidebar, Logo
    └── theme.css                # variables de tema
```

Cada feature vive en `src/modules/<nombre>/<Nombre>Page.tsx`. Lo transversal va en `src/shared/`.

### Routing y autenticación

- `App.tsx` es la tabla de rutas única.
- `PrivateRoute` lee el token desde `useAuthStore`. Si no hay token, redirige a `/login`.
- Las rutas privadas se envuelven en `AppShell` (sidebar + main).
- El token se persiste en `localStorage` para sobrevivir al reload.

Estado actual: `/login` y `/services` están implementadas; `/providers`, `/clients`, `/appointments`, `/reports`, `/admin/*` son placeholders ("próximamente").

### Cliente HTTP

`src/shared/api/client.ts` exporta una **única instancia de axios** que:

- Inyecta `Authorization: Bearer <token>` desde `localStorage` en cada request.
- En `401`, limpia el token y hace `window.location.href = '/login'`.

Usar siempre este `api` exportado — no crear nuevas instancias de axios.

### Estado

- **Auth:** `useAuthStore` (Zustand) con espejo en `localStorage`.
- **Datos del servidor:** TanStack Query — preferirlo a `useEffect` + axios manual para nuevas pantallas.

### Estilos

Mezcla de Tailwind (configurado en `tailwind.config.js`) y estilos inline. Paleta de marca:

- Navy primario: `#0A1F44`
- Azul accent: `#00A9E0`
- Fondo app: `#F5F5F5`

Toda la copy es en **español**.

## Deploy

Configurado para Railway con Railpack auto-detectando Vite (`railway.toml` es un placeholder). `.railwayignore` excluye artefactos locales. El build de producción (`npm run build`) genera `dist/` listo para servir como estático.
