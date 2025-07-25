# Specyfikacja Techniczna: Moduł Autentykacji Użytkowników

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę i implementację modułu autentykacji, rejestracji i odzyskiwania hasła dla aplikacji 10x-cards. Rozwiązanie opiera się na wymaganiach zdefiniowanych w PRD (US-001, US-002, US-009) oraz na stacku technologicznym (Astro, React, Supabase).

Celem jest stworzenie bezpiecznego i spójnego systemu zarządzania sesją użytkownika, który integruje się z istniejącą strukturą aplikacji i wykorzystuje serwerowe możliwości Astro w połączeniu z Supabase Auth.

## 2. Architektura Interfejsu Użytkownika (Frontend)

### 2.1. Nowe Strony (Astro Pages)

Wprowadzone zostaną dedykowane strony dla procesów autentykacji, renderowane przez Astro. Każda strona będzie zawierać odpowiedni komponent formularza w React.

-   **`/register`**: Strona rejestracji.
    -   Wyświetli komponent `RegisterForm`.
    -   Dostępna tylko dla niezalogowanych użytkowników. Po pomyślnej rejestracji użytkownik jest automatycznie logowany i przekierowywany do `/generate`.
-   **`/login`**: Strona logowania.
    -   Wyświetli komponent `LoginForm`.
    -   Może zawierać link do strony odzyskiwania hasła (`/reset-password`).
    -   Dostępna tylko dla niezalogowanych użytkowników. Zalogowany użytkownik zostanie przekierowany do `/generate`.
-   **`/reset-password`**: Strona do inicjowania procesu resetowania hasła.
    -   Wyświetli komponent `ResetPasswordForm`.
-   **`/update-password`**: Strona do ustawiania nowego hasła.
    -   Strona ta będzie dostępna poprzez specjalny link wysyłany na e-mail użytkownika. Supabase Auth domyślnie obsługuje ten mechanizm, a my musimy jedynie stworzyć stronę, na którą użytkownik zostanie przekierowany.

### 2.2. Aktualizacja Layoutu (`src/layouts/Layout.astro`)

Główny layout aplikacji zostanie zaktualizowany, aby dynamicznie renderować elementy interfejsu w zależności od stanu autentykacji użytkownika. Wprowadzony zostanie `Topbar` (lub zaktualizowany istniejący `NavigationMenu`) zawierający linki nawigacyjne i przyciski akcji.

-   **Logika w `Layout.astro`**:
    -   Przy użyciu `Astro.locals.session` (dostarczanego przez middleware), layout sprawdzi, czy użytkownik jest zalogowany.
    -   **Dla gościa (non-auth)**: W prawym górnym rogu `Topbar` wyświetlony zostanie przycisk/link "Zaloguj się", kierujący do `/login`.
    -   **Dla zalogowanego użytkownika (auth)**: `Topbar` będzie zawierał:
        -   Linki nawigacyjne do kluczowych sekcji:
            -   **"Generuj Fiszki"** (`/generate`)
            -   **"Moje Fiszki"** (`/flashcards`)
        -   Przycisk "Wyloguj", który będzie formularzem `POST` wysyłającym żądanie do endpointu `/api/auth/logout`.

### 2.3. Komponenty Interaktywne (React)

Formularze zostaną zaimplementowane jako komponenty React, aby zapewnić dynamiczną walidację i komunikację z API bez przeładowywania strony.

-   **`RegisterForm.tsx`**:
    -   **Pola**: `email`, `password`, `confirmPassword`.
    -   **Walidacja (client-side)**:
        -   Sprawdzenie formatu e-mail.
        -   Wymaganie minimalnej długości hasła.
        -   Sprawdzenie, czy hasła w obu polach są identyczne.
    -   **Obsługa stanu**: Stan dla pól formularza, stanu ładowania (`isLoading`) oraz komunikatów o błędach.
    -   **Interakcja**: Po wysłaniu formularza, komponent wykonuje żądanie `POST` do `/api/auth/register`. W przypadku sukcesu, użytkownik jest programowo przekierowywany (np. `window.location.href = '/generate'`). Błędy (np. "użytkownik już istnieje") są wyświetlane w komponencie.

-   **`LoginForm.tsx`**:
    -   **Pola**: `email`, `password`.
    -   **Walidacja (client-side)**: Sprawdzenie formatu e-mail i obecności hasła.
    -   **Interakcja**: Wykonuje żądanie `POST` do `/api/auth/login`. W razie powodzenia następuje przekierowanie. Błędy ("nieprawidłowe dane logowania") są wyświetlane w formularzu.

-   **`ResetPasswordForm.tsx`**:
    -   **Pole**: `email`.
    -   **Interakcja**: Wykonuje żądanie `POST` do `/api/auth/reset-password`. Po pomyślnym wysłaniu wyświetla komunikat o wysłaniu linku resetującego na podany adres e-mail.

### 2.4. Scenariusze i Obsługa Błędów

-   **Walidacja formularzy**: Wykorzystanie biblioteki Zod po stronie klienta (wewnątrz komponentów React) do walidacji danych wejściowych, zapewniając natychmiastowy feedback dla użytkownika.
-   **Komunikaty**: Błędy sieciowe lub błędy zwracane przez API będą przechwytywane w blokach `try...catch` wewnątrz komponentów i wyświetlane użytkownikowi za pomocą dedykowanego elementu UI (np. komponentu `Alert`).
-   **Ochrona stron**: Strony takie jak `/flashcards` i `/generate` będą chronione. Próba wejścia bez aktywnej sesji spowoduje przekierowanie do `/login`.

## 3. Logika Backendowa

Logika serwerowa zostanie zaimplementowana z wykorzystaniem Astro API Routes oraz middleware.

### 3.1. Middleware (`src/middleware/index.ts`)

Middleware będzie kluczowym elementem systemu, odpowiedzialnym za zarządzanie sesją i ochronę zasobów.

-   **Inicjalizacja Supabase**: Middleware na początku każdej requestu stworzy serwerowego klienta Supabase, używając `cookies` z requestu.
-   **Zarządzanie sesją**: Na podstawie ciasteczek, middleware odczyta sesję użytkownika (`supabase.auth.getSession()`). Informacje o sesji i użytkowniku zostaną umieszczone w `Astro.locals`, dzięki czemu będą dostępne wewnątrz layoutów i stron (`Astro.locals.session`, `Astro.locals.user`).
-   **Ochrona stron (Routing)**:
    -   Middleware sprawdzi, czy żądanie dotyczy chronionej ścieżki (np. `/generate`, `/flashcards`).
    -   Jeśli użytkownik nie jest zalogowany (`Astro.locals.session` jest `null`), zostanie przekierowany do `/login` za pomocą `Astro.redirect`.
    -   Doda również logikę przekierowania dla zalogowanych użytkowników próbujących uzyskać dostęp do stron `/login` lub `/register`.

### 3.2. API Endpoints (`src/pages/api/auth/`)

Endpointy API będą obsługiwać logikę autentykacji, komunikując się z Supabase Auth. Będą to pliki `.ts` w Astro, które eksportują funkcje `POST`.

-   **`POST /api/auth/register`**:
    -   Odbiera `email` i `password` z ciała żądania.
    -   Waliduje dane wejściowe za pomocą schemy Zod (`register.schema.ts`).
    -   Wywołuje `supabase.auth.signUp()`.
    -   W przypadku sukcesu, Supabase domyślnie loguje użytkownika i ustawia odpowiednie ciasteczka sesyjne. Endpoint zwraca status 200.
    -   Obsługuje błędy (np. użytkownik już istnieje) i zwraca odpowiedni status HTTP (np. 409 Conflict).

-   **`POST /api/auth/login`**:
    -   Odbiera `email` i `password`.
    -   Waliduje dane.
    -   Wywołuje `supabase.auth.signInWithPassword()`.
    -   W przypadku sukcesu, Supabase ustawia ciasteczka sesyjne. Endpoint zwraca status 200.
    -   Obsługuje błędy (np. nieprawidłowe dane) i zwraca status 401 Unauthorized.

-   **`POST /api/auth/logout`**:
    -   Wywołuje `supabase.auth.signOut()`.
    -   Czyści ciasteczka sesyjne.
    -   Przekierowuje użytkownika na stronę główną (`/`) lub logowania (`/login`).

-   **`POST /api/auth/reset-password`**:
    -   Odbiera `email`.
    -   Wywołuje `supabase.auth.resetPasswordForEmail()`, podając URL do strony `update-password`.
    -   Zawsze zwraca status 200, aby zapobiec możliwości weryfikacji istnienia kont e-mail.

### 3.3. Schemy Walidacji (`src/lib/schemas/`)

-   **`auth.schema.ts`**: Nowy plik zawierający schemy Zod dla wszystkich formularzy autentykacji: `registerSchema`, `loginSchema`, `resetPasswordSchema`. Zapewni to spójność walidacji między klientem a serwerem.

## 4. System Autentykacji (Integracja z Supabase)

### 4.1. Konfiguracja Supabase

-   **Zmienne środowiskowe**: `SUPABASE_URL` i `SUPABASE_ANON_KEY` muszą być skonfigurowane po stronie frontendu i serwera. Dodatkowo, `SUPABASE_SERVICE_ROLE_KEY` będzie potrzebny do operacji administracyjnych na serwerze, jeśli zajdzie taka potrzeba.
-   **Email Templates**: W panelu Supabase należy skonfigurować szablony e-maili dla potwierdzenia rejestracji (jeśli włączone) oraz dla resetowania hasła, aby zawierały poprawny link do naszej aplikacji (`/update-password`).

### 4.2. Klient Supabase (`src/db/supabase.client.ts`)

-   Należy upewnić się, że klient Supabase jest poprawnie skonfigurowany do pracy w środowisku serwerowym Astro. Supabase dostarcza pakiety pomocnicze (np. `@supabase/ssr`), które ułatwiają zarządzanie sesją za pomocą ciasteczek w środowiskach SSR, takich jak Astro. Należy je wykorzystać w implementacji middleware.

### 4.3. Row-Level Security (RLS)

Zgodnie z wymaganiem US-009, dane użytkowników muszą być odizolowane.

-   **Aktywacja RLS**: RLS zostanie włączone dla tabeli `flashcards` oraz wszystkich innych tabel przechowujących dane powiązane z użytkownikiem.
-   **Polisy RLS**:
    -   Dla tabeli `flashcards` zostanie dodana polisa, która pozwala na operacje `SELECT`, `INSERT`, `UPDATE`, `DELETE` tylko wtedy, gdy `user_id` w wierszu jest równe `auth.uid()`.
    -   Przykład polisy `SELECT`:
        ```sql
        CREATE POLICY "Users can view their own flashcards"
        ON public.flashcards FOR SELECT
        USING (auth.uid() = user_id);
        ```
    -   Analogiczne polisy zostaną stworzone dla pozostałych operacji.

## 5. Kluczowe Wnioski i Podsumowanie

-   Architektura w pełni wykorzystuje model "server-first" Astro, delegując interaktywność do komponentów React tam, gdzie jest to konieczne.
-   Middleware stanowi centralny punkt kontroli dostępu i zarządzania sesją, co upraszcza logikę w poszczególnych stronach.
-   Użycie Supabase Auth upraszcza implementację, dostarczając gotowe mechanizmy do obsługi cyklu życia użytkownika.
-   Kluczowe dla bezpieczeństwa jest wdrożenie RLS w bazie danych, co stanowi ostatnią i najważniejszą linię obrony danych użytkowników.
-   Spójność walidacji między frontendem a backendem zostanie zapewniona przez współdzielone schemy Zod. 