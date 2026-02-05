import { DSASpeedDrill } from '../types/dsaDrill';

export const dsaDrills: DSASpeedDrill[] = [
  {
    id: 'pattern-two-sum',
    problemId: 'two-sum',
    drillType: 'pattern',
    difficulty: 'easy',
    promptMarkdown: 'Identify the pattern and explain why it works for Two Sum.',
    starterCode: '',
    allowedEditRegions: [],
    visibleTestsOnly: true,
    timeLimitMinutes: 3,
    referenceSnippet: 'Hash map for complements.',
    recallQuestions: ['What pattern did you use?', 'What invariant did you keep?']
  },
  {
    id: 'core-loop-two-sum',
    problemId: 'two-sum',
    drillType: 'core-loop',
    difficulty: 'easy',
    promptMarkdown: 'Fill in the core loop only.',
    starterCode: `function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  // EDIT_START\n  // EDIT_END\n  return [];\n}`,
    allowedEditRegions: [{ start: '// EDIT_START', end: '// EDIT_END' }],
    visibleTestsOnly: true,
    timeLimitMinutes: 6,
    referenceSnippet: 'for loop: check complement and return indices.',
    recallQuestions: ['What did the map store?']
  },
  {
    id: 'invariant-palindrome',
    problemId: 'valid-palindrome',
    drillType: 'invariant',
    difficulty: 'easy',
    promptMarkdown: 'Fill in the invariant update lines.',
    starterCode: `function isPalindrome(s: string): boolean {\n  let left = 0;\n  let right = s.length - 1;\n  const isAlphaNum = (ch: string) => /[a-z0-9]/i.test(ch);\n  while (left < right) {\n    while (left < right && !isAlphaNum(s[left])) {\n      // EDIT_START\n      // EDIT_END\n    }\n    while (left < right && !isAlphaNum(s[right])) {\n      // EDIT_START\n      // EDIT_END\n    }\n    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;\n    left += 1;\n    right -= 1;\n  }\n  return true;\n}`,
    allowedEditRegions: [
      { start: '// EDIT_START', end: '// EDIT_END' },
      { start: '// EDIT_START', end: '// EDIT_END' }
    ],
    visibleTestsOnly: true,
    timeLimitMinutes: 4,
    referenceSnippet: 'Increment/decrement pointers when skipping.',
    recallQuestions: ['What invariant do the pointers maintain?']
  },
  {
    id: 'bugfix-valid-parens',
    problemId: 'valid-parentheses',
    drillType: 'bug-fix',
    difficulty: 'easy',
    promptMarkdown: 'Fix the bug in the stack logic.',
    starterCode: `function isValidParentheses(s: string): boolean {\n  const stack: string[] = [];\n  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n  for (const ch of s) {\n    if (ch === '(' || ch === '[' || ch === '{') {\n      stack.push(ch);\n    } else if (pairs[ch]) {\n      // EDIT_START\n      if (stack[stack.length - 1] === pairs[ch]) return false;\n      stack.pop();\n      // EDIT_END\n    }\n  }\n  return stack.length === 0;\n}`,
    allowedEditRegions: [{ start: '// EDIT_START', end: '// EDIT_END' }],
    visibleTestsOnly: true,
    timeLimitMinutes: 5,
    referenceSnippet: 'Pop and compare; if mismatch return false.',
    recallQuestions: ['What causes mismatch?']
  },
  {
    id: 'pattern-sliding-window',
    problemId: 'longest-substring',
    drillType: 'pattern',
    difficulty: 'medium',
    promptMarkdown: 'Identify the pattern for longest substring without repeat.',
    starterCode: '',
    allowedEditRegions: [],
    visibleTestsOnly: true,
    timeLimitMinutes: 3,
    referenceSnippet: 'Sliding window + last seen map.',
    recallQuestions: ['What is the window invariant?']
  },
  {
    id: 'core-loop-sliding-window',
    problemId: 'longest-substring',
    drillType: 'core-loop',
    difficulty: 'medium',
    promptMarkdown: 'Implement the sliding window loop only.',
    starterCode: `function lengthOfLongestSubstring(s: string): number {\n  const lastSeen = new Map<string, number>();\n  let left = 0;\n  let best = 0;\n  // EDIT_START\n  // EDIT_END\n  return best;\n}`,
    allowedEditRegions: [{ start: '// EDIT_START', end: '// EDIT_END' }],
    visibleTestsOnly: true,
    timeLimitMinutes: 7,
    referenceSnippet: 'for right loop with left shift on repeat.',
    recallQuestions: ['Why is it linear?']
  },
  {
    id: 'pattern-two-pointers',
    problemId: 'valid-palindrome',
    drillType: 'pattern',
    difficulty: 'easy',
    promptMarkdown: 'Identify the pattern used in palindrome check.',
    starterCode: '',
    allowedEditRegions: [],
    visibleTestsOnly: true,
    timeLimitMinutes: 2,
    referenceSnippet: 'Two pointers moving inward.',
    recallQuestions: ['How do you skip non-alnum?']
  },
  {
    id: 'core-loop-binary-search',
    problemId: 'binary-search',
    drillType: 'core-loop',
    difficulty: 'easy',
    promptMarkdown: 'Implement the binary search loop only.',
    starterCode: `function binarySearch(nums: number[], target: number): number {\n  let left = 0;\n  let right = nums.length - 1;\n  // EDIT_START\n  // EDIT_END\n  return -1;\n}`,
    allowedEditRegions: [{ start: '// EDIT_START', end: '// EDIT_END' }],
    visibleTestsOnly: true,
    timeLimitMinutes: 5,
    referenceSnippet: 'while left <= right, mid, adjust bounds.',
    recallQuestions: ['What is the invariant?']
  },
  {
    id: 'invariant-merge-intervals',
    problemId: 'merge-intervals',
    drillType: 'invariant',
    difficulty: 'medium',
    promptMarkdown: 'Fill in invariant update for merging.',
    starterCode: `function mergeIntervals(intervals: number[][]): number[][] {\n  if (intervals.length === 0) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result: number[][] = [intervals[0]];\n  for (let i = 1; i < intervals.length; i += 1) {\n    const last = result[result.length - 1];\n    const current = intervals[i];\n    if (current[0] <= last[1]) {\n      // EDIT_START\n      // EDIT_END\n    } else {
      result.push(current);
    }
  }
  return result;
}`,
    allowedEditRegions: [{ start: '// EDIT_START', end: '// EDIT_END' }],
    visibleTestsOnly: true,
    timeLimitMinutes: 4,
    referenceSnippet: 'Update last[1] = Math.max(last[1], current[1]).',
    recallQuestions: ['What does last represent?']
  },
  {
    id: 'bugfix-valid-parentheses',
    problemId: 'valid-parentheses',
    drillType: 'bug-fix',
    difficulty: 'easy',
    promptMarkdown: 'Fix the bug to handle empty stack.',
    starterCode: `function isValidParentheses(s: string): boolean {\n  const stack: string[] = [];\n  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n  for (const ch of s) {\n    if (ch === '(' || ch === '[' || ch === '{') {\n      stack.push(ch);\n    } else if (pairs[ch]) {\n      // EDIT_START\n      const top = stack.pop();\n      if (top !== pairs[ch]) return false;\n      // EDIT_END\n    }\n  }\n  return stack.length === 0;\n}`,
    allowedEditRegions: [{ start: '// EDIT_START', end: '// EDIT_END' }],
    visibleTestsOnly: true,
    timeLimitMinutes: 5,
    referenceSnippet: 'Guard when stack empty before pop.',
    recallQuestions: ['Why check stack empty?']
  }
];
