# UI System

## Componentes `shared/ui`

Todos son componentes standalone. Ninguno tiene dependencias de estado global — reciben datos exclusivamente por `@Input`.

| Selector | @Input principales | Cuándo usarlo |
|---|---|---|
| `app-status-badge` | `status: ProcedureStatus` *(req)* | Mostrar el estado de un trámite en tablas, tarjetas y headers |
| `app-type-badge` | `type: ProcedureTypeCode` *(req)* | Mostrar el tipo de trámite (RAI, MAI-PMA, IAA, CIERRE) |
| `app-category-badge` | `category: ObservationCategory` *(req)* | Mostrar la categoría de una observación |
| `app-priority-badge` | `priority: ObservationPriority` *(req)* | Mostrar la prioridad de una observación (ALTA/MEDIA/BAJA) |
| `app-rai-semaphore` | `raiStatus: RaiStatus\|null`, `expirationDate: string\|null` | Indicador semáforo del estado del RAI en empresas/expedientes |
| `app-deadline-indicator` | `deadlineDate: string\|null`, `daysRemaining: number\|null`, `isOverdue: boolean` | Indicador de plazo en filas de tabla; usa `parsePureDate` internamente |
| `app-empty-state` | `title`, `message`, `iconPath` (SVG path `d`) | Estado vacío cuando una lista no tiene resultados |
| `app-confirm-dialog` | `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant: 'danger'\|'warning'`, `isLoading` | Diálogo de confirmación modal reutilizable |

### Paleta de colores por badge (Tailwind estático)

Los badges usan clases Tailwind de color literal — **no** tokens del design system — para poder variar por valor de enum sin CSS dinámico.

| Badge | Valores → color |
|---|---|
| `StatusBadge` | RECIBIDO → blue · EN_REVISION → amber · OBSERVADO → orange · SUBSANACION → purple · CERRADO → emerald · ABANDONADO → red |
| `TypeBadge` | RAI → emerald · MAI_PMA → violet · IAA → sky · CIERRE → rose |
| `CategoryBadge` | DOCUMENTAL → blue · TECNICA → teal · ADMINISTRATIVA → slate · LEGAL → indigo · OTRA → gray |
| `PriorityBadge` | ALTA → red · MEDIA → yellow · BAJA → green |
| `RaiSemaphore` | VIGENTE → emerald dot · POR_VENCER → yellow dot · VENCIDO → red dot · SIN_RAI → gray dot |

`RaiSemaphore` acepta `raiStatus` directo del backend **o** calcula el estado a partir de `expirationDate` (< 0 días → VENCIDO, ≤ 90 días → POR_VENCER, > 90 → VIGENTE).

---

## Utilidades (`shared/utils`)

### `toast.utils.ts`

```typescript
showToast(icon: 'success' | 'error' | 'warning' | 'info', title: string): void
```

Wrapper de SweetAlert2 preconfigurado como mixin:

| Config | Valor |
|---|---|
| Posición | `top-end` |
| Timer | 3000 ms con barra de progreso |
| Mouseenter | pausa el timer (`Swal.stopTimer`) |
| Mouseleave | reanuda el timer (`Swal.resumeTimer`) |
| Clases CSS | `rounded-xl border border-border bg-card text-foreground shadow-lg` (tokens del design system) |

Usar `showToast` en lugar de `Swal.fire()` directo en toda la app.

### `date.utils.ts`

| Función | Firma | Uso |
|---|---|---|
| `parsePureDate(dateStr)` | `string → Date` | Convierte string ISO de la API a fecha local sin desplazamiento UTC. **Usar siempre para fechas de solo fecha del backend.** |
| `formatPureDate(dateStr)` | `string\|null\|undefined → string` | Formatea para mostrar en UI (`es-BO`, dd/mm/yyyy). Retorna `'—'` si el valor es nulo. |

Ver [INTENTIONAL-DESIGNS.md](../INTENTIONAL-DESIGNS.md) para el detalle del bug UTC-4 que motivó estas funciones.

---

## CSS variables (design tokens)

Definidas en `src/styles.css` como variables HSL en `:root`. Tailwind v4 las consume via `@theme inline` y las expone como clases `bg-*`, `text-*`, `border-*`.

### Paleta principal

| Variable | HSL | Color aprox. | Uso |
|---|---|---|---|
| `--primary` | `158 64% 32%` | Verde GAMS `#1d8653` | Botones primarios, links, anillo de focus, spinner |
| `--primary-foreground` | `0 0% 100%` | Blanco | Texto sobre fondo `--primary` |
| `--accent` | `158 64% 95%` | Verde muy claro | Hover de items en sidebar, fondos de acento |
| `--accent-foreground` | `158 64% 20%` | Verde oscuro | Texto sobre `--accent` |
| `--destructive` | `0 84% 60%` | Rojo | Botones de eliminar, badges de error |
| `--destructive-foreground` | `210 40% 98%` | Blanco azulado | Texto sobre `--destructive` |

### Neutrales

| Variable | HSL | Uso |
|---|---|---|
| `--background` | `150 20% 98%` | Fondo general de la app |
| `--foreground` | `160 50% 10%` | Texto principal |
| `--card` | `0 0% 100%` | Fondo de tarjetas y modales |
| `--card-foreground` | `160 50% 10%` | Texto dentro de cards |
| `--muted` | `150 10% 94%` | Fondos de elementos desactivados / secundarios |
| `--muted-foreground` | `160 10% 45%` | Texto secundario, placeholders |
| `--border` | `150 20% 90%` | Bordes de inputs, cards, tablas |
| `--input` | `150 20% 90%` | Fondo de inputs |
| `--ring` | `158 64% 32%` | Anillo de focus (mismo que `--primary`) |

### Sidebar

| Variable | HSL | Uso |
|---|---|---|
| `--sidebar` | `165 60% 8%` | Fondo del sidebar (verde muy oscuro) |
| `--sidebar-foreground` | `150 20% 96%` | Texto en sidebar |
| `--sidebar-border` | `165 60% 12%` | Bordes internos del sidebar |
| `--sidebar-primary` | `158 64% 40%` | Items activos del sidebar |
| `--sidebar-accent` | `165 60% 15%` | Hover de items del sidebar |
| `--sidebar-accent-foreground` | `150 20% 98%` | Texto en hover del sidebar |

### Otras variables

| Variable | Valor | Uso |
|---|---|---|
| `--radius` | `0.75rem` | Radio base de bordes redondeados |
| `--radius-sm` | `calc(--radius - 4px)` | Bordes pequeños |
| `--radius-xl` | `calc(--radius + 4px)` | Bordes grandes (modales) |

---

## Tailwind v4

La app usa **Tailwind CSS v4**. Diferencias clave respecto a v3:

- El entry point es `@import 'tailwindcss'` en `styles.css` — no hay `@tailwind base/components/utilities`.
- La configuración de tema se hace en `@theme inline { ... }` dentro del CSS — **no hay `tailwind.config.js`**.
- Los tokens CSS (`--color-primary`, `--color-sidebar`, etc.) se definen bajo `@theme inline` y Tailwind los convierte automáticamente en clases utilitarias (`bg-primary`, `text-sidebar-foreground`, etc.).
- Para añadir un nuevo token: definir la variable en `:root` y mapearla en `@theme inline`. No editar ningún archivo `.js` de configuración.

---

## Convenciones de UI

### Modales y diálogos

```
fixed inset-0 z-50
├── overlay: bg-black/40 backdrop-blur-sm
│   └── click → cierra el modal (llama a onCancel() / emite closeDialog)
└── panel: bg-card rounded-2xl shadow-xl border border-border
    └── click → stopPropagation() (evita que el click en el panel cierre el modal)
```

Animación de entrada: clase `animate-fade-in` (definida en `@theme inline` — `fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)`).

### Paginación

Implementada inline en cada componente de tabla (no hay componente separado). Patrón estándar:

- Estado local: `currentPage = 1`, `totalPages`, `totalItems`.
- `pageNumbers` getter: ventana deslizante de **máximo 5 páginas**, centrada en `currentPage` con `Math.max`/`Math.min`.
- Al cambiar cualquier `@Input` de filtro (`ngOnChanges`): resetea `currentPage = 1` y recarga.
- Footer de paginación: oculto si `totalItems === 0` o `isLoading`. Botones "Anterior" / "Siguiente" deshabilitados en los extremos.

### Loading states

Spinner doble anillo, centrado, con texto contextual:

```html
<div class="flex items-center justify-center py-16">
  <div class="relative w-12 h-12">
    <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>          <!-- anillo fondo -->
    <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>  <!-- anillo giratorio -->
  </div>
  <span class="ml-4 text-sm font-medium text-muted-foreground">Cargando...</span>
</div>
```

### Estado vacío

Siempre usar `<app-empty-state>` en lugar de texto plano. Pasar `iconPath` como el string del atributo `d` de un path SVG de Heroicons (outline, 24px).

### Botones

| Variante | Clases base |
|---|---|
| Primario | `bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm` |
| Secundario | `border border-border text-foreground rounded-xl hover:bg-muted` |
| Peligro | `border border-red-300 text-red-700 rounded-xl hover:bg-red-50` |
| Confirmar (danger modal) | `bg-red-600 text-white rounded-lg hover:bg-red-700` |

Todos los botones interactivos llevan `cursor-pointer` explícito (por comportamiento del navegador con `button` deshabilitado).
