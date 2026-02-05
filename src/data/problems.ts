import { Problem } from '../types/problem';

export const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    patterns: ['Arrays/Hashing'],
    statementMarkdown: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume exactly one solution exists, and you may not use the same element twice.`,
    planMarkdown: `Use a hash map of number -> index. Scan once, and for each value look up its complement in the map.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    functionName: 'twoSum',
    referenceSolution: `function twoSum(nums: number[], target: number): number[] {\n  const seen = new Map<number, number>();\n  for (let i = 0; i < nums.length; i += 1) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement) as number, i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}`,
    guidedStub: `function twoSum(nums: number[], target: number): number[] {\n  // Step 1: Initialize a map from number -> index so we can look up complements in O(1).\n  // TODO(step 1 start)\n  // Use a Map to store numbers we have seen and their indices.\n  // TODO(step 1 end)\n\n  // Step 2: Iterate through nums once, keeping the invariant that "seen" contains indices of previous elements.\n  // TODO(step 2 start)\n  // Loop over indices from 0 to nums.length - 1.\n  // TODO(step 2 end)\n\n  // Step 3: For each number, compute complement = target - current, and check if it exists in seen.\n  // TODO(step 3 start)\n  // Compute complement and check the map.\n  // TODO(step 3 end)\n\n  // Step 4: If found, return the pair of indices. Otherwise add current number to seen.\n  // TODO(step 4 start)\n  // Return indices when found, otherwise add to map.\n  // TODO(step 4 end)\n\n  // Step 5: If no solution exists, return an empty array (based on problem requirements).\n  // TODO(step 5 start)\n  // Return fallback.\n  // TODO(step 5 end)\n\n  return [];\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[[2,7,11,15], 9]', expected: '[0,1]' },
        { name: 'example 2', input: '[[3,2,4], 6]', expected: '[1,2]' }
      ],
      hidden: [
        { name: 'negative numbers', input: '[[-1,-2,-3,-4,-5], -8]', expected: '[2,4]' }
      ]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      commonPitfalls: ['Using nested loops', 'Forgetting to store index before check'],
      recallQuestions: ['What invariant does the map maintain?', 'Why is the lookup O(1)?']
    }
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    patterns: ['Two Pointers'],
    statementMarkdown: `Given a string \`s\`, return true if it is a palindrome, considering only alphanumeric characters and ignoring cases.`,
    planMarkdown: `Use two pointers moving inward. Skip non-alphanumeric characters and compare lowercase forms.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    functionName: 'isPalindrome',
    referenceSolution: `function isPalindrome(s: string): boolean {\n  let left = 0;\n  let right = s.length - 1;\n  const isAlphaNum = (ch: string) => /[a-z0-9]/i.test(ch);\n  while (left < right) {\n    while (left < right && !isAlphaNum(s[left])) left += 1;\n    while (left < right && !isAlphaNum(s[right])) right -= 1;\n    if (s[left].toLowerCase() !== s[right].toLowerCase()) return false;\n    left += 1;\n    right -= 1;\n  }\n  return true;\n}`,
    guidedStub: `function isPalindrome(s: string): boolean {\n  // Step 1: Set up two pointers at the start and end of the string.\n  // TODO(step 1 start)\n  // Initialize left and right indices.\n  // TODO(step 1 end)\n\n  // Step 2: Define a helper to check if a character is alphanumeric.\n  // TODO(step 2 start)\n  // Create a small helper using a regex.\n  // TODO(step 2 end)\n\n  // Step 3: Move pointers inward, skipping non-alphanumeric characters.\n  // TODO(step 3 start)\n  // Advance left/right while invalid.\n  // TODO(step 3 end)\n\n  // Step 4: Compare lowercase characters and early return on mismatch.\n  // TODO(step 4 start)\n  // Compare and return false if needed.\n  // TODO(step 4 end)\n\n  // Step 5: If all pairs match, return true.\n  // TODO(step 5 start)\n  // Return true when loop finishes.\n  // TODO(step 5 end)\n\n  return true;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '["A man, a plan, a canal: Panama"]', expected: 'true' },
        { name: 'example 2', input: '["race a car"]', expected: 'false' }
      ],
      hidden: [{ name: 'numbers', input: '["0P"]', expected: 'false' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      commonPitfalls: ['Not skipping punctuation', 'Case sensitivity'],
      recallQuestions: ['Why two pointers instead of reverse?', 'What gets skipped?']
    }
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    patterns: ['Sliding Window'],
    statementMarkdown: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    planMarkdown: `Use a sliding window with a map of last seen indices. Move the left pointer when duplicates appear.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3' },
      { input: 's = "bbbbb"', output: '1' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4'],
    functionName: 'lengthOfLongestSubstring',
    referenceSolution: `function lengthOfLongestSubstring(s: string): number {\n  const lastSeen = new Map<string, number>();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right += 1) {\n    const ch = s[right];\n    const prev = lastSeen.get(ch);\n    if (prev !== undefined && prev >= left) {\n      left = prev + 1;\n    }\n    lastSeen.set(ch, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}`,
    guidedStub: `function lengthOfLongestSubstring(s: string): number {\n  // Step 1: Track last seen index for each character.\n  // TODO(step 1 start)\n  // Create a Map and window pointers.\n  // TODO(step 1 end)\n\n  // Step 2: Expand the window with a right pointer.\n  // TODO(step 2 start)\n  // Loop right across the string.\n  // TODO(step 2 end)\n\n  // Step 3: If a character repeats inside the window, move left past its previous index.\n  // TODO(step 3 start)\n  // Check lastSeen and adjust left.\n  // TODO(step 3 end)\n\n  // Step 4: Update last seen index and best window length.\n  // TODO(step 4 start)\n  // Update map and best length.\n  // TODO(step 4 end)\n\n  // Step 5: Return the best length.\n  // TODO(step 5 start)\n  // Return best.\n  // TODO(step 5 end)\n\n  return 0;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '["abcabcbb"]', expected: '3' },
        { name: 'example 2', input: '["bbbbb"]', expected: '1' }
      ],
      hidden: [{ name: 'empty', input: '[""]', expected: '0' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(min(n, alphabet))',
      commonPitfalls: ['Not moving left far enough', 'Updating best before moving left'],
      recallQuestions: ['What does the window represent?', 'Why is it linear?']
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    patterns: ['Stack'],
    statementMarkdown: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.`,
    planMarkdown: `Use a stack. Push open brackets; pop and match on closing.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: ['1 <= s.length <= 10^4'],
    functionName: 'isValidParentheses',
    referenceSolution: `function isValidParentheses(s: string): boolean {\n  const stack: string[] = [];\n  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };\n  for (const ch of s) {\n    if (ch === '(' || ch === '[' || ch === '{') {\n      stack.push(ch);\n    } else if (pairs[ch]) {\n      if (stack.pop() !== pairs[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}`,
    guidedStub: `function isValidParentheses(s: string): boolean {\n  // Step 1: Set up a stack and a map of closing -> opening.\n  // TODO(step 1 start)\n  // Define stack and pairs map.\n  // TODO(step 1 end)\n\n  // Step 2: Iterate through the string.\n  // TODO(step 2 start)\n  // Loop over each character.\n  // TODO(step 2 end)\n\n  // Step 3: Push opening brackets, and on closing, check the top of the stack.\n  // TODO(step 3 start)\n  // Handle opening vs closing.\n  // TODO(step 3 end)\n\n  // Step 4: If a mismatch happens, return false immediately.\n  // TODO(step 4 start)\n  // Return false on mismatch.\n  // TODO(step 4 end)\n\n  // Step 5: At the end, stack must be empty.\n  // TODO(step 5 start)\n  // Return stack length check.\n  // TODO(step 5 end)\n\n  return false;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '["()"]', expected: 'true' },
        { name: 'example 2', input: '["(]"]', expected: 'false' }
      ],
      hidden: [{ name: 'mixed', input: '["{[]}"]', expected: 'true' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      commonPitfalls: ['Not checking empty stack', 'Ignoring leftover openings'],
      recallQuestions: ['Why stack?', 'What invariant does stack maintain?']
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    patterns: ['Binary Search'],
    statementMarkdown: `Given a sorted array of integers and a target, return the index of the target, or -1 if not found.`,
    planMarkdown: `Use left/right pointers and narrow the interval based on comparison.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
    ],
    constraints: ['1 <= nums.length <= 10^4'],
    functionName: 'binarySearch',
    referenceSolution: `function binarySearch(nums: number[], target: number): number {\n  let left = 0;\n  let right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    guidedStub: `function binarySearch(nums: number[], target: number): number {\n  // Step 1: Initialize left and right pointers.\n  // TODO(step 1 start)\n  // Set left = 0, right = nums.length - 1.\n  // TODO(step 1 end)\n\n  // Step 2: Loop while the search space is valid.\n  // TODO(step 2 start)\n  // While left <= right.\n  // TODO(step 2 end)\n\n  // Step 3: Compute mid and compare to target.\n  // TODO(step 3 start)\n  // Compare nums[mid] with target.\n  // TODO(step 3 end)\n\n  // Step 4: Move left or right to discard half.\n  // TODO(step 4 start)\n  // Update left/right based on comparison.\n  // TODO(step 4 end)\n\n  // Step 5: If not found, return -1.\n  // TODO(step 5 start)\n  // Return -1.\n  // TODO(step 5 end)\n\n  return -1;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[[-1,0,3,5,9,12], 9]', expected: '4' },
        { name: 'example 2', input: '[[-1,0,3,5,9,12], 2]', expected: '-1' }
      ],
      hidden: [{ name: 'single', input: '[[5], 5]', expected: '0' }]
    },
    metadata: {
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      commonPitfalls: ['Off-by-one in loop condition', 'Mid overflow (not in JS)'],
      recallQuestions: ['Why sorted array?', 'What is the invariant?']
    }
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    patterns: ['Linked List'],
    statementMarkdown: `Reverse a singly linked list and return the new head.`,
    planMarkdown: `Iterate with prev/current pointers, reversing next links one by one.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }
    ],
    constraints: ['0 <= list length <= 5000'],
    functionName: 'reverseList',
    inputFormat: 'linked-list',
    outputFormat: 'linked-list',
    referenceSolution: `type ListNode = { val: number; next: ListNode | null };\nfunction reverseList(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}`,
    guidedStub: `type ListNode = { val: number; next: ListNode | null };\nfunction reverseList(head: ListNode | null): ListNode | null {\n  // Step 1: Initialize prev = null and curr = head.\n  // TODO(step 1 start)\n  // Set up pointers.\n  // TODO(step 1 end)\n\n  // Step 2: Loop while curr exists.\n  // TODO(step 2 start)\n  // While curr is not null.\n  // TODO(step 2 end)\n\n  // Step 3: Save next pointer, reverse link, then advance.\n  // TODO(step 3 start)\n  // Store next, reverse, move prev/curr.\n  // TODO(step 3 end)\n\n  // Step 4: After loop, prev is new head.\n  // TODO(step 4 start)\n  // Return prev.\n  // TODO(step 4 end)\n\n  return null;\n}`,
    tests: {
      visible: [{ name: 'example 1', input: '[[1,2,3,4,5]]', expected: '[5,4,3,2,1]' }],
      hidden: [{ name: 'empty', input: '[[]]', expected: '[]' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      commonPitfalls: ['Losing next pointer', 'Returning curr instead of prev'],
      recallQuestions: ['Why keep prev?', 'What does curr represent?']
    }
  },
  {
    id: 'max-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    patterns: ['Trees DFS'],
    statementMarkdown: `Return the maximum depth of a binary tree.`,
    planMarkdown: `Use DFS recursion: depth = 1 + max(left, right).`,
    examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3' }],
    constraints: ['0 <= nodes <= 10^4'],
    functionName: 'maxDepth',
    inputFormat: 'binary-tree',
    referenceSolution: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };\nfunction maxDepth(root: TreeNode | null): number {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}`,
    guidedStub: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };\nfunction maxDepth(root: TreeNode | null): number {\n  // Step 1: Base case for empty tree.\n  // TODO(step 1 start)\n  // Return 0 if root is null.\n  // TODO(step 1 end)\n\n  // Step 2: Recurse to get left depth.\n  // TODO(step 2 start)\n  // Compute left depth.\n  // TODO(step 2 end)\n\n  // Step 3: Recurse to get right depth.\n  // TODO(step 3 start)\n  // Compute right depth.\n  // TODO(step 3 end)\n\n  // Step 4: Return 1 + max of both.\n  // TODO(step 4 start)\n  // Return 1 + Math.max(left, right).\n  // TODO(step 4 end)\n\n  return 0;\n}`,
    tests: {
      visible: [{ name: 'example 1', input: '[[3,9,20,null,null,15,7]]', expected: '3' }],
      hidden: [{ name: 'empty', input: '[[]]', expected: '0' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(h)',
      commonPitfalls: ['Forgetting base case', 'Off-by-one depth'],
      recallQuestions: ['Why add 1?', 'What is depth of empty tree?']
    }
  },
  {
    id: 'level-order',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    patterns: ['Trees BFS'],
    statementMarkdown: `Given the root of a binary tree, return its level order traversal (values at each level).`,
    planMarkdown: `Use a queue for BFS, process level by level.`,
    examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }],
    constraints: ['0 <= nodes <= 2000'],
    functionName: 'levelOrder',
    inputFormat: 'binary-tree',
    referenceSolution: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };\nfunction levelOrder(root: TreeNode | null): number[][] {\n  if (!root) return [];\n  const result: number[][] = [];\n  const queue: TreeNode[] = [root];\n  while (queue.length) {\n    const size = queue.length;\n    const level: number[] = [];\n    for (let i = 0; i < size; i += 1) {\n      const node = queue.shift() as TreeNode;\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}`,
    guidedStub: `type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };\nfunction levelOrder(root: TreeNode | null): number[][] {\n  // Step 1: Handle empty tree.\n  // TODO(step 1 start)\n  // Return [] when root is null.\n  // TODO(step 1 end)\n\n  // Step 2: Initialize queue with root and result array.\n  // TODO(step 2 start)\n  // Create queue and result.\n  // TODO(step 2 end)\n\n  // Step 3: While queue not empty, process one level at a time.\n  // TODO(step 3 start)\n  // Loop while queue has nodes.\n  // TODO(step 3 end)\n\n  // Step 4: For each level, pop size nodes and push children.\n  // TODO(step 4 start)\n  // Build level array and enqueue children.\n  // TODO(step 4 end)\n\n  // Step 5: Return result.\n  // TODO(step 5 start)\n  // Return result.\n  // TODO(step 5 end)\n\n  return [];\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[[3,9,20,null,null,15,7]]', expected: '[[3],[9,20],[15,7]]' }
      ],
      hidden: [{ name: 'single', input: '[[1]]', expected: '[[1]]' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      commonPitfalls: ['Not resetting level array', 'Using recursion instead of queue'],
      recallQuestions: ['Why BFS?', 'What does size represent?']
    }
  },
  {
    id: 'kth-largest',
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    patterns: ['Heap/Priority Queue'],
    statementMarkdown: `Return the kth largest element in the array.`,
    planMarkdown: `Maintain a min-heap of size k; the top is kth largest.`,
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }
    ],
    constraints: ['1 <= k <= nums.length <= 10^4'],
    functionName: 'findKthLargest',
    referenceSolution: `class MinHeap {\n  private data: number[] = [];\n  push(value: number) {\n    this.data.push(value);\n    this.bubbleUp(this.data.length - 1);\n  }\n  pop(): number | undefined {\n    if (this.data.length === 0) return undefined;\n    const top = this.data[0];\n    const last = this.data.pop() as number;\n    if (this.data.length) {\n      this.data[0] = last;\n      this.bubbleDown(0);\n    }\n    return top;\n  }\n  peek() {\n    return this.data[0];\n  }\n  size() {\n    return this.data.length;\n  }\n  private bubbleUp(index: number) {\n    while (index > 0) {\n      const parent = Math.floor((index - 1) / 2);\n      if (this.data[parent] <= this.data[index]) break;\n      [this.data[parent], this.data[index]] = [this.data[index], this.data[parent]];\n      index = parent;\n    }\n  }\n  private bubbleDown(index: number) {\n    const len = this.data.length;\n    while (true) {\n      const left = index * 2 + 1;\n      const right = index * 2 + 2;\n      let smallest = index;\n      if (left < len && this.data[left] < this.data[smallest]) smallest = left;\n      if (right < len && this.data[right] < this.data[smallest]) smallest = right;\n      if (smallest === index) break;\n      [this.data[smallest], this.data[index]] = [this.data[index], this.data[smallest]];\n      index = smallest;\n    }\n  }\n}\nfunction findKthLargest(nums: number[], k: number): number {\n  const heap = new MinHeap();\n  for (const num of nums) {\n    heap.push(num);\n    if (heap.size() > k) heap.pop();\n  }\n  return heap.peek() as number;\n}`,
    guidedStub: `class MinHeap {\n  private data: number[] = [];\n  // Step 1: Implement push with bubble-up.\n  // TODO(step 1 start)\n  // Write push(value) and bubbleUp helper.\n  // TODO(step 1 end)\n\n  // Step 2: Implement pop with bubble-down.\n  // TODO(step 2 start)\n  // Write pop() and bubbleDown helper.\n  // TODO(step 2 end)\n\n  // Step 3: Implement peek and size.\n  // TODO(step 3 start)\n  // Return top and length.\n  // TODO(step 3 end)\n}\n\nfunction findKthLargest(nums: number[], k: number): number {\n  // Step 4: Maintain a min-heap of size k.\n  // TODO(step 4 start)\n  // Push each num and pop if size > k.\n  // TODO(step 4 end)\n\n  // Step 5: Return the top of the heap.\n  // TODO(step 5 start)\n  // Return heap.peek().\n  // TODO(step 5 end)\n\n  return 0;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[[3,2,1,5,6,4], 2]', expected: '5' },
        { name: 'example 2', input: '[[3,2,3,1,2,4,5,5,6], 4]', expected: '4' }
      ],
      hidden: [{ name: 'single', input: '[[1], 1]', expected: '1' }]
    },
    metadata: {
      timeComplexity: 'O(n log k)',
      spaceComplexity: 'O(k)',
      commonPitfalls: ['Building max heap instead of min heap', 'Forgetting to pop when size > k'],
      recallQuestions: ['Why min-heap?', 'What stays in heap at the end?']
    }
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    patterns: ['Graphs'],
    statementMarkdown: `Given a grid of '1's (land) and '0's (water), return the number of islands.`,
    planMarkdown: `Use DFS/BFS to flood-fill each unseen land cell.`,
    examples: [
      { input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', output: '2' }
    ],
    constraints: ['1 <= rows, cols <= 300'],
    functionName: 'numIslands',
    referenceSolution: `function numIslands(grid: string[][]): number {\n  const rows = grid.length;\n  const cols = grid[0]?.length ?? 0;\n  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));\n  const dfs = (r: number, c: number) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    if (visited[r][c] || grid[r][c] === '0') return;\n    visited[r][c] = true;\n    dfs(r + 1, c);\n    dfs(r - 1, c);\n    dfs(r, c + 1);\n    dfs(r, c - 1);\n  };\n  let count = 0;\n  for (let r = 0; r < rows; r += 1) {\n    for (let c = 0; c < cols; c += 1) {\n      if (!visited[r][c] && grid[r][c] === '1') {\n        count += 1;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}`,
    guidedStub: `function numIslands(grid: string[][]): number {\n  // Step 1: Capture grid dimensions and visited tracking.\n  // TODO(step 1 start)\n  // Define rows, cols, visited.\n  // TODO(step 1 end)\n\n  // Step 2: Write a DFS helper that marks land as visited.\n  // TODO(step 2 start)\n  // Implement dfs with bounds and water checks.\n  // TODO(step 2 end)\n\n  // Step 3: Walk all cells and launch DFS on unvisited land.\n  // TODO(step 3 start)\n  // Loop over r, c.\n  // TODO(step 3 end)\n\n  // Step 4: Increment island count when DFS starts.\n  // TODO(step 4 start)\n  // Increase count and call dfs.\n  // TODO(step 4 end)\n\n  // Step 5: Return the count.\n  // TODO(step 5 start)\n  // Return count.\n  // TODO(step 5 end)\n\n  return 0;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[[["1","1","0"],["1","0","0"],["0","0","1"]]]', expected: '2' }
      ],
      hidden: [{ name: 'all water', input: '[[["0","0"],["0","0"]]]', expected: '0' }]
    },
    metadata: {
      timeComplexity: 'O(r*c)',
      spaceComplexity: 'O(r*c)',
      commonPitfalls: ['Not marking visited', 'Missing bounds checks'],
      recallQuestions: ['What does DFS guarantee?', 'Why count increments before DFS?']
    }
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    patterns: ['DP 1D'],
    statementMarkdown: `You can climb 1 or 2 steps. How many distinct ways to reach the top?`,
    planMarkdown: `Use DP: ways[i] = ways[i-1] + ways[i-2].`,
    examples: [
      { input: 'n = 2', output: '2' },
      { input: 'n = 3', output: '3' }
    ],
    constraints: ['1 <= n <= 45'],
    functionName: 'climbStairs',
    referenceSolution: `function climbStairs(n: number): number {\n  if (n <= 2) return n;\n  let prev = 1;\n  let curr = 2;\n  for (let i = 3; i <= n; i += 1) {\n    const next = prev + curr;\n    prev = curr;\n    curr = next;\n  }\n  return curr;\n}`,
    guidedStub: `function climbStairs(n: number): number {\n  // Step 1: Handle small n directly.\n  // TODO(step 1 start)\n  // Return n when n <= 2.\n  // TODO(step 1 end)\n\n  // Step 2: Initialize dp for ways to reach step 1 and 2.\n  // TODO(step 2 start)\n  // Set prev = 1, curr = 2.\n  // TODO(step 2 end)\n\n  // Step 3: Iterate from step 3 to n.\n  // TODO(step 3 start)\n  // Loop i from 3 to n.\n  // TODO(step 3 end)\n\n  // Step 4: Update rolling values for dp.\n  // TODO(step 4 start)\n  // Compute next and shift prev/curr.\n  // TODO(step 4 end)\n\n  // Step 5: Return curr as answer.\n  // TODO(step 5 start)\n  // Return curr.\n  // TODO(step 5 end)\n\n  return 0;\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[2]', expected: '2' },
        { name: 'example 2', input: '[3]', expected: '3' }
      ],
      hidden: [{ name: 'n=1', input: '[1]', expected: '1' }]
    },
    metadata: {
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      commonPitfalls: ['Not handling base case', 'Using recursion without memo'],
      recallQuestions: ['Why Fibonacci?', 'What do prev/curr represent?']
    }
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    patterns: ['Intervals'],
    statementMarkdown: `Given an array of intervals, merge overlapping intervals and return the merged list.`,
    planMarkdown: `Sort intervals by start, then merge by tracking the current interval.`,
    examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }],
    constraints: ['1 <= intervals.length <= 10^4'],
    functionName: 'mergeIntervals',
    referenceSolution: `function mergeIntervals(intervals: number[][]): number[][] {\n  if (intervals.length === 0) return [];\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result: number[][] = [intervals[0]];\n  for (let i = 1; i < intervals.length; i += 1) {\n    const last = result[result.length - 1];\n    const current = intervals[i];\n    if (current[0] <= last[1]) {\n      last[1] = Math.max(last[1], current[1]);\n    } else {\n      result.push(current);\n    }\n  }\n  return result;\n}`,
    guidedStub: `function mergeIntervals(intervals: number[][]): number[][] {\n  // Step 1: Handle empty input and sort by start time.\n  // TODO(step 1 start)\n  // Return [] if needed and sort intervals.\n  // TODO(step 1 end)\n\n  // Step 2: Seed the result with the first interval.\n  // TODO(step 2 start)\n  // Initialize result array.\n  // TODO(step 2 end)\n\n  // Step 3: Iterate through intervals and compare with last merged.\n  // TODO(step 3 start)\n  // Loop from index 1.\n  // TODO(step 3 end)\n\n  // Step 4: Merge if overlapping, otherwise append.\n  // TODO(step 4 start)\n  // Update last or push current.\n  // TODO(step 4 end)\n\n  // Step 5: Return merged result.\n  // TODO(step 5 start)\n  // Return result.\n  // TODO(step 5 end)\n\n  return [];\n}`,
    tests: {
      visible: [
        { name: 'example 1', input: '[[[1,3],[2,6],[8,10],[15,18]]]', expected: '[[1,6],[8,10],[15,18]]' }
      ],
      hidden: [{ name: 'single', input: '[[[1,4]]]', expected: '[[1,4]]' }]
    },
    metadata: {
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      commonPitfalls: ['Forgetting to sort', 'Not updating end time'],
      recallQuestions: ['Why sort?', 'What defines overlap?']
    }
  }
];
