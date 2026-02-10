# Frontend Architecture - Procedures GAMS

## Objetivo
Establecer una arquitectura consistente para que el equipo implemente funcionalidades sin duplicación, sin acoplar UI a HTTP, y con manejo uniforme de errores y autenticación.

## Principios
- Feature-first (vertical slicing): el código vive por dominio/feature, no por tipo técnico.
- UI no habla con HTTP: los componentes/páginas solo consumen facades/stores o servicios de aplicación.
- Contratos y consistencia: errores, auth y rutas se manejan de forma centralizada.
- Reutilización controlada: shared/ui solo componentes presentacionales, sin lógica de negocio.

## Capas y responsabilidades

### UI (pages/components)
- Renderiza y captura eventos del usuario.
- No contiene lógica HTTP ni mapea DTOs.
- No conoce URLs de endpoints.

### Store/Facade (signals)
- Estado de pantalla: loading, error, data.
- Expone métodos de intención: load(), submit(), approve(), reject(), etc.
- Usa servicios de aplicación.

### Application Services (use-cases)
- Orquesta flujos de negocio (sin UI).
- Valida precondiciones (ej. permisos por rol/estado).
- Llama al API layer.

### API Layer (api/)
- Único lugar donde existen endpoints.
- ApiClient wrapper y clients por bounded context.
- Mapea DTO <-> modelos del frontend.

### Core
- Auth: token, guards.
- HTTP: interceptors (auth header + error normalize).
- Errors: modelo AppError.
- Policies: RBAC helpers (y luego ABAC si aplica).
- Config: environments.

## Estructura de carpetas (src/app)
- core/
  - auth/
  - http/
  - errors/
  - policies/
  - config/
- api/
- shared/
  - ui/
  - utils/
  - types/
- features/
  - auth/
  - dashboard/
  - companies/
  - case-files/
  - procedures/
  - alerts/
  - admin/

## Convenciones

### Naming
- Carpetas, archivos y exports en inglés.
- Páginas: `*.page.ts`
- Rutas: `*.routes.ts`
- Store: `*.store.ts`
- Servicios: `*.service.ts`
- API client: `*.api.ts` o `*-client.ts`

### No-go rules (prohibido)
- Llamar HttpClient/ApiClient desde páginas o componentes UI.
- Manejar errores “a mano” en cada feature (todo error debe ser AppError).
- Usar roles con ifs dispersos en UI; usar policies.

## Feature Template (plantilla oficial)

Ejemplo: features/case-files/
- `case-files.page.ts` (UI)
- `case-files.store.ts` (state + signals)
- `case-files.service.ts` (use-cases)
- `case-files.api.ts` (endpoints)

Flujo:
UI -> Store -> Service -> API -> Service -> Store -> UI

## Manejo de errores
- Toda respuesta fallida se normaliza a AppError en el interceptor.
- UI muestra solo `AppError.message`.
- `details` se usa solo para debugging.

## Auth
- JWT en Authorization Bearer (via interceptor).
- Rutas protegidas via AuthGuard.
- Login queda desacoplado hasta tener contrato BE.

## Integración con Backend (expectativas mínimas)
- Swagger/OpenAPI ideal para cliente tipado.
- Endpoints mínimos: login, me, expedientes, trámites, documentos, historial, transiciones.
- Respuestas de error con un shape consistente (message/code/details).

## Checklist para PR
- Sigue el feature template.
- No hay HTTP en UI.
- Maneja errores como AppError.
- No rompe build (`npm run build`).
