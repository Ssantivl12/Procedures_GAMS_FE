# Procedures GAMS Frontend

Frontend del sistema Procedures GAMS. Angular + TailwindCSS. Desarrollo bajo la rama `dev`.

## Requisitos
- Node.js (recomendado: 22.x)
- npm

## Instalación
```bash
npm install
Ejecución en desarrollo
npm run start
App: http://localhost:4200

Build
npm run build
Estructura
src/app/core: auth, interceptors, errors, policies, config

src/app/api: acceso a APIs (único lugar con endpoints)

src/app/shared: UI reutilizable y utilidades sin negocio

src/app/features: funcionalidades por dominio (feature-first)

docs/: documentación de arquitectura y branching

Branching
Rama de trabajo: dev

PRs apuntan a dev

Releases a main

Ver: docs/branching.md

Convención de commits
feat: nueva funcionalidad

fix: bug

chore: tareas internas

refactor: refactor sin cambio funcional

docs: documentación

test: pruebas

style: formato

Backend
Auth: JWT (Bearer)

Base URL API: configurada en src/environments/environment.ts (placeholder)

Reglas rápidas
No HTTP en páginas/components.

No strings de endpoints fuera de src/app/api.

Errores siempre como AppError (interceptor).