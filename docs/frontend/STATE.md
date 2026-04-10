# State Management

## Estado global: `ConfigCacheService`

**Único** servicio con estado compartido entre componentes. Vive en `src/app/features/configuration/services/config-cache.service.ts`, registrado como `providedIn: 'root'`.

### Qué cachea

| Signal público (readonly) | Tipo | Fuente (endpoint) |
|---|---|---|
| `procedureTypes` | `Signal<ProcedureType[]>` | `GET /config/procedure-types` |
| `deadlineConfigs` | `Signal<DeadlineConfig[]>` | `GET /config/deadlines` |
| `nonWorkingDays` | `Signal<NonWorkingDay[]>` | `GET /config/non-working-days` |
| `isLoading` | `Signal<boolean>` | interno |
| `isLoaded` | `Signal<boolean>` | interno |

### Signals privados vs públicos

El servicio expone las Signals como **readonly** para prevenir escritura externa:

```typescript
// Escritura (privado)
private readonly _procedureTypes = signal<ProcedureType[]>([]);

// Lectura (público)
readonly procedureTypes = this._procedureTypes.asReadonly();
```

Los componentes solo pueden leer via los Signals públicos — no pueden llamar `.set()` ni `.update()` sobre ellos.

### `procedureTypesMap` — computed para lookups O(1)

```typescript
readonly procedureTypesMap = computed(() => {
  const map = new Map<string, ProcedureType>();
  this.procedureTypes().forEach(pt => map.set(pt.id, pt));
  return map;
});
```

Se recalcula automáticamente cada vez que `procedureTypes` cambia. Permite buscar un tipo de trámite por id en O(1) sin iterar el array. Actualmente **no se consume fuera del feature de configuration** — está disponible para cuando otros features lo necesiten.

### `loadInitialConfig()` — carga única al iniciar sesión

Llamado en `AdminShellComponent.ngOnInit()`. Lógica:

```
si _isLoaded() o _isLoading()  →  retorna inmediatamente (idempotente)
si no  →  _isLoading.set(true)
          forkJoin([procedureTypes, deadlineConfigs, nonWorkingDays])
          cada endpoint falla silenciosamente (catchError → of([]))
          finalize: _isLoading.set(false)
          next: set los tres signals + _isLoaded.set(true)
```

Los tres endpoints se lanzan en paralelo. Si uno falla, los otros continúan y el Signal correspondiente queda como array vacío — no bloquea la app.

### `refreshNonWorkingDays()` / `refreshDeadlineConfigs()` — refetch parcial

Llamados por los componentes de configuración **después de una mutación exitosa**:

| Acción | Componente | Refresh que llama |
|---|---|---|
| Actualizar días de plazo | `DeadlinesConfigComponent` | `refreshDeadlineConfigs()` |
| Crear feriados (bulk) | `NonWorkingDaysConfigComponent` | `refreshNonWorkingDays()` |
| Eliminar feriado | `NonWorkingDaysConfigComponent` | `refreshNonWorkingDays()` |

Estos métodos hacen un nuevo GET al endpoint correspondiente y reemplazan el Signal. No tienen guardia de idempotencia — pueden llamarse múltiples veces.

### Cómo consumen los componentes los Signals

Los componentes asignan el Signal directamente a una propiedad local y lo usan como función en el template:

```typescript
// DeadlinesConfigComponent
readonly deadlineConfigs = this.configCache.deadlineConfigs;

// Template
@for (config of deadlineConfigs(); track config.id) { ... }
```

`ProcedureTypesConfigComponent` es solo lectura — no tiene formulario ni mutaciones, solo itera `procedureTypes()`.

> **Nota:** `DeadlinesConfigComponent` usa `[(ngModel)]` directamente sobre `config.deadlineDays` (objeto dentro del array del Signal). Esto muta el objeto en memoria del cache en tiempo real al tipear, antes de guardar. Si el request HTTP falla, el componente revierte manualmente: `config.deadlineDays = originalValue`. El Signal readonly protege contra reasignar el array, pero no contra mutar los objetos dentro de él.

---

## Estado local (componentes de listado)

Cada tabla y lista maneja su propio estado de carga y paginación como propiedades de clase:

```typescript
// Patrón repetido en ProcedureTableComponent, CaseFileTableComponent,
// CompanyTableComponent, UsersTableComponent
isLoading = false;
currentPage = 1;
totalPages = 1;
totalItems = 0;
data: T[] = [];
```

El ciclo de vida es:
1. `ngOnInit` → llama al servicio
2. `ngOnChanges` → resetea `currentPage = 1`, vuelve a llamar al servicio
3. El servicio retorna `PaginatedResponse<T>` → se asignan `data`, `totalPages`, `totalItems`

No hay comunicación entre tablas de distintas features — cada una es independiente.

---

## Sin store global

No hay NgRx, ni `@ngrx/signals`, ni ningún store centralizado. Decisión intencional para mantener la complejidad baja en un sistema de backoffice con patrones CRUD directos.

**Modelo de datos en la app:**

```
API (backend)
  ↓  HTTP (ApiClient + interceptores)
Servicio de feature (ProcedureService, CompanyService, etc.)
  ↓  Observable<T>
Componente
  ↓  propiedades locales (isLoading, data[], currentPage…)
Template
```

`ConfigCacheService` es la única excepción a este modelo lineal — actúa como cache de configuración global estable durante la sesión.

### Cuándo añadir estado compartido

Si en el futuro un dato necesita sincronizarse entre múltiples features sin recargar de la API, el patrón a seguir es el mismo que `ConfigCacheService`:
- Signals privados para escritura, readonly para lectura
- Guard de idempotencia en la carga inicial
- Métodos de refresh granulares tras mutaciones

No añadir NgRx para casos aislados — el overhead no se justifica para este dominio.
