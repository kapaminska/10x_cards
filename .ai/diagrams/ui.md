flowchart TD
    subgraph "Aplikacja (Przeglądarka)"
        direction LR
        subgraph "Strony Publiczne"
            direction TB
            LoginPage["Strona /login"]
            RegisterPage["Strona /register"]
            ResetPasswordPage["Strona /reset-password"]
        end

        subgraph "Komponenty UI (React)"
            direction TB
            LoginForm["Komponent LoginForm.tsx"]
            RegisterForm["Komponent RegisterForm.tsx"]
            ResetPasswordForm["Komponent ResetPasswordForm.tsx"]
        end
        
        subgraph "Chronione Strony Użytkownika"
            direction TB
            GeneratePage["Strona /generate"]
            FlashcardsPage["Strona /flashcards"]
        end

        LoginPage -- renderuje --> LoginForm
        RegisterPage -- renderuje --> RegisterForm
        ResetPasswordPage -- renderuje --> ResetPasswordForm
    end

    subgraph "Infrastruktura Astro (Serwer)"
        direction LR
        subgraph "Middleware i Layout"
            Middleware["Middleware (index.ts)<br/>Zarządzanie sesją"]
            Layout["Layout.astro<br/>Sprawdza sesję, renderuje Topbar"]:::updated
            Topbar["Komponent Topbar<br/>(wcześniej NavigationMenu)"]:::updated
        end

        subgraph "API Endpoints (/api/auth)"
            ApiLogin["POST /api/auth/login"]
            ApiRegister["POST /api/auth/register"]
            ApiLogout["POST /api/auth/logout"]
            ApiReset["POST /api/auth/reset-password"]
        end

        subgraph "Współdzielone Zasoby"
            AuthSchemas["Schemy Zod (auth.schema.ts)<br/>Wspólna walidacja"]
        end

        Middleware --> Layout
        Layout --> Topbar
    end

    subgraph "Usługi Zewnętrzne"
        SupabaseAuth["Supabase Auth<br/>Baza użytkowników, E-maile"]
    end

    %% Przepływy danych
    User(Użytkownik)

    User -- "Nawiguje do /login" --> LoginPage
    User -- "Wypełnia formularz" --> LoginForm
    LoginForm -- "POST z danymi<br/>(email, hasło)" --> ApiLogin
    
    User -- "Nawiguje do /register" --> RegisterPage
    User -- "Wypełnia formularz" --> RegisterForm
    RegisterForm -- "POST z danymi" --> ApiRegister

    ApiLogin -- "Walidacja" --> AuthSchemas
    ApiRegister -- "Walidacja" --> AuthSchemas

    ApiLogin -- "signInWithPassword()" --> SupabaseAuth
    ApiRegister -- "signUp()" --> SupabaseAuth
    ApiReset -- "resetPasswordForEmail()" --> SupabaseAuth
    ApiLogout -- "signOut()" --> SupabaseAuth

    SupabaseAuth -- "Ustawia cookies sesyjne" --> User
    
    User -- "Próba dostępu<br/>do /generate" --> Middleware
    Middleware -- "Sprawdza cookies" --> SupabaseAuth
    Middleware -- "Brak sesji? Przekieruj<br/>do /login" --> LoginPage
    Middleware -- "Jest sesja? Renderuj" --> GeneratePage
    
    Layout -- "Odczytuje Astro.locals.session<br/>(dostarczone przez Middleware)" --> Topbar
    Topbar -- "Użytkownik zalogowany" --> DisplayLogout["Wyświetl 'Wyloguj' i linki"]
    Topbar -- "Użytkownik niezalogowany" --> DisplayLogin["Wyświetl 'Zaloguj się'"]

    classDef updated fill:#ffe_6,stroke:#333,stroke-width:2px; 