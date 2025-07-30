# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Ten punkt końcowy jest odpowiedzialny za tworzenie jednej lub więcej fiszek dla uwierzytelnionego użytkownika. Obsługuje dwa odrębne przypadki użycia:

1.  **Tworzenie ręczne**: Użytkownik przesyła pojedynczy obiekt fiszki. Pole `source` jest opcjonalne i domyślnie ustawiane na 'manual', a `generation_id` jest pomijane.
2.  **Tworzenie wsadowe (AI)**: Po sesji generowania propozycji fiszek przez AI, klient przesyła tablicę zaakceptowanych fiszek (zarówno edytowanych, jak i nieedytowanych). Każda fiszka musi zawierać `source` ('ai-full' lub 'ai-edited') oraz powiązany `generation_id`.

## 2. Szczegóły żądania

- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/flashcards`
- **Request Body**: Ciało żądania musi pasować do jednego z dwóch poniższych schematów walidowanych przez Zod.

  **Schemat 1: Pojedyncza fiszka (ręczna lub AI)**

  ```json
  {
    "front": "What is Zod?",
    "back": "A TypeScript-first schema declaration and validation library.",
    "generationId": null
  }
  ```

  **Schemat 2: Wiele fiszek (wsadowe AI)**
  Zgodnie z typem `CreateFlashcardsBatchCommand` z `src/types.ts`.

  ```json
  {
    "generationId": "a1b2c3d4-e5f6-4a3b-8c7d-1e2f3a4b5c6d",
    "acceptedCards": [
      {
        "front": "Card 1 Front",
        "back": "Card 1 Back",
        "source": "ai-full"
      },
      {
        "front": "Edited Card 2 Front",
        "back": "Card 2 Back",
        "source": "ai-edited"
      }
    ],
    "rejectedCount": 3
  }
  ```

- **Walidacja pól**: Walidacja będzie przeprowadzana przez schemat Zod, który weryfikuje poprawność jednego z dwóch powyższych schematów.
  - Dla schematu 1 (`FlashcardCreateDto`): `front` i `back` są wymagane. Pole `source` jest opcjonalne (domyślnie 'manual'). `generationId` musi być `null` lub pominięty, gdy `source` jest 'manual'.
  - Dla schematu 2 (`CreateFlashcardsBatchCommand`): `generationId`, `acceptedCards` (tablica z określonymi polami) i `rejectedCount` są wymagane.

## 3. Wykorzystywane typy

- **Request Body Validation**: Niestandardowy schemat Zod, który wykorzystuje `z.union`, aby obsłużyć oba formaty żądania (`FlashcardCreateDto` | `CreateFlashcardsBatchCommand`).
- **DTOs (z `src/types.ts`)**:
  - `FlashcardCreateDto`: Schemat walidacji dla pojedynczej fiszki.
  - `CreateFlashcardsBatchCommand`: Schemat walidacji dla partii fiszek AI.
  - `FlashcardDTO`: Używany do formatowania danych wyjściowych w odpowiedzi.

## 4. Szczegóły odpowiedzi

- **Odpowiedź sukcesu (`201 Created`)**: Zwraca obiekt zawierający tablicę nowo utworzonych fiszek.
  ```json
  {
    "flashcards": [
      {
        "id": "uuid-1",
        "front": "Card 1 Front",
        "back": "Card 1 Back",
        "source": "ai-full",
        "generationId": "uuid-gen-1",
        "createdAt": "2024-10-26T10:05:00Z",
        "updatedAt": "2024-10-26T10:05:00Z"
      }
    ]
  }
  ```
- **Odpowiedzi błędu**: Zobacz sekcję "Obsługa błędów".

## 5. Przepływ danych

1.  Żądanie `POST` trafia do pliku trasy Astro `src/pages/api/flashcards.ts`.
2.  Astro middleware weryfikuje token JWT użytkownika i udostępnia klienta Supabase oraz dane użytkownika w `Astro.locals`.
3.  Handler `POST` w pliku trasy jest wywoływany.
4.  Ciało żądania jest parsowane i walidowane za pomocą przygotowanego schematu `z.union`. Jeśli walidacja się nie powiedzie, zwracany jest błąd `400 Bad Request`.
5.  Logika rozgałęzia się w zależności od zwalidowanego schematu:
    a. **Tworzenie pojedyncze**: Obiekt `FlashcardCreateDto` jest opakowywany w tablicę.
    b. **Tworzenie wsadowe**: Z obiektu `CreateFlashcardsBatchCommand` wyodrębniane są `generationId`, `acceptedCards` i `rejectedCount`.
6.  Dane są przekazywane do odpowiedniej metody w `flashcard.service`.
7.  Wewnątrz serwisu (`flashcard.service`):
    a. Dla każdej fiszki z `generationId` (w scenariuszu wsadowym), serwis weryfikuje, czy `generation` o podanym ID istnieje i czy należy do uwierzytelnionego użytkownika. Jeśli nie, zgłaszany jest błąd (prowadzący do odpowiedzi `404 Not Found`).
    b. (Opcjonalnie) Sprawdzany jest limit tworzenia fiszek (rate limiting).
    c. Serwis przygotowuje tablicę obiektów `FlashcardInsert`, mapując dane wejściowe (`acceptedCards`) i dodając do każdej fiszki `user_id` oraz `generation_id`.
    d. Wykonywana jest pojedyncza operacja `supabase.from('flashcards').insert([...])`, aby wsadowo wstawić wszystkie fiszki.
    e. Jeśli operacja w bazie danych się nie powiedzie, zgłaszany jest błąd (prowadzący do `500 Internal Server Error`).
    f. **Aktualizacja statystyk**: Po pomyślnym wstawieniu fiszek (tylko w scenariuszu wsadowym), serwis wykonuje operację `UPDATE` na tabeli `generations` dla danego `generationId`. Aktualizuje kolumny `accepted_unedited_count`, `accepted_edited_count` i `rejected_count` na podstawie danych z `acceptedCards` i `rejectedCount`. Obie operacje (insert i update) powinny być częścią jednej transakcji.
8.  Po pomyślnym zakończeniu operacji, serwis zwraca nowo utworzone rekordy fiszek.
9.  Handler Astro formatuje zwrócone dane do postaci `{ flashcards: FlashcardDTO[] }` i wysyła odpowiedź `201 Created`.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Każde żądanie musi być uwierzytelnione za pomocą ważnego tokenu JWT. Middleware jest odpowiedzialne за weryfikację i odrzucenie nieautoryzowanych żądań (`401 Unauthorized`).
- **Autoryzacja**: Logika serwisu musi zapewnić, że `generation_id` (jeśli podano) należy do uwierzytelnionego użytkownika, aby zapobiec tworzeniu przez jednego użytkownika fiszek w kontekście generacji innego użytkownika.
- **Walidacja danych wejściowych**: Rygorystyczna walidacja za pomocą Zod na brzegu (w handlerze Astro) chroni przed nieprawidłowymi lub złośliwymi danymi, zanim dotrą one do logiki biznesowej.

## 7. Obsługa błędów

- **`400 Bad Request`**: Zwracany, gdy walidacja Zod schematu ciała żądania nie powiedzie się. Odpowiedź powinna zawierać szczegóły błędu walidacji.
- **`401 Unauthorized`**: Zwracany przez middleware, gdy brakuje tokenu uwierzytelniającego lub jest on nieważny.
- **`404 Not Found`**: Zwracany, gdy podano `generationId`, który nie istnieje lub nie należy do bieżącego użytkownika.
- **`429 Too Many Requests`**: Zwracany, gdy użytkownik przekroczy zdefiniowany limit tworzenia fiszek.
- **`500 Internal Server Error`**: Zwracany w przypadku nieoczekiwanego błędu serwera, np. błędu zapisu do bazy danych.

## 8. Rozważania dotyczące wydajności

- **Operacje wsadowe**: Użycie pojedynczego wywołania `insert()` dla wielu fiszek jest znacznie bardziej wydajne niż wykonywanie wielu oddzielnych zapytań do bazy danych. Architektura wspiera to podejście.
- **Zapytania walidacyjne**: Walidacja `generationId` wymaga dodatkowego zapytania do bazy danych. Należy zoptymalizować to zapytanie, aby było jak najszybsze (np. pobierając tylko `id` i `user_id`).

## 9. Etapy wdrożenia

1.  **Plik trasy**: Utwórz plik `src/pages/api/flashcards.ts`.
2.  **Schemat walidacji**: W `flashcards.ts`, zdefiniuj schemat walidacji Zod, który obsługuje zarówno pojedyncze, jak i wsadowe tworzenie fiszek, w tym walidację warunkową dla `generationId` i `source`.
3.  **Handler POST**: W `flashcards.ts`, zaimplementuj funkcję `POST({ request, locals })`.
    - Pobierz dane użytkownika i klienta Supabase z `locals`.
    - Przeprowadź walidację ciała żądania za pomocą schematu Zod.
    - Znormalizuj dane wejściowe do postaci tablicy fiszek.
4.  **Serwis**: Utwórz plik `src/lib/services/flashcardService.ts` (jeśli nie istnieje).
5.  **Metoda serwisu**: W `flashcardService.ts`, zaimplementuj asynchroniczną metodę `createFlashcards(data: FlashcardCreateDto[], userId: string, supabase: SupabaseClient)`.
    - Zaimplementuj logikę weryfikacji własności `generationId`.
    - Zaimplementuj logikę rate limitingu.
    - Przygotuj i wykonaj operację wstawiania do bazy danych oraz aktualizacji statystyk generacji w ramach transakcji.
    - Zwróć utworzone fiszki lub rzuć odpowiedni błąd.
6.  **Integracja**: Wywołaj metodę serwisu z handlera `POST` w `flashcards.ts`.
7.  **Obsługa odpowiedzi**: W handlerze `POST`, opakuj pomyślne wyniki w odpowiedź `201 Created` i obsłuż błędy zgłoszone przez serwis, mapując je na odpowiednie kody stanu HTTP.
8.  **Testowanie**: Napisz testy jednostkowe dla logiki serwisu (zwłaszcza walidacji `generationId`) oraz testy integracyjne dla całego punktu końcowego.
