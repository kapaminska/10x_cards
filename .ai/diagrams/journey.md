stateDiagram-v2
direction LR

    [*] --> Niezalogowany

    Niezalogowany --> Logowanie: "Chcę się zalogować"
    Niezalogowany --> Rejestracja: "Chcę się zarejestrować"
    Niezalogowany --> ResetHasla: "Zapomniałem hasła"

    state Logowanie {
       [*] --> FormularzLogowania
       FormularzLogowania --> WeryfikacjaLogowania <<choice>>
       WeryfikacjaLogowania --> Zalogowany: Poprawne dane
       WeryfikacjaLogowania --> FormularzLogowania: Błędne dane
    }

    state Rejestracja {
        [*] --> FormularzRejestracji
        FormularzRejestracji --> WeryfikacjaRejestracji <<choice>>
        WeryfikacjaRejestracji --> Zalogowany: Rejestracja udana
        WeryfikacjaRejestracji --> FormularzRejestracji: Błąd
    }

    state ResetHasla {
        [*] --> FormularzEmail
        FormularzEmail --> WysłanoLink: Podano e-mail
        WysłanoLink --> Niezalogowany: Użytkownik wraca do logowania
    }

    Zalogowany: Użytkownik w aplikacji
    note right of Zalogowany
        - Dostęp do chronionych stron
        - Widzi opcję "Wyloguj"
    end note

    Zalogowany --> Niezalogowany: Wylogowanie
