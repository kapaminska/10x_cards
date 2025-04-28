# 10x-cards

## Description

10x-cards is a flashcard generation and management application designed to streamline the creation of high-quality educational flashcards. The project leverages AI models to automatically generate flashcard suggestions from user-provided text while also offering functionalities for manual flashcard creation, editing, and deletion. This facilitates an efficient learning process based on spaced repetition.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication)
- **AI Integration:** Openrouter.ai for LLM interactions
- **CI/CD and Hosting:** GitHub Actions and DigitalOcean

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the project directory:**
   ```bash
   cd 10x_cards
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Ensure you are using the correct Node.js version:**
   If you have nvm installed, run:
   ```bash
   nvm use
   ```
5. **Run the development server:**
   ```bash
   npm run dev
   ```
6. **Build and preview:**
   - To build the project:
     ```bash
     npm run build
     ```
   - To preview the production build:
     ```bash
     npm run preview
     ```

## Available Scripts

- **dev:** `astro dev` - Starts the development server.
- **build:** `astro build` - Builds the project for production.
- **preview:** `astro preview` - Previews the production build.
- **astro:** `astro` - CLI command for Astro.
- **lint:** `eslint .` - Runs the linter.
- **lint:fix:** `eslint . --fix` - Runs the linter and fixes issues.
- **format:** `prettier --write .` - Formats the codebase.

## Project Scope

The project aims to provide:

- **Automatic Flashcard Generation:** Generate flashcard suggestions using AI models by processing user-provided text.
- **Manual Flashcard Management:** Create, edit, and delete flashcards manually.
- **User Authentication:** Secure user registration, login, and account management.
- **Spaced Repetition:** Integration of a spaced repetition algorithm for effective learning sessions.
- **Analytics:** Collection of data on generated and accepted flashcards for performance tracking.

## Project Status

The project is currently in its MVP stage with core features under active development. Future releases will bring additional enhancements and new features.

## License

This project is licensed under the MIT License.

## Table of Contents

- [10x-cards](#10x-cards)
  - [Description](#description)
  - [Tech Stack](#tech-stack)
  - [Getting Started Locally](#getting-started-locally)
  - [Available Scripts](#available-scripts)
  - [Project Scope](#project-scope)
  - [Project Status](#project-status)
  - [License](#license)
