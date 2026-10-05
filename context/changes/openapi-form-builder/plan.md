# OpenAPI Form Builder — Plan Implementacji

## Przegląd

PoC platformy full-stack w Dockerze, która importuje specyfikację OpenAPI (upload pliku lub URL), zapisuje znormalizowane parametry API w bazie SQLite, a następnie pozwala użytkownikowi budować formularze metodą drag&drop z predefiniowanych kontrolek i wyświetlać je z przyciskiem ZAPISZ/WYŚLIJ generującym testowy JSON.

## Analiza stanu obecnego

Katalog projektu `/Users/tomaszwawrzyniak/Projects/v3forms` jest pusty (greenfield) — istnieje tylko folder `.opencode` ze skillami. Brak istniejącego kodu, bazy, konfiguracji. Wszystko budowane od zera.

## Pożądany stan końcowy

Użytkownik uruchamia `docker-compose up` lokalnie lub na serwerze. Wchodzi na stronę importu, wgrywa plik OpenAPI lub podaje URL. System parsuje specyfikację (OpenAPI 3.x i Swagger 2.0), wyciąga parametry (query, path, header) oraz właściwości top-level request body, i zapisuje je w znormalizowanych tabelach. Następnie użytkownik przechodzi do buildera, gdzie z palety kontrolek (StringInput, DateInput, TextInput, ListInput) przeciąga pola na formularz, konfiguruje ich właściwości (required, regexp, max size, itd.) i zapisuje definicję formularza jako JSON schema. Finalnie użytkownik otwiera formularz, wypełnia go (z walidacją client-side przez zod), a przycisk ZAPISZ/WYŚLIJ generuje JSON opakowany w strukturę API (endpoint, method, params).

### Kluczowe odkrycia:

- Greenfield — zero istniejącego kodu, pełna swoboda architektoniczna
- Next.js App Router pozwala na API Routes bez osobnego serwera
- SQLite + Prisma = zero konfiguracji bazy, migracje out-of-the-box
- dnd-kit współpracuje z React 18+ i jest aktywnie utrzymywana
- Docker: multi-stage build, non-root user, healthcheck

## Czego NIE robimy

- Autoryzacji użytkowników (brak logowania, brak sesji)
- Testów automatycznych (tylko testowanie ręczne)
- Obsługi zagnieżdżonych właściwości request body (tylko top-level)
- Wysyłki JSON na prawdziwe API (tylko generowanie podglądu)
- Wielu formularzy na jednym endpointcie (jeden formularz = jeden endpoint)
- Responsywności mobile (desktop-first PoC)
- Wersjonowania specyfikacji OpenAPI (import zastępuje poprzedni)
- CI/CD pipeline (ręczny deploy przez docker-compose)

## Podejście architektoniczne

Full-stack Next.js (App Router) w kontenerze Docker: frontend React + API Routes jako backend. Prisma ORM nad SQLite. Tailwind CSS do stylizacji. dnd-kit do drag&drop. Zod do walidacji client-side. Przepływ: `/import` → `/builder` → `/form/[id]`.

## Faza 0: Docker & Sample Data

### Przegląd

Przygotowanie Dockerfile (multi-stage build), docker-compose.yml (app + volume dla SQLite), oraz 2 przykładowych plików OpenAPI/Swagger do testów.

### Wymagane zmiany:

#### 1. Dockerfile

**Plik**: `Dockerfile`

**Intent**: Multi-stage build: stage 1 (deps) → stage 2 (builder) → stage 3 (runner). Non-root user, tylko niezbędne pliki.

**Contract**:

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

#### 2. docker-compose.yml

**Plik**: `docker-compose.yml`

**Intent**: Definicja usługi `app` z build kontekstem, portem 3000, volume dla SQLite, healthcheck.

**Contract**:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - sqlite-data:/app/prisma
    environment:
      - DATABASE_URL=file:./dev.db
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  sqlite-data:
```

#### 3. .dockerignore

**Plik**: `.dockerignore`

**Intent**: Wykluczenie node_modules, .next, .git z build context.

**Contract**: `node_modules`, `.next`, `.git`, `*.md`, `.opencode`.

#### 4. Przykładowy plik OpenAPI 3.x

**Plik**: `samples/petstore-openapi3.yaml`

**Intent**: Pełna specyfikacja Petstore w OpenAPI 3.x z różnymi typami parametrów (query, path, header, body) do testów.

**Contract**: Zawiera: GET /pets (query params: limit, status), GET /pets/{id} (path param), POST /pets (request body z właściwościami top-level: name, tag, status), PUT /pets/{id} (path + body), DELETE /pets/{id} (path). Typy: string, integer, boolean, array, enum.

#### 5. Przykładowy plik Swagger 2.0

**Plik**: `samples/petstore-swagger2.yaml`

**Intent**: Ta sama specyfikacja co wyżej, ale w formacie Swagger 2.0 do testowania parsera v2.

**Contract**: Ta sama logika co OpenAPI 3.x, ale składnia Swagger 2.0 (basePath, consumes, produces, parameters z `in: body` zamiast requestBody).

### Kryteria sukcesu:

#### Weryfikacja automatyczna:

- `docker-compose build` przechodzi bez błędów
- `docker-compose up` uruchamia serwer na porcie 3000
- `docker-compose exec app npx prisma migrate deploy` działa

#### Weryfikacja ręczna:

- `docker-compose up` → aplikacja dostępna na http://localhost:3000
- Wgrywam `samples/petstore-openapi3.yaml` → parametry zapisują się w bazie
- Wgrywam `samples/petstore-swagger2.yaml` → parametry zapisują się w bazie
- Kontener restartuje się poprawnie (volume SQLite zachowuje dane)

**Implementation Note**: Po zakończeniu tej fazy i przejściu weryfikacji automatycznej, pauza na ręczne potwierdzenie.

---

## Faza 1: Scaffold & Foundation

### Przegląd

Inicjalizacja projektu Next.js, konfiguracja Prisma + SQLite, Tailwind, layoutu i routingu.

### Wymagane zmiany:

#### 1. Inicjalizacja projektu

**Plik**: `package.json`, `next.config.js`, `tsconfig.json`

**Intent**: Utworzenie projektu Next.js 14+ z App Router, TypeScript, ESLint.

**Contract**: `next@14`, `react@18`, `typescript@5`, `tailwindcss@3`, `zod@3`, `@prisma/client@5`, `prisma@5`, `@dnd-kit/core@6`, `@dnd-kit/sortable@8`, `@dnd-kit/utilities@3`, `js-yaml@4`, `swagger-parser@10`.

#### 2. Schemat bazy danych

**Plik**: `prisma/schema.prisma`

**Intent**: Definicja znormalizowanych tabel dla parametrów OpenAPI i definicji formularzy.

**Contract**:

```prisma
model ApiSpec {
  id        String   @id @default(cuid())
  name      String
  source    String   // "upload" | "url"
  version   String   // "2.0" | "3.x"
  createdAt DateTime @default(now())
  endpoints ApiEndpoint[]
}

model ApiEndpoint {
  id       String @id @default(cuid())
  specId   String
  spec     ApiSpec @relation(fields: [specId], references: [id], onDelete: Cascade)
  method   String // GET, POST, PUT, DELETE, itd.
  path     String
  params   ApiParameter[]
}

model ApiParameter {
  id         String  @id @default(cuid())
  endpointId String
  endpoint   ApiEndpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  name       String
  location   String  // "query" | "path" | "header" | "body"
  type       String  // "string" | "number" | "integer" | "boolean" | "array"
  required   Boolean @default(false)
  format     String? // "date", "email", "int32", itd.
  enumValues String? // JSON array stringów
  description String?
  pattern    String?
  minLength  Int?
  maxLength  Int?
  minimum    Float?
  maximum    Float?
  exclusiveMinimum Boolean?
  exclusiveMaximum Boolean?
}

model FormDefinition {
  id        String   @id @default(cuid())
  name      String
  endpointId String
  endpoint  ApiEndpoint @relation(fields: [endpointId], references: [id])
  schema    String   // JSON schema formularza
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 3. Layout i routing

**Plik**: `app/layout.tsx`, `app/page.tsx`, `app/import/page.tsx`, `app/builder/page.tsx`, `app/form/[id]/page.tsx`

**Intent**: Base layout z nawigacją, strona główna z linkami, puste strony dla każdego kroku.

**Contract**: Layout z nawigacją (Import | Builder | Formularze). Każda strona to server component renderujący shell.

#### 4. Konfiguracja Tailwind

**Plik**: `tailwind.config.ts`, `app/globals.css`

**Intent**: Podstawowa konfiguracja Tailwind z customowymi kolorami.

**Contract**: Content paths: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`.

### Kryteria sukcesu:

#### Weryfikacja automatyczna:

- `npx prisma migrate dev` działa bez błędów
- `npm run dev` uruchamia serwer
- `npm run lint` przechodzi
- `npm run typecheck` przechodzi

#### Weryfikacja ręczna:

- Strona główna wyświetla się z linkami do importu i buildera
- Nawigacja działa między stronami

**Implementation Note**: Po zakończeniu tej fazy i przejściu weryfikacji automatycznej, pauza na ręczne potwierdzenie.

---

## Faza 2: OpenAPI Parser

### Przegląd

Endpoint API do importu specyfikacji OpenAPI (upload pliku + URL), parser wspierający OpenAPI 3.x i Swagger 2.0, zapis znormalizowanych parametrów do bazy.

### Wymagane zmiany:

#### 1. Endpoint importu — upload pliku

**Plik**: `app/api/import/route.ts`

**Intent**: Przyjmuje multipart form data z plikiem JSON/YAML, wykrywa wersję specyfikacji, parsuje i zapisuje do bazy.

**Contract**: `POST /api/import` — body: `multipart/form-data` z polem `file`. Odpowiedź: `{ specId, endpointsCount, paramsCount }`.

#### 2. Endpoint importu — URL

**Plik**: `app/api/import-url/route.ts`

**Intent**: Przyjmuje URL, pobiera specyfikację, parsuje i zapisuje do bazy.

**Contract**: `POST /api/import-url` — body: `{ url: string }`. Odpowiedź: `{ specId, endpointsCount, paramsCount }`.

#### 3. Parser OpenAPI

**Plik**: `lib/openapi-parser.ts`

**Intent**: Funkcja `parseOpenAPI(spec: unknown): ParsedSpec` — wykrywa wersję (2.0 vs 3.x), iteruje po ścieżkach i operacjach, wyciąga parametry (query, path, header) oraz właściwości top-level request body.

**Contract**:

```typescript
interface ParsedSpec {
  version: "2.0" | "3.x";
  endpoints: ParsedEndpoint[];
}

interface ParsedEndpoint {
  method: string;
  path: string;
  params: ParsedParameter[];
}

interface ParsedParameter {
  name: string;
  location: "query" | "path" | "header" | "body";
  type: string;
  required: boolean;
  format?: string;
  enumValues?: string[];
  description?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
}
```

#### 4. Serwis zapisu do bazy

**Plik**: `lib/import-service.ts`

**Intent**: Funkcja `saveSpec(parsed: ParsedSpec, source: string, name: string): Promise<string>` — tworzy ApiSpec, ApiEndpoint, ApiParameter w jednej transakcji.

**Contract**: Zwraca `specId`. Używa `prisma.$transaction`.

#### 5. Strona importu

**Plik**: `app/import/page.tsx`, `components/import-form.tsx`

**Intent**: UI z dwoma zakładkami: "Wgraj plik" i "Podaj URL". Po pomyślnym imporcie przekierowanie do `/builder?specId=...`.

**Contract**: Komponent `ImportForm` — client component z dwoma trybami. Po sukcesie `router.push('/builder?specId=' + specId)`.

#### 6. Lista endpointów

**Plik**: `app/api/specs/[id]/route.ts`, `app/api/specs/route.ts`

**Intent**: API do listowania zaimportowanych specyfikacji i endpointów.

**Contract**: `GET /api/specs` — lista specyfikacji. `GET /api/specs/[id]` — endpointy z parametrami.

### Kryteria sukcesu:

#### Weryfikacja automatyczna:

- `npm run typecheck` przechodzi
- `npm run lint` przechodzi

#### Weryfikacja ręczna:

- Wgrywam `samples/petstore-openapi3.yaml` → parametry zapisują się w bazie
- Wgrywam `samples/petstore-swagger2.yaml` → parametry zapisują się w bazie
- Podaję URL do specyfikacji → parametry zapisują się w bazie
- Parametry query, path, header i body (top-level) są widoczne w liście endpointów

**Implementation Note**: Po zakończeniu tej fazy i przejściu weryfikacji automatycznej, pauza na ręczne potwierdzenie.

---

## Faza 3: Form Builder

### Przegląd

Drag&drop builder formularzy z paletą 4 kontrolek, konfiguracją właściwości pól i zapisem definicji jako JSON schema.

### Wymagane zmiany:

#### 1. Typy kontrolek i konfiguracji

**Plik**: `lib/controls.ts`

**Intent**: Definicja typów dla 4 kontrolek i ich właściwości.

**Contract**:

```typescript
type ControlType = "StringInput" | "DateInput" | "TextInput" | "ListInput";

interface BaseFieldConfig {
  control: ControlType;
  label: string;
  required: boolean;
  paramName: string;
}

interface StringInputConfig extends BaseFieldConfig {
  control: "StringInput";
  stringOnly?: boolean;
  numberOnly?: "Natural" | "Decimal" | "Float" | null;
  regexp?: "email" | "IBAN" | "NRB" | "PESEL" | "custom";
  customPattern?: string;
}

interface DateInputConfig extends BaseFieldConfig {
  control: "DateInput";
  dateOnly?: boolean;
  noPastDate?: boolean;
}

interface TextInputConfig extends BaseFieldConfig {
  control: "TextInput";
  maxTextSize?: number;
}

interface ListInputConfig extends BaseFieldConfig {
  control: "ListInput";
  isBool?: boolean;
  multipleChoice?: boolean;
}

type FieldConfig = StringInputConfig | DateInputConfig | TextInputConfig | ListInputConfig;
```

#### 2. Paleta kontrolek

**Plik**: `components/control-palette.tsx`

**Intent**: Panel z 4 przygotowanymi kontrolkami do przeciągnięcia (dnd-kit `useDraggable`).

**Contract**: Każda kontrolka renderuje się jako draggable card z ikoną i nazwą.

#### 3. Canvas formularza

**Plik**: `components/form-canvas.tsx`

**Intent**: Strefa drop (dnd-kit `useDroppable`) z sortowalną listą przeciągniętych pól (dnd-kit `SortableContext`).

**Contract**: Każde pole na canvasie ma przycisk konfiguracji i usunięcia.

#### 4. Panel konfiguracji pola

**Plik**: `components/field-config-panel.tsx`

**Intent**: Panel boczny z formularzem konfiguracji wybranego pola — dynamicznie renderuje odpowiednie opcje na podstawie `control`.

**Contract**: Dla StringInput: checkboxy stringOnly, numberOnly (select), regexp (select + custom pattern input). Dla DateInput: checkboxy dateOnly, noPastDate. Dla TextInput: input maxTextSize. Dla ListInput: checkboxy isBool, multipleChoice. Dla wszystkich: required, label.

#### 5. Serwis zapisu formularza

**Plik**: `lib/form-service.ts`

**Intent**: Funkcja `saveForm(name: string, endpointId: string, fields: FieldConfig[]): Promise<string>` — serializuje pola do JSON schema i zapisuje w `FormDefinition`.

**Contract**: Zwraca `formId`. Schema JSON: `{ name, endpointId, fields: FieldConfig[] }`.

#### 6. Strona buildera

**Plik**: `app/builder/page.tsx`

**Intent**: Layout: lista endpointów z lewej (z query param `specId`), paleta kontrolek, canvas, panel konfiguracji. Przycisk "Zapisz formularz".

**Contract**: Client component. Stan: wybrany endpoint, lista pól na canvasie, wybrany panel konfiguracji. Po zapisie: `router.push('/form/' + formId)`.

#### 7. Endpoint API zapisu formularza

**Plik**: `app/api/forms/route.ts`

**Intent**: Zapisuje definicję formularza do bazy.

**Contract**: `POST /api/forms` — body: `{ name, endpointId, schema }`. Odpowiedź: `{ formId }`.

### Kryteria sukcesu:

#### Weryfikacja automatyczna:

- `npm run typecheck` przechodzi
- `npm run lint` przechodzi

#### Weryfikacja ręczna:

- Przeciągam StringInput na canvas → pojawia się na liście
- Konfiguruję StringInput: required + regexp email → zapisuje się
- Przeciągam DateInput, ustawiam noPastDate → zapisuje się
- Przeciągam TextInput, ustawiam maxTextSize → zapisuje się
- Przeciągam ListInput, ustawiam isBool → zapisuje się
- Zmieniam kolejność pól drag&drop → zapisuje się
- Usuwam pole z canvasa → znika z listy
- Zapisuję formularz → przekierowanie do `/form/[id]`

**Implementation Note**: Po zakończeniu tej fazy i przejściu weryfikacji automatycznej, pauza na ręczne potwierdzenie.

---

## Faza 4: Form Renderer & Eksport JSON

### Przegląd

Renderer formularza na podstawie zapisanej JSON schema, walidacja client-side przez zod, przycisk ZAPISZ/WYŚLIJ generujący JSON opakowany w strukturę API.

### Wymagane zmiany:

#### 1. Renderer kontrolek

**Plik**: `components/controls/string-input.tsx`, `components/controls/date-input.tsx`, `components/controls/text-input.tsx`, `components/controls/list-input.tsx`

**Intent**: Komponenty renderujące poszczególne kontrolki na podstawie konfiguracji pola.

**Contract**: Każdy komponent przyjmuje `FieldConfig` i `value`, `onChange`. StringInput: `<input type="text">` z walidacją regexp. DateInput: `<input type="date">` z opcją noPastDate. TextInput: `<textarea>` z maxTextSize. ListInput: radiobuttony lub checkboxes w zależności od konfiguracji.

#### 2. Schemat walidacji zod

**Plik**: `lib/validation.ts`

**Intent**: Funkcja `buildZodSchema(fields: FieldConfig[]): z.ZodObject` — generuje schemat zod na podstawie konfiguracji pól.

**Contract**: Dla StringInput z regexp email: `z.string().email()`. Dla numberOnly: `z.number()`. Dla required: `.min(1)` lub odpowiednik. Dla DateInput noPastDate: `z.date().min(new Date())`. Dla TextInput maxTextSize: `z.string().max(n)`.

#### 3. Strona formularza

**Plik**: `app/form/[id]/page.tsx`, `components/form-renderer.tsx`

**Intent**: Renderer formularza — czyta definicję z bazy, renderuje kontrolki, zbiera wartości, waliduje, generuje JSON.

**Contract**: `GET /api/forms/[id]` — zwraca definicję formularza. Strona: server component pobiera dane, przekazuje do `FormRenderer` (client component).

#### 4. Generowanie JSON

**Plik**: `lib/json-generator.ts`

**Intent**: Funkcja `generatePayload(fields: FieldConfig[], values: Record<string, unknown>): ApiPayload` — buduje JSON opakowany w strukturę API.

**Contract**:

```typescript
interface ApiPayload {
  endpoint: string;
  method: string;
  params: Record<string, unknown>;
}
```

#### 5. Przycisk ZAPISZ/WYŚLIJ

**Plik**: `components/submit-button.tsx`

**Intent**: Przycisk generujący JSON i wyświetlający go w modalu/panelu z opcją skopiowania.

**Contract**: Po kliknięciu: walidacja zod → jeśli OK, generowanie JSON → wyświetlenie w `<pre>` z przyciskiem "Kopiuj do schowka".

### Kryteria sukcesu:

#### Weryfikacja automatyczna:

- `npm run typecheck` przechodzi
- `npm run lint` przechodzi

#### Weryfikacja ręczna:

- Otwieram zapisany formularz → widzę wszystkie pola z odpowiednimi kontrolkami
- Wypełniam formularz poprawnie → przycisk ZAPISZ/WYŚLIJ generuje JSON
- JSON zawiera endpoint, method i params z wartościami
- Wypełniam formularz niepoprawnie (np. zły email) → walidacja blokuje i pokazuje błąd
- Required pole puste → walidacja blokuje
- Kopiuję JSON do schowka → działa

**Implementation Note**: Po zakończeniu tej fazy i przejściu weryfikacji automatycznej, pauza na ręczne potwierdzenie.

---

## Strategia testów

### Testy ręczne:

1. `docker-compose up` → aplikacja dostępna na http://localhost:3000
2. Import `samples/petstore-openapi3.yaml` (OpenAPI 3.x)
3. Import `samples/petstore-swagger2.yaml` (Swagger 2.0)
4. Import przez URL (np. https://petstore.swagger.io/v2/swagger.json)
5. Budowanie formularza z każdego typu kontrolki
6. Walidacja pól (required, regexp, max size, noPastDate)
7. Zapis i ponowne otwarcie formularza
8. Generowanie JSON i weryfikacja struktury

## Uwagi dotyczące wydajności

- PoC — brak wymagań wydajnościowych
- SQLite wystarcza dla pojedynczego użytkownika
- dnd-kit jest wystarczająco szybki dla dziesiątek pól

## Migracje

- `npx prisma migrate dev` — tworzenie tabel (lokalnie)
- `npx prisma migrate deploy` — deployment (w Dockerfile CMD)

## Odnośniki

- dnd-kit docs: https://docs.dndkit.com/
- Prisma + SQLite: https://www.prisma.io/docs/concepts/database-connectors/sqlite
- Zod: https://zod.dev/
- Next.js Docker: https://github.com/vercel/next.js/tree/canary/examples/with-docker

## Progress

> Konwencja: `- [ ]` oczekujące, `- [x]` zrobione. Dopisz ` — <commit sha>` gdy krok wyląduje.

### Faza 0: Docker & Sample Data

#### Automated

- [x] 0.1 `docker-compose build` przechodzi bez błędów
- [x] 0.2 `docker-compose up` uruchamia serwer na porcie 3000
- [x] 0.3 `docker-compose exec app npx prisma migrate deploy` działa

#### Manual

- [x] 0.4 `docker-compose up` → aplikacja dostępna na http://localhost:3000
- [x] 0.5 Wgrywam `samples/petstore-openapi3.yaml` → parametry zapisują się w bazie
- [x] 0.6 Wgrywam `samples/petstore-swagger2.yaml` → parametry zapisują się w bazie
- [x] 0.7 Kontener restartuje się poprawnie (volume SQLite zachowuje dane)

### Faza 1: Scaffold & Foundation

#### Automated

- [x] 1.1 `npx prisma migrate dev` działa bez błędów
- [x] 1.2 `npm run dev` uruchamia serwer
- [x] 1.3 `npm run lint` przechodzi
- [x] 1.4 `npm run typecheck` przechodzi

#### Manual

- [x] 1.5 Strona główna wyświetla się z linkami do importu i buildera
- [x] 1.6 Nawigacja działa między stronami

### Faza 2: OpenAPI Parser

#### Automated

- [x] 2.1 `npm run typecheck` przechodzi
- [x] 2.2 `npm run lint` przechodzi

#### Manual

- [x] 2.3 Wgrywam `samples/petstore-openapi3.yaml` → parametry zapisują się w bazie
- [x] 2.4 Wgrywam `samples/petstore-swagger2.yaml` → parametry zapisują się w bazie
- [x] 2.5 Podaję URL do specyfikacji → parametry zapisują się w bazie
- [x] 2.6 Parametry query, path, header i body (top-level) są widoczne w liście endpointów

### Faza 3: Form Builder

#### Automated

- [x] 3.1 `npm run typecheck` przechodzi
- [x] 3.2 `npm run lint` przechodzi

#### Manual

- [x] 3.3 Przeciągam StringInput na canvas → pojawia się na liście
- [x] 3.4 Konfiguruję StringInput: required + regexp email → zapisuje się
- [x] 3.5 Przeciągam DateInput, ustawiam noPastDate → zapisuje się
- [x] 3.6 Przeciągam TextInput, ustawiam maxTextSize → zapisuje się
- [x] 3.7 Przeciągam ListInput, ustawiam isBool → zapisuje się
- [x] 3.8 Zmieniam kolejność pól drag&drop → zapisuje się
- [x] 3.9 Usuwam pole z canvasa → znika z listy
- [x] 3.10 Zapisuję formularz → przekierowanie do `/form/[id]`

### Faza 4: Form Renderer & Eksport JSON

#### Automated

- [x] 4.1 `npm run typecheck` przechodzi
- [x] 4.2 `npm run lint` przechodzi

#### Manual

- [x] 4.3 Otwieram zapisany formularz → widzę wszystkie pola z odpowiednimi kontrolkami
- [x] 4.4 Wypełniam formularz poprawnie → przycisk ZAPISZ/WYŚLIJ generuje JSON
- [x] 4.5 JSON zawera endpoint, method i params z wartościami
- [x] 4.6 Wypełniam formularz niepoprawnie → walidacja blokuje i pokazuje błąd
- [x] 4.7 Required pole puste → walidacja blokuje
- [x] 4.8 Kopiuję JSON do schowka → działa
