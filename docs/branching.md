# Branching Strategy - Procedures GAMS Frontend
Este documento define la estrategia oficial de ramas para el proyecto Procedures GAMS - Frontend, basada en un flujo tipo Git Flow.
## Objetivo
Garantizar un desarrollo ordenado, estable y colaborativo, reduciendo conflictos y evitando errores al liberar versiones.
## Estructura de ramas
El proyecto utiliza las siguientes ramas:

main -> Producción (estable)
dev -> Integración de desarrollo (rama principal de trabajo)
feature/* -> Nuevas funcionalidades
fix/* -> Correcciones no urgentes (sobre dev)
style/* -> Diseño o mejora del CSS sobre feature funcionales
hotfix/* -> Correcciones urgentes en producción (sobre main)


## Rama main
Propósito:
- Contiene versiones estables y listas para producción.
- Representa el baseline funcional liberado.
Reglas:
- No se hacen commits directos.
- Solo recibe merges desde release/* o hotfix/* (y excepcionalmente desde dev si se acuerda).
- Debe compilar y ejecutarse sin errores.

## Rama dev
Propósito:
- Rama principal de integración de desarrollo.
- Integra funcionalidades antes de pasar a main.
Reglas:
- Todas las feature/* y fix/* se integran aquí mediante PR.
- Debe mantenerse en un estado ejecutable (no romper build).
- No se trabaja directamente en main.

## Ramas feature/*
Propósito:
- Desarrollo de funcionalidades específicas.
Convención de nombres:
feature/login
feature/dashboard
feature/case-file-detail

Flujo:
1. git checkout dev
2. git pull
3. git checkout -b feature/nombre-feature
Al finalizar:
Abrir PR hacia dev
Luego de aprobar y mergear, borrar la rama feature/*
## Ramas fix/*
Propósito:
Correcciones no urgentes detectadas durante el desarrollo (sin impacto inmediato en producción).
Convención de nombres:
fix/table-pagination
fix/null-guard-dashboard
Flujo:
1. git checkout dev
2. git pull
3. git checkout -b fix/nombre-fix
Al finalizar:
Abrir PR hacia dev
Luego de aprobar y mergear, borrar la rama fix/*

## Ramas hotfix/*
Propósito:
Correcciones urgentes en producción.
Convención:
hotfix/auth-token-expired
hotfix/critical-crash-startup
Flujo:
1. git checkout main
2. git pull
3. git checkout -b hotfix/nombre-hotfix
Al finalizar:
Abrir PR hacia main
Luego mergear main de vuelta a dev (para mantener ambas alineadas)
Borrar la rama hotfix/*

## Convención de commits
Se recomienda el uso de commits semánticos:
feat: nueva funcionalidad
fix: corrección de bug
chore: configuración o tareas internas
refactor: refactorización sin cambio funcional
docs: cambios en documentación
test: cambios en pruebas
style: cambios de formato (sin impacto funcional)

Ejemplos:
feat: add login page layout
fix: handle null user session
chore: update tooling config

## Flujo de trabajo general

Crear rama desde dev (feature/* o fix/*).

Desarrollar con commits claros.

Abrir PR hacia dev.

Revisar y aprobar.

Merge a dev y borrar la rama.

Cuando se planee una liberación, crear release/* desde dev y preparar versión.

Merge a main y luego sincronizar main hacia dev.