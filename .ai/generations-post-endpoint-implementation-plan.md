# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Ten punkt końcowy inicjuje proces generowania fiszek wspomagany przez AI. Przyjmuje tekst źródłowy od użytkownika, przetwarza go, wywołuje zewnętrzną usługę LLM w celu uzyskania propozycji fiszek, a następnie zwraca je do klienta. Każde wywołanie jest logowane w tabeli `generations`, a ewentualne błędy w tabeli `generation_error_logs`. Endpoint musi być zabezpieczony i dostępny tylko dla uwierzytelnionych użytkowników.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/generations`
- **Parametry**:
  - **Wymagane**:
  - `sourceText`: `string` (długość pomiędzy 1000 a 10000 znaków)
- **Request Body**:
  ```json
  {
    "sourceText": "string"
  }
  ```

## 3. Wykorzystywane typy
- **Request Command Model**: `GenerateFlashcardsCommand` (`{ sourceText: string }`) z `src/types.ts`.
- **Request Command Model**: `CreateGenerationCommand` (`{ sourceText: string }`) z `src/types.ts`.
- **Response DTO**: `GenerationSuggestionsResponseDto` (`{ generationId: string, flashcardsSuggestions: FlashcardSuggestionDto[] }`) z `src/types.ts`.
- **Database Types**: `GenerationRow`, `GenerationErrorLogRow` z `src/db/database.types.ts`.
- **DTO**: FlashcardSuggestionDto: `{ front: string, back: string, source: 'ai-full' }`.

## 4. Szczegóły odpowiedzi
- **Success (200 OK)**:
  - Zwraca obiekt `GenerationSuggestionsResponseDto`.
  ```json
  {
    "generationId": "uuid-string-...",
    "flashcardsSuggestions": [
      {
        "front": "Sugerowane pytanie 1?",
        "back": "Sugerowana odpowiedź 1.",
        "source": "ai-full"
      },
      "generationCount" : 5
    ]
  }
  ```
- **Error**: Zobacz sekcję "Obsługa błędów".

## 5. Przepływ danych
1.  Klient wysyła żądanie `POST` na `/api/generations` z `sourceText` w ciele żądania.
2.  Astro middleware weryfikuje token JWT użytkownika. Jeśli jest nieprawidłowy, zwraca `401 Unauthorized`.
3.  Endpoint API w `src/pages/api/generations/index.ts` jest wywoływany.
4.  **Walidacja wejściowa (Kontroler)**: `zod` weryfikuje, czy `sourceText` jest obecny i jest stringiem. Jeśli nie, zwraca `400 Bad Request`.
5.  Kontroler wywołuje metodę `generateSuggestions(sourceText, userId)`.
6.  **Walidacja biznesowa ('generation.service')**:
    - Sprawdza długość `sourceText`. Jeśli jest nieprawidłowa, rzuca błąd (obsługiwany jako `400 Bad Request`).
    - Oblicza hash SHA-256 z `sourceText` do celów przechowywania.
7.  **Interakcja z AI**:
    - Serwis wywołuje API LLM (np. OpenRouter) z odpowiednio przygotowanym promptem zawierającym `sourceText`. Na etapie dewelopmentu skorzystamy z mocków.
    - Mierzy czas trwania operacji.
8.  **Przetwarzanie odpowiedzi LLM**:
    - Parsuje odpowiedź od LLM.
    - Jeśli wystąpi błąd komunikacji lub LLM zwróci błąd, serwis łapie wyjątek, loguje szczegóły w `generation_error_logs` i rzuca błąd (obsługiwany jako `500` lub `502`).
9.  **Zapis do bazy danych**:
    - Serwis tworzy nowy rekord w tabeli `generations`, zapisując m.in. `userId`, `model`, `source_text_hash`, `source_text_length`, `suggestions_count` i `generation_duration_ms`.
    - Pobiera wygenerowany `id` z nowego rekordu.
10. **Odpowiedź do klienta**:
    - Serwis formatuje dane w strukturę `GenerationSuggestionsResponseDto`.
    - Kontroler odbiera DTO z serwisu i wysyła je do klienta z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wszystkie żądania do tego endpointu muszą zawierać prawidłowy token `Authorization: Bearer`. Użycie `Astro.locals.supabase` do weryfikacji sesji i pobrania danych użytkownika jest obligatoryjne.
- **Autoryzacja**: Każdy uwierzytelniony użytkownik może korzystać z tej funkcji. Dostęp jest powiązany z jego `user_id`.
- **Walidacja danych wejściowych**: Stosowanie `zod` na poziomie kontrolera i dodatkowych sprawdzeń w serwisie chroni przed nieprawidłowymi danymi i potencjalnymi atakami.
- **Rate Limiting**: Należy zaimplementować mechanizm ograniczający liczbę żądań na użytkownika (np. 10 generacji na godzinę), aby zapobiec nadużyciom i kontrolować koszty API.

## 7. Obsługa błędów
| Kod Statusu | Nazwa Błędu | Opis | Akcja |
| :--- | :--- | :--- | :--- |
| `400` | `Bad Request` | Brak `sourceText`, nieprawidłowy typ danych, lub długość tekstu poza zakresem 1000-10000 znaków. | Zwrócenie komunikatu o błędzie walidacji. |
| `401` | `Unauthorized` | Brak lub nieprawidłowy token uwierzytelniający. | Zwrócenie standardowego komunikatu o braku autoryzacji. |
| `429` | `Too Many Requests`| Użytkownik przekroczył limit szybkości generowania. | Zwrócenie komunikatu z informacją, kiedy będzie mógł spróbować ponownie. |
| `500` | `AI Service Error` | Problem z komunikacją z usługą LLM (np. timeout, błąd sieciowy). | Zalogowanie błędu w `generation_error_logs`. Zwrócenie generycznego komunikatu. |
| `502` | `Bad Gateway` | Usługa LLM zwróciła wewnętrzny błąd (status 5xx). | Zalogowanie błędu w `generation_error_logs`. Zwrócenie generycznego komunikatu. |

## 8. Rozważania dotyczące wydajności:
- **Timeout dla wywołania LLM**: 60 sekund.
- **Asynchroniczność**: Rozważyć asynchroniczne wywołanie LLM.
- **Hashowanie**: Obliczanie hasha SHA-256 jest szybką operacją i służy do celów przechowywania.
- **Zapytania do bazy danych**: Zapytania powinny być zoptymalizowane przez odpowiednie indeksy.

## 9. Etapy wdrożenia
1.  **Struktura plików**:
    - Utwórz plik dla endpointu: `src/pages/api/generations/index.ts`.
    - Utwórz plik dla serwisu: `src/lib/services/generation.service.ts`.
2.  **Model walidacji**:
    - W osobnym pliku (`src/lib/schemas/generation.schema.ts`) lub bezpośrednio w endpoincie zdefiniuj schemat `zod` dla `CreateGenerationCommand`.
3.  **Implementacja serwisu (`generation.service`)**:
    - Stwórz klasę `generation.service` z konstruktorem przyjmującym instancję `SupabaseClient`.
    - Zaimplementuj publiczną metodę `generateSuggestions(sourceText: string, userId: string)`.
    - Zaimplementuj prywatne metody pomocnicze do: hashowania tekstu, wywoływania LLM i logowania błędów.
4.  **Implementacja endpointu (`/api/generations/index.ts`)**:
    - Ustaw `export const prerender = false;`.
    - Zaimplementuj handler `POST`.
    - Pobierz sesję użytkownika z `Astro.locals.supabase`. Jeśli brak, zwróć `401`.
    - Użyj schematu `zod` do walidacji `Astro.request.json()`.
    - Utwórz instancję `generation.service`.
    - Wywołaj serwis w bloku `try...catch` i obsłuż potencjalne błędy, mapując je na odpowiednie odpowiedzi HTTP.
    - Zwróć `Astro.response` z wynikiem z serwisu lub odpowiednim błędem.
5.  **Konfiguracja zmiennych środowiskowych**:
    - Dodaj klucz API do usługi LLM (np. `OPENROUTER_API_KEY`) do zmiennych środowiskowych i upewnij się, że są one dostępne w kodzie (`import.meta.env`).
