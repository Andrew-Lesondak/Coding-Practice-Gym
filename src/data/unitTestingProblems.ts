import { UnitTestingProblem } from '../types/unitTesting';

const createProblem = (problem: UnitTestingProblem) => problem;

const buildStub = (imports: string, describeName: string, steps: string[]) => `${imports}

describe("${describeName}", () => {
${steps.join('\n\n')}
});
`;

const buildStep = (step: number, title: string, lines: string[]) => `  // Step ${step}: ${title}
  // TODO(step ${step} start)
${lines.map((line) => `  // ${line}`).join('\n')}
  // TODO(step ${step} end)`;

const unitTestingProblems: UnitTestingProblem[] = [
  createProblem({
    id: 'unit-testing-sum-positive-numbers',
    title: 'Test sumPositiveNumbers',
    difficulty: 'easy',
    category: 'unit',
    topics: ['arrange-act-assert', 'edge-cases'],
    framework: 'vitest',
    promptMarkdown: `Write tests for an existing ` + '`sumPositiveNumbers`' + ` utility. The function should add only positive numbers and ignore zero or negative values.`,
    requirements: ['Cover the basic happy path.', 'Cover empty input.', 'Cover ignored values.'],
    constraints: ['Do not modify the source implementation.', 'Write behavior-focused assertions.'],
    sourceFiles: [
      {
        path: '/src/sumPositiveNumbers.ts',
        language: 'ts',
        editable: false,
        contents: `export function sumPositiveNumbers(values: number[]) {
  return values.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
}`
      }
    ],
    testStubFile: {
      path: '/src/sumPositiveNumbers.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { sumPositiveNumbers } from "./sumPositiveNumbers";`,
        'sumPositiveNumbers',
        [
          buildStep(1, 'Write a happy-path test for positive numbers.', ['Verify a simple array sums correctly.']),
          buildStep(2, 'Write a test for empty input.', ['Verify an empty array returns 0.']),
          buildStep(3, 'Write a test for ignored non-positive values.', ['Verify zero and negative values do not affect the sum.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/sumPositiveNumbers.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { sumPositiveNumbers } from "./sumPositiveNumbers";

describe("sumPositiveNumbers", () => {
  it("returns the sum for a simple positive array", () => {
    expect(sumPositiveNumbers([2, 3, 5])).toBe(10);
  });

  it("returns 0 for an empty array", () => {
    expect(sumPositiveNumbers([])).toBe(0);
  });

  it("ignores zero and negative values", () => {
    expect(sumPositiveNumbers([4, 0, -3, 6])).toBe(10);
  });
});`
    },
    testsMeta: {
      visibleChecks: ['happy path sum', 'empty input', 'ignores zero and negatives'],
      hiddenChecks: ['all-negative input', 'mixed values still ignore non-positive numbers']
    },
    commonPitfalls: ['Asserting on implementation details instead of the return value.', 'Skipping the ignored-values case.'],
    recallQuestions: ['What behavior did your tests prove?', 'Why is the ignored-values case important?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Start with a direct happy-path example, then add the smallest edge cases that define the utility contract.',
      whyTheseAssertionsMarkdown: 'Each assertion proves an externally visible behavior: normal summing, empty input, and ignoring unsupported values.',
      edgeCasesMarkdown: 'Arrays with only negative values should still return 0, and zero should behave like an ignored value.'
    },
    hiddenMutants: [
      {
        id: 'counts-positives',
        mutatedFiles: [
          {
            path: '/src/sumPositiveNumbers.ts',
            contents: `export function sumPositiveNumbers(values: number[]) {
  return values.filter((value) => value > 0).length;
}`
          }
        ],
        description: 'The helper counts positive items instead of summing them.'
      },
      {
        id: 'sums-everything',
        mutatedFiles: [
          {
            path: '/src/sumPositiveNumbers.ts',
            contents: `export function sumPositiveNumbers(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}`
          }
        ],
        description: 'Negative values are no longer ignored.'
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-slugify',
    title: 'Test slugify',
    difficulty: 'easy',
    category: 'unit',
    topics: ['arrange-act-assert', 'string-normalization'],
    framework: 'vitest',
    promptMarkdown: `Write tests for ` + '`slugify`' + `, which lowercases text, trims extra spaces, and joins words with hyphens.`,
    requirements: ['Test normal words.', 'Test extra whitespace.', 'Test punctuation removal.'],
    constraints: ['Keep the tests readable.', 'Do not assert internal helper steps.'],
    sourceFiles: [
      {
        path: '/src/slugify.ts',
        language: 'ts',
        editable: false,
        contents: `export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-");
}`
      }
    ],
    testStubFile: {
      path: '/src/slugify.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";`,
        'slugify',
        [
          buildStep(1, 'Test a standard phrase.', ['Verify lowercase words become a hyphenated slug.']),
          buildStep(2, 'Test extra whitespace.', ['Verify repeated spaces are collapsed.']),
          buildStep(3, 'Test punctuation handling.', ['Verify punctuation is removed from the final slug.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/slugify.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("turns a phrase into a lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("collapses repeated whitespace", () => {
    expect(slugify("  spaced   out   title ")).toBe("spaced-out-title");
  });

  it("removes punctuation from the slug", () => {
    expect(slugify("Ship it, now!")).toBe("ship-it-now");
  });
});`
    },
    testsMeta: {
      visibleChecks: ['phrase to slug', 'repeated spaces collapse', 'punctuation removed'],
      hiddenChecks: ['leading and trailing spaces', 'mixed punctuation still removed']
    },
    commonPitfalls: ['Only testing one phrase.', 'Checking exact regex details instead of the output string.'],
    recallQuestions: ['What output contract matters most here?', 'Which edge case protects the punctuation behavior?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Use one simple phrase first, then add whitespace normalization and punctuation handling as the contract edges.',
      whyTheseAssertionsMarkdown: 'The assertions describe the final string the caller cares about, not the implementation steps that produced it.',
      edgeCasesMarkdown: 'Leading/trailing spaces and punctuation-heavy input are the easiest places for a slug helper to drift.'
    },
    hiddenMutants: [
      {
        id: 'keeps-punctuation',
        mutatedFiles: [
          {
            path: '/src/slugify.ts',
            contents: `export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, "-");
}`
          }
        ]
      },
      {
        id: 'does-not-trim',
        mutatedFiles: [
          {
            path: '/src/slugify.ts',
            contents: `export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, "")
    .replace(/\\s+/g, "-");
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-group-orders-by-status',
    title: 'Test groupOrdersByStatus',
    difficulty: 'medium',
    category: 'unit',
    topics: ['arrange-act-assert', 'collections', 'edge-cases'],
    framework: 'vitest',
    promptMarkdown: `Write tests for ` + '`groupOrdersByStatus`' + `, which groups orders into arrays by their ` + '`status`' + ` field.`,
    requirements: ['Prove orders are grouped under the right key.', 'Prove repeated statuses append correctly.', 'Prove empty input returns an empty object.'],
    constraints: ['Do not mutate the source file.', 'Assert on the grouped result, not reducer internals.'],
    sourceFiles: [
      {
        path: '/src/groupOrdersByStatus.ts',
        language: 'ts',
        editable: false,
        contents: `type Order = { id: string; status: "pending" | "paid" | "shipped" };

export function groupOrdersByStatus(orders: Order[]) {
  return orders.reduce<Record<string, Order[]>>((groups, order) => {
    const bucket = groups[order.status] ?? [];
    bucket.push(order);
    groups[order.status] = bucket;
    return groups;
  }, {});
}`
      }
    ],
    testStubFile: {
      path: '/src/groupOrdersByStatus.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { groupOrdersByStatus } from "./groupOrdersByStatus";`,
        'groupOrdersByStatus',
        [
          buildStep(1, 'Test that orders land in the correct status bucket.', ['Arrange a few orders with mixed statuses and assert on the grouped shape.']),
          buildStep(2, 'Test repeated statuses.', ['Verify multiple orders with the same status end up in the same array.']),
          buildStep(3, 'Test empty input.', ['Verify an empty array returns an empty object.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/groupOrdersByStatus.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { groupOrdersByStatus } from "./groupOrdersByStatus";

describe("groupOrdersByStatus", () => {
  it("groups orders under the correct status keys", () => {
    const result = groupOrdersByStatus([
      { id: "1", status: "pending" },
      { id: "2", status: "paid" }
    ]);

    expect(result.pending).toEqual([{ id: "1", status: "pending" }]);
    expect(result.paid).toEqual([{ id: "2", status: "paid" }]);
  });

  it("appends repeated statuses into the same array", () => {
    const result = groupOrdersByStatus([
      { id: "1", status: "pending" },
      { id: "2", status: "pending" }
    ]);

    expect(result.pending).toEqual([
      { id: "1", status: "pending" },
      { id: "2", status: "pending" }
    ]);
  });

  it("returns an empty object for empty input", () => {
    expect(groupOrdersByStatus([])).toEqual({});
  });
});`
    },
    testsMeta: {
      visibleChecks: ['correct grouping', 'repeated statuses append', 'empty input'],
      hiddenChecks: ['multiple buckets preserved', 'no last-order overwrite']
    },
    commonPitfalls: ['Only asserting one bucket.', 'Not checking repeated statuses.'],
    recallQuestions: ['What behavior proves grouping worked?', 'Which test catches overwrite bugs?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Start with one mixed example, then add a repeated-status case that proves grouping is cumulative.',
      whyTheseAssertionsMarkdown: 'Asserting on the final object shape and array contents proves the public behavior without coupling to the reducer internals.',
      edgeCasesMarkdown: 'Empty input and repeated statuses are the main places grouping helpers regress.'
    },
    hiddenMutants: [
      {
        id: 'overwrite-bucket',
        mutatedFiles: [
          {
            path: '/src/groupOrdersByStatus.ts',
            contents: `type Order = { id: string; status: "pending" | "paid" | "shipped" };

export function groupOrdersByStatus(orders: Order[]) {
  return orders.reduce<Record<string, Order[]>>((groups, order) => {
    groups[order.status] = [order];
    return groups;
  }, {});
}`
          }
        ]
      },
      {
        id: 'array-only',
        mutatedFiles: [
          {
            path: '/src/groupOrdersByStatus.ts',
            contents: `type Order = { id: string; status: "pending" | "paid" | "shipped" };

export function groupOrdersByStatus(orders: Order[]) {
  return { all: orders };
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-format-currency',
    title: 'Test formatCurrency',
    difficulty: 'easy',
    category: 'unit',
    topics: ['error-handling', 'arrange-act-assert'],
    framework: 'vitest',
    promptMarkdown: `Write tests for ` + '`formatCurrency`' + `, including invalid input handling.`,
    requirements: ['Test a normal price.', 'Test zero.', 'Test invalid numeric input.'],
    constraints: ['Use readable assertions.', 'Do not change the formatter implementation.'],
    sourceFiles: [
      {
        path: '/src/formatCurrency.ts',
        language: 'ts',
        editable: false,
        contents: `export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid amount");
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(value);
}`
      }
    ],
    testStubFile: {
      path: '/src/formatCurrency.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";`,
        'formatCurrency',
        [
          buildStep(1, 'Test a normal amount.', ['Verify a standard decimal amount is formatted as USD.']),
          buildStep(2, 'Test zero.', ['Verify zero still formats as currency.']),
          buildStep(3, 'Test invalid input handling.', ['Assert that invalid input throws the expected error.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/formatCurrency.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats a standard decimal amount", () => {
    expect(formatCurrency(12.5)).toBe("$12.50");
  });

  it("formats zero as USD currency", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("throws for invalid numeric input", () => {
    expect(() => formatCurrency(Number.NaN)).toThrow("Invalid amount");
  });
});`
    },
    testsMeta: {
      visibleChecks: ['standard amount', 'zero amount', 'invalid input throws'],
      hiddenChecks: ['infinity throws', 'keeps two decimal places']
    },
    commonPitfalls: ['Forgetting to cover the error branch.', 'Asserting loosely on the formatted output.'],
    recallQuestions: ['What contract matters for invalid input?', 'Why is a zero case still useful?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Cover one normal example, then add a boundary-like zero case and the explicit throwing path.',
      whyTheseAssertionsMarkdown: 'Formatting helpers are all about user-facing output, so the assertion should prove the exact formatted string or thrown error.',
      edgeCasesMarkdown: 'NaN and Infinity are easy invalid inputs to miss if you only test a happy path.'
    },
    hiddenMutants: [
      {
        id: 'returns-string-on-invalid',
        mutatedFiles: [
          {
            path: '/src/formatCurrency.ts',
            contents: `export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(value);
}`
          }
        ]
      },
      {
        id: 'drops-cents',
        mutatedFiles: [
          {
            path: '/src/formatCurrency.ts',
            contents: `export function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid amount");
  }

  return "$" + Math.round(value);
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-retry-async',
    title: 'Test retryAsync',
    difficulty: 'hard',
    category: 'unit',
    topics: ['async', 'error-handling', 'arrange-act-assert'],
    framework: 'vitest',
    promptMarkdown: `Write tests for an async helper that retries a task until it succeeds or the retry limit is reached.`,
    requirements: ['Prove immediate success returns once.', 'Prove a later retry can succeed.', 'Prove the helper rejects after exhausting retries.'],
    constraints: ['Keep the tests deterministic.', 'Do not over-mock the helper internals.'],
    sourceFiles: [
      {
        path: '/src/retryAsync.ts',
        language: 'ts',
        editable: false,
        contents: `export async function retryAsync<T>(task: () => Promise<T>, retries: number) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await task();
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }

    attempt += 1;
  }

  throw new Error("Unreachable");
}`
      }
    ],
    testStubFile: {
      path: '/src/retryAsync.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { retryAsync } from "./retryAsync";`,
        'retryAsync',
        [
          buildStep(1, 'Test immediate success.', ['Write an async test that verifies the helper resolves on the first attempt.']),
          buildStep(2, 'Test a later success.', ['Arrange a task that fails once, then succeeds, and assert the attempt count.']),
          buildStep(3, 'Test final rejection.', ['Verify the helper rejects after all retries are exhausted.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/retryAsync.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { retryAsync } from "./retryAsync";

describe("retryAsync", () => {
  it("resolves immediately when the task succeeds", async () => {
    let calls = 0;
    const result = await retryAsync(async () => {
      calls += 1;
      return "ok";
    }, 2);

    expect(result).toBe("ok");
    expect(calls).toBe(1);
  });

  it("retries until a later attempt succeeds", async () => {
    let calls = 0;
    const result = await retryAsync(async () => {
      calls += 1;
      if (calls < 2) {
        throw new Error("temporary");
      }
      return "done";
    }, 2);

    expect(result).toBe("done");
    expect(calls).toBe(2);
  });

  it("rejects when all retries are exhausted", async () => {
    let calls = 0;

    await expect(
      retryAsync(async () => {
        calls += 1;
        throw new Error("still failing");
      }, 1)
    ).rejects.toThrow("still failing");

    expect(calls).toBe(2);
  });
});`
    },
    testsMeta: {
      visibleChecks: ['immediate success', 'later retry succeeds', 'exhausted retries reject'],
      hiddenChecks: ['attempt count is correct', 'retries are not skipped']
    },
    commonPitfalls: ['Not awaiting the rejection path.', 'Forgetting to assert how many times the task ran.'],
    recallQuestions: ['What behavior did the attempt-count assertion prove?', 'Why is the rejection path part of the contract?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Treat each async branch separately: immediate success, retry-then-success, and permanent failure.',
      whyTheseAssertionsMarkdown: 'The attempt counter proves the helper retried the right number of times rather than just returning the correct final value.',
      edgeCasesMarkdown: 'Off-by-one retry bugs are common, so counting invocations is just as important as checking resolve/reject outcomes.'
    },
    hiddenMutants: [
      {
        id: 'no-retry',
        mutatedFiles: [
          {
            path: '/src/retryAsync.ts',
            contents: `export async function retryAsync<T>(task: () => Promise<T>, _retries: number) {
  return task();
}`
          }
        ]
      },
      {
        id: 'swallow-error',
        mutatedFiles: [
          {
            path: '/src/retryAsync.ts',
            contents: `export async function retryAsync<T>(task: () => Promise<T>, retries: number) {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      return await task();
    } catch {
      return undefined as T;
    }
  }

  throw new Error("Unreachable");
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-validate-signup-form',
    title: 'Test validateSignupForm',
    difficulty: 'medium',
    category: 'unit',
    topics: ['error-handling', 'edge-cases', 'arrange-act-assert'],
    framework: 'vitest',
    promptMarkdown: `Write tests for a small form validator that returns field errors for invalid signup input.`,
    requirements: ['Test valid input.', 'Test missing required fields.', 'Test password length validation.'],
    constraints: ['Assert on returned errors, not intermediate branches.', 'Do not change the validator.'],
    sourceFiles: [
      {
        path: '/src/validateSignupForm.ts',
        language: 'ts',
        editable: false,
        contents: `type Values = { email: string; password: string; agreeToTerms: boolean };

export function validateSignupForm(values: Values) {
  const errors: Record<string, string> = {};

  if (!values.email.includes("@")) {
    errors.email = "Enter a valid email";
  }

  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!values.agreeToTerms) {
    errors.agreeToTerms = "You must accept the terms";
  }

  return errors;
}`
      }
    ],
    testStubFile: {
      path: '/src/validateSignupForm.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { validateSignupForm } from "./validateSignupForm";`,
        'validateSignupForm',
        [
          buildStep(1, 'Test valid input.', ['Verify valid values return an empty error object.']),
          buildStep(2, 'Test required/format errors.', ['Verify an invalid email and missing agreement return the expected keys.']),
          buildStep(3, 'Test password length validation.', ['Verify short passwords produce the password error message.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/validateSignupForm.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { validateSignupForm } from "./validateSignupForm";

describe("validateSignupForm", () => {
  it("returns no errors for valid input", () => {
    expect(
      validateSignupForm({
        email: "user@example.com",
        password: "supersecret",
        agreeToTerms: true
      })
    ).toEqual({});
  });

  it("returns email and terms errors when those fields are invalid", () => {
    expect(
      validateSignupForm({
        email: "invalid",
        password: "supersecret",
        agreeToTerms: false
      })
    ).toEqual({
      email: "Enter a valid email",
      agreeToTerms: "You must accept the terms"
    });
  });

  it("returns the password length error for short passwords", () => {
    expect(
      validateSignupForm({
        email: "user@example.com",
        password: "short",
        agreeToTerms: true
      })
    ).toEqual({
      password: "Password must be at least 8 characters"
    });
  });

  it("accepts a password that is exactly 8 characters long", () => {
    expect(
      validateSignupForm({
        email: "user@example.com",
        password: "12345678",
        agreeToTerms: true
      })
    ).toEqual({});
  });
});`
    },
    testsMeta: {
      visibleChecks: ['valid input', 'invalid email + terms', 'short password'],
      hiddenChecks: ['all three errors at once', 'password boundary at 8 chars']
    },
    commonPitfalls: ['Only checking one invalid field.', 'Using one oversized test that hides which rule failed.'],
    recallQuestions: ['Why is one focused validation test per rule useful?', 'What boundary matters for the password rule?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Start with a clean valid case, then add focused invalid cases that prove each rule independently.',
      whyTheseAssertionsMarkdown: 'Asserting on the exact error object proves both which keys exist and which messages matter to the caller.',
      edgeCasesMarkdown: 'Boundary lengths like 7 vs 8 characters matter more than extra random invalid values.'
    },
    hiddenMutants: [
      {
        id: 'wrong-password-boundary',
        mutatedFiles: [
          {
            path: '/src/validateSignupForm.ts',
            contents: `type Values = { email: string; password: string; agreeToTerms: boolean };

export function validateSignupForm(values: Values) {
  const errors: Record<string, string> = {};

  if (!values.email.includes("@")) {
    errors.email = "Enter a valid email";
  }

  if (values.password.length <= 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!values.agreeToTerms) {
    errors.agreeToTerms = "You must accept the terms";
  }

  return errors;
}`
          }
        ]
      },
      {
        id: 'missing-terms-validation',
        mutatedFiles: [
          {
            path: '/src/validateSignupForm.ts',
            contents: `type Values = { email: string; password: string; agreeToTerms: boolean };

export function validateSignupForm(values: Values) {
  const errors: Record<string, string> = {};

  if (!values.email.includes("@")) {
    errors.email = "Enter a valid email";
  }

  if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-calculate-cart-total',
    title: 'Test calculateCartTotal',
    difficulty: 'hard',
    category: 'unit',
    topics: ['edge-cases', 'business-logic', 'arrange-act-assert'],
    framework: 'vitest',
    promptMarkdown: `Write tests for cart total calculation with an optional percentage discount.`,
    requirements: ['Test normal totals.', 'Test percentage discount application.', 'Test an empty cart.'],
    constraints: ['Assert on business outcomes, not intermediate accumulator values.', 'Do not rewrite the implementation.'],
    sourceFiles: [
      {
        path: '/src/calculateCartTotal.ts',
        language: 'ts',
        editable: false,
        contents: `type CartItem = { price: number; quantity: number };

export function calculateCartTotal(items: CartItem[], discountPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discounted = subtotal - subtotal * (discountPercent / 100);
  return Number(discounted.toFixed(2));
}`
      }
    ],
    testStubFile: {
      path: '/src/calculateCartTotal.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { calculateCartTotal } from "./calculateCartTotal";`,
        'calculateCartTotal',
        [
          buildStep(1, 'Test the normal subtotal.', ['Verify multiple items sum to the expected total with no discount.']),
          buildStep(2, 'Test a percentage discount.', ['Verify the discount is applied to the full subtotal.']),
          buildStep(3, 'Test empty input.', ['Verify an empty cart still returns 0.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/calculateCartTotal.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { calculateCartTotal } from "./calculateCartTotal";

describe("calculateCartTotal", () => {
  it("calculates the subtotal with quantities", () => {
    expect(
      calculateCartTotal([
        { price: 10, quantity: 2 },
        { price: 5, quantity: 1 }
      ])
    ).toBe(25);
  });

  it("applies a percentage discount to the subtotal", () => {
    expect(
      calculateCartTotal([
        { price: 20, quantity: 1 },
        { price: 10, quantity: 1 }
      ], 10)
    ).toBe(27);
  });

  it("returns 0 for an empty cart", () => {
    expect(calculateCartTotal([], 20)).toBe(0);
  });
});`
    },
    testsMeta: {
      visibleChecks: ['subtotal', 'discount', 'empty cart'],
      hiddenChecks: ['quantity still matters under discount', 'discount is percentage not fixed amount']
    },
    commonPitfalls: ['Testing only one item.', 'Forgetting quantity multiplies price before discount.'],
    recallQuestions: ['What behavior proves the discount logic?', 'Which case protects against a fixed-amount bug?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Cover the subtotal first, then prove the discount uses that subtotal, and finish with the empty-cart edge case.',
      whyTheseAssertionsMarkdown: 'The assertions prove the important business outcome: what the shopper should pay.',
      edgeCasesMarkdown: 'Percent-vs-fixed discount bugs and quantity handling are the common mistakes for this helper.'
    },
    hiddenMutants: [
      {
        id: 'fixed-discount',
        mutatedFiles: [
          {
            path: '/src/calculateCartTotal.ts',
            contents: `type CartItem = { price: number; quantity: number };

export function calculateCartTotal(items: CartItem[], discountPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Number((subtotal - discountPercent).toFixed(2));
}`
          }
        ]
      },
      {
        id: 'ignores-quantity',
        mutatedFiles: [
          {
            path: '/src/calculateCartTotal.ts',
            contents: `type CartItem = { price: number; quantity: number };

export function calculateCartTotal(items: CartItem[], discountPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discounted = subtotal - subtotal * (discountPercent / 100);
  return Number(discounted.toFixed(2));
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-parse-query-params',
    title: 'Test parseQueryParams',
    difficulty: 'medium',
    category: 'unit',
    topics: ['edge-cases', 'string-parsing', 'arrange-act-assert'],
    framework: 'vitest',
    promptMarkdown: `Write tests for a query parser that converts a search string into a record of decoded values.`,
    requirements: ['Test a simple query.', 'Test URL decoding.', 'Test empty input.'],
    constraints: ['Stay focused on the returned object.', 'Do not test implementation details like split order.'],
    sourceFiles: [
      {
        path: '/src/parseQueryParams.ts',
        language: 'ts',
        editable: false,
        contents: `export function parseQueryParams(query: string) {
  const normalized = query.startsWith("?") ? query.slice(1) : query;
  if (!normalized) return {};

  return normalized.split("&").reduce<Record<string, string>>((acc, pair) => {
    const [rawKey, rawValue = ""] = pair.split("=");
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
    return acc;
  }, {});
}`
      }
    ],
    testStubFile: {
      path: '/src/parseQueryParams.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { parseQueryParams } from "./parseQueryParams";`,
        'parseQueryParams',
        [
          buildStep(1, 'Test a simple query string.', ['Verify a basic query is converted into key/value pairs.']),
          buildStep(2, 'Test URL decoding.', ['Verify encoded characters are decoded in both keys and values.']),
          buildStep(3, 'Test empty input.', ['Verify an empty query returns an empty object.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/parseQueryParams.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { parseQueryParams } from "./parseQueryParams";

describe("parseQueryParams", () => {
  it("parses a simple query string into an object", () => {
    expect(parseQueryParams("?page=2&sort=asc")).toEqual({
      page: "2",
      sort: "asc"
    });
  });

  it("decodes encoded keys and values", () => {
    expect(parseQueryParams("?user%20name=Ada%20Lovelace")).toEqual({
      "user name": "Ada Lovelace"
    });
  });

  it("returns an empty object for empty input", () => {
    expect(parseQueryParams("")).toEqual({});
  });

  it("uses an empty string when a value is missing", () => {
    expect(parseQueryParams("?flag=")).toEqual({ flag: "" });
  });
});`
    },
    testsMeta: {
      visibleChecks: ['simple query', 'decoding', 'empty input'],
      hiddenChecks: ['leading question mark optional', 'missing value becomes empty string']
    },
    commonPitfalls: ['Only testing one pair.', 'Skipping decoding behavior.'],
    recallQuestions: ['Which test proves decoding matters?', 'What edge case protects empty searches?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Use one normal query, one encoded query, and one empty-input edge case.',
      whyTheseAssertionsMarkdown: 'The returned record is the contract, so asserting directly on that object keeps the tests easy to read.',
      edgeCasesMarkdown: 'Missing values and the optional leading question mark are common parsing regressions.'
    },
    hiddenMutants: [
      {
        id: 'no-decode',
        mutatedFiles: [
          {
            path: '/src/parseQueryParams.ts',
            contents: `export function parseQueryParams(query: string) {
  const normalized = query.startsWith("?") ? query.slice(1) : query;
  if (!normalized) return {};

  return normalized.split("&").reduce<Record<string, string>>((acc, pair) => {
    const [rawKey, rawValue = ""] = pair.split("=");
    acc[rawKey] = rawValue;
    return acc;
  }, {});
}`
          }
        ]
      },
      {
        id: 'keeps-question-mark',
        mutatedFiles: [
          {
            path: '/src/parseQueryParams.ts',
            contents: `export function parseQueryParams(query: string) {
  if (!query) return {};

  return query.split("&").reduce<Record<string, string>>((acc, pair) => {
    const [rawKey, rawValue = ""] = pair.split("=");
    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
    return acc;
  }, {});
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-counter-button',
    title: 'Test CounterButton',
    difficulty: 'easy',
    category: 'react-component',
    topics: ['rendering', 'user-events', 'arrange-act-assert'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a counter button component that shows the current count and increments on click.`,
    requirements: ['Test the initial render.', 'Test a click increments the count.', 'Test multiple clicks update the UI.'],
    constraints: ['Assert on user-visible text.', 'Do not inspect internal state directly.'],
    sourceFiles: [
      {
        path: '/src/CounterButton.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function CounterButton() {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      Count: {count}
    </button>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/CounterButton.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CounterButton } from "./CounterButton";`,
        'CounterButton',
        [
          buildStep(1, 'Test the initial count.', ['Render the component and assert that it starts at 0.']),
          buildStep(2, 'Test a single click.', ['Click the button once and assert the visible count updates.']),
          buildStep(3, 'Test repeated clicks.', ['Click the button multiple times and assert the final count.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/CounterButton.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CounterButton } from "./CounterButton";

describe("CounterButton", () => {
  it("renders the initial count", () => {
    render(React.createElement(CounterButton));
    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });

  it("increments after one click", () => {
    render(React.createElement(CounterButton));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });

  it("keeps incrementing across multiple clicks", () => {
    render(React.createElement(CounterButton));
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByText("Count: 3")).toBeInTheDocument();
  });
});`
    },
    testsMeta: {
      visibleChecks: ['initial render', 'single click', 'multiple clicks'],
      hiddenChecks: ['button text updates', 'count keeps accumulating']
    },
    commonPitfalls: ['Testing state instead of the button text.', 'Only clicking once.'],
    recallQuestions: ['What behavior did your clicks prove?', 'Why is visible text a better assertion than state access?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Start at render, then simulate the smallest user interaction and assert on visible text changes.',
      whyTheseAssertionsMarkdown: 'A user only sees the button text, so that is the most stable behavior-focused assertion.',
      edgeCasesMarkdown: 'Repeated clicks matter because state updates can accidentally reset or stop accumulating.'
    },
    hiddenMutants: [
      {
        id: 'starts-at-one',
        mutatedFiles: [
          {
            path: '/src/CounterButton.tsx',
            contents: `import React from "react";

export function CounterButton() {
  const [count, setCount] = React.useState(1);

  return (
    <button onClick={() => setCount((value) => value + 1)}>
      Count: {count}
    </button>
  );
}`
          }
        ]
      },
      {
        id: 'increments-by-two',
        mutatedFiles: [
          {
            path: '/src/CounterButton.tsx',
            contents: `import React from "react";

export function CounterButton() {
  const [count, setCount] = React.useState(0);

  return (
    <button onClick={() => setCount((value) => value + 2)}>
      Count: {count}
    </button>
  );
}`
          }
        ]
      }
    ]
  }),
  // Remaining 6 component problems + 1 more unit problem to reach 15.
  createProblem({
    id: 'unit-testing-visible-todos',
    title: 'Test getVisibleTodos',
    difficulty: 'medium',
    category: 'unit',
    topics: ['selectors', 'edge-cases', 'arrange-act-assert'],
    framework: 'vitest',
    promptMarkdown: `Write tests for a selector that filters todos based on a visibility mode.`,
    requirements: ['Test the all filter.', 'Test the active filter.', 'Test the completed filter.'],
    constraints: ['Focus on returned todos.', 'Do not assert implementation detail helpers.'],
    sourceFiles: [
      {
        path: '/src/getVisibleTodos.ts',
        language: 'ts',
        editable: false,
        contents: `type Todo = { id: string; text: string; completed: boolean };

export function getVisibleTodos(todos: Todo[], filter: "all" | "active" | "completed") {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}`
      }
    ],
    testStubFile: {
      path: '/src/getVisibleTodos.test.ts',
      language: 'ts',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { getVisibleTodos } from "./getVisibleTodos";`,
        'getVisibleTodos',
        [
          buildStep(1, 'Test the all filter.', ['Verify all todos are returned when the filter is "all".']),
          buildStep(2, 'Test the active filter.', ['Verify only incomplete todos are returned.']),
          buildStep(3, 'Test the completed filter.', ['Verify only completed todos are returned.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/getVisibleTodos.test.ts',
      language: 'ts',
      contents: `import { describe, it, expect } from "vitest";
import { getVisibleTodos } from "./getVisibleTodos";

const todos = [
  { id: "1", text: "A", completed: false },
  { id: "2", text: "B", completed: true }
];

describe("getVisibleTodos", () => {
  it("returns all todos for the all filter", () => {
    expect(getVisibleTodos(todos, "all")).toEqual(todos);
  });

  it("returns only active todos", () => {
    expect(getVisibleTodos(todos, "active")).toEqual([{ id: "1", text: "A", completed: false }]);
  });

  it("returns only completed todos", () => {
    expect(getVisibleTodos(todos, "completed")).toEqual([{ id: "2", text: "B", completed: true }]);
  });
});`
    },
    testsMeta: {
      visibleChecks: ['all filter', 'active filter', 'completed filter'],
      hiddenChecks: ['empty lists remain empty', 'completed filter does not include active todos']
    },
    commonPitfalls: ['Not checking both filtered branches.', 'Using one giant mixed assertion.'],
    recallQuestions: ['Why does each filter deserve its own test?', 'What bug would the completed-filter test catch?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Give each visibility mode its own focused test with a small shared todo fixture.',
      whyTheseAssertionsMarkdown: 'Selectors are easiest to understand when you assert directly on the returned list for each filter.',
      edgeCasesMarkdown: 'Selectors often regress by returning the wrong branch for one filter, especially when the default branch is "all".'
    },
    hiddenMutants: [
      {
        id: 'completed-uses-active',
        mutatedFiles: [
          {
            path: '/src/getVisibleTodos.ts',
            contents: `type Todo = { id: string; text: string; completed: boolean };

export function getVisibleTodos(todos: Todo[], filter: "all" | "active" | "completed") {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => !todo.completed);
  }

  return todos;
}`
          }
        ]
      },
      {
        id: 'all-returns-empty',
        mutatedFiles: [
          {
            path: '/src/getVisibleTodos.ts',
            contents: `type Todo = { id: string; text: string; completed: boolean };

export function getVisibleTodos(todos: Todo[], filter: "all" | "active" | "completed") {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return [];
}`
          }
        ]
      }
    ]
  }),
  // React component seeds 6 more
  createProblem({
    id: 'unit-testing-login-form',
    title: 'Test LoginForm validation',
    difficulty: 'medium',
    category: 'react-component',
    topics: ['user-events', 'conditional-rendering', 'error-handling'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a login form that shows inline validation errors when submitted with missing fields.`,
    requirements: ['Test the initial render.', 'Test submitting empty fields shows both errors.', 'Test filling both fields removes the errors on submit.'],
    constraints: ['Assert on visible error messages.', 'Do not inspect component state.'],
    sourceFiles: [
      {
        path: '/src/LoginForm.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const emailError = submitted && !email ? "Email is required" : "";
  const passwordError = submitted && !password ? "Password is required" : "";

  return (
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <label>
        Email
        <input aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Password
        <input aria-label="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit">Sign in</button>
      {emailError ? <p>{emailError}</p> : null}
      {passwordError ? <p>{passwordError}</p> : null}
    </form>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/LoginForm.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LoginForm } from "./LoginForm";`,
        'LoginForm',
        [
          buildStep(1, 'Test the initial render.', ['Render the form and verify the submit button is visible.']),
          buildStep(2, 'Test empty submission.', ['Submit the form without typing and assert both validation messages appear.']),
          buildStep(3, 'Test a valid submission path.', ['Fill both inputs, submit, and verify the validation messages are not shown.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/LoginForm.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("renders the submit button", () => {
    render(React.createElement(LoginForm));
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByText("Email is required")).toBe(null);
    expect(screen.queryByText("Password is required")).toBe(null);
  });

  it("shows both validation messages after submitting empty fields", () => {
    render(React.createElement(LoginForm));
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("does not show validation errors when both fields are filled", () => {
    render(React.createElement(LoginForm));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.queryByText("Email is required")).toBe(null);
    expect(screen.queryByText("Password is required")).toBe(null);
  });
});`
    },
    testsMeta: {
      visibleChecks: ['initial render', 'empty submit errors', 'filled submit no errors'],
      hiddenChecks: ['single missing field only shows one error', 'errors appear only after submit']
    },
    commonPitfalls: ['Typing into the wrong field label.', 'Asserting on internal state instead of visible messages.'],
    recallQuestions: ['What user behavior triggers validation here?', 'Why should the tests assert on text instead of state?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Test the visible form first, then the invalid submit, then the valid submit to cover the main user flow.',
      whyTheseAssertionsMarkdown: 'The caller cares whether validation is visible to the user, not how the component stores field state internally.',
      edgeCasesMarkdown: 'A single missing field should only show one error, and the form should stay quiet before the first submit.'
    },
    hiddenMutants: [
      {
        id: 'email-error-missing',
        mutatedFiles: [
          {
            path: '/src/LoginForm.tsx',
            contents: `import React from "react";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const passwordError = submitted && !password ? "Password is required" : "";

  return (
    <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
      <label>
        Email
        <input aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Password
        <input aria-label="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit">Sign in</button>
      {passwordError ? <p>{passwordError}</p> : null}
    </form>
  );
}`
          }
        ]
      },
      {
        id: 'always-shows-errors',
        mutatedFiles: [
          {
            path: '/src/LoginForm.tsx',
            contents: `import React from "react";

export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const emailError = !email ? "Email is required" : "";
  const passwordError = !password ? "Password is required" : "";

  return (
    <form onSubmit={(event) => { event.preventDefault(); }}>
      <label>
        Email
        <input aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Password
        <input aria-label="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit">Sign in</button>
      {emailError ? <p>{emailError}</p> : null}
      {passwordError ? <p>{passwordError}</p> : null}
    </form>
  );
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-user-card',
    title: 'Test UserCard avatar fallback',
    difficulty: 'easy',
    category: 'react-component',
    topics: ['rendering', 'conditional-rendering'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a user card that renders either an avatar image or a fallback label when no avatar URL is present.`,
    requirements: ['Test avatar render when provided.', 'Test fallback render when missing.', 'Test the user name is shown.'],
    constraints: ['Assert on visible DOM output.', 'Avoid snapshot-style testing.'],
    sourceFiles: [
      {
        path: '/src/UserCard.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function UserCard({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <article>
      <h2>{name}</h2>
      {avatarUrl ? <img alt={name + " avatar"} src={avatarUrl} /> : <span>No avatar</span>}
    </article>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/UserCard.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { UserCard } from "./UserCard";`,
        'UserCard',
        [
          buildStep(1, 'Test the name render.', ['Render the card and verify the user name is shown.']),
          buildStep(2, 'Test the avatar path.', ['Render with an avatar URL and verify the image is in the document.']),
          buildStep(3, 'Test the fallback path.', ['Render without an avatar URL and verify the fallback text is shown.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/UserCard.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("renders the user name", () => {
    render(React.createElement(UserCard, { name: "Ada" }));
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("renders the avatar image when a URL is provided", () => {
    render(React.createElement(UserCard, { name: "Ada", avatarUrl: "/ada.png" }));
    expect(screen.getByAltText("Ada avatar")).toBeInTheDocument();
  });

  it("renders fallback text when the avatar URL is missing", () => {
    render(React.createElement(UserCard, { name: "Ada" }));
    expect(screen.getByText("No avatar")).toBeInTheDocument();
  });
});`
    },
    testsMeta: {
      visibleChecks: ['name renders', 'avatar renders', 'fallback renders'],
      hiddenChecks: ['fallback not shown when avatar exists', 'alt text matches the user name']
    },
    commonPitfalls: ['Only checking the fallback path.', 'Ignoring the accessible alt text.'],
    recallQuestions: ['Why does the alt text matter?', 'What behavior proves the fallback branch?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Cover the always-visible name, then test each conditional branch separately.',
      whyTheseAssertionsMarkdown: 'The image alt text and fallback text are the user-observable outputs that matter here.',
      edgeCasesMarkdown: 'It is easy for a card to render both branches accidentally, so each branch should be asserted independently.'
    },
    hiddenMutants: [
      {
        id: 'fallback-always',
        mutatedFiles: [
          {
            path: '/src/UserCard.tsx',
            contents: `import React from "react";

export function UserCard({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <article>
      <h2>{name}</h2>
      <span>No avatar</span>
    </article>
  );
}`
          }
        ]
      },
      {
        id: 'wrong-alt',
        mutatedFiles: [
          {
            path: '/src/UserCard.tsx',
            contents: `import React from "react";

export function UserCard({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <article>
      <h2>{name}</h2>
      {avatarUrl ? <img alt="avatar" src={avatarUrl} /> : <span>No avatar</span>}
    </article>
  );
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-search-results',
    title: 'Test SearchResults states',
    difficulty: 'medium',
    category: 'react-component',
    topics: ['rendering', 'async', 'conditional-rendering'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a search results component that renders loading, empty, and success states based on props.`,
    requirements: ['Test loading state.', 'Test empty state.', 'Test success state with a list of items.'],
    constraints: ['Prefer visible UI assertions.', 'No snapshot tests.'],
    sourceFiles: [
      {
        path: '/src/SearchResults.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function SearchResults({ isLoading, results }: { isLoading: boolean; results: string[] }) {
  if (isLoading) {
    return <p>Loading results...</p>;
  }

  if (results.length === 0) {
    return <p>No results found</p>;
  }

  return (
    <ul>
      {results.map((result) => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/SearchResults.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SearchResults } from "./SearchResults";`,
        'SearchResults',
        [
          buildStep(1, 'Test the loading state.', ['Render the component while loading and assert the loading text.']),
          buildStep(2, 'Test the empty state.', ['Render with no results and assert the empty-state message.']),
          buildStep(3, 'Test the success state.', ['Render with results and assert that the items appear.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/SearchResults.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { SearchResults } from "./SearchResults";

describe("SearchResults", () => {
  it("renders the loading state", () => {
    render(React.createElement(SearchResults, { isLoading: true, results: [] }));
    expect(screen.getByText("Loading results...")).toBeInTheDocument();
  });

  it("renders the empty state", () => {
    render(React.createElement(SearchResults, { isLoading: false, results: [] }));
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders each result in the success state", () => {
    render(React.createElement(SearchResults, { isLoading: false, results: ["Ada", "Grace"] }));
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
  });
});`
    },
    testsMeta: {
      visibleChecks: ['loading', 'empty', 'success'],
      hiddenChecks: ['loading wins over empty', 'success renders list items not placeholder']
    },
    commonPitfalls: ['Skipping one state branch.', 'Asserting on props instead of rendered output.'],
    recallQuestions: ['What behavior proves the loading branch?', 'Why should success assertions look for user-visible items?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Cover each branch once with a dedicated render so the state model stays obvious.',
      whyTheseAssertionsMarkdown: 'Conditional UI is best tested by the text and items the user sees, not by prop inspection.',
      edgeCasesMarkdown: 'Branch priority matters here: loading should hide other states while it is active.'
    },
    hiddenMutants: [
      {
        id: 'empty-before-loading',
        mutatedFiles: [
          {
            path: '/src/SearchResults.tsx',
            contents: `import React from "react";

export function SearchResults({ isLoading, results }: { isLoading: boolean; results: string[] }) {
  if (results.length === 0) {
    return <p>No results found</p>;
  }

  if (isLoading) {
    return <p>Loading results...</p>;
  }

  return (
    <ul>
      {results.map((result) => (
        <li key={result}>{result}</li>
      ))}
    </ul>
  );
}`
          }
        ]
      },
      {
        id: 'success-missing-list',
        mutatedFiles: [
          {
            path: '/src/SearchResults.tsx',
            contents: `import React from "react";

export function SearchResults({ isLoading, results }: { isLoading: boolean; results: string[] }) {
  if (isLoading) {
    return <p>Loading results...</p>;
  }

  if (results.length === 0) {
    return <p>No results found</p>;
  }

  return <p>{results.length} results</p>;
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-modal',
    title: 'Test Modal closing behavior',
    difficulty: 'medium',
    category: 'react-component',
    topics: ['user-events', 'conditional-rendering', 'keyboard-events'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a modal that closes when the user clicks the close button or presses Escape.`,
    requirements: ['Test visible render.', 'Test close button behavior.', 'Test Escape key behavior.'],
    constraints: ['Assert on callback effects with a simple counter or flag.', 'Keep the tests focused on behavior.'],
    sourceFiles: [
      {
        path: '/src/Modal.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function Modal({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      <p>Important modal content</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/Modal.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Modal } from "./Modal";`,
        'Modal',
        [
          buildStep(1, 'Test the modal render.', ['Render the modal and assert the dialog content is visible.']),
          buildStep(2, 'Test the close button.', ['Pass a callback, click Close, and assert the callback was triggered.']),
          buildStep(3, 'Test Escape key handling.', ['Render the modal, press Escape, and assert the callback was triggered.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/Modal.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders the modal content", () => {
    render(React.createElement(Modal, { onClose: () => {} }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Important modal content")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    let closed = 0;
    render(React.createElement(Modal, { onClose: () => { closed += 1; } }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(closed).toBe(1);
  });

  it("calls onClose when Escape is pressed", () => {
    let closed = 0;
    render(React.createElement(Modal, { onClose: () => { closed += 1; } }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(closed).toBe(1);
  });
});`
    },
    testsMeta: {
      visibleChecks: ['renders dialog', 'button close', 'escape close'],
      hiddenChecks: ['non-escape key does not close', 'content still visible before close action']
    },
    commonPitfalls: ['Trying to inspect event listeners directly.', 'Not asserting that the callback actually ran.'],
    recallQuestions: ['What user behavior proves the Escape contract?', 'Why is a callback counter enough here?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Render the modal once per behavior and assert on either visible content or the public `onClose` callback.',
      whyTheseAssertionsMarkdown: 'The callback is the modal’s public closing contract, so counting calls is the most direct proof.',
      edgeCasesMarkdown: 'Non-Escape keys should not close the modal, and the dialog should still render before any close action.'
    },
    hiddenMutants: [
      {
        id: 'wrong-key',
        mutatedFiles: [
          {
            path: '/src/Modal.tsx',
            contents: `import React from "react";

export function Modal({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      <p>Important modal content</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}`
          }
        ]
      },
      {
        id: 'button-missing-close',
        mutatedFiles: [
          {
            path: '/src/Modal.tsx',
            contents: `import React from "react";

export function Modal({ onClose }: { onClose: () => void }) {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      <p>Important modal content</p>
      <button>Close</button>
    </div>
  );
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-tabs',
    title: 'Test Tabs panel switching',
    difficulty: 'medium',
    category: 'react-component',
    topics: ['user-events', 'conditional-rendering', 'accessibility'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a tabs component that switches the active panel when different tabs are clicked.`,
    requirements: ['Test the initial active tab.', 'Test switching to another tab.', 'Test the active tab indicator updates.'],
    constraints: ['Assert on visible panels and selected state.', 'Do not inspect component internals.'],
    sourceFiles: [
      {
        path: '/src/TabsDemo.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

const tabs = [
  { id: "overview", label: "Overview", content: "Overview panel" },
  { id: "details", label: "Details", content: "Details panel" }
];

export function TabsDemo() {
  const [activeId, setActiveId] = React.useState("overview");
  const activeTab = tabs.find((tab) => tab.id === activeId)!;

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeTab.content}</div>
    </div>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/TabsDemo.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TabsDemo } from "./TabsDemo";`,
        'TabsDemo',
        [
          buildStep(1, 'Test the default active tab.', ['Render the component and assert the Overview panel is visible first.']),
          buildStep(2, 'Test panel switching.', ['Click the Details tab and assert the Details panel becomes visible.']),
          buildStep(3, 'Test selected-state updates.', ['Assert the selected tab updates when the active tab changes.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/TabsDemo.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TabsDemo } from "./TabsDemo";

describe("TabsDemo", () => {
  it("shows the overview panel by default", () => {
    render(React.createElement(TabsDemo));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
  });

  it("switches to the details panel when clicked", () => {
    render(React.createElement(TabsDemo));
    fireEvent.click(screen.getByRole("tab", { name: "Details" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Details panel");
  });

  it("updates the selected state with the active tab", () => {
    render(React.createElement(TabsDemo));
    const overview = screen.getByRole("tab", { name: "Overview" });
    const details = screen.getByRole("tab", { name: "Details" });
    expect(overview.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(details);
    expect(details.getAttribute("aria-selected")).toBe("true");
    expect(overview.getAttribute("aria-selected")).toBe("false");
  });
});`
    },
    testsMeta: {
      visibleChecks: ['default panel', 'switching panel', 'selected state'],
      hiddenChecks: ['only one selected tab', 'panel text matches active tab']
    },
    commonPitfalls: ['Only checking panel text without the selected state.', 'Querying implementation details instead of roles/text.'],
    recallQuestions: ['Why is `aria-selected` worth testing here?', 'What user behavior drives the panel change?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Use roles to find the tabs and panel, then assert both visible content and selected state as the user interacts.',
      whyTheseAssertionsMarkdown: 'Tabs are both visual and accessible UI, so the selected-state assertion adds important coverage without coupling to internals.',
      edgeCasesMarkdown: 'A tabs UI can show the right panel but forget to update the selected-state indicator.'
    },
    hiddenMutants: [
      {
        id: 'selected-never-updates',
        mutatedFiles: [
          {
            path: '/src/TabsDemo.tsx',
            contents: `import React from "react";

const tabs = [
  { id: "overview", label: "Overview", content: "Overview panel" },
  { id: "details", label: "Details", content: "Details panel" }
];

export function TabsDemo() {
  const [activeId, setActiveId] = React.useState("overview");
  const activeTab = tabs.find((tab) => tab.id === activeId)!;

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === "overview"}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeTab.content}</div>
    </div>
  );
}`
          }
        ]
      },
      {
        id: 'panel-never-switches',
        mutatedFiles: [
          {
            path: '/src/TabsDemo.tsx',
            contents: `import React from "react";

const tabs = [
  { id: "overview", label: "Overview", content: "Overview panel" },
  { id: "details", label: "Details", content: "Details panel" }
];

export function TabsDemo() {
  const [activeId, setActiveId] = React.useState("overview");
  const activeTab = tabs.find((tab) => tab.id === "overview")!;

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeTab.content}</div>
    </div>
  );
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-theme-toggle',
    title: 'Test ThemeToggle UI updates',
    difficulty: 'medium',
    category: 'react-component',
    topics: ['user-events', 'conditional-rendering'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for a theme toggle that switches the visible label from light mode to dark mode and back.`,
    requirements: ['Test the initial mode.', 'Test toggling once.', 'Test toggling twice returns to the original mode.'],
    constraints: ['Assert on visible text and button labels.', 'Avoid testing state directly.'],
    sourceFiles: [
      {
        path: '/src/ThemeToggle.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <div>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme(nextTheme)}>Switch to {nextTheme}</button>
    </div>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/ThemeToggle.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";`,
        'ThemeToggle',
        [
          buildStep(1, 'Test the initial mode.', ['Render the component and assert it starts in light mode.']),
          buildStep(2, 'Test one toggle.', ['Click once and assert the visible theme changes to dark.']),
          buildStep(3, 'Test toggling back.', ['Click twice and assert the component returns to light mode.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/ThemeToggle.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("starts in light mode", () => {
    render(React.createElement(ThemeToggle));
    expect(screen.getByText("Theme: light")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Switch to dark");
  });

  it("switches to dark mode after one click", () => {
    render(React.createElement(ThemeToggle));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Theme: dark")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Switch to light");
  });

  it("switches back to light mode after two clicks", () => {
    render(React.createElement(ThemeToggle));
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Theme: light")).toBeInTheDocument();
  });
});`
    },
    testsMeta: {
      visibleChecks: ['initial mode', 'first toggle', 'second toggle'],
      hiddenChecks: ['button label tracks next theme', 'toggle remains reversible']
    },
    commonPitfalls: ['Only asserting after one click.', 'Ignoring the visible label.'],
    recallQuestions: ['What behavior proves the toggle is reversible?', 'Why is visible text enough here?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Start with the default state, then drive the component through one toggle and back again.',
      whyTheseAssertionsMarkdown: 'A user experiences the theme toggle through the visible text and button label, not internal state variables.',
      edgeCasesMarkdown: 'Toggles often work in one direction and fail to reverse cleanly, so the second click matters.'
    },
    hiddenMutants: [
      {
        id: 'button-label-stale',
        mutatedFiles: [
          {
            path: '/src/ThemeToggle.tsx',
            contents: `import React from "react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const nextTheme = "dark";

  return (
    <div>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Switch to {nextTheme}</button>
    </div>
  );
}`
          }
        ]
      },
      {
        id: 'never-switches-back',
        mutatedFiles: [
          {
            path: '/src/ThemeToggle.tsx',
            contents: `import React from "react";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  return (
    <div>
      <p>Theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>Switch to dark</button>
    </div>
  );
}`
          }
        ]
      }
    ]
  }),
  createProblem({
    id: 'unit-testing-pagination-controls',
    title: 'Test PaginationControls disabled states',
    difficulty: 'hard',
    category: 'react-component',
    topics: ['rendering', 'user-events', 'edge-cases'],
    framework: 'vitest-testing-library',
    promptMarkdown: `Write tests for pagination controls that disable Previous and Next correctly at the boundaries.`,
    requirements: ['Test the first-page state.', 'Test a middle page state.', 'Test the last-page state.'],
    constraints: ['Assert on disabled button behavior.', 'Do not inspect page math internals.'],
    sourceFiles: [
      {
        path: '/src/PaginationControls.tsx',
        language: 'tsx',
        editable: false,
        contents: `import React from "react";

export function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <button disabled={page === 1} onClick={onPrevious}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page === totalPages} onClick={onNext}>Next</button>
    </div>
  );
}`
      }
    ],
    testStubFile: {
      path: '/src/PaginationControls.test.tsx',
      language: 'tsx',
      contents: buildStub(
        `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PaginationControls } from "./PaginationControls";`,
        'PaginationControls',
        [
          buildStep(1, 'Test the first-page boundary.', ['Render page 1 and assert Previous is disabled while Next is enabled.']),
          buildStep(2, 'Test a middle page.', ['Render a middle page and assert both buttons are enabled.']),
          buildStep(3, 'Test the last-page boundary.', ['Render the final page and assert Next is disabled.'])
        ]
      )
    },
    referenceTestFile: {
      path: '/src/PaginationControls.test.tsx',
      language: 'tsx',
      contents: `import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PaginationControls } from "./PaginationControls";

describe("PaginationControls", () => {
  it("disables Previous on the first page", () => {
    render(React.createElement(PaginationControls, {
      page: 1,
      totalPages: 4,
      onPrevious: () => {},
      onNext: () => {}
    }));
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("enables both buttons on a middle page", () => {
    render(React.createElement(PaginationControls, {
      page: 2,
      totalPages: 4,
      onPrevious: () => {},
      onNext: () => {}
    }));
    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("disables Next on the last page", () => {
    render(React.createElement(PaginationControls, {
      page: 4,
      totalPages: 4,
      onPrevious: () => {},
      onNext: () => {}
    }));
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});`
    },
    testsMeta: {
      visibleChecks: ['first page', 'middle page', 'last page'],
      hiddenChecks: ['only the correct boundary button is disabled', 'middle page keeps both enabled']
    },
    commonPitfalls: ['Only testing one boundary.', 'Ignoring the middle-page control state.'],
    recallQuestions: ['What behavior proves the boundary logic?', 'Why does the middle page deserve its own test?'],
    solutionNotes: {
      testingStrategyMarkdown: 'Treat first, middle, and last pages as three distinct behavior states and assert the disabled state of each button.',
      whyTheseAssertionsMarkdown: 'Disabled buttons are the control contract the user experiences, so they are the right thing to test directly.',
      edgeCasesMarkdown: 'Boundary logic often breaks at one end only, so both edges plus the middle state need coverage.'
    },
    hiddenMutants: [
      {
        id: 'previous-never-disabled',
        mutatedFiles: [
          {
            path: '/src/PaginationControls.tsx',
            contents: `import React from "react";

export function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <button disabled={false} onClick={onPrevious}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page === totalPages} onClick={onNext}>Next</button>
    </div>
  );
}`
          }
        ]
      },
      {
        id: 'next-disabled-too-early',
        mutatedFiles: [
          {
            path: '/src/PaginationControls.tsx',
            contents: `import React from "react";

export function PaginationControls({
  page,
  totalPages,
  onPrevious,
  onNext
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <button disabled={page === 1} onClick={onPrevious}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages - 2} onClick={onNext}>Next</button>
    </div>
  );
}`
          }
        ]
      }
    ]
  })
];

export { unitTestingProblems };
