# IRAPS Frontend — Overview

Sistema de gestión de trámites municipales para **GAMS Sacaba** (Gobierno Autónomo Municipal de Sacaba). Permite gestionar empresas, expedientes, procedimientos administrativos, usuarios y reportes bajo un flujo de trabajo controlado por roles.

---

## Stack

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Angular (standalone, no NgModules) | ^21.1 |
| Estilos | Tailwind CSS v4 | ^4.1 |
| Alertas/Confirmaciones | SweetAlert2 | ^11 |
| Mapas | Leaflet + leaflet.utm | ^1.9 |
| Lenguaje | TypeScript | ~5.9 |
| Build | @angular/build (Vite-based) | ^21.1 |

La app usa **componentes standalone** exclusivamente — no hay `NgModule` en el código de la aplicación.

---

## Estructura de `src/app/`

```
src/app/
├── app.ts              # Componente raíz (bootstrap)
├── app.routes.ts       # Definición global de rutas
├── app.config.ts       # ApplicationConfig (providers)
├── core/               # Servicios singleton y lógica transversal
│   ├── auth/           # AuthService, authGuard
│   ├── http/           # Interceptores: auth token, errores globales
│   ├── errors/         # Manejo centralizado de errores
│   ├── policies/       # Lógica de permisos por rol
│   └── api/            # Clientes HTTP base
├── features/           # Módulos de dominio (lazy-loaded)
│   ├── home/           # Landing pública
│   ├── auth/           # Página de login
│   ├── dashboard/      # Vista principal tras login
│   ├── companies/      # Gestión de empresas
│   ├── status-companies/ # Estado de empresas
│   ├── inbox/          # Bandeja de entrada de trámites
│   ├── case-files/     # Expedientes (carpetas de caso)
│   ├── procedures/     # Procedimientos administrativos
│   ├── users/          # Gestión de usuarios (SUPERADMIN)
│   ├── configuration/  # Configuración del sistema (SUPERADMIN)
│   ├── reports/        # Reportes (SUPERADMIN + ENCARGADO)
│   └── admin/          # Área administrativa con sub-rutas propias
└── shared/             # Código reutilizable entre features
    ├── layout/         # AdminShellComponent (shell con sidebar)
    ├── models/         # Interfaces/tipos compartidos
    ├── ui/             # Componentes UI genéricos (botones, tablas, etc.)
    └── utils/          # Funciones utilitarias puras
```

---

## Variables de entorno

| Variable | Desarrollo | Producción |
|---|---|---|
| `production` | `false` | `true` |
| `apiBaseUrl` | `'/api'` | `''` (se define en el despliegue) |

Archivo de referencia: `src/environments/environment.ts` / `environment.prod.ts`.

---

## Proxy de desarrollo

Configurado en `src/proxy.conf.cjs`:

| Patrón | Target | Comportamiento |
|---|---|---|
| `/api/*` | `http://localhost:3000` | Reescribe quitando `/api`, sin SSL verify |

En desarrollo, todas las llamadas HTTP a `/api/...` se redirigen al backend local en el puerto 3000.

---

## Design System — Paleta GAMS Green

Variables CSS definidas en `src/styles.css` como tokens HSL consumidos por Tailwind v4 via `@theme inline`.

| Token | Descripción | Valor aproximado |
|---|---|---|
| `--primary` | Verde GAMS principal | `hsl(158 64% 32%)` ≈ `#1d8653` |
| `--sidebar` | Verde oscuro sidebar | `hsl(165 60% 8%)` |
| `--sidebar-primary` | Acento sidebar | `hsl(158 64% 40%)` |
| `--accent` | Verde claro (hover/fondo) | `hsl(158 64% 95%)` |
| `--destructive` | Rojo para acciones peligrosas | `hsl(0 84% 60%)` |
| `--radius` | Radio base de bordes | `0.75rem` |

Tipografía: **Inter** / **Plus Jakarta Sans** (sistema fallback).

Las clases de Tailwind (`bg-primary`, `text-sidebar-foreground`, etc.) mapean directamente a estos tokens — no usar valores hexadecimales hardcodeados.

---

## Configuración de la aplicación

`app.config.ts` registra dos interceptores HTTP globales en orden:

1. `authInterceptor` — adjunta el token JWT a cada request
2. `errorInterceptor` — captura errores HTTP y los maneja globalmente

No hay estado global (NgRx/Signals store) a nivel de `app.config.ts`; el estado vive en servicios de feature.

---

## Roles de usuario

Definidos en `AuthService` como enum `UserRole`:

| Rol | Acceso especial |
|---|---|
| `SUPERADMIN` | Users, Configuration, Reports |
| `ENCARGADO` | Reports |
| *(resto)* | Dashboard, empresas, expedientes, trámites |

Las rutas protegidas usan `authGuard` con `data: { roles: [...] }`.
