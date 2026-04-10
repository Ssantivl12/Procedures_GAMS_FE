# CLAUDE.md — IRAPS/GAMS Frontend

Guía de reglas para asistentes AI trabajando en este repositorio Angular.
Documentación completa en `docs/frontend/`.

## Frontend (Angular)

- **Standalone components siempre.** Sin `NgModule`. Importar dependencias en el array `imports` del decorador.
- **Inyección con `inject()`**, no constructor DI.
- **Fechas de API:** SIEMPRE usar `parsePureDate()` / `formatPureDate()` de `src/app/shared/utils/date.utils.ts`. Nunca `new Date(dateStr)` directo para fechas de solo fecha — desplaza un día en UTC-4. Ver `docs/frontend/INTENTIONAL-DESIGNS.md`.
- **Errores HTTP:** tras `errorInterceptor` ya son `AppError`. Leer `err.message`, no `err.error.message`.
- **Servicios HTTP:** extender `ApiClient` (`src/app/api/api-client.ts`), no inyectar `HttpClient` directamente.
- **Respuestas paginadas:** usar `PaginatedResponse<T>` de `src/app/shared/models`. Los listados devuelven `Observable<PaginatedResponse<T>>`.

## Roles y permisos

- Llamar `auth.hasRole()` **una vez** en `ngOnInit` y guardar en variable booleana local (`isSuperadmin = this.auth.hasRole(...)`).
- No llamar `hasRole()` directamente en el template ni dentro de loops — se evalúa en cada ciclo de detección de cambios.
- `isAuthenticated()` solo verifica presencia del token, no expiración. La expiración la gestiona el `authInterceptor` con refresh automático.

## CSS / UI

- **Tailwind v4** con `@import 'tailwindcss'` y `@theme inline`. No hay `tailwind.config.js`.
- Usar tokens del design system: `bg-primary`, `text-muted-foreground`, `border-border`, etc. **No hardcodear colores hex en templates.**
- Para colores por valor de enum (badges): usar clases Tailwind literales (`bg-blue-100 text-blue-700`), no tokens semánticos.
- Modales: siempre `fixed inset-0 z-50 backdrop-blur-sm` con click en overlay que emite `closeForm` / `closeDialog`.
- Toasts: usar `showToast(icon, title)` de `src/app/shared/utils/toast.utils.ts`. No usar `Swal.fire()` directo salvo confirmaciones de destructive actions.
- Estado vacío: usar `<app-empty-state>` con `iconPath` como string del atributo `d` de un path SVG Heroicons.

## Estado

- `ConfigCacheService` es el único estado global (Signals). Se carga una vez en `AdminShellComponent.ngOnInit()`. No llamar `loadInitialConfig()` en componentes hijos.
- Estado de tablas/listas (isLoading, currentPage, data[]) vive en el propio componente. No hay store global.
- Tras mutaciones en configuration: llamar `configCache.refreshDeadlineConfigs()` o `configCache.refreshNonWorkingDays()` según corresponda.

## Patrones a no revertir

Ver `docs/frontend/INTENTIONAL-DESIGNS.md` para el detalle de cada uno:

- `parsePureDate()` — bug UTC-4 con `new Date(isoString)`
- `isRefreshing` como variable de módulo en `authInterceptor` — serializa refreshes concurrentes
- `cancelLoad$` Subject en `ObservationsCardComponent` — evita race conditions en `ngOnChanges`
- `EmptyStateComponent.iconPath` como string SVG — sin dependencia de librería de iconos
- `ConfigCacheService.loadInitialConfig()` — idempotente, no duplicar llamadas
