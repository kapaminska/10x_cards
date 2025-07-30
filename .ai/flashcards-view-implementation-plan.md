# Plan implementacji widoku "Moje Fiszki"

## 1. Przegląd

Widok "Moje Fiszki" jest głównym interfejsem dla zalogowanego użytkownika do zarządzania swoją kolekcją fiszek. Celem widoku jest umożliwienie przeglądania, ręcznego tworzenia, edytowania i usuwania fiszek w sposób intuicyjny i wydajny. Widok będzie również oferował podstawowe funkcje sortowania i filtrowania, a także zapewni jasną informację zwrotną w przypadku braku fiszek lub błędów.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- **Ścieżka**: `/flashcards`
- **Plik**: `src/pages/flashcards.astro`

Strona Astro będzie renderować główny komponent React (`FlashcardsView`) z dyrektywą `client:load`, aby zapewnić pełną interaktywność po stronie klienta.

## 3. Struktura komponentów

Hierarchia komponentów React, które zbudują ten widok, będzie następująca:

```
FlashcardsView (Komponent główny)
├── Button (Shadcn/ui) - "Stwórz nową fiszkę"
├── FilterSortControls
│   └── Select (Shadcn/ui) - Opcje filtrowania i sortowania
├── FlashcardsList
│   ├── (Stan ładowania) -> Skeleton (Shadcn/ui)
│   ├── (Stan pusty) -> EmptyState (Komunikat z CTA)
│   └── (Lista fiszek) -> FlashcardListItem[]
│       └── Card (Shadcn/ui)
│       └── Button (Shadcn/ui) - "Edytuj", "Usuń"
├── FlashcardFormModal (oparty o Dialog z Shadcn/ui)
│   ├── Input (Shadcn/ui) - "Przód" fiszki
│   └── Textarea (Shadcn/ui) - "Tył" fiszki
└── ConfirmationDialog (oparty o AlertDialog z Shadcn/ui)
```

## 4. Szczegóły komponentów

### FlashcardsView

- **Opis**: Główny kontener dla widoku. Orkiestruje stanem, obsługuje logikę biznesową (otwieranie modali, wywoływanie akcji API) i renderuje komponenty podrzędne.
- **Główne elementy**: Przycisk do tworzenia nowej fiszki, komponenty `FilterSortControls`, `FlashcardsList`, `FlashcardFormModal`, `ConfirmationDialog`.
- **Obsługiwane interakcje**:
  - Otwarcie modalu tworzenia fiszki.
  - Otwarcie modalu edycji fiszki (przekazując dane).
  - Otwarcie modalu potwierdzenia usunięcia (przekazując ID fiszki).
  - Przekazywanie zmian filtrów i sortowania do logiki zarządzającej stanem.
- **Typy**: `FlashcardDTO`, `FlashcardsViewState`, `FlashcardFormState`, `DeleteConfirmationState`.
- **Propsy**: Brak.

### FlashcardsList

- **Opis**: Wyświetla listę fiszek, stan ładowania lub stan pusty.
- **Główne elementy**: Warunkowo renderuje komponent `Skeleton` (podczas ładowania), komunikat o pustym stanie lub mapuje listę fiszek na komponenty `FlashcardListItem`.
- **Obsługiwane interakcje**: Propaguje zdarzenia `onEdit` i `onDelete` od dzieci do `FlashcardsView`.
- **Typy**: `FlashcardDTO`.
- **Propsy**:
  - `flashcards: FlashcardDTO[]`
  - `isLoading: boolean`
  - `onEdit: (flashcard: FlashcardDTO) => void`
  - `onDelete: (flashcardId: string) => void`

### FlashcardListItem

- **Opis**: Reprezentuje pojedynczą fiszkę na liście. Wyświetla jej treść i przyciski akcji.
- **Główne elementy**: Komponent `Card` z Shadcn/ui do wizualnego oddzielenia, wyświetlenie pól `front` i `back`, przyciski "Edytuj" i "Usuń".
- **Obsługiwane interakcje**: Kliknięcie przycisków "Edytuj" i "Usuń".
- **Typy**: `FlashcardDTO`.
- **Propsy**:
  - `flashcard: FlashcardDTO`
  - `onEdit: (flashcard: FlashcardDTO) => void`
  - `onDelete: (flashcardId: string) => void`

### FlashcardFormModal

- **Opis**: Modal do tworzenia i edycji fiszki, wykorzystujący `react-hook-form` do zarządzania formularzem i walidacją.
- **Główne elementy**: `Dialog` z Shadcn/ui, pola `Input` (`front`) i `Textarea` (`back`), przycisk zapisu i zamknięcia.
- **Obsługiwane interakcje**: Wprowadzanie tekstu, submisja formularza.
- **Warunki walidacji**:
  - `front`: Wymagane, maksymalnie 200 znaków.
  - `back`: Wymagane, maksymalnie 500 znaków.
- **Typy**: `FlashcardDTO`, `UpdateFlashcardCommand`, `FlashcardFormState`.
- **Propsy**:
  - `state: FlashcardFormState`
  - `onClose: () => void`
  - `onSubmit: (data: UpdateFlashcardCommand) => void`

### ConfirmationDialog

- **Opis**: Prosty modal do potwierdzenia operacji usunięcia fiszki.
- **Główne elementy**: `AlertDialog` z Shadcn/ui z tytułem, opisem i przyciskami "Potwierdź" i "Anuluj".
- **Obsługiwane interakcje**: Kliknięcie przycisku "Potwierdź" lub "Anuluj".
- **Typy**: `DeleteConfirmationState`.
- **Propsy**:
  - `state: DeleteConfirmationState`
  - `onClose: () => void`
  - `onConfirm: () => void`

## 5. Typy

Do implementacji widoku wykorzystane zostaną istniejące typy DTO oraz zdefiniowane zostaną nowe typy ViewModel do zarządzania stanem UI.

### Istniejące typy (z `src/types.ts`)

- `FlashcardDTO`: Obiekt fiszki otrzymywany z API.
- `FlashcardCreateDto`: Payload dla `POST /flashcards`.
- `UpdateFlashcardCommand`: Payload dla `PUT /flashcards/:id`.
- `PaginatedResponse<T>`: Struktura odpowiedzi dla paginowanych list.
- `FlashcardSource`: Enum dla źródła fiszki.

### Nowe typy ViewModel

```typescript
// Stan całego widoku, zarządzany przez custom hooka
interface FlashcardsViewState {
  flashcards: FlashcardDTO[];
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  filters: {
    source?: FlashcardSource;
  };
  sorting: {
    sortBy: "created_at" | "updated_at";
    order: "asc" | "desc";
  };
}

// Stan modalu formularza
interface FlashcardFormState {
  mode: "create" | "edit";
  isOpen: boolean;
  isSubmitting: boolean;
  // Dane do pre-populacji formularza w trybie edycji
  initialData?: FlashcardDTO;
}

// Stan modalu potwierdzenia usunięcia
interface DeleteConfirmationState {
  isOpen: boolean;
  isConfirming: boolean;
  // ID fiszki do usunięcia
  flashcardId?: string;
}
```

## 6. Zarządzanie stanem

Zalecane jest stworzenie customowego hooka `useFlashcards`, który będzie enkapsulował całą logikę zarządzania stanem i interakcji z API.

### `useFlashcards` hook:

- **Cel**: Centralizacja logiki pobierania, tworzenia, aktualizacji i usuwania fiszek, a także zarządzanie stanami ładowania, błędów, paginacji, filtrowania i sortowania.
- **Zarządzany stan**: `FlashcardsViewState`.
- **Eksponowane funkcje**:
  - `fetchFlashcards(params)`: Pobiera dane z API.
  - `createFlashcard(data)`: Wysyła żądanie `POST`.
  - `updateFlashcard(id, data)`: Wysyła żądanie `PUT`.
  - `deleteFlashcard(id)`: Wysyła żądanie `DELETE`.
  - `setFilters(filters)`: Aktualizuje filtry i wywołuje ponowne pobranie danych.
  - `setSorting(sorting)`: Aktualizuje sortowanie i wywołuje ponowne pobranie danych.
  - `setPage(page)`: Ustawia nową stronę i wywołuje ponowne pobranie danych.

## 7. Integracja API

Komponenty będą komunikować się z API za pośrednictwem funkcji udostępnianych przez hook `useFlashcards`.

- **`GET /flashcards`**: Wywoływane przy inicjalizacji widoku oraz przy każdej zmianie paginacji, sortowania lub filtrów.
  - **Żądanie**: Parametry query: `page`, `limit`, `sort`, `order`, `source`.
  - **Odpowiedź**: `PaginatedResponse<FlashcardDTO>`.
- **`POST /flashcards`**: Wywoływane po zatwierdzeniu formularza tworzenia nowej fiszki.
  - **Żądanie**: `FlashcardCreateDto`.
  - **Odpowiedź**: `{ flashcards: FlashcardDTO[] }`.
- **`PUT /flashcards/:id`**: Wywoływane po zatwierdzeniu formularza edycji istniejącej fiszki.
  - **Żądanie**: `UpdateFlashcardCommand`.
  - **Odpowiedź**: `FlashcardDTO`.
- **`DELETE /flashcards/:id`**: Wywoływane po potwierdzeniu usunięcia fiszki.
  - **Żądanie**: Brak body.
  - **Odpowiedź**: `204 No Content`.

## 8. Interakcje użytkownika

- **Tworzenie fiszki**: Użytkownik klika "Stwórz nową fiszkę" -> Otwiera się `FlashcardFormModal` -> Użytkownik wypełnia formularz i klika "Zapisz" -> Wywoływana jest funkcja `createFlashcard` -> Po sukcesie modal jest zamykany, a lista fiszek odświeżana.
- **Edycja fiszki**: Użytkownik klika "Edytuj" na elemencie listy -> Otwiera się `FlashcardFormModal` z wypełnionymi danymi -> Użytkownik modyfikuje dane i klika "Zapisz" -> Wywoływana jest funkcja `updateFlashcard` -> Po sukcesie modal jest zamykany, a element na liście jest aktualizowany.
- **Usuwanie fiszki**: Użytkownik klika "Usuń" -> Otwiera się `ConfirmationDialog` -> Użytkownik klika "Potwierdź" -> Wywoływana jest funkcja `deleteFlashcard` -> Po sukcesie dialog jest zamykany, a element znika z listy (najlepiej optymistycznie).

## 9. Warunki i walidacja

- **Komponent**: `FlashcardFormModal`.
- **Warunki**:
  - Pole `front` nie może być puste.
  - Długość pola `front` nie może przekraczać 200 znaków.
  - Pole `back` nie może być puste.
  - Długość pola `back` nie może przekraczać 500 znaków.
- **Weryfikacja**: Zostanie zaimplementowana po stronie klienta za pomocą biblioteki `zod` i `react-hook-form`. Błędy walidacji będą wyświetlane pod odpowiednimi polami formularza, a przycisk "Zapisz" będzie nieaktywny, jeśli formularz jest niepoprawny lub w trakcie wysyłania.

## 10. Obsługa błędów

- **Błąd pobierania listy (`GET`)**: W miejscu listy fiszek zostanie wyświetlony komunikat o błędzie, np. "Wystąpił błąd podczas pobierania fiszek. Spróbuj ponownie później."
- **Błąd zapisu/edycji/usunięcia (`POST`/`PUT`/`DELETE`)**: Po nieudanej operacji zostanie wyświetlony komunikat typu "toast" (np. przy użyciu `sonner` z Shadcn/ui) z informacją o niepowodzeniu, np. "Nie udało się zapisać fiszki.". Modal formularza/potwierdzenia nie powinien być zamykany automatycznie, aby umożliwić użytkownikowi ponowną próbę.
- **Stan pusty**: Jeśli API zwróci pustą listę fiszek, zostanie wyświetlony komunikat "Nie masz jeszcze żadnych fiszek" wraz z przyciskiem/linkiem zachęcającym do ich stworzenia lub wygenerowania (`/generate`).

## 11. Kroki implementacji

1.  **Struktura plików**: Stworzenie pliku `src/pages/flashcards.astro` oraz katalogu `src/components/views/flashcards/` na komponenty React.
2.  **Komponent główny**: Implementacja `FlashcardsView.tsx` jako głównego, interaktywnego komponentu.
3.  **Zarządzanie stanem**: Stworzenie customowego hooka `useFlashcards.ts` do obsługi stanu i komunikacji z API.
4.  **Komponenty UI**: Implementacja komponentów `FlashcardsList.tsx`, `FlashcardListItem.tsx` i `FilterSortControls.tsx` przy użyciu komponentów z biblioteki Shadcn/ui.
5.  **Modale**: Implementacja komponentów `FlashcardFormModal.tsx` (z walidacją `zod` i `react-hook-form`) oraz `ConfirmationDialog.tsx`.
6.  **Integracja**: Połączenie wszystkich komponentów w `FlashcardsView`, przekazanie propsów i obsługa zdarzeń.
7.  **Obsługa błędów i stanów brzegowych**: Implementacja logiki wyświetlania stanu ładowania (szkielety), błędów (komunikaty, toasty) oraz stanu pustego.
8.  **Stylowanie**: Dopracowanie wyglądu za pomocą Tailwind CSS zgodnie z ogólnym designem aplikacji.
9.  **Testowanie manualne**: Weryfikacja wszystkich ścieżek użytkownika: tworzenie, edycja, usuwanie, filtrowanie, sortowanie oraz obsługa błędów.
