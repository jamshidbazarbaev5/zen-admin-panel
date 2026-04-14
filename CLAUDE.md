# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check + Vite production build
- `npm run lint` — ESLint (flat config)
- `npm run preview` — Preview production build

No test runner is configured.

## Architecture

Zen Admin Panel — a React admin dashboard for Zen Coffee business management. Built with React 19, TypeScript, Vite, and Tailwind CSS 4.

### API Layer

- Axios instance at `src/core/api/api.ts` with base URL `https://zen-coffee.uz/api/admin/`
- Bearer token auth via localStorage (`access_token`, `refresh_token`)
- Automatic 401 → token refresh → retry; on failure redirects to `/login`
- All API errors are parsed and displayed via Zustand `errorStore` modal
- Data fetching with TanStack React Query (refetchOnWindowFocus: false, retry: 1)

### Resource CRUD Pattern

Most features follow the same pattern — understand this and you understand the app:

1. **API hooks** — `createResourceApiHooks<T>(baseUrl, queryKey)` in `src/core/helpers/createResourceApi.ts` generates `useGetResources`, `useGetResource`, `useCreateResource`, `useUpdateResource`, `useDeleteResource`. Each resource file (e.g., `src/core/api/category.ts`) calls this factory.

2. **Table display** — `ResourceTable<T>` in `src/core/helpers/ResourceTable.tsx` renders a paginated table with edit/delete actions, expandable rows, and optional custom actions.

3. **Form handling** — `ResourceForm<T>` in `src/core/helpers/ResourceForm.tsx` builds forms from a field descriptor array. Uses react-hook-form + Zod validation. Supports field types: text, number, textarea, select, native-select, searchable-select, file, multiple-files, checkbox, datetime-local, password. Handles FormData for file uploads automatically.

4. **Page composition** — Each page in `src/core/pages/` combines search/filters + ResourceTable + Dialog with ResourceForm for create/edit.

### Routing & Auth

- React Router v7 in `src/App.tsx`
- `ProtectedRoute` — requires authentication, wraps content in Layout
- `AdminRoute` — requires `is_superuser` or `role === 'admin'`, otherwise redirects to `/orders`
- `/` redirects admins to `/dashboard`, non-admins to `/orders`
- `/orders` is the only route accessible to non-admin authenticated users

### Context Providers

Wrapped in `App.tsx` in this order: QueryClientProvider → ThemeProvider → LanguageProvider → AuthProvider → BrowserRouter.

- **AuthContext** — login/logout, currentUser state, token management
- **ThemeContext** — light/dark mode toggle (CSS variables)
- **LanguageContext** — i18next language switching (en, ru, uz, kaa)

### UI Stack

- shadcn/ui components (Radix primitives) in `src/components/ui/`
- Tailwind CSS with CSS variables for theming (light/dark)
- Icons: lucide-react (primary), plus @radix-ui/react-icons, @heroicons/react, react-icons
- Toasts via sonner
- Path alias: `@/` → `src/`

### Notable Features

- **Real-time orders** — OrdersPage uses WebSocket with auto-reconnect, sound notifications, and new-order counter badge
- **i18n** — 4 languages (en, ru, uz, kaa) via i18next with `useTranslation()` hook
- **Drag-and-drop** — @dnd-kit for sortable lists (e.g., category ordering)
- **Charts** — recharts on DashboardPage

### Adding a New Resource

1. Create API hooks: new file in `src/core/api/` calling `createResourceApiHooks<YourType>('/your-endpoint/', 'yourQueryKey')`
2. Create page in `src/core/pages/` using ResourceTable + ResourceForm pattern
3. Add route in `App.tsx` wrapped in `AdminRoute` or `ProtectedRoute`
4. Add nav item in `src/core/layout/layout.tsx` sidebar menu
