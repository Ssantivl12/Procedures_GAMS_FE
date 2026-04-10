# Feature: Procedures (Trámites)

## Propósito

Gestiona el ciclo de vida completo de los trámites ambientales asociados a un expediente (`CaseFile`). Un trámite tiene un tipo (`ProcedureTypeCode`), avanza por estados definidos (`ProcedureStatus`), puede generar observaciones y documentos, y es trazado en un historial de auditoría.

---

## Modelos clave

### `Procedure` (`src/app/shared/models/procedure.model.ts`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | UUID del trámite |
| `caseFileId` | `string` | Expediente al que pertenece |
| `procedureTypeId` | `number` | FK a `ProcedureType` |
| `procedureKind` | `ProcedureKind` | `NUEVO` o `RENOVACION` (null en IAA/CIERRE) |
| `currentStatus` | `ProcedureStatus` | Estado actual en el flujo |
| `cycleCount` | `number` | Número de ciclos completados |
| `receptionDate` | `string` | Fecha de ingreso (ISO date) |
| `reviewStartDate` | `string\|null` | Fecha inicio de revisión |
| `obsPickedDate` | `string\|null` | Fecha de recojo de observaciones |
| `deadlineDate` | `string\|null` | Fecha límite calculada por el backend |
| `daysElapsed` / `daysRemaining` | `number\|null` | Días transcurridos / restantes |
| `isOverdue` | `boolean` | Si superó el plazo |
| `routeSheetNumber` | `string\|null` | Número de hoja de ruta |
| `companyStatus` | `CompanyStatus\|null` | Estado de la empresa al momento del trámite |
| `approvalDate` / `approvalCertificate` | `string\|null` | Datos de aprobación |
| `expirationDate` | `string\|null` | Fecha de vencimiento del certificado |
| `assignedInspectorUserId` | `string\|null` | Inspector asignado |
| `abandonReason` | `string\|null` | Motivo de abandono |
| `cycles` | `ProcedureCycle[]\|undefined` | Ciclos (eager opcional) |
| `observationsSummary` | `{total, pending, resolved}\|undefined` | Resumen (eager opcional) |

### `ProcedureAudit`

| Campo | Tipo | Descripción |
|---|---|---|
| `fromStatus` | `ProcedureStatus\|null` | Estado origen (null en creación) |
| `toStatus` | `ProcedureStatus` | Estado destino |
| `changedBy` | `{id, fullName}` | Usuario que hizo el cambio |
| `changedAt` | `string` | Timestamp ISO |
| `note` | `string\|null` | Nota opcional del cambio |

### `ProcedureCycle`

| Campo | Tipo | Descripción |
|---|---|---|
| `cycleNumber` | `number` | Número de ciclo (1, 2, …) |
| `openedAt` | `string` | Fecha de apertura del ciclo |
| `closedAt` | `string\|null` | Fecha de cierre |
| `reentryDate` | `string\|null` | Fecha de reingreso |
| `reviewDeadline` | `string\|null` | Plazo de revisión del ciclo |
| `isActive` | `boolean` | Si es el ciclo activo |

---

## Estados del flujo (`ProcedureStatus`)

```
                       ┌─────────────┐
               ┌──────▶│  ABANDONADO │◀──────────────────────────────────┐
               │       └─────────────┘                                   │
               │             │ revertir abandono                          │
               │             ▼                                            │ (cualquier estado
  ─────────▶ RECIBIDO ──▶ EN_REVISION ──▶ CERRADO                        │  no terminal)
               │              │
               │              │ (obs pendientes > 0)
               │              ▼
               │   OBSERVADO_PENDIENTE_RECOJO
               │              │ registrar recojo
               │              ▼
               │   SUBSANACION_PENDIENTE_REINGRESO
               │              │ registrar reingreso (nuevo ciclo)
               └──────────────┘ (vuelve a EN_REVISION)
```

| Estado | Descripción |
|---|---|
| `RECIBIDO` | Trámite ingresado, pendiente de asignación/inicio |
| `EN_REVISION` | En revisión por el inspector |
| `OBSERVADO_PENDIENTE_RECOJO` | Inspector finalizó con observaciones; ciudadano debe recoger la notificación |
| `SUBSANACION_PENDIENTE_REINGRESO` | Ciudadano recogió; debe subsanar y reingresar documentación |
| `CERRADO` | Aprobado/cerrado. Estado terminal. |
| `ABANDONADO` | Marcado como abandonado. Terminal lateral, reversible solo por SUPERADMIN/ENCARGADO. |

Los tipos de trámite disponibles son: `RAI`, `MAI_PMA`, `IAA`, `CIERRE`.

---

## Componentes

| Componente | Responsabilidad | Inputs | Outputs |
|---|---|---|---|
| `ProceduresListComponent` | Página de listado; orquesta filtros y tabla | — | — |
| `ProcedureDetailComponent` | Página de detalle; carga el trámite y orquesta todos los sub-componentes | — (lee `:id` de la ruta) | — |
| `ProcedureHeaderComponent` | Título de sección + botón "Nuevo trámite" | — | `addProcedure` |
| `ProcedureFiltersComponent` | Controles de búsqueda, filtro de estado/tipo y tamaño de página | `searchQuery`, `statusFilter`, `typeFilter`, `pageSize` | `search`, `statusChange`, `typeChange`, `pageSizeChange`, `refresh` |
| `ProcedureTableComponent` | Tabla paginada que aplica los filtros recibidos como inputs | `searchQuery`, `statusFilter`, `typeFilter`, `pageSize` | `edit` |
| `ProcedureFormComponent` | Formulario de creación con búsqueda de expediente y validaciones de negocio | `caseFileId`, `companyCategory` | `closeForm`, `procedureSaved` |
| `ProcedureInfoCardComponent` | Tarjeta de datos del trámite (fechas, certificado, inspector, notas) | `procedure` | — |
| `ProcedureStepperComponent` | Indicador visual del estado actual en el flujo de estados | `currentStatus` *(req)*, `procedureTypeCode` | — |
| `ProcedureActionsComponent` | Botones de acción calculados según rol y estado actual | `currentStatus` *(req)*, `procedureTypeCode`, `assignedInspectorUserId`, `pendingObservationsCount` | `actionClick: ActionEvent` |
| `StatusChangeDialogComponent` | Diálogo que recoge datos adicionales para transiciones (fechas, certificado, motivo) | `procedureId` *(req)*, `currentStatus` *(req)*, `procedureTypeCode`, `action` | `closeDialog`, `statusChanged` |
| `AssignInspectorDialogComponent` | Diálogo para seleccionar y asignar inspector | `procedureId` *(req)*, `currentInspectorId` | `closeDialog`, `inspectorAssigned` |
| `ReentryDialogComponent` | Diálogo para registrar reingreso (crea un nuevo ciclo) | `procedureId` *(req)* | `closeDialog`, `reentryCompleted` |
| `ObservationsCardComponent` | Lista de observaciones agrupadas por ciclo con acciones resolve/reopen | `procedure` *(req)*, `currentStatus`, `procedureTypeCode` | — |
| `ObservationFormComponent` | Formulario de creación de observación | — | — |
| `ObservationItemComponent` | Ítem de observación individual con acciones | — | — |
| `DocumentsCardComponent` | Lista de documentos del trámite + trigger para subida | `procedure` *(req)*, `currentStatus` | — |
| `DocumentUploadComponent` | Formulario de subida de archivo con selección de grupo y ciclo | `procedureId` *(req)*, `cycleId` | `closeForm`, `uploaded` |
| `DocumentItemComponent` | Ítem de documento con descarga | — | — |
| `ProcedureAuditTimelineComponent` | Timeline de cambios de estado con usuario y nota | `auditItems: ProcedureAudit[]` | — |

---

## Reglas de negocio en frontend

Validadas en `ProcedureFormComponent.onSubmit()` antes de llamar al servicio:

1. **C4 no puede tener MAI_PMA ni IAA**
   Si `company.category === 'C4'` y el tipo seleccionado es `MAI_PMA` o `IAA` → error, no se envía.

2. **MAI_PMA requiere RAI cerrado**
   Si el tipo es `MAI_PMA` y `caseFile.proceduresSummary.closedProcedureCodes` no incluye `RAI` → error.

3. **IAA requiere RAI y MAI_PMA cerrados**
   Si el tipo es `IAA` y no están ambos códigos en `closedProcedureCodes` → error.

4. **IAA y CIERRE deshabilitan `procedureKind`**
   Al seleccionar un tipo `IAA` o `CIERRE`, el campo `procedureKind` se deshabilita y se pone a `null` via `setupProcedureTypeListener()`. El payload solo incluye `procedureKind` si el control está habilitado (`f['procedureKind'].enabled`).

5. **Búsqueda de expediente filtrada a `status: 'open'`**
   El autocomplete de expediente solo devuelve resultados con `status: 'open'` — no se puede crear un trámite en un expediente cerrado desde este formulario.

La fuente de verdad de `closedProcedureCodes` es `caseFile.proceduresSummary` que viene del backend — el frontend no calcula este valor.

---

## Servicios

### `ProcedureService` — `/procedures`

| Método | Endpoint | Descripción |
|---|---|---|
| `getProcedures(params?)` | `GET /procedures` | Listado paginado con filtros |
| `getProcedureById(id)` | `GET /procedures/:id` | Detalle completo |
| `getProceduresByCaseFile(caseFileId, params?)` | `GET /case-files/:id/procedures` | Trámites de un expediente |
| `createProcedure(data)` | `POST /procedures` | Crear trámite |
| `updateProcedure(id, data)` | `PATCH /procedures/:id` | Actualizar campos editables |
| `changeStatus(id, data)` | `PATCH /procedures/:id/status` | Transición de estado |
| `assignInspector(id, inspectorUserId)` | `PATCH /procedures/:id/assign` | Asignar inspector |
| `deleteProcedure(id)` | `DELETE /procedures/:id` | Eliminar |
| `getAuditHistory(id)` | `GET /procedures/:id/audit` | Historial de cambios |
| `getCycles(procedureId)` | `GET /procedures/:id/cycles` | Ciclos del trámite |
| `createCycle(procedureId, data)` | `POST /procedures/:id/cycles` | Nuevo ciclo (reingreso) |

`getAuditHistory` y `getCycles` normalizan la respuesta: aceptan tanto `T[]` como `{ data: T[] }`.

### `ObservationService` — `/procedures/:id/observations`

| Método | Endpoint |
|---|---|
| `getObservations(procedureId)` | `GET /procedures/:id/observations` |
| `createObservation(procedureId, data)` | `POST /procedures/:id/observations` |
| `updateObservation(procedureId, id, data)` | `PATCH /procedures/:id/observations/:obsId` |
| `resolveObservation(procedureId, id)` | `PATCH /procedures/:id/observations/:obsId/resolve` |
| `reopenObservation(procedureId, id)` | `PATCH /procedures/:id/observations/:obsId/reopen` |
| `deleteObservation(procedureId, id)` | `DELETE /procedures/:id/observations/:obsId` |

### `DocumentService` — `/procedures/:id/documents`

| Método | Endpoint | Notas |
|---|---|---|
| `getDocuments(procedureId)` | `GET /procedures/:id/documents` | Normaliza `T[]` o `{ data: T[] }` |
| `uploadDocument(procedureId, file, docGroup, cycleId?, description?)` | `POST /procedures/:id/documents` | `multipart/form-data` |
| `downloadDocument(procedureId, id)` | `GET /procedures/:id/documents/:docId/download` | Retorna `Blob` |
| `getVersionHistory(procedureId, id)` | `GET /procedures/:id/documents/:docId/versions` | — |
| `deleteDocument(procedureId, id)` | `DELETE /procedures/:id/documents/:docId` | — |

---

## Acciones por rol

Calculadas como getters en `ProcedureActionsComponent`. "Inspector asignado" significa que `auth.currentUserId === assignedInspectorUserId`.

| Acción | Estado requerido | Roles permitidos |
|---|---|---|
| Iniciar revisión (`advance`) | `RECIBIDO` | SUPERADMIN, ENCARGADO, inspector asignado |
| Cerrar / Aprobar (`advance`) | `EN_REVISION` + 0 obs pendientes | SUPERADMIN, ENCARGADO, inspector asignado |
| Agregar observación (`observe`) | `EN_REVISION` + tipo ≠ `CIERRE` | SUPERADMIN, ENCARGADO, INSPECTOR |
| Finalizar revisión con obs (`mark-observed`) | `EN_REVISION` + obs pendientes > 0 | SUPERADMIN, ENCARGADO, inspector asignado |
| Registrar recojo (`pickup`) | `OBSERVADO_PENDIENTE_RECOJO` | SUPERADMIN, ENCARGADO, SECRETARIA |
| Registrar reingreso (`reentry`) | `SUBSANACION_PENDIENTE_REINGRESO` | SUPERADMIN, ENCARGADO, SECRETARIA |
| Asignar inspector (`assign`) | `RECIBIDO` | SUPERADMIN, ENCARGADO |
| Marcar abandonado (`abandon`) | ≠ `CERRADO` y ≠ `ABANDONADO` | SUPERADMIN, ENCARGADO |
| Revertir abandono (`reverse-abandon`) | `ABANDONADO` | SUPERADMIN, ENCARGADO |
