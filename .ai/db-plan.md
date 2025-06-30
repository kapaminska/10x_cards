# Database Schema: 10x-cards

## 1. Custom Types & Enums

### `flashcard_source`
Enum to track the origin of a flashcard.

```sql
CREATE TYPE public.flashcard_source AS ENUM (
  'ai-full',     -- Accepted from AI suggestion without changes
  'ai-edited',   -- Accepted from AI suggestion with user edits
  'manual'       -- Created manually by the user
);
```

---

## 2. Tables

### `users`
This table is managed by Supabase Auth.

### `flashcards`
Stores the individual flashcards created by users.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the flashcard. NOT NULL|
| `user_id` | `uuid` | `NOT NULL`, `FOREIGN KEY (auth.users.id)` | References the user who owns the flashcard. |
| `front` | `varchar(200)` | `NOT NULL` | The question or front side of the flashcard. |
| `back` | `varchar(500)` | `NOT NULL` | The answer or back side of the flashcard. |
| `source` | `flashcard_source`| `NOT NULL` | The source of the flashcard (AI or manual). |
| `generation_id`| `uuid` | `FOREIGN KEY (generations.id)` | References the AI generation session. `NULL` if `source` is 'manual'. ON DELETE SET NULL|
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Timestamp of when the flashcard was created. |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Timestamp of the last update. |

### `generations`
Logs each attempt to generate flashcards using AI.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the generation log. |
| `user_id` | `uuid` | `NOT NULL`, `FOREIGN KEY (auth.users.id)` | References the user who initiated the generation. |
| `model` | `varchar(100)` | `NOT NULL` | The name of the LLM used for generation. |
| `source_text_hash`| `bytea` | `NOT NULL` | SHA-256 hash of the source text to prevent duplicates and save space. |
| `source_text_length`| `integer` | `NOT NULL`, `CHECK (source_text_length BETWEEN 1000 AND 10000)` | Character count of the original source text. |
| `generation_duration_` | `integer` | `NOT NULL` | Time taken for the LLM API to respond. |
| `suggestions_count` | `integer` | `NOT NULL`, `CHECK (suggestions_count >= 0)` | Total number of flashcards suggested by the AI. |
| `accepted_unedited_count`| `integer` | `NULLABLE`, `CHECK (accepted_unedited_count >= 0)` | Count of suggestions accepted without edits. |
| `accepted_edited_count` | `integer` | `NULLABLE`, `CHECK (accepted_edited_count >= 0)` | Count of suggestions accepted with edits. |
| `rejected_count` | `integer` | `NULLABLE`, `CHECK (rejected_count >= 0)` | Count of suggestions rejected by the user. |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Timestamp of when the generation was initiated. |
| **Unique Constraint** | | `UNIQUE (user_id, source_text_hash)` | A user cannot generate from the exact same text twice. |


### `generation_error_logs`
Logs any errors that occur during the AI generation process.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the error log. |
| `user_id` | `uuid` | `FOREIGN KEY (auth.users.id)` | The user who experienced the error. Anonymized on user deletion. |
| `error_message` | `text` | `NOT NULL` | The error message from the system or API. |
| `error_context` | `jsonb` | | Additional context for debugging (e.g., model name, partial response). |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` | Timestamp of when the error occurred. |
| `model` | `varchar(100)` | `NOT NULL` | The name of the LLM that caused the error. |
| `source_text_hash`| `bytea` | `NOT NULL` | SHA-256 hash of the source text to prevent duplicates and save space. |
| `source_text_length`| `integer` | `NOT NULL`, `CHECK (source_text_length BETWEEN 1000 AND 10000)` | Character count of the original source text. |

---

## 3. Relationships & Foreign Key Policies

| Table | Foreign Key | References | On Delete |
|---|---|---|---|
| `flashcards` | `user_id` | `auth.users(id)` | `CASCADE` |
| `flashcards` | `generation_id` | `generations(id)` | `SET NULL` |
| `generations` | `user_id` | `auth.users(id)` | `CASCADE` |
| `generation_error_logs` | `user_id` | `auth.users(id)` | `SET NULL` |

---

## 4. Indexes

| Table | Column(s) | Notes |
|---|---|---|
| `flashcards` | `user_id` | Speeds up fetching all flashcards for a user. |
| `flashcards` | `generation_id` | Speeds up finding flashcards from a specific generation. |
| `generations` | `user_id` | Speeds up fetching generation history for a user. |
| `generations` | `source_text_hash` | Part of the unique constraint, speeds up duplicate checks. |
| `generation_error_logs` | `user_id` | Speeds up queries on user-specific errors. |

---

## 5. Row-Level Security (RLS)

RLS will be enabled on all tables to ensure users can only access their own data.

### `flashcards` Table Policy
```sql
-- Enable RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Allow users full access to their own flashcards
CREATE POLICY "Allow full access to own flashcards"
ON public.flashcards
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### `generations` Table Policy
```sql
-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Allow users full access to their own generation history
CREATE POLICY "Allow full access to own generation history"
ON public.generations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### `generation_error_logs` Table Policy
```sql
-- Enable RLS
ALTER TABLE public.generation_error_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own error logs
CREATE POLICY "Allow select access to own error logs"
ON public.generation_error_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Note: INSERTs will be handled by a backend role with elevated privileges.
```

---

## 6. Additional Considerations & Functions

### Auto-updating `updated_at` Column
A trigger will be created to automatically update the `updated_at` column in the `flashcards` table whenever a row is modified.

```sql
-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger
CREATE TRIGGER on_flashcard_update
BEFORE UPDATE ON public.flashcards
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
```

### Spaced Repetition Algorithm
The current schema does not include fields for a spaced repetition algorithm (e.g., `due_date`, `interval`, `ease_factor`). These will be added in a future migration once a specific algorithm (like FSRS or SM-2) is chosen. The `flashcards` table is designed to be easily extendable for this purpose. 