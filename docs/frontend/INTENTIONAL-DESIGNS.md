# Diseños Intencionales

Este archivo documenta decisiones de arquitectura y patrones de código que pueden parecer incorrectos, redundantes o mejorables pero que existen por razones específicas. **No revertir sin entender el motivo.**

---

### ConfigCacheService: carga única en AdminShell

**Qué hace:**
`ConfigCacheService.loadInitialConfig()` se llama **una sola vez** en `AdminShellComponent.ngOnInit()`. Carga en paralelo (via `forkJoin`) los tipos de trámite, configuraciones de plazo y días inhábiles, y los almacena en Signals de solo lectura accesibles globalmente.

**Por qué así:**
Estos datos son estables durante la sesión y los necesitan múltiples features (`procedures`, `case-files`, `configuration`). Cargarlos en el shell garantiza que estén disponibles antes de que cualquier ruta hija renderice. La función es idempotente — si `_isLoaded()` o `_isLoading()` ya son `true`, retorna inmediatamente sin hacer ningún request.

**NO cambiar a:**
- Llamar a `loadInitialConfig()` en componentes hijos — genera requests duplicados.
- Reemplazar los Signals por un BehaviorSubject sin mantener la guardia de idempotencia.
- Mover la carga a un `APP_INITIALIZER` sin considerar que requiere autenticación previa.

---

### `parsePureDate()` en date.utils.ts

**Qué hace:**
Extrae año, mes y día del string ISO (`"2026-04-16T00:00:00.000Z"`) y construye una fecha local con `new Date(year, month - 1, day)`, ignorando completamente la parte de hora y zona horaria.

**Por qué así:**
El backend devuelve fechas de "solo fecha" como `"YYYY-MM-DDT00:00:00.000Z"` (UTC). En zonas UTC-4 (Bolivia), `new Date("2026-04-16T00:00:00.000Z")` resulta en `2026-04-15 20:00:00` hora local — el browser desplaza la fecha **un día atrás**. Este bug afectaba directamente las fechas de vencimiento de procedimientos mostradas en la UI. `parsePureDate` evita el problema al nunca dejar que el motor JS interprete la zona horaria.

**NO cambiar a:**
```typescript
// ❌ Desplaza la fecha en UTC-4
new Date(dateStr)
new Date(dateStr.replace('Z', ''))

// ✅ Correcto
parsePureDate(dateStr)
```
Usar `parsePureDate` para **todo** campo de fecha pura proveniente de la API. Usar `formatPureDate` para mostrar fechas en UI.

---

### `authInterceptor`: `isRefreshing` como variable de módulo

**Qué hace:**
`isRefreshing` (boolean) y `refreshTokenSubject` (BehaviorSubject) están declarados **a nivel de módulo**, fuera de la función del interceptor. Cuando llega un 401, el primer request activa el refresh; los demás requests que llegan mientras el refresh está en curso esperan en `refreshTokenSubject.pipe(filter(t => t !== null), take(1))` y se reintentan con el nuevo token.

**Por qué así:**
Los interceptores funcionales (`HttpInterceptorFn`) en Angular no son instancias de clase — no tienen estado de instancia. La única forma de compartir estado entre múltiples invocaciones concurrentes del interceptor es con variables de módulo. Si el flag estuviera dentro de la función, cada request tendría su propio `isRefreshing = false` y todos intentarían refrescar simultáneamente, generando múltiples llamadas a `/auth/refresh` y condiciones de carrera.

**NO cambiar a:**
- Mover `isRefreshing` a un servicio inyectado sin replicar exactamente la lógica de cola con `BehaviorSubject`.
- Usar `signal()` para `isRefreshing` — las Signals no son observables y no permiten el patrón `filter + take(1)` que serializa la cola.
- Eliminar el `BehaviorSubject` y reintentar con un `timer` o polling.

---

### `ObservationsCardComponent`: cancelación de requests con `cancelLoad$`

**Qué hace:**
El componente declara `private readonly cancelLoad$ = new Subject<void>()`. Cada vez que `loadObservations()` se invoca (desde `ngOnInit` o `ngOnChanges`), **primero emite en `cancelLoad$`**, lo que cancela la suscripción del request anterior via `takeUntil(cancelLoad$)`, y luego inicia el nuevo request.

```typescript
loadObservations(): void {
  this.cancelLoad$.next();   // cancela el request anterior si estaba en vuelo
  this.isLoading = true;
  this.observationService.getObservations(this.procedureId)
    .pipe(takeUntil(this.cancelLoad$))
    .subscribe({ ... });
}
```

**Por qué así:**
`ngOnChanges` se dispara cada vez que el `@Input() procedure` cambia. Si el usuario navega rápidamente entre procedimientos, pueden quedar múltiples requests en vuelo. Sin cancelación, el último en llegar podría ser una respuesta de un procedimiento anterior, sobreescribiendo el estado con datos incorrectos (race condition). El Subject actúa como interruptor: emitir cancela el anterior, y el propio stream del nuevo request escucha el mismo Subject para poder ser cancelado a su vez.

**NO cambiar a:**
- `switchMap` en un stream de inputs — requeriría refactorizar el componente a un patrón reactivo completo y romper la lógica de `ngOnChanges`.
- Eliminar `takeUntil(cancelLoad$)` y confiar en que los requests llegan en orden — los HTTP requests no garantizan orden de respuesta.
- Usar `takeUntilDestroyed` en lugar de `cancelLoad$` — `takeUntilDestroyed` sólo cancela al destruir el componente, no entre cargas sucesivas.

---

### `EmptyStateComponent`: `iconPath` como string de path SVG

**Qué hace:**
`EmptyStateComponent` recibe el atributo `d` de un `<path>` SVG directamente como `@Input() iconPath: string`. El template renderiza el SVG con `[attr.d]="iconPath"`.

**Por qué así:**
No hay dependencia de ninguna librería de iconos. Los iconos son strings de Heroicons que se pasan directamente desde el componente padre. Esto mantiene el bundle mínimo — no se importa ni `@heroicons/angular`, ni FontAwesome, ni ningún sprite. El SVG wrapper (tamaño, color, forma del círculo de fondo) está encapsulado en el componente; sólo el path cambia por uso.

**NO cambiar a:**
- Recibir un nombre de icono como `iconName: string` y hacer un map interno — añade mantenimiento y no gana nada.
- Importar una librería de iconos — añade peso al bundle para un componente de estado vacío.
- Usar `<img>` o `<mat-icon>` — rompe la consistencia de color con `stroke="currentColor"`.
