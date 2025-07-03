# REST API Plan

## 1. Resources

- **Users**: Represents the user. Managed by Supabase Auth.
- **Flashcards**: Represents the user-created flashcards. Corresponds to the `flashcards` table.
- **Generations**: Represents the process of generating flashcard suggestions from a source text using an AI model. Corresponds to the `generations` table.
- **GenerationErrorLogs**: Represents logs for errors that occurred during the AI generation process. Corresponds to the `generation_error_logs` table.

---

## 2. Endpoints

All endpoints are prefixed with `/api`.

### 2.1. Flashcards

#### **`GET /flashcards`**
- **Description**: Retrieves a paginated list of the authenticated user's flashcards.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `limit` (number, optional, default: 20): The number of items per page.
  - `sort` (string, optional, default: 'created_at'): Field to sort by.
  - `order` (string, optional, default: 'desc'): Sort order ('asc' or 'desc').
  - `generationId` (string, optional): Filter flashcards that belong to a specific generation.
  - `source` (string, optional): Filter flashcards by their `source` ('manual', 'ai-full', 'ai-edited').
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "c3a4b1d2-...",
        "front": "What is REST?",
        "back": "Representational State Transfer.",
        "source": "manual",
        "createdAt": "2024-10-26T10:00:00Z",
        "updatedAt": "2024-10-26T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.

---

#### **`POST /flashcards`**
- **Description**: Creates one or more flashcards for the authenticated user. Handles two distinct cases:
  1.  **Manual Creation**: The request body is a single object for one flashcard. The `source` is implicitly 'manual' if omitted.
  2.  **AI-Generated Batch Creation**: The request body is an object containing the `generationId` and arrays of accepted/rejected cards, conforming to the `CreateFlashcardsBatchCommand` type.
- **Request Body (Manual - Single)**:
  ```json
  {
    "front": "What is Astro?",
    "back": "A web framework for building content-driven websites."
  }
  ```
- **Request Body (AI-Generated - Batch)**:
  ```json
  {
    "generationId": "a1b2c3d4-e5f6-4a3b-8c7d-1e2f3a4b5c6d",
    "acceptedCards": [
      { "front": "Card 1 Front", "back": "Card 1 Back", "source": "ai-full" },
      { "front": "Edited Card 2 Front", "back": "Card 2 Back", "source": "ai-edited" }
    ],
    "rejectedCount": 3
  }
  ```
- **Success Response (201 Created)**:
  - Returns an object containing an array of the newly created flashcard(s).
  ```json
  {
    "flashcards": [
      {
        "id": "c3a4b1d2-1111-2222-3333-444444444444",
        "front": "Card 1 Front",
        "back": "Card 1 Back",
        "source": "ai-full",
        "generationId": "a1b2c3d4-e5f6-4a3b-8c7d-1e2f3a4b5c6d",
        "createdAt": "2024-10-26T10:05:00Z",
        "updatedAt": "2024-10-26T10:05:00Z"
      },
      {
        "id": "d4e5f6a7-5555-6666-7777-888888888888",
        "front": "Edited Card 2 Front",
        "back": "Card 2 Back",
        "source": "ai-edited",
        "generationId": "a1b2c3d4-e5f6-4a3b-8c7d-1e2f3a4b5c6d",
        "createdAt": "2024-10-26T10:05:00Z",
        "updatedAt": "2024-10-26T10:05:00Z"
      }
    ]
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If validation fails (e.g., missing fields, fields too long).
  - `401 Unauthorized`: If the user is not authenticated.
  - `404 Not Found`: If `generationId` is provided but does not exist or does not belong to the user.
  - `429 Too Many Requests`: If the user has exceeded their daily flashcard creation limit.
- ** Validation**:
  - `front`: Required, string, max 200 characters.
  - `back`: Required, string, max 500 characters.
  - `source`: Optional. If provided for manual creation, must be 'manual'. Required for cards in a batch, must be 'ai-full' or 'ai-edited'. Defaults to 'manual' on backend if omitted.
  - `generationId`: Required for 'ai-full' and 'ai-edited' sources (via the batch endpoint), must be omitted or null for 'manual' source.

---

#### **`GET /flashcards/:id`**
- **Description**: Retrieves a single flashcard by its ID.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "c3a4b1d2-...",
    "front": "What is REST?",
    "back": "Representational State Transfer.",
    "source": "manual",
    "createdAt": "2024-10-26T10:00:00Z",
    "updatedAt": "2024-10-26T10:00:00Z",
    "generation_id": null
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user does not own the flashcard.
  - `404 Not Found`: If the flashcard does not exist.

---

#### **`PUT /flashcards/:id`**
- **Description**: Updates an existing flashcard.
- **Request Body**: Fields to update.
  ```json
  {
    "front": "What is a RESTful API?",
    "back": "An API that conforms to the constraints of REST architectural style."
  }
  ```
- **Success Response (200 OK)**:
  - Returns the updated flashcard object.
- **Error Responses**:
  - `400 Bad Request`: If validation fails.
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user does not own the flashcard.
  - `404 Not Found`: If the flashcard does not exist.
- ** Validation**:
  - `front`: string, max 200 characters.
  - `back`: string, max 500 characters.
  - `source`: string, must be 'manual' or 'ai-edited'.

---

#### **`DELETE /flashcards/:id`**
- **Description**: Deletes a flashcard by its ID.
- **Success Response (204 No Content)**:
  - An empty body is returned on successful deletion.
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user does not own the flashcard.
  - `404 Not Found`: If the flashcard does not exist.

---

### 2.2. Generations

#### **`POST /generations`**
- **Description**: Initiates an AI flashcard generation process. Sends source text to the backend, which communicates with the LLM and returns a list of suggestions. This action creates a `generations` log entry.
- **Business Logic**:
  - The `sourceText` is hashed for storage purposes.
  - The `sourceText` is checked against the `source_text_length` constraint on the `generations` table to ensure it is between 1000 and 10000 characters.
  - Calls the LLM API to generate flashcard suggestions.
  - Store the generation metadata and the associate generated proposal cards.
- **Request Body**:
  ```json
  {
    "sourceText": "A long piece of text about a topic, between 1,000 and 10,000 characters..."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "generationId": "a1b2c3d4-...",
    "flashcardsSuggestions": [
      {
        "front": "Suggested Question 1?",
        "back": "Suggested Answer 1.",
        "source": "ai-full"
      },
      {
        "front": "Suggested Question 2?",
        "back": "Suggested Answer 2.",
        "source": "ai-full"
      }
    ],
    "generationCount": 2
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If `sourceText` validation fails (e.g., too short/long).
  - `401 Unauthorized`: If the user is not authenticated.
  - `429 Too Many Requests`: If the user has exceeded their rate limit for generations.
  - `500 AI Service Error`: For issues with the external LLM API. Logs recorded in the `generation_error_logs` table.
  - `502 Bad Gateway`: If the external LLM API returns an error.

---

#### **`GET /generations`**
- **Description**: Retrieves a paginated list of the authenticated user's generation logs.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `limit` (number, optional, default: 20): The number of items per page.
  - `sort` (string, optional, default: 'created_at'): Field to sort by.
  - `order` (string, optional, default: 'desc'): Sort order ('asc' or 'desc').
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "a1b2c3d4-...",
        "model": "gpt-4o",
        "sourceTextLength": 4500,
        "suggestionsCount": 20,
        "acceptedUneditedCount": 10,
        "acceptedEditedCount": 5,
        "rejectedCount": 5,
        "generationDurationMs": 9500,
        "createdAt": "2024-10-26T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.

---

#### **`GET /generations/:id`**
- **Description**: Retrieves details of a specific generation log.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "a1b2c3d4-...",
    "model": "gpt-4o",
    "sourceTextLength": 4500,
    "suggestionsCount": 20,
    "acceptedUneditedCount": 10,
    "acceptedEditedCount": 5,
    "rejectedCount": 5,
    "generationDurationMs": 9500,
    "createdAt": "2024-10-26T10:00:00Z"
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user does not own the generation log.
  - `404 Not Found`: If the generation log does not exist.

---

#### **`GET /generations/stats`**
- **Description**: Returns aggregated statistics across all generation logs for the authenticated user.
- **Query Parameters**:
  - `period` (string, optional, default: 'overall'): Aggregation period ('overall', 'daily', 'monthly').
- **Success Response (200 OK)**:
  ```json
  {
    "totalGenerations": 12,
    "totalSuggestions": 240,
    "acceptedUnedited": 120,
    "acceptedEdited": 60,
    "rejected": 60,
    "acceptanceRate": 0.75
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.

---

### 2.3. Generation Error Logs

#### **`GET /generation-error-logs`**
- **Description**: Retrieves a paginated list of the authenticated user's generation errors.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `limit` (number, optional, default: 20): The number of items per page.
  - `sort` (string, optional, default: 'created_at'): Field to sort by.
  - `order` (string, optional, default: 'desc'): Sort order ('asc' or 'desc').
- **Success Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "f1a2b3c4-...",
        "errorMessage": "The model could not be reached.",
        "errorContext": { "details": "Upstream API timeout" },
        "createdAt": "2024-10-27T11:00:00Z",
        "model": "gpt-4",
        "sourceTextLength": 4500
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.

---

#### **`GET /generation-error-logs/:id`**
- **Description**: Retrieves details of a specific generation error log.
- **Success Response (200 OK)**:
  ```json
  {
    "id": "f1a2b3c4-...",
    "errorMessage": "The model could not be reached.",
    "errorContext": { "details": "Upstream API timeout" },
    "createdAt": "2024-10-27T11:00:00Z",
    "model": "gpt-4",
    "sourceTextLength": 4500
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If the user is not authenticated.
  - `403 Forbidden`: If the user does not own the error log.
  - `404 Not Found`: If the error log does not exist.

---

## 3. Authentication and Authorization

- **Authentication**: Authentication will be handled via JSON Web Tokens (JWT) provided by Supabase Auth. The client must include the JWT in the `Authorization` header with every request to protected endpoints.
  - **Header Format**: `Authorization: Bearer <SUPABASE_JWT>`
- **Authorization**: Authorization is enforced at the database level using PostgreSQL Row-Level Security (RLS), as defined in the database plan. API business logic will rely on RLS to ensure that users can only access or modify their own data. Any attempt to access another user's data will result in a `403 Forbidden` or `404 Not Found` response.
- **CORS**: Requests are accepted only from whitelisted front-end origins (e.g., `https://app.10x-cards.com`). Pre-flight `OPTIONS` responses include appropriate `Access-Control-Allow-*` headers.
- **CSRF Protection**: All state-changing requests require the `Authorization` header. If cookies are used, a double-submit CSRF token will be issued to prevent CSRF attacks.
- **Account Deletion**: Deleting a user through Supabase Auth cascades to related records (`flashcards`, `generations`, `generation_error_logs`) via `ON DELETE CASCADE`, ensuring privacy compliance.

---

## 4. Validation and Business Logic

### 4.1. Validation
Input validation will be performed on the server-side for all `POST` and `PATCH` requests to prevent invalid data from being processed.

- **`POST /flashcards` (Manual)**:
  - `front`: Required, string, max 200 characters.
  - `back`: Required, string, max 500 characters.
  - `source`: Required, must be 'manual'.
- **`POST /flashcards` (Batch)**:
  - `generationId`: Required, UUID format.
  - `acceptedCards`: Required, array of objects.
    - `front`: Required, string, max 200 characters.
    - `back`: Required, string, max 500 characters.
    - `source`: Required, must be 'ai-full' or 'ai-edited'.
  - `rejectedCount`: Required, integer, >= 0.
- **`PATCH /flashcards/:id`**:
  - `front`: Optional, string, max 200 characters.
  - `back`: Optional, string, max 500 characters.
- **`POST /generations`**:
  - `sourceText`: Required, string, length between 1000 and 10000 characters.

## 4. Validation and Business Logic

### 4.1. Validation
Input validation will be performed on the server-side for all `POST` and `PATCH` requests to prevent invalid data from being processed.

- **`POST /flashcards` (Manual)**:
  - `front`: Required, string, max 200 characters.
  - `back`: Required, string, max 500 characters.
  - `source`: Required, must be 'manual'.
- **`POST /flashcards` (Batch)**:
  - `generationId`: Required, UUID format.
  - `acceptedCards`: Required, array of objects.
    - `front`: Required, string, max 200 characters.
    - `back`: Required, string, max 500 characters.
    - `source`: Required, must be 'ai-full' or 'ai-edited'.
  - `rejectedCount`: Required, integer, >= 0.
- **`PATCH /flashcards/:id`**:
  - `front`: Optional, string, max 200 characters.
  - `back`: Optional, string, max 500 characters.
- **`POST /generations`**:
  - `sourceText`: Required, string, length between 1000 and 10000 characters.

### 4.2. Business Logic Implementation
- **AI Generation Statistics**: The `POST /flashcards` endpoint (when used for batch creation) is responsible for updating the `generations` table. It will use the provided `generationId` to find the corresponding record and update the `accepted_unedited_count`, `accepted_edited_count`, and `rejected_count` fields in a single transaction.
- **Rate Limiting**:  
  - `POST /generations` – Limited to prevent excessive LLM usage (e.g., 15 requests per hour).  
  - `POST /flashcards` – Capped at 100 newly created flashcards per user per day (manual + batch). Exceeding this limit returns `429 Too Many Requests`.
- **Error Logging**: The backend logic for `POST /generations` will automatically create an entry in the `generation_error_logs` table if the external LLM API returns an error or the process fails. These logs can be retrieved by the user via the `GET /generation-error-logs` endpoint.
- **Generation Statistics Endpoint**: The `GET /generations/stats` endpoint calculates aggregated acceptance metrics on demand using data from the `generations` table.

### 4.3. Implementation Approach
The current implementation prioritizes simplicity and maintainability over complex database operations:

- **Database Operations**: Uses standard Supabase client operations (`insert()`, `update()`) rather than PostgreSQL RPC functions
- **Transaction Handling**: While not using database-level transactions, the implementation handles errors gracefully and logs any issues with stats updates
- **Error Handling**: Comprehensive error handling with proper HTTP status codes and detailed logging
- **Validation**: Uses Zod schemas for robust input validation with custom refinements for business logic rules

This approach makes the code easier to debug, test, and maintain while still providing the necessary functionality. Future iterations may introduce more sophisticated database operations as the application scales. 