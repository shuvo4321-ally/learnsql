# LearnSQL (LuminaSQL)

An AI-powered database learning assistant. Ask questions about a database in plain English and get the answer, the generated SQL query, and a short explanation of the logic behind it.

## Features

- **Natural language to SQL** using Gemini, with the generated query shown next to the result
- **Auto-correction**: if a generated query fails, the app asks the model to fix it and retries
- **Explanations** of what each query does and why
- **Safety prompt** before destructive statements (`DROP`, `DELETE`, ...)
- **Schema browser** with inferred primary keys and `*_id` relationships
- **Results as a table or chart**, plus a history sidebar
- **Bring your own data**: upload a `.sql` script (`CREATE TABLE` / `INSERT`) or a `.csv` file, or start from a built-in sample database
- Queries run in the browser on [AlaSQL](https://github.com/AlaSQL/alasql), so nothing you upload leaves your machine except the schema and question sent to Gemini

> The "MySQL Connection" tab currently loads sample data. It does not open a real MySQL connection.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Express, Gemini (`@google/genai`), AlaSQL, Firebase, Recharts

## Getting started

Prerequisites: Node.js 18+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
cp .env.example .env      # then set GEMINI_API_KEY
npm run dev
```

Open the URL printed in the terminal.

| Script | What it does |
|---|---|
| `npm run dev` | Start the Express + Vite dev server |
| `npm run build` | Build the client and bundle the server to `dist/` |
| `npm start` | Run the production build |
| `npm run lint` | Type-check with `tsc` |

## Practice database

[`examples/university.sql`](examples/university.sql) is a small university database (teachers, courses, students, enrollments). Upload it from **Database -> Upload SQL / CSV**, then try questions like:

- "Which teacher teaches the most courses?"
- "Show the top 3 students by average grade."
- "Which students are not enrolled in any course?"