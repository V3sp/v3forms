---
change-id: openapi-form-builder
title: "OpenAPI Form Builder PoC"
status: planned
created: 2026-10-05
updated: 2026-10-05
---

# OpenAPI Form Builder PoC

## Cel

Platforma full-stack w Dockerze: import OpenAPI → baza parametrów → drag&drop builder → renderer z eksportem JSON.

## Decyzje kluczowe

- Stack: Next.js 14 (App Router) + TypeScript
- Baza: SQLite + Prisma
- Docker: multi-stage build, docker-compose
- DnD: dnd-kit
- Walidacja: zod (client-side)
- Styl: Tailwind CSS
- Auth: brak
- Testy: tylko ręczne
