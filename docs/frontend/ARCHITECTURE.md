# Architecture

## Shell y layout

`AdminShellComponent` es el wrapper de todas las rutas autenticadas. El router lo monta en la ruta raíz `''` protegida por `authGuard`, y todas las rutas hijas renderizan dentro de su `<router-outlet>`.

**Template** (`admin-shell.html`):

```
flex h-screen
├── <app-dashboard-sidebar>   ← DashboardSidebarComponent
│     @Input  isOpen, isCollapsed
│     @Output close, toggleCollapse
└── <main>
      └── <router-outlet />
```

El estado del sidebar se guarda en dos propiedades locales del componente: `isSidebarOpen` y `isSidebarCollapsed`. Un click en el área `<main>` cierra el sidebar (`isSidebarOpen = false`).

**`ngOnInit`** llama a `ConfigCacheService.loadInitialConfig()`, que pre-carga los datos de configuración global (tipos de trámite, plazos, días inhábiles) en paralelo via `forkJoin`. La llamada es idempotente: si ya cargó o está cargando, no hace nada. Los datos se exponen como Signals de solo lectura consumibles por cualquier feature.

---

## HTTP layer

### ApiClient (`src/app/api/api-client.ts`)

Wrapper de `HttpClient` que prepone `environment.apiBaseUrl` a todos los paths. Métodos disponibles:

| Método | Firma | Notas |
|---|---|---|
| `get<T>` | `(path, params?)` | `params` se convierte a `HttpParams` |
| `post<T>` | `(path, body)` | JSON |
| `put<T>` | `(path, body)` | JSON |
| `patch<T>` | `(path, body)` | JSON |
| `delete<T>` | `(path)` | — |
| `postFormData<T>` | `(path, FormData)` | Sin `Content-Type` manual; el browser lo pone |
| `getBlob` | `(path, params?)` | `responseType: 'blob'` |

`params` acepta `Record<string, string | number | boolean>`; los valores se convierten a string antes de pasarlos a `HttpParams`.

---

### authInterceptor (`src/app/core/http/auth.interceptor.ts`)

1. Lee el token de `AuthService.getAccessToken()`.
2. Si hay token **y** la URL no es un endpoint de auth (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/change-password`), clona el request añadiendo `Authorization: Bearer <token>`.
3. En caso de **401** (no en endpoints de auth), ejecuta `handle401Error`:
   - Si no hay un refresh en curso: marca `isRefreshing = true`, llama a `auth.refreshToken()`, reintenta el request original con el nuevo token. Al completar, emite el nuevo token en `refreshTokenSubject`.
   - Si ya hay un refresh en curso: otros requests en vuelo esperan con `refreshTokenSubject.pipe(filter(t => t !== null), take(1), switchMap(...))`.
   - Si el refresh falla: llama a `auth.logout()` y navega a `/login`.

`isRefreshing` y `refreshTokenSubject` son variables **a nivel de módulo** (no de instancia), por lo que la cola de requests en vuelo es compartida entre todas las instancias del interceptor.

> **Nota:** El interceptor atrapa errores que pueden ser `HttpErrorResponse` o `AppError` (si `errorInterceptor` ya los convirtió en la cadena). Por eso evalúa el status con: `error instanceof HttpErrorResponse ? error.status : (error.status || null)`.

---

### errorInterceptor (`src/app/core/http/error.interceptor.ts`)

Convierte cualquier error HTTP a `AppError` antes de propagarlo:

| Condición | `kind` | Mensaje |
|---|---|---|
| `status === 0` | `NETWORK` | "No se pudo conectar con el servidor." |
| `status === 401` o `403` | `AUTH` | "No autorizado. Inicia sesión nuevamente." |
| Otro `HttpErrorResponse` | `HTTP` | `err.error.message \| err.error.error \| err.error.detail` o mensaje genérico |
| No es `HttpErrorResponse` | `UNKNOWN` | "Ocurrió un error inesperado." |

El tipo `AppError` (`src/app/core/errors/app-error.ts`):

```typescript
interface AppError {
  kind: 'NETWORK' | 'HTTP' | 'AUTH' | 'VALIDATION' | 'UNKNOWN';
  message: string;   // user-facing
  status?: number;
  code?: string;     // código backend opcional
  details?: unknown; // para debug
  timestamp: string;
}
```

`isAppError(value)` es un type guard exportado para identificar errores normalizados en los `catchError` de los servicios.

---

### Orden de interceptores

Registrados en `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

En Angular, el primer interceptor de la lista envuelve a todos los demás. El flujo efectivo es:

```
Request  →  authInterceptor → errorInterceptor → HTTP
Error    ←  errorInterceptor (convierte a AppError) → authInterceptor (ve AppError)
```

El `errorInterceptor` normaliza el error **antes** de que `authInterceptor` lo vea en su `catchError`. Por eso `authInterceptor` debe manejar ambos tipos (`HttpErrorResponse` | `AppError`).

---

## Patrón de datos paginados

Todos los servicios de listado devuelven `Observable<PaginatedResponse<T>>`, definido en `src/app/shared/models/paginated-response.ts`:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
```

Los servicios que lo usan actualmente: `CompanyService`, `ProcedureService`, `CaseFileService`. Los parámetros de paginación (`page`, `limit`) se pasan como query params a través del método `ApiClient.get(path, params)`.
