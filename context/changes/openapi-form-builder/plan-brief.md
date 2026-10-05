# OpenAPI Form Builder — Plan Brief

> Pełny plan: `context/changes/openapi-form-builder/plan.md`

## Co i dlaczego

Budujemy PoC platformy, która pozwala na import specyfikacji OpenAPI/Swagger, zapisuje parametry API w bazie, a następnie pozwala użytkownikowi budować formularze metodą drag&drop z predefiniowanych kontrolek i wyświetlać je z przyciskiem ZAPISZ/WYŚLIJ generującym testowy JSON. Cel: szybka weryfikacja koncepcji bez konieczności pisania kodu do integracji z API.

## Punkt wyjścia

Katalog projektu jest pusty (greenfield). Zero istniejącego kodu, bazy, konfiguracji. Wszystko budowane od zera w Dockerze.

## Pożądany stan końcowy

Użytkownik uruchamia `docker-compose up`, wchodzi na stronę importu, wgrywa plik OpenAPI lub podaje URL. System parsuje specyfikację, zapisuje parametry w bazie. Następnie użytkownik buduje formularz w builderze drag&drop, zapisuje go i wyświetla. Przycisk ZAPISZ/WYŚLIJ generuje JSON opakowany w strukturę API (endpoint, method, params).

## Decyzje kluczowe

| Decyzja | Wybór | Dlaczego | Źródło |
|---|---|---|---|
| Stack | Next.js 14 (App Router) | Najmniej boilerplate'a dla full-stack PoC | Plan |
| Baza danych | SQLite + Prisma | Zero konfiguracji, migracje out-of-the-box | Plan |
| Docker | Multi-stage build | Lekki obraz, non-root user, bezpieczeństwo | Plan |
| Źródło OpenAPI | Upload pliku + URL | Elastyczność — testy lokalne i żywe API | Plan |
| Drag & drop | dnd-kit | Aktywnie utrzymywana, React 18+, dostępna | Plan |
| Model danych | Znormalizowane tabele | Filtrowanie parametrów w builderze | Plan |
| Zakres parsowania | Parametry + body (top-level) | Pełny obraz API bez złożoności zagnieżdżeń | Plan |
| Zapis formularza | JSON schema w bazie | Standard de facto, łatwy do rozszerzenia | Plan |
| Format JSON | Opakowany w strukturę API | Samodokumentujący się, widać cel wysyłki | Plan |
| Walidacja | Client-side (zod) | Natychmiastowy feedback, zero requestów | Plan |
| Przepływ UI | Osobne strony | Prosty routing, jasny podział | Plan |
| Testy | Tylko ręczne | PoC — brak wymagań jakościowych | Plan |
| Wersje OpenAPI | 3.x + Swagger 2.0 | Pokrywa ~95% istniejących specyfikacji | Plan |
| Styl | Tailwind CSS | Najszybszy rozwój UI | Plan |
| Auth | Brak | PoC lokalny, zero dodatkowej pracy | Plan |

## Zakres

**W scope:**
- Docker: Dockerfile, docker-compose, .dockerignore
- 2 przykładowe pliki OpenAPI (3.x i Swagger 2.0)
- Parser OpenAPI (upload + URL)
- Baza SQLite z znormalizowanymi tabelami
- Builder drag&drop z 4 kontrolkami
- Renderer formularza z walidacją zod
- Generowanie JSON (endpoint, method, params)

**Poza scope:**
- Autoryzacja użytkowników
- Testy automatyczne
- Zagnieżdżone właściwości body
- Wysyłka na prawdziwe API
- Responsywność mobile
- CI/CD pipeline

## Architektura / Podejście

```
┌─────────────────────────────────────────────────────┐
│                    Docker Container                  │
│  ┌───────────────────────────────────────────────┐  │
│  │           Next.js 14 (App Router)              │  │
│  │  ┌─────────────┐  ┌────────────────────────┐  │  │
│  │  │  Frontend   │  │     API Routes         │  │  │
│  │  │  (React)    │  │  /api/import           │  │  │
│  │  │             │  │  /api/import-url       │  │  │
│  │  │  /import    │  │  /api/specs            │  │  │
│  │  │  /builder   │  │  /api/forms            │  │  │
│  │  │  /form/[id] │  │  /api/forms/[id]       │  │  │
│  │  └─────────────┘  └────────────────────────┘  │  │
│  │                      │                        │  │
│  │                      ▼                        │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │         Prisma ORM + SQLite             │  │  │
│  │  │  ApiSpec → ApiEndpoint → ApiParameter   │  │  │
│  │  │  FormDefinition                         │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Fazy w skrócie

| Faza | Co dostarcza | Kluczowe ryzyko |
|---|---|---|
| 0. Docker & Sample Data | Dockerfile, docker-compose, 2 przykładowe pliki OpenAPI | Build fail, problemy z volume |
| 1. Scaffold & Foundation | Next.js, Prisma, Tailwind, routing | Konfiguracja, zależności |
| 2. OpenAPI Parser | Upload + URL, parser v2/v3, zapis do bazy | Różnice składni v2/v3 |
| 3. Form Builder | dnd-kit, paleta kontrolek, konfiguracja, zapis | Kompleksowość DnD |
| 4. Form Renderer & Eksport JSON | Renderer, walidacja zod, generowanie JSON | Walidacja edge cases |

**Prerequisites:** Docker zainstalowany lokalnie
**Szacowany wysiłek:** ~3-4 sesje po 2-3 godziny

## Otwarte ryzyka i założenia

- SQLite w volume Docker — czy zachowa dane po restarcie? (tak, przy poprawnym volume)
- dnd-kit z React 18 StrictMode — potencjalne problemy (do weryfikacji w Fazi 3)
- Parser OpenAPI — specyfikacje mogą być niepełne/błędne (do obsługi błędów)
- Brak testów automatycznych — regresje przy zmianach parsera/walidacji

## Kryteria sukcesu (podsumowanie)

1. `docker-compose up` → aplikacja działa na localhost:3000
2. Import OpenAPI (upload + URL) → parametry w bazie
3. Builder drag&drop → formularz zapisany
4. Renderer → JSON z endpoint, method, params
