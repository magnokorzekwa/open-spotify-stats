# Contributing to Open Spotify Stats

First off, thanks for taking the time to contribute! People like you make the open-source community such an amazing place to learn, inspire, and create.

## ⚡ Quick Guide

1.  **Fork** the repository.
2.  **Clone** the project to your machine.
3.  **Create a Branch** for your modification.
4.  **Code** following our standards.
5.  **Test** your changes.
6.  **Open a Pull Request**.

## 🛠️ Environment Setup

The project uses **Node.js** and **npm**. Make sure you have the latest LTS version installed.

1. Install dependencies:

    npm install

2. Run the development server:

    npm run dev

3. Run tests to ensure everything is working:

    npm run test

## 📏 Code Standards (Important)

To maintain project quality and consistency, we follow strict rules:

### 1. TypeScript & Vue 3
* We use **Composition API** with `<script setup lang="ts">`.
* **Do not use `any`**. Strict typing is mandatory. Create interfaces or types in `src/types/` if necessary.
* Use `const` whenever possible.

### 2. Clean Code & Comments
* **Self-Explanatory Code:** We believe code should be readable on its own.
* **Zero Comments:** Do not leave comments in the code (e.g., `// function that sums`). If you need to explain what the code does, refactor the code to make it clearer (name variables and functions better).
* Comments are allowed only in extreme cases of algorithmic complexity or JSDoc for libraries.

### 3. Web Workers
* All heavy data processing must occur within Workers. Do not block the main thread (UI).

### 4. Tests
* If you created a new logical feature, **create a unit test** (Vitest).
* If you fixed a bug, create a test that reproduces the bug and proves it has been fixed.

## 🌿 Git Flow

* **Branches:** Use clear prefixes.
    * `feature/new-analysis`
    * `fix/timezone-calc`
    * `docs/update-readme`
* **Commits:** Be direct and use the imperative mood.
    * Good: `Add timezone support to worker`
    * Bad: `fixed the timezone error`

## ⚖️ License

By contributing, you agree that your contributions will be licensed under its **GNU General Public License v3.0**.