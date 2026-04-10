# Auth

## Roles y permisos

Los permisos por rol están definidos en `src/app/core/policies/policy.ts` como un mapa estático `ROLE_PERMISSIONS`:

| Permiso | SUPERADMIN | ENCARGADO | SECRETARIA | INSPECTOR |
|---|:---:|:---:|:---:|:---:|
| `CASE_FILE_READ` | ✓ | ✓ | ✓ | ✓ |
| `CASE_FILE_WRITE` | ✓ | ✓ | ✓ | — |
| `DOCUMENT_UPLOAD` | ✓ | ✓ | ✓ | ✓ |
| `PROCEDURE_TRANSITION` | ✓ | — | — | ✓ |
| `ADMIN_ACCESS` | ✓ | — | — | — |

La función exportada `can(role, permission): boolean` consulta ese mapa. Sin embargo, **ningún componente la usa actualmente** — los componentes llaman directamente a `AuthService.hasRole()`.

---

## AuthService (`src/app/core/auth/auth.service.ts`)

### Hidratación de sesión

Al instanciarse (constructor), el servicio llama a `hydrateSession()`:

1. Lee el access token de `localStorage` (`gams_access_token`).
2. Si existe, lo decodifica con `decodeToken()` y emite el payload en `currentUserSubject`.
3. Si el token tiene formato inválido, llama a `clearSession()`.

El servicio **no llama al backend** para validar el token al inicio — sólo decodifica el payload localmente.

### `decodeToken(token)`

Decodifica el payload del JWT de forma manual, sin librería externa:

1. Extrae la parte central (`token.split('.')[1]`).
2. Convierte de base64url a base64 estándar.
3. Decodifica con `atob()` + `decodeURIComponent` (maneja UTF-8).
4. Parsea el JSON resultante y lo devuelve como `UserPayload`.

Lanza `Error('Invalid token format')` si algún paso falla.

### Tokens en localStorage

| Clave | Valor |
|---|---|
| `gams_access_token` | JWT de acceso |
| `gams_refresh_token` | Token de refresco |

**`setTokens(accessToken, refreshToken)`** — guarda ambos en localStorage y actualiza `currentUserSubject` decodificando el nuevo access token.

**`clearSession()`** — elimina ambas claves de localStorage y emite `null` en `currentUserSubject`.

### `isAuthenticated()`

Retorna `!!localStorage.getItem('gams_access_token')`. No verifica expiración ni firma del token.

### `hasRole(allowedRoles)`

```typescript
hasRole(allowedRoles: UserRole | UserRole[]): boolean
```

Lee `currentUserSubject.value.roles` (el array de roles del JWT en memoria) y comprueba si alguno está en `allowedRoles`. Retorna `false` si no hay usuario activo.

### `currentUserId`

Getter que retorna el campo `sub` del JWT payload (`currentUserSubject.value?.sub`), o `null` si no hay sesión.

---

## authGuard (`src/app/core/auth/auth.guard.ts`)

Función `CanActivateFn` usada en dos contextos:

**1. Solo sesión** (sin `data.roles`):
```
no token → navigate('/login') → return false
token    → return true
```

**2. Sesión + rol** (con `data: { roles: [UserRole.SUPERADMIN] }`):
```
no token → navigate('/login') → return false
token, sin rol requerido → navigate('/dashboard') → return false
token, con rol → return true
```

Rutas que usan restricción de rol en `app.routes.ts`:

| Ruta | Roles permitidos |
|---|---|
| `/users` | `SUPERADMIN` |
| `/configuration` | `SUPERADMIN` |
| `/reports` | `SUPERADMIN`, `ENCARGADO` |

---

## Patrón en componentes

Los componentes inyectan `AuthService` directamente y exponen getters que llaman a `hasRole()`:

```typescript
// ProcedureActionsComponent — patrón real en el código
private readonly auth = inject(AuthService);

get isSuperadminOrEncargado() { return this.auth.hasRole([UserRole.SUPERADMIN, UserRole.ENCARGADO]); }
get isInspector()             { return this.auth.hasRole(UserRole.INSPECTOR); }
get isAssignedInspector()     { return this.auth.currentUserId === this.assignedInspectorUserId; }
```

Los getters se usan en el template para mostrar u ocultar elementos de UI (`*ngIf`, directivas estructurales). El sidebar (`DashboardSidebarComponent`) filtra sus links de navegación con el mismo patrón.

Los guards **no se usan** para lógica de visibilidad dentro del componente — sólo protegen la activación de rutas.

---

## ⚠️ Diseño intencional

**`hasRole()` lee del JWT decodificado en memoria, no hace ninguna llamada al backend.**

Consecuencias asumidas por diseño:
- Si un admin cambia el rol de un usuario, el cambio no se refleja hasta que el usuario cierre sesión y vuelva a iniciarla (el JWT antiguo sigue siendo válido hasta su expiración).
- `isAuthenticated()` no valida la expiración del token — un token expirado en localStorage devuelve `true`. La expiración real la detecta el backend (401) y el `authInterceptor` la maneja via refresh.
- `decodeToken` no verifica la firma del JWT — la validación criptográfica ocurre exclusivamente en el backend.
