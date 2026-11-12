# Dev Toolbox

## Purpose
Developer tools that run entirely in the browser: a timestamp converter, a JSON
formatter, a JWT decoder and the like. Nothing typed into a tool leaves the
page: no request carries user input, and no third-party script, font or image
is loaded. A finished change adds or improves one tool, with its logic covered
by unit tests.

## Stack
- Runtime: Node.js 24, the version of the CI and of Vercel, pinned in `.nvmrc`
  and in `package.json` (`"engines": { "node": "24.x" }`).
- Package manager: npm. `package-lock.json` is committed: install with `npm ci`,
  never `npm install`, which rewrites it. Adding, removing or upgrading a
  dependency is a change of its own, with its own issue.
- Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript in
  strict mode, Tailwind CSS 4, ESLint with `eslint-config-next`, Vitest with
  React Testing Library and jsdom.
- Fonts come from the `geist` package and ship with the page. Never
  `next/font/google`: it fetches from Google at build time.
- Next.js has changed since your training data. When `node_modules/` is
  installed, read the matching guide in `node_modules/next/dist/docs/` before
  writing Next.js code: it documents the installed version and reads offline.
  Heed its deprecation notices.

## Layout
| Path | What lives there |
|---|---|
| `app/page.tsx` | the home page: the list of tools, read from `lib/tools.ts` |
| `app/tools/<slug>/page.tsx` | one route per tool |
| `components/` | React components shared between tools |
| `lib/tools.ts` | the registry: one entry per tool, in the order the home page lists them |
| `lib/<slug>/` | a tool's logic and its tests: pure functions, without React or browser APIs |
| `public/` | static files, served as they are |

Adding a tool takes three pieces, in one pull request: its logic and tests in `lib/<slug>/`, its page in `app/tools/<slug>/`, and its entry in `lib/tools.ts`.
`lib/tools.test.ts` checks that every entry has a page.

## Commands
From the repository root. The CI runs the same commands: a change is done when
they pass there.

| Step | Command |
|---|---|
| Install | `npm ci` |
| Build | `npm run build` — `next build`, which also checks the types and prerenders every page |
| Test | `npm test` — `vitest run`: once, without watching |
| Lint | `npm run lint` — `eslint`; `next lint` no longer exists, and `next build` no longer lints |
| Run locally | `npm run dev` — never needed to publish; stop it before you finish |

The CI runs install first, then build; tests and lint still run when the build fails, as long as install succeeded.
`next build` also type-checks test files: a test that does not compile breaks
the build.

## Conventions
- A tool's logic lives in `lib/<slug>/<slug>.ts` as pure functions, tested in `lib/<slug>/<slug>.test.ts`: valid input, edge cases, invalid input. When it grows, split it by subject inside `lib/<slug>/`, each file with its own test. The page only wires them to the form.
- Invalid input shows a message on the page; a tool never throws at the user.
- The interface speaks French. Code, identifiers and file names are in English.
- In French JSX text, the apostrophe is the typographic one (’): the straight
  apostrophe makes the `react/no-unescaped-entities` rule fail.
- No network: no `fetch` of what the user typed, no analytics, no external
  script, font or image. Everything a tool needs ships with the page.
- Server Components by default. `'use client'` only where state, effects or
  browser APIs are needed, as low in the tree as possible.
- Cache Components is on, so every page is prerendered at build time. Never
  read the clock or randomness during render, not even in a Client Component
  (`Date.now()`, `new Date()`, `Math.random()`, `crypto.randomUUID()`): read
  them in an event handler or a `useEffect`. Otherwise `next build` fails.
- Request APIs are asynchronous: `await` `params`, `searchParams`, `cookies()`,
  `headers()`.
- `proxy.ts`, not `middleware.ts`. Images through `next/image`, from `public/`
  only.
- Tailwind is configured in CSS, in `app/globals.css`: there is no
  `tailwind.config.js`.
- Imports from the repository root use the `@/` alias.
- Tests sit next to what they test: `<name>.test.ts(x)`. Vitest cannot render an
  async Server Component: test the functions it calls.
- Assertions use Vitest matchers: `@testing-library/jest-dom` is not installed,
  so neither `toHaveValue` nor `toBeInTheDocument` is available; read `.value`
  or `.textContent` instead.
- `vitest.config.mts` keeps `globals: true`: without it, Testing Library does
  not clean up the DOM between tests.
- `next.config.ts` keeps `agentRules: false`: this file, not `next dev`, says how
  to work here.

## Verifying a change
- The home page lists every tool of `lib/tools.ts`, each linking to its page.
- Each tool page renders, turns a valid input into the expected output, and
  shows a French message for invalid input instead of failing.
- `npm test` covers the tool's functions: valid input, edge cases, invalid input.

## Do not touch
- Generated, never edited by hand, never committed: `.next/`, `node_modules/`,
  `next-env.d.ts`, `*.tsbuildinfo`.
- Never committed: any `.env*` file but `.env.example`; `.vercel/`.
- `package-lock.json` is written by npm only.

## Environment variables
None: the project reads no environment variable, and the build and the tests
need none. Adding one is a change of its own: its value would live in the
Vercel project, never in the repository, and `.env.example` would list its name
with an empty value.

## Deployment
Vercel. The branch `production` is the production deployment; every other
branch and every pull request gets a preview deployment. `production` moves only
when the owner merges `main` into it.
