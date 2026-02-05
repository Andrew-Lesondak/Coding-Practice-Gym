# DSA Gym

A production-ready React + TypeScript app for guided DSA practice. The experience centers on guided completion, spaced repetition, and a fast feedback loop.

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
- Save to a local overlay pack stored in `localStorage` (dev only).

Switch the authoring mode to “System Design” to draft a system design prompt and rubric. Validation checks step markers and rubric weights before saving.

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

## Roadmap (v2 ideas)

1. Optional backend for syncing progress across devices.
2. Additional language modes (Python, Java) with server-side execution.
3. Analytics for streaks, time-to-solve, and pattern heatmaps.
4. Community problem packs and curated study tracks.
