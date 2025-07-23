# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji 10x-cards została zaprojektowana w celu zapewnienia płynnego, intuicyjnego i responsywnego doświadczenia, zorientowanego na kluczową funkcjonalność – generowanie i zarządzanie fiszkami edukacyjnymi. Struktura opiera się na podejściu modułowym, wykorzystując Astro do budowy statycznych stron oraz React do tworzenia dynamicznych, interaktywnych komponentów.

Głównym celem jest uproszczenie procesu tworzenia fiszek, co realizowane jest poprzez centralny widok generowania oparty na AI. Nawigacja jest prosta i czytelna, a przepływy użytkownika zoptymalizowane pod kątem wydajności i minimalizacji liczby kroków potrzebnych do osiągnięcia celu. Zarządzanie stanem opiera się na wbudowanych mechanizmach React, a komunikacja z API jest scentralizowana, co ułatwia utrzymanie i rozwój aplikacji. Architektura jest w pełni zgodna z podejściem mobile-first. Całość korzysta z Tailwind CSS i wykorzystuje bibliotekę komponentów `shadcn/ui` do zapewnienia spójności wizualnej i wysokiej dostępności.

## 2. Lista widoków

### Widok Generowania Fiszki (Generate View)
- **Nazwa widoku**: Generate
- **Ścieżka widoku**: `/generate`
- **Główny cel**: Umożliwienie użytkownikowi wklejenia tekstu, wygenerowania propozycji fiszek przy użyciu AI, a następnie ich przeglądania, edycji i zapisywania. Jest to główny widok aplikacji dla zalogowanego użytkownika.
- **Kluczowe informacje do wyświetlenia**:
    - Pole tekstowe na tekst źródłowy.
    - Lista wygenerowanych sugestii fiszek (przód i tył).
    - Wizualny status każdej sugestii (nowa, zaakceptowana, edytowana, odrzucona).
    - Komunikaty o stanie procesu (ładowanie, błąd, sukces - skeleton).
- **Kluczowe komponenty widoku**:
    - `GenerationForm`: Komponent React zawierający `Textarea` na tekst źródłowy i przycisk inicjujący generowanie.
    - `SuggestionsList`: Komponent React renderujący listę propozycji.
    - `SuggestionCard`: Komponent React reprezentujący pojedynczą sugestię z opcjami akcji (akceptuj, edytuj, odrzuć).
    - Przycisk "Zapisz zaakceptowane fiszki", który wysyła dane wsadowo do API.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Przycisk "Zapisz" jest nieaktywny, dopóki co najmniej jedna fiszka nie zostanie zaakceptowana. Jasne stany ładowania i błędu. Na urządzeniach mobilnych formularz generowania zwija się, aby zrobić miejsce na listę sugestii.
    - **Dostępność**: Formularz i przyciski są w pełni dostępne z klawiatury i dla czytników ekranu.
    - **Bezpieczeństwo**: Walidacja długości tekstu źródłowego po stronie klienta i serwera, aby zapobiec nadużyciom API.

### Widok "Moje Fiszki" (My Flashcards View)
- **Nazwa widoku**: My Flashcards
- **Ścieżka widoku**: `/flashcards`
- **Główny cel**: Przeglądanie, tworzenie, edytowanie i usuwanie wszystkich zapisanych fiszek użytkownika.
- **Kluczowe informacje do wyświetlenia**:
    - Spaginowana lub zwirtualizowana lista wszystkich fiszek użytkownika.
    - Treść przodu i tyłu każdej fiszki.
    - Źródło fiszki (utworzona ręcznie, wygenerowana przez AI, zmodyfikowana przez użytkownika).
    - Opcje sortowania i filtrowania listy.
- **Kluczowe komponenty widoku**:
    - `FlashcardsList`: Komponent React wyświetlający listę fiszek.
    - `FlashcardListItem`: Komponent React dla pojedynczego elementu listy z przyciskami "Edytuj" i "Usuń".
    - `FilterSortControls`: Komponent React z opcjami filtrowania (np. po źródle) i sortowania (np. po dacie utworzenia).
    - `FlashcardFormModal`: Modal (okno dialogowe) do ręcznego tworzenia i edycji fiszek.
    - `ConfirmationDialog`: Modal do potwierdzania operacji usunięcia fiszki.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Wyraźny stan pusty z wezwaniem do akcji (link do `/generate`), jeśli użytkownik nie ma żadnych fiszek. Płynna paginacja.
    - **Dostępność**: Wszystkie interaktywne elementy (przyciski, modale) są dostępne.
    - **Bezpieczeństwo**: Operacja usunięcia wymaga potwierdzenia, aby zapobiec przypadkowej utracie danych.

### Widok Panelu Użytkownika (Account View)
- **Nazwa widoku**: Account
- **Ścieżka widoku**: `/account`
- **Główny cel**: Zarządzanie ustawieniami konta użytkownika.
- **Kluczowe informacje do wyświetlenia**:
    - Adres e-mail użytkownika.
    - Opcje zarządzania kontem.
- **Kluczowe komponenty widoku**:
    - Przycisk "Wyloguj".
    - Przycisk "Usuń konto", który otwiera `ConfirmationDialog`.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Prosty i czytelny interfejs.
    - **Dostępność**: Elementy są poprawnie oznaczone dla technologii asystujących.
    - **Bezpieczeństwo**: Krytyczna akcja usunięcia konta jest chroniona przez modal potwierdzający, który może wymagać od użytkownika wpisania hasła lub specjalnego słowa kluczowego.

### Widoki Autentykacji (Login/Register Views)
- **Nazwa widoku**: Login / Register
- **Ścieżka widoku**: `/login`, `/register`
- **Główny cel**: Umożliwienie użytkownikom zalogowania się do istniejącego konta lub utworzenia nowego.
- **Kluczowe informacje do wyświetlenia**:
    - Formularz z polami na e-mail i hasło.
    - Linki do przełączania się między logowaniem a rejestracją.
- **Kluczowe komponenty widoku**:
    - `AuthForm`: Reużywalny komponent React dla formularzy logowania i rejestracji.
- **UX, dostępność i względy bezpieczeństwa**:
    - **UX**: Walidacja formularza w czasie rzeczywistym z jasnymi komunikatami o błędach (np. "Hasło musi mieć co najmniej 8 znaków").
    - **Dostępność**: Formularze są zgodne ze standardami dostępności (etykiety, atrybuty `aria`).
    - **Bezpieczeństwo**: Hasła nie są przechowywane w stanie aplikacji w postaci jawnej; komunikacja z API odbywa się przez HTTPS.

## 3. Mapa podróży użytkownika

Podstawowa podróż użytkownika koncentruje się na głównym celu aplikacji – szybkim tworzeniu fiszek.

1.  **Rejestracja/Logowanie**:
    - Nowy użytkownik trafia na stronę główną (`/`) i przechodzi do `/register`. Po pomyślnej rejestracji jest automatycznie logowany i przekierowywany do widoku generowania (`/generate`).
    - Powracający użytkownik przechodzi do `/login`, a po zalogowaniu jest przekierowywany do `/generate`.

2.  **Generowanie Fiszki (Główny Przepływ)**:
    - Użytkownik znajduje się na stronie `/generate`.
    - Wkleja tekst do formularza i klika "Generuj fiszki". Aplikacja wyświetla wskaźnik ładowania.
    - Po otrzymaniu odpowiedzi z API, pod formularzem pojawia się lista sugestii.
    - Użytkownik przegląda sugestie, akceptując, edytując lub odrzucając każdą z nich. Status każdej sugestii jest wyraźnie oznaczony wizualnie.
    - Po zaakceptowaniu co najmniej jednej fiszki, przycisk "Zapisz zaakceptowane fiszki" staje się aktywny.
    - Użytkownik klika przycisk zapisu. Aplikacja wysyła zaakceptowane/zmodyfikowane fiszki do API i wyświetla powiadomienie (toast) o sukcesie. Lista sugestii jest czyszczona, przygotowując widok na kolejne generowanie.

3.  **Zarządzanie Fiszami**:
    - Z nawigacji użytkownik przechodzi do widoku "Moje Fiszki" (`/flashcards`).
    - Może tu przeglądać wszystkie swoje zapisane fiszki, filtrować je i sortować.
    - Klikając "Edytuj", otwiera modal do modyfikacji fiszki.
    - Klikając "Usuń", otwiera modal z prośbą o potwierdzenie.
    - Klikając "Dodaj nową fiszkę", otwiera ten sam modal co do edycji, ale z pustymi polami, aby utworzyć fiszkę ręcznie.

## 4. Układ i struktura nawigacji

- **Główny Układ (Layout)**: Aplikacja wykorzystuje główny plik `Layout.astro`, który zawiera wspólną strukturę dla wszystkich podstron. Wewnątrz tego layoutu renderowane są dynamiczne komponenty React.
- **Nawigacja dla zalogowanych użytkowników**:
    - Zaimplementowana jako stały, poziomy pasek na górze strony (`TopBar`).
    - Zawiera bezpośrednie linki do kluczowych widoków: **"Generuj"** (`/generate`) i **"Moje Fiszki"** (`/flashcards`).
    - Po prawej stronie znajduje się menu rozwijane (dropdown) z awatarem użytkownika, które zawiera link do **"Panelu Użytkownika"** (`/account`) oraz przycisk **"Wyloguj"**.
- **Nawigacja dla niezalogowanych użytkowników**:
    - Ograniczona do przycisków na stronie głównej (`/`) oraz w formularzach: **"Zaloguj się"** i **"Zarejestruj się"**.
- **Ochrona Ścieżek**: Middleware w Astro będzie chronić ścieżki (`/generate`, `/flashcards`, `/account`), przekierowując niezalogowanych użytkowników do strony logowania (`/login`).

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów React, które będą stanowić fundament interfejsu użytkownika.

- **`GenerationForm`**: Formularz do wprowadzania tekstu źródłowego. Odpowiada za walidację i komunikację z API w celu rozpoczęcia generowania.
- **`SuggestionsList`**: Kontener na listę wygenerowanych propozycji. Zarządza stanem całej listy sugestii.
- **`SuggestionCard`**: Pojedynczy, interaktywny element na liście propozycji z logiką do akceptacji, edycji i odrzucenia.
- **`FlashcardsList`**: Komponent do wyświetlania listy istniejących fiszek z obsługą paginacji i/lub wirtualizacji dla optymalnej wydajności.
- **`FlashcardFormModal`**: Uniwersalny modal do tworzenia i edycji pojedynczej fiszki. Zawiera formularz z polami "przód" i "tył" oraz walidację.
- **`ConfirmationDialog`**: Reużywalny modal do potwierdzania krytycznych akcji, takich jak usuwanie fiszki lub usuwanie konta.
- **`TopBar`**: Komponent nawigacyjny dla zalogowanych użytkowników.
- **`ToastProvider`**: Globalny system powiadomień do informowania o sukcesach (np. zapisano fiszki) lub niekrytycznych błędach (np. przekroczono limit zapytań). 