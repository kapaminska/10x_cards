# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi

`OpenRouterService` to klasa-wrapper, która ułatwia komunikację z API OpenRouter przy użyciu biblioteki Langchain. Jej celem jest centralizacja logiki związanej z wywoływaniem modeli językowych, zarządzaniem konfiguracją, formatowaniem zapytań i obsługą błędów. Usługa ta zapewni spójny interfejs do generowania odpowiedzi, w tym odpowiedzi o ustrukturyzowanej składni JSON, co jest kluczowe dla przewidywalności i niezawodności działania aplikacji.

Usługa zostanie zaimplementowana w `src/lib/services/openrouter.service.ts` zgodnie ze strukturą projektu.

## 2. Opis konstruktora

Konstruktor `OpenRouterService` inicjalizuje usługę, konfigurując klienta Langchain `ChatOpenRouter`. Przyjmuje on opcjonalny obiekt konfiguracyjny, który pozwala na dostosowanie modelu i jego parametrów. Klucz API jest odczytywany z zmiennych środowiskowych.

```typescript
// src/lib/services/openrouter.service.ts

import { ChatOpenRouter } from "@langchain/community/chat_models/openrouter";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ZodSchema } from "zod";
import {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  BadRequestError,
  OutputValidationError,
} from "@/lib/errors";

interface OpenRouterServiceConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  // Inne parametry modelu
}

export class OpenRouterService {
  private client: ChatOpenRouter;
  private readonly DEFAULT_MODEL = "openai/gpt-4o";

  constructor(config: OpenRouterServiceConfig = {}) {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new AuthenticationError("Brak klucza API OpenRouter. Ustaw zmienną środowiskową OPENROUTER_API_KEY.");
    }

    this.client = new ChatOpenRouter({
      openRouterApiKey: apiKey,
      modelName: config.modelName || this.DEFAULT_MODEL,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 1024,
    });
  }
  // ... reszta implementacji
}
```

## 3. Publiczne metody i pola

### `getStructuredResponse<T extends ZodSchema>(prompt: string, schema: T, systemPrompt?: string): Promise<z.infer<T>>`

Główna metoda usługi, która wysyła zapytanie do modelu i oczekuje odpowiedzi zgodnej z podanym schematem Zod.

- **`prompt`**: Główne zapytanie użytkownika.
- **`schema`**: Schemat Zod definiujący oczekiwaną strukturę odpowiedzi JSON.
- **`systemPrompt`**: (Opcjonalny) Komunikat systemowy do ustawienia kontekstu dla modelu.
- **Zwraca**: Obiekt `Promise`, który po rozwiązaniu zawiera odpowiedź sparsowaną i zwalidowaną zgodnie ze schematem.

### `getResponse(prompt: string, systemPrompt?: string): Promise<string>`

Prostsza metoda do uzyskiwania odpowiedzi tekstowych bez narzuconej struktury.

- **`prompt`**: Główne zapytanie użytkownika.
- **`systemPrompt`**: (Opcjonalny) Komunikat systemowy.
- **Zwraca**: `Promise` z tekstową odpowiedzią modelu.

## 4. Prywatne metody i pola

### `private handleError(error: unknown): never`

Prywatna metoda do centralizacji obsługi błędów. Mapuje błędy z biblioteki Langchain na niestandardowe, zdefiniowane w aplikacji typy błędów.

- **`error`**: Przechwycony obiekt błędu.
- **Zwraca**: `never` - metoda zawsze rzuca błąd.

### `private buildMessages(prompt: string, systemPrompt?: string): BaseMessage[]`

Metoda pomocnicza do tworzenia tablicy wiadomości (`SystemMessage`, `HumanMessage`) w formacie wymaganym przez Langchain.

- **`prompt`**: Zapytanie użytkownika.
- **`systemPrompt`**: Komunikat systemowy.
- **Zwraca**: Tablica instancji `BaseMessage`.

## 5. Obsługa błędów

Błędy będą obsługiwane centralnie przez metodę `handleError`. Zostaną zdefiniowane niestandardowe klasy błędów w `src/lib/errors.ts`, aby ułatwić ich identyfikację i obsługę w wyższych warstwach aplikacji.

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OpenRouterError extends AppError {}
export class AuthenticationError extends OpenRouterError {}
export class RateLimitError extends OpenRouterError {}
export class BadRequestError extends OpenRouterError {}
export class OutputValidationError extends OpenRouterError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
  }
}
```

Przykładowa implementacja `handleError` w `OpenRouterService`:

```typescript
// fragment w klasie OpenRouterService
private handleError(error: unknown): never {
    if (error instanceof Error) {
        // Tu można dodać bardziej szczegółową analizę `error.message`
        // lub kodu błędu, jeśli Langchain go dostarcza
        if (error.message.includes("401")) {
            throw new AuthenticationError("Błąd autentykacji w OpenRouter.");
        }
        if (error.message.includes("429")) {
            throw new RateLimitError("Przekroczono limit zapytań do OpenRouter.");
        }
        if (error.message.includes("400")) {
            throw new BadRequestError("Nieprawidłowe zapytanie do OpenRouter.");
        }
        throw new OutputValidationError(error.message, error);
    }
    throw new OpenRouterError("Nieznany błąd podczas komunikacji z OpenRouter.");
}
```

## 6. Kwestie bezpieczeństwa

1.  **Klucz API**: Klucz API OpenRouter **nigdy** nie może być przechowywany w kodzie źródłowym ani po stronie klienta. Musi być zarządzany wyłącznie za pomocą zmiennych środowiskowych na serwerze (`.env` w trybie deweloperskim, sekrety środowiskowe w produkcji).
2.  **Walidacja danych wejściowych**: Zapytania od użytkowników powinny być walidowane i sanitowane przed wysłaniem do API, aby zapobiec atakom typu "prompt injection".
3.  **Zarządzanie kosztami**: OpenRouter oferuje mechanizmy kontroli kosztów. Warto skonfigurować limity w panelu OpenRouter, aby uniknąć nieoczekiwanych wydatków.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Instalacja zależności

Dodaj wymaganą paczkę Langchain do projektu.

```bash
npm install @langchain/community zod
```

### Krok 2: Konfiguracja zmiennych środowiskowych

Do wykonania przez użytkownika.

### Krok 3: Zdefiniowanie niestandardowych błędów

Utwórz lub zaktualizuj plik `src/lib/errors.ts` z klasami błędów opisanymi w sekcji "Obsługa błędów".

### Krok 4: Implementacja klasy `OpenRouterService`

Utwórz plik `src/lib/services/openrouter.service.ts` i zaimplementuj w nim pełną klasę `OpenRouterService`.

```typescript
// src/lib/services/openrouter.service.ts

import { ChatOpenRouter } from "@langchain/community/chat_models/openrouter";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z, ZodSchema } from "zod";
import {
  OpenRouterError,
  AuthenticationError,
  RateLimitError,
  BadRequestError,
  OutputValidationError,
} from "@/lib/errors";

// ... Interfejs OpenRouterServiceConfig ...

export class OpenRouterService {
  private client: ChatOpenRouter;
  private readonly DEFAULT_MODEL = "openai/gpt-4o";

  constructor(config: OpenRouterServiceConfig = {}) {
    // ... implementacja konstruktora ...
  }

  private buildMessages(prompt: string, systemPrompt?: string): BaseMessage[] {
    const messages: BaseMessage[] = [];
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(prompt));
    return messages;
  }

  private handleError(error: unknown): never {
    // ... implementacja handleError ...
  }

  async getResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const messages = this.buildMessages(prompt, systemPrompt);
      const response = await this.client.invoke(messages);
      return response.content as string;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStructuredResponse<T extends ZodSchema>(
    prompt: string,
    schema: T,
    systemPrompt?: string
  ): Promise<z.infer<T>> {
    try {
      const messages = this.buildMessages(prompt, systemPrompt);
      const structuredClient = this.client.withStructuredOutput(schema);
      const response = await structuredClient.invoke(messages);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }
}
```

### Krok 5: Przykład użycia usługi w API endpoint

Zilustruj użycie nowej usługi w jednym z endpointów API Astro, np. do generowania fiszek.

```typescript
// src/pages/api/generations/index.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "@/lib/services/openrouter.service";
import { flashcardsListSchema } from "@/lib/schemas/generation.schema"; // Załóżmy, że ten schemat istnieje

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { topic, count } = body; // Proste odczytanie, w praktyce potrzebna walidacja

  if (!topic || !count) {
    return new Response(JSON.stringify({ error: "Topic and count are required" }), { status: 400 });
  }

  const openRouterService = new OpenRouterService();
  const prompt = `Wygeneruj ${count} unikalnych fiszek na temat: "${topic}".`;
  const systemPrompt =
    "Jesteś ekspertem w tworzeniu zwięzłych i ciekawych fiszek edukacyjnych. Zawsze odpowiadaj w formacie JSON, zgodnie z podanym schematem.";

  try {
    const generatedFlashcards = await openRouterService.getStructuredResponse(
      prompt,
      flashcardsListSchema,
      systemPrompt
    );

    return new Response(JSON.stringify(generatedFlashcards), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Tutaj można zalogować błąd
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};
```

### Wyjaśnienie konfiguracji kluczowych funkcji

- **Komunikat systemowy (`systemPrompt`)**: Przekazywany jako opcjonalny argument do metod usługi, jest konwertowany na `SystemMessage` z Langchain, aby nadać modelowi odpowiedni kontekst lub osobowość.
- **Komunikat użytkownika (`prompt`)**: Główny argument metod, konwertowany na `HumanMessage`, reprezentujący bezpośrednie zapytanie.
- **Nazwa modelu i parametry**: Konfigurowane w konstruktorze `OpenRouterService`. Pozwala to na stworzenie wielu instancji usługi z różnymi modelami (np. jedna dla szybkiej generacji, inna dla analizy) lub na dynamiczne tworzenie instancji z modelem wybranym przez użytkownika.
- **`response_format` (schemat JSON)**: To jest kluczowa funkcjonalność. Zamiast ręcznie tworzyć skomplikowany obiekt `response_format`, wykorzystujemy metodę `withStructuredOutput(schema)` z Langchain. Przyjmuje ona schemat Zod, a Langchain automatycznie instruuje model (za pomocą `JSON Mode` lub `Tool Calling`), aby jego odpowiedź była zgodna ze strukturą tego schematu. Jest to nowoczesne, elastyczne i zalecane podejście, które abstrahuje od specyfiki implementacji danego modelu. Wynik jest automatycznie parsowany i walidowany, co znacznie upraszcza kod.
