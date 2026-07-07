# StudyBee

A school app built for students — schedule, grades, and study support in one place.
Built on the Vercel Next.js admin dashboard template's UI (sidebar, breadcrumbs, shadcn/ui
components), with the ecommerce/Postgres/auth backend swapped out for StudyBee's own
features.

## Setup

```
npm install
npm run dev
```

Then open http://localhost:3000. No database or environment variables are required —
data is stored in your browser's localStorage, and the app comes pre-loaded with sample
classes, schedule, grades, and notes so you can see it working immediately.

## What's included

- **Home** — greeting, today's schedule, "don't forget" reminders (what to bring, pulled
  from today's events), upcoming tasks, and your classes.
- **Schedule** — weekly timetable with day tabs; add classes, clubs, sports, meetings, or
  events, each with optional "what to bring" items.
- **Grades** — log tests/quizzes/homework/projects per class, see per-class and overall
  averages.
- **Study** — three tools:
  - *Homework feedback*: paste a written response, get structural feedback (detail,
    reasoning language, sentence variety).
  - *Study guide generator*: builds key terms, a summary, and review questions from your
    class notes for a given unit.
  - *Import content*: paste text (e.g. from Google Docs/Slides) and summarize it into
    key points you can save straight into Notes.
- **Notes** — searchable, filterable notebook organized by class and unit.

## Data & the "AI" features

Everything is local — there's no backend. The Study tools in `lib/study-ai.ts` use
lightweight text-analysis heuristics (keyword frequency, sentence structure checks) so
they work with zero configuration.

If you want real LLM-generated feedback and study guides instead, that file is the only
place you need to touch: replace the body of `getHomeworkFeedback`,
`generateStudyGuide`, and `summarizeImportedContent` with a call to an API route that
hits the Anthropic API (or any model provider) with the same input, and return its
response in the same shape.

## Structure

```
app/(dashboard)/       Pages: Home, Schedule, Grades, Study, Notes
components/            Forms (dialogs) + shared UI + shadcn primitives
lib/types.ts           Data model
lib/constants.ts       Colors, weekdays, type labels
lib/seed-data.ts       First-run sample data
lib/store.tsx          React context + localStorage-backed CRUD (Classes/Events/Grades/Notes/Tasks)
lib/study-ai.ts        Homework feedback / study guide / import summarization logic
```
