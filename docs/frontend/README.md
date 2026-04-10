# Frontend Docs — IRAPS/GAMS

> Este directorio documenta el frontend Angular de IRAPS/GAMS. El backend está documentado en `docs/backend/`.

## Índice

| Archivo | Contenido | Cuándo consultarlo |
|---|---|---|
| [OVERVIEW.md](OVERVIEW.md) | Stack, estructura de carpetas, entornos, proxy, design tokens | Primera vez en el proyecto |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Shell/layout, HTTP layer (ApiClient, interceptores), paginación | Al entender cómo fluye una request o cómo está montado el layout |
| [AUTH.md](AUTH.md) | Roles, AuthService, guards, patrón `hasRole()` en componentes | Al trabajar con permisos o sesión |
| [STATE.md](STATE.md) | ConfigCacheService (Signals), estado local de tablas, sin store global | Al añadir estado o entender de dónde vienen los datos de configuración |
| [UI-SYSTEM.md](UI-SYSTEM.md) | Componentes shared/ui, design tokens CSS, Tailwind v4, convenciones de modales/tablas/toasts | Al crear o modificar UI |
| [INTENTIONAL-DESIGNS.md](INTENTIONAL-DESIGNS.md) | Decisiones de diseño que NO deben revertirse (fechas UTC, refresh de tokens, cancelación de requests…) | Antes de refactorizar cualquier patrón que parezca raro |
| [features/procedures.md](features/procedures.md) | Modelos, estados del flujo, componentes, reglas de negocio, acciones por rol | Al tocar el módulo de trámites |

## Quick start — dev nuevo

1. **[OVERVIEW.md](OVERVIEW.md)** — entiende qué es la app y cómo está organizada.
2. **[ARCHITECTURE.md](ARCHITECTURE.md)** — cómo funciona el HTTP layer y el shell.
3. **[AUTH.md](AUTH.md)** — cómo funcionan los roles antes de tocar cualquier componente protegido.
4. **[INTENTIONAL-DESIGNS.md](INTENTIONAL-DESIGNS.md)** — léelo completo antes de tu primer PR.
5. El feature que vayas a tocar en `features/`.
