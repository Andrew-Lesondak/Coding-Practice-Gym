# Coding Practice Gym

A React + TypeScript based app for guided coding practice. The experience centers on guided completion, spaced repetition, and a fast feedback loop.

## Learning loop (Explain it back)

After you pass a problem, the app prompts you to explain:

- Pattern used
- Why it works (2–4 sentences)
- Time/space complexity

This explanation is stored per problem and shown during reviews. After a re-solve, you can compare your previous explanation to the new one and update it if it improved.

## System Design Gym

The System Design Gym mirrors the DSA learning loop with rubric-based self-evaluation. Prompts live in `src/data/systemDesignPrompts.ts` and are merged with local overlay packs at runtime.

### Guided design stub format

```md
## Step 1: Requirements and scope
[TEMPLATE_START step=1]
- Functional requirements:
  - TODO:
[TEMPLATE_END step=1]
```

Step headers must be sequential and every step needs a matching `TEMPLATE_START`/`TEMPLATE_END` region.

### Rubric scoring

Rubric items count only when the user checks them. Suggestions highlight potential rubric items but do not auto-check. Overall score is a weighted average across categories.

### Explain it back (system design)

After completing a prompt, the app asks for:

- Primary tradeoff and why
- Biggest risk and mitigation
- One change at 10x scale

This explanation is shown during future reviews.

## System Design Drills

Drills are short, time-boxed exercises focused on 1–3 steps of system design. They reuse the same step markers and rubric logic but keep the scope small to build speed and recall.

- Routes: `/system-design/drills` and `/system-design/drills/:id`
- Each drill uses a starter template with `TEMPLATE_START/END` markers
- Rubric scoring is user-confirmed (suggestions are assist-only)

## Mock Interview Mode

Mock interviews simulate a 45-minute system design interview using a fixed sequence of drills followed by a full design and reflection. Sessions are stored locally and can be reviewed after completion.

## DSA Speed Drills

DSA Speed Drills provide short, focused exercises (3–10 minutes) using existing problems. Drills are partial: pattern recognition, core loop, invariant maintenance, or bug-fix. They run visible tests only and never replace guided stubs.

## JS/React Quizzes

Quizzes are rapid-fire, objective questions with immediate feedback and spaced repetition scheduling.

- Routes: `/quizzes`, `/quizzes/catalog`, `/quizzes/session`, `/quizzes/review/:sessionId`
- Supports true/false, single choice, and multiple choice.
- Sessions prioritize due questions, then weak subtopics, then new questions.

## React Coding Gym

React Coding Gym provides guided, test-driven React component challenges with the same stepper + retention loop as DSA.

- Routes: `/react`, `/react/catalog`, `/react/:id`
- Guided stubs in TSX with strict `Step` headers + `TODO(step n start/end)` markers
- Tests run in-browser using a lightweight runner (no backend)

### React test runner (browser)

React coding problems are executed on the main thread with a lightweight harness:

- TSX is transpiled in-browser using `sucrase`
- User exports are injected into a test module
- Tests use `@testing-library/react` helpers and `expect`
- DOM is cleaned between tests
- Per-test timeout: 1500ms

Limitations:
- No Node-only APIs (filesystem, network)
- `window/document` access is blocked in user modules (tests still run in a DOM)
- No async test utilities beyond basic promises

## React Debugging Gym

React Debugging Gym focuses on repairing existing broken React codebases rather than building from scratch.

- Routes: `/react-debugging`, `/react-debugging/catalog`, `/react-debugging/:id`
- Challenge format: multi-file mini app, bug report, repro hints, preview, visible tests, hidden tests, and post-submit review
- Progress integrates with local persistence, spaced repetition, analytics, and overlay packs

### Debugging runner (browser)

The debugging runner executes an in-memory codebase directly in the browser:

- Challenge files are stored as virtual modules (`tsx`, `ts`, `json`, and `css`)
- `sucrase` transpiles TS/TSX modules to CommonJS in memory
- Relative imports are resolved against the virtual file graph
- Preview runs render the entry module into a controlled container and fully reset between runs
- Visible tests run on demand; submit runs visible + hidden tests
- Submit also enforces editable vs read-only files and optional `allowedEditablePaths` / `forbiddenPaths`

Structured runner failures are classified as:

- `SYNTAX_ERROR`
- `RUNTIME_ERROR`
- `TEST_FAILURE`
- `TIMEOUT`
- `MODULE_RESOLUTION_ERROR`
- `HARNESS_ERROR`

Limitations:

- No network or Node APIs inside challenge code
- CSS files are injected for preview only; they do not export CSS-module bindings
- Tests use a lightweight Testing Library-style harness, not Jest/Vitest globals

## Unit Testing Gym

Unit Testing Gym teaches test writing against existing JavaScript/TypeScript utilities and React components.

- Routes: `/unit-testing`, `/unit-testing/catalog`, `/unit-testing/:id`
- Solve flow: read-only source-under-test, editable guided test stub, stepper, visible run feedback, hidden mutant validation, and review
- Guided test stubs use the same strict `Step` headers + `TODO(step n start/end)` markers as the DSA and React Coding modes

### Unit Testing runner (browser)

The Unit Testing runner stays fully client-side and deterministic:

- Source files and the user-authored test file are loaded as an in-memory module graph
- `sucrase` transpiles TS/TSX/JS/JSX files in-browser
- A lightweight Vitest-style collector supports `describe`, `it`, `test`, `expect`, and scoped Testing Library imports
- Each test runs in an isolated DOM host so preview content and prior tests do not leak into later assertions
- Submit first runs the user tests against the intended implementation, then reruns them against hidden mutant variants

Structured runner failures include:

- `SYNTAX_ERROR`
- `RUNTIME_ERROR`
- `TEST_FAILURE`
- `TIMEOUT`
- `HARNESS_ERROR`
- `WEAK_TEST_FAILURE`

`WEAK_TEST_FAILURE` means the authored tests passed the main implementation but failed to kill one or more hidden mutants.

### Authoring Unit Testing problems

`UnitTestingProblem` authoring centers on:

- read-only `sourceFiles`
- a guided `testStubFile`
- a complete `referenceTestFile`
- `hiddenMutants` that represent deterministic buggy implementation variants

Reference validation checks:

- step markers parse from the stub test file
- relative imports resolve
- the reference tests compile and pass against the intended implementation
- the same reference tests fail the hidden mutants during submit validation

Limitations:

- The runner supports a focused browser-safe subset of Vitest behavior rather than the full Node/Vitest API surface
- Hidden mutant validation is deterministic, but it only measures the mutants the authored problem defines
- Browser-based execution means no filesystem access and no Node-only testing utilities

## Adaptive Interview Paths

Adaptive Interview Paths generate deterministic, explainable session plans that mix reviews, drills, and timed blocks based on spaced repetition due items, weaknesses, speed gaps, transfer gaps, and confidence calibration.

- Route: `/adaptive`
- Session runner: `/adaptive/session/:sessionId`
- Plans are previewable and editable before starting.
- Each block includes a one-sentence rationale derived from stored signals.
- Timed blocks enforce timers and auto-advance on timeout.

## Run locally

```bash
npm install
npm run dev
```

Run tests:

```bash
npm run test
```

## Storage & migrations

The app uses IndexedDB as the source of truth for all persistence. Storage is centralized under `src/storage/`:

- `src/storage/db.ts`: database open + schema versioning
- `src/storage/stores/*`: typed store accessors
- `src/storage/migrations/*`: migrations from legacy localStorage

### Migration behavior

On first load after this upgrade:

1. The app checks if IndexedDB is empty and legacy localStorage data exists.
2. If so, it migrates progress, settings, sessions, and drafts into IndexedDB.
3. localStorage is **not** deleted (kept as backup).

If IndexedDB is unavailable, the app shows a warning banner and falls back to a read-only legacy view.

### Reset storage (dev only)

To wipe IndexedDB during development:

- Open browser devtools and run: `indexedDB.deleteDatabase('coding-practice-gym-db')`
- Reload the page

Legacy localStorage is left intact and can be re-migrated.

## Problem structure

Problems live in `src/data/problems.ts` and follow this shape:

```ts
{
  id,
  title,
  difficulty,
  patterns,
  statementMarkdown,
  planMarkdown,
  examples,
  constraints,
  functionName,
  inputFormat, // optional: 'plain' | 'linked-list' | 'binary-tree'
  outputFormat, // optional: 'plain' | 'linked-list' | 'binary-tree'
  referenceSolution,
  guidedStub,
  tests: { visible, hidden },
  metadata: { timeComplexity, spaceComplexity, commonPitfalls, recallQuestions }
}
```

`tests.input` is a JSON array of arguments. For example: `"[[2,7,11,15], 9]"`. `tests.expected` is JSON for the return value.

## Guided stubs

Guided stubs are authored in `guidedStub` strings. The app parses step headers and TODO regions to power the stepper and completion tracking.

Structure:

```ts
function example(nums: number[]): number {
  // Step 1: Describe the intent.
  // TODO(step 1 start)
  // Placeholder text that the user replaces.
  // TODO(step 1 end)

  // Step 2: Next piece of logic.
  // TODO(step 2 start)
  // Placeholder text.
  // TODO(step 2 end)

  return 0;
}
```

Hints can be included with optional levels:

```ts
// HINT(level 2): const seen = new Map<number, number>();
```

The hint level slider in Settings reveals hints up to the selected level. Keep hints outside TODO regions to avoid marking steps as completed.

## Test execution

- User code runs in a Web Worker (`src/workers/runner.worker.ts`).
- Execution is isolated from the main thread and terminated after 1s.
- TypeScript is transpiled in-browser using the `typescript` package.
- Inputs are parsed as JSON arrays.
- For linked list / binary tree problems, the worker converts array inputs into in-memory nodes and normalizes outputs back to arrays for comparison.
 - Output diffs use stable JSON-like stringification (sorted keys). NaN is supported; `-0` and `0` are treated as equivalent. Date objects are not supported in v1.

Limitations:
- Only synchronous functions are supported in v1.
- Access to `fetch` and `XMLHttpRequest` is disabled in the worker.
 - DOM globals are shadowed inside the sandboxed user function scope.

## Adding new problems

1. Add a new entry in `src/data/problems.ts` with all required fields.
2. Ensure `guidedStub` uses `Step` headers and `TODO(step n start/end)` markers.
3. Add visible and hidden tests with JSON argument arrays.
4. If you need a different input/output structure, set `inputFormat` or `outputFormat` (linked lists or binary trees).

## Problem authoring (local-only)

Visit `/author` in dev mode to draft a new problem in the browser. The authoring workspace includes:

- Live validation for step markers, tests, and reference solution.
- Import/export JSON and copy-to-clipboard.
- Save to a local overlay pack stored in IndexedDB (dev only).

Switch the authoring mode to “System Design” to draft a system design prompt and rubric. Validation checks step markers and rubric weights before saving.
Switch to “Quizzes” to draft quiz questions and validate choices/correct answers.
Switch to “React Coding” to draft React component problems and validate stubs/tests.
Switch to “React Debugging” to draft multi-file debugging challenges and validate import resolution, entry files, tests, and a separate fixed reference codebase.

### Stub marker format

```ts
// Step 1: Describe the intent.
// TODO(step 1 start)
// placeholder
// TODO(step 1 end)
```

Step numbers must be sequential starting at 1, and each step must have exactly one TODO start and end marker.

### Overlay pack behavior

Overlay problems are merged with the built-in pack at runtime. If an overlay problem shares the same `id`, the overlay version replaces the built-in one. Use the overlay toggle in `/author` to enable or disable overlay problems.

Overlay packs also support system design prompts via the `systemDesignPrompts` array. The merge rule is the same: overlay prompts replace built-ins with matching `id`.

Overlay packs also support quiz questions via the `quizQuestions` array.
Overlay packs also support React coding problems via the `reactCodingProblems` array.
Overlay packs also support React debugging problems via the `reactDebuggingProblems` array.

### Authoring React debugging challenges

React debugging challenges use this runtime shape:

```ts
{
  id,
  title,
  difficulty,
  topics,
  bugTypes,
  briefMarkdown,
  codebase: {
    files: [{ path, language, contents, editable }]
  },
  entryFile,
  tests: { visible, hidden },
  reproductionHints,
  maintainabilityNotes,
  solutionNotes: { rootCauseMarkdown, fixSummaryMarkdown, edgeCasesMarkdown },
  recallQuestions,
  metadata: { estimatedMinutes },
  allowedEditablePaths?, forbiddenPaths?
}
```

The authoring UI validates:

- entry file existence
- relative import resolution inside the authored codebase
- visible and hidden test modules
- a separate fixed reference codebase JSON

The simpler reliable authoring path is a separate fixed codebase. The reference files are used only for validation and are not required by the runtime challenge payload.

## Roadmap (v2 ideas)

1. Optional backend for syncing progress across devices.
2. Additional language modes (Python, Java) with server-side execution.
3. Analytics for streaks, time-to-solve, and pattern heatmaps.
4. Community problem packs and curated study tracks.
