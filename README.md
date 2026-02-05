# DSA Gym

A production-ready React + TypeScript app for guided DSA practice. The experience centers on guided completion, spaced repetition, and a fast feedback loop.

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

## Roadmap (v2 ideas)

1. Optional backend for syncing progress across devices.
2. Additional language modes (Python, Java) with server-side execution.
3. Analytics for streaks, time-to-solve, and pattern heatmaps.
4. Community problem packs and curated study tracks.
