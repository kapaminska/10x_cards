Zaczynam od analizy projektu. Po jej zakończeniu przejdę do stworzenia kompleksowego planu testów.
Search files...

Okay, I have analyzed the project and created a comprehensive test plan. Here is the plan in Markdown format, as requested.

<plan_testów>

# Plan Testów dla Aplikacji 10x-cards

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji `10x-cards`, platformy do generowania i zarządzania fiszkami edukacyjnymi z wykorzystaniem sztucznej inteligencji. Plan został opracowany na podstawie analizy architektury projektu, stosu technologicznego (Astro, React, Supabase, Openrouter.ai) oraz kluczowych funkcjonalności.

### 1.2. Cele Testowania

Główne cele procesu testowania to:

- **Weryfikacja funkcjonalności:** Zapewnienie, że wszystkie funkcje aplikacji, od uwierzytelniania po generowanie fiszek, działają zgodnie z wymaganiami określonymi w [dokumencie wymagań produktu (PRD)](/.ai/prd.md).
- **Zapewnienie jakości i niezawodności:** Identyfikacja i eliminacja błędów w celu dostarczenia stabilnego i niezawodnego produktu.
- **Walidacja bezpieczeństwa:** Upewnienie się, że dane użytkowników są bezpieczne, a system jest odporny na podstawowe zagrożenia.
- **Ocena wydajności:** Sprawdzenie, jak aplikacja zachowuje się pod obciążeniem i przy większej ilości danych.
- **Weryfikacja użyteczności (UX/UI):** Zapewnienie, że interfejs użytkownika jest intuicyjny, spójny i responsywny na różnych urządzeniach.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami (In-Scope)

- **Moduł Uwierzytelniania:** Rejestracja, logowanie, wylogowywanie, resetowanie hasła, zarządzanie sesją.
- **Generowanie Fiszki (AI):** Proces od wklejenia tekstu, przez komunikację z API Openrouter.ai, po wyświetlenie sugestii.
- **Zarządzanie Sugestiami:** Akceptowanie, edytowanie i odrzucanie wygenerowanych sugestii fiszek.
- **Zarządzanie Fiszami (CRUD):** Ręczne tworzenie, odczyt, aktualizacja i usuwanie fiszek.
- **API Backend:** Wszystkie endpointy w `src/pages/api/` pod kątem logiki biznesowej, walidacji i obsługi błędów.
- **Bezpieczeństwo:** Ochrona endpointów i polityki dostępu do danych (Supabase RLS).
- **Interfejs Użytkownika:** Responsywność (RWD), spójność wizualna, obsługa stanów (ładowanie, błąd).

### 2.2. Funkcjonalności wyłączone z testów (Out-of-Scope)

- Szczegółowe testy samego algorytmu LLM dostarczanego przez Openrouter.ai (zakładamy, że działa poprawnie; testujemy jedynie integrację z nim).
- Testy penetracyjne wykraczające poza podstawową weryfikację bezpieczeństwa.
- Testy infrastruktury Supabase i DigitalOcean (zakładamy niezawodność dostawców).

## 3. Typy Testów

Proces testowania zostanie podzielony na następujące poziomy i typy, z naciskiem na konsolidację narzędzi:

| Typ Testu                                        | Poziom    | Narzędzia                                | Cel                                                                                                                                      |
| :----------------------------------------------- | :-------- | :--------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Testy Jednostkowe i Integracyjne Komponentów** | Kod       | **Vitest + React Testing Library**       | Weryfikacja logiki pojedynczych funkcji (serwisy, helpery) oraz izolowanych komponentów React.                                           |
| **Testy End-to-End (E2E)**                       | Aplikacja | **Playwright**                           | Symulacja pełnych scenariuszy użytkownika w przeglądarce, od logowania po zarządzanie fiszkami.                                          |
| **Testy API**                                    | Backend   | **Playwright (APIRequestContext)**       | Bezpośrednie testowanie endpointów API pod kątem logiki, walidacji i schematów odpowiedzi. Eliminuje to potrzebę stosowania `Supertest`. |
| **Testy Bezpieczeństwa (zautomatyzowane)**       | Aplikacja | **Playwright**                           | Automatyzacja weryfikacji polityk RLS, ochrony endpointów i podstawowych wektorów ataków.                                                |
| **Testy Wydajności (podstawowe)**                | Aplikacja | **Playwright + integracja z Lighthouse** | Pomiar kluczowych metryk wydajności (np. LCP, FCP) dla najważniejszych stron.                                                            |
| **Testy Manualne (Eksploracyjne / UAT)**         | Aplikacja | Manualne                                 | Weryfikacja scenariuszy trudnych do zautomatyzowania i ogólna ocena UX/UI.                                                               |

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1. Uwierzytelnianie

- **TC-AUTH-01:** Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
- **TC-AUTH-02:** Próba rejestracji z istniejącym adresem e-mail.
- **TC-AUTH-03:** Próba rejestracji z niepoprawnym formatem e-maila / zbyt krótkim hasłem.
- **TC-AUTH-04:** Pomyślne logowanie i przekierowanie na stronę `/generate`.
- **TC-AUTH-05:** Próba logowania z błędnym hasłem/e-mailem.
- **TC-AUTH-06:** Pomyślne wylogowanie i ochrona stron wymagających autentykacji.
- **TC-AUTH-07:** Inicjowanie procesu resetowania hasła i weryfikacja otrzymania e-maila (mock).
- **TC-AUTH-08:** Sesja użytkownika wygasa podczas aktywnego korzystania z aplikacji. Aplikacja powinna bezpiecznie przekierować do strony logowania.

### 4.2. Generowanie i Zarządzanie Fiszami (Główny przepływ)

- **TC-GEN-01:** Zalogowany użytkownik wkleja tekst, klika "Generuj" i widzi szkielety (skeleton) ładowania, a następnie listę sugestii.
- **TC-GEN-02:** Użytkownik edytuje treść sugestii, akceptuje ją i widzi zmianę statusu.
- **TC-GEN-03:** Użytkownik klika "Zapisz zaakceptowane", a fiszki pojawiają się na liście w widoku "Moje fiszki" (`/flashcards`).
- **TC-GEN-04:** Próba generowania z pustym polem tekstowym (oczekiwany błąd walidacji).
- **TC-GEN-05:** Obsługa błędu z API Openrouter.ai (wyświetlenie stosownego komunikatu użytkownikowi).
- **TC-GEN-06:** Użytkownik próbuje zapisać te same zaakceptowane sugestie dwukrotnie (np. przez podwójne kliknięcie). System nie powinien tworzyć duplikatów.
- **TC-GEN-07:** API Openrouter.ai zwraca odpowiedź w nieoczekiwanym formacie lub pustą. Frontend powinien obsłużyć taki przypadek i wyświetlić stosowny komunikat.
- **TC-CRUD-01:** Ręczne tworzenie nowej fiszki poprzez formularz.
- **TC-CRUD-02:** Edycja istniejącej fiszki i weryfikacja zapisania zmian.
- **TC-CRUD-03:** Usunięcie fiszki i weryfikacja jej zniknięcia z listy.
- **TC-CRUD-04:** Test paginacji i sortowania na liście fiszek (`/flashcards`) przy dużej liczbie rekordów (np. >20 fiszek).

### 4.3. Bezpieczeństwo

- **TC-SEC-01:** Użytkownik A (zalogowany) próbuje uzyskać dostęp do fiszki użytkownika B przez bezpośredni URL lub ID w zapytaniu API (oczekiwany błąd 403/404).
- **TC-SEC-02:** Niezalogowany użytkownik próbuje wysłać zapytanie POST do chronionego endpointa API (np. `/api/flashcards`) (oczekiwany błąd 401).
- **TC-SEC-03:** Testowanie walidacji wejściowej dla wszystkich pól formularzy pod kątem próby wstrzyknięcia złośliwego kodu (XSS), np. `<script>alert('XSS')</script>`.

### 4.4. Wydajność

- **TC-PERF-01:** Pomiar czasu generowania i wyświetlania sugestii dla bardzo długiego tekstu wejściowego przy użyciu Playwright i metryk Lighthouse.

## 5. Środowisko Testowe

- **System Operacyjny:** Windows/Linux/MacOS
- **Przeglądarki:** Chrome, Firefox, Safari (najnowsze wersje)
- **Baza Danych:** Dedykowana, odizolowana instancja projektu w Supabase przeznaczona wyłącznie do celów testowych. Baza będzie regularnie czyszczona i wypełniana zestawem danych testowych.
- **Klucze API:** Dedykowane klucze API dla Openrouter.ai z niskimi limitami użycia, przeznaczone dla środowiska testowego.

## 6. Narzędzia do Testowania

- **Główny Framework Testowy (E2E, API, Bezpieczeństwo, Wydajność):** [Playwright](https://playwright.dev/)
  - Używany do testów End-to-End, bezpośrednich wywołań API (`APIRequestContext`), testów bezpieczeństwa oraz integracji z Lighthouse do podstawowych testów wydajności.
- **Framework do testów jednostkowych i integracyjnych komponentów:** [Vitest](https://vitest.dev/) z [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - Służy do szybkiego testowania logiki biznesowej i poszczególnych komponentów React w izolacji.
- **CI/CD:** [GitHub Actions](https://github.com/features/actions) do automatycznego uruchamiania testów przy każdym pushu i pull requeście.
- **Zarządzanie Zadaniami i Błędami:** GitHub Issues.

## 7. Harmonogram Testów

- **Testy jednostkowe i integracyjne:** Pisane na bieżąco przez deweloperów w trakcie tworzenia nowych funkcjonalności.
- **Testy E2E i API:** Rozwijane równolegle z developmentem, uruchamiane automatycznie w pipeline CI/CD.
- **Faza testów regresji:** Przed każdym wydaniem produkcyjnym, pełny cykl testów automatycznych i manualnych.
- **Testy UAT (User Acceptance Testing):** Po zakończeniu developmentu danej funkcji, przed wdrożeniem na produkcję.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia

- Kod źródłowy został wdrożony na środowisko testowe.
- Wszystkie zależności i konfiguracje środowiska są gotowe.
- Plan testów i scenariusze są przygotowane i zatwierdzone.

### 8.2. Kryteria Wyjścia (Definicja Ukończenia)

- **100%** wykonanych scenariuszy testowych zdefiniowanych w planie.
- **95%** scenariuszy testowych zakończonych sukcesem (pass rate).
- **Brak krytycznych i wysokich błędów** (blocker/critical) na otwartej liście.
- Pokrycie kodu testami (code coverage) na poziomie co najmniej **80%** dla kluczowych modułów (serwisy, API).

## 9. Role i Odpowiedzialności

- **Deweloperzy:**
  - Pisanie testów jednostkowych i integracyjnych.
  - Naprawa błędów zgłoszonych przez zespół QA.
  - Utrzymanie i konfiguracja środowiska testowego.
- **Inżynier QA (Automatyzujący):**
  - Tworzenie i utrzymanie frameworka do testów E2E i API.
  - Projektowanie i implementacja scenariuszy testowych.
  - Analiza wyników testów automatycznych i raportowanie błędów.
- **Product Owner / Analityk:**
  - Udział w testach UAT.
  - Weryfikacja zgodności aplikacji z wymaganiami biznesowymi.

## 10. Procedury Raportowania Błędów

Wszystkie zidentyfikowane błędy będą raportowane jako **Issues** w repozytorium GitHub projektu. Każdy raport o błędzie musi zawierać:

- **Tytuł:** Zwięzły opis problemu.
- **Środowisko:** Wersja przeglądarki, system operacyjny.
- **Kroki do odtworzenia (Steps to Reproduce):** Szczegółowa, numerowana lista kroków.
- **Wynik oczekiwany (Expected Result):** Co powinno się wydarzyć.
- **Wynik rzeczywisty (Actual Result):** Co się wydarzyło.
- **Dowody:** Zrzuty ekranu, nagrania wideo, logi z konsoli.
- **Priorytet:** Krytyczny, Wysoki, Średni, Niski.
- **Etykiety:** np. `bug`, `frontend`, `backend`, `security`.
  </plan_testów>
