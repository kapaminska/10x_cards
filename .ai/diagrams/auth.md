sequenceDiagram
    autonumber

    participant Browser
    participant Middleware
    participant Astro API
    participant Supabase Auth

    Note over Browser, Supabase Auth: Przepływ logowania użytkownika

    Browser->>Astro API: POST /api/auth/login (email, password)
    activate Astro API
    Astro API->>Supabase Auth: signInWithPassword(credentials)
    activate Supabase Auth
    Supabase Auth-->>Astro API: Sesja (access & refresh token)
    deactivate Supabase Auth
    Astro API-->>Browser: Odpowiedź (Set-Cookie z tokenami)
    deactivate Astro API
    Browser->>Browser: Przekierowanie do /generate

    Note over Browser, Supabase Auth: Dostęp do chronionej strony

    Browser->>Middleware: GET /flashcards (z ciasteczkami sesyjnymi)
    activate Middleware
    Middleware->>Supabase Auth: getSession() (z tokenem z ciasteczka)
    activate Supabase Auth
    alt Sesja jest ważna
        Supabase Auth-->>Middleware: Zwraca dane sesji
        Middleware-->>Browser: Renderuje stronę /flashcards
    else Sesja wygasła lub nieprawidłowa
        Supabase Auth-->>Middleware: Zwraca null
        Middleware-->>Browser: Przekierowanie 302 do /login
    end
    deactivate Supabase Auth
    deactivate Middleware

    Note over Browser, Supabase Auth: Automatyczne odświeżanie tokenu

    Browser->>Middleware: GET /... (z tokenem bliskim wygaśnięcia)
    activate Middleware
    Middleware->>Supabase Auth: getSession()
    activate Supabase Auth
    Supabase Auth->>Supabase Auth: Wykryto token do odświeżenia
    Supabase Auth-->>Middleware: Zwraca sesję z nowymi tokenami
    deactivate Supabase Auth
    Middleware-->>Browser: Renderuje stronę (Set-Cookie z nowymi tokenami)
    deactivate Middleware


    Note over Browser, Supabase Auth: Przepływ wylogowania

    Browser->>Astro API: POST /api/auth/logout
    activate Astro API
    Astro API->>Supabase Auth: signOut()
    activate Supabase Auth
    Supabase Auth-->>Astro API: Sesja unieważniona
    deactivate Supabase Auth
    Astro API-->>Browser: Odpowiedź (Clear-Cookie) i przekierowanie
    deactivate Astro API 