import { DataStructureProblem } from '../types/dataStructures';

const createProblem = (problem: DataStructureProblem) => problem;

const buildTests = (cases: Array<{ name: string; body: string }>) =>
  ['export const tests = [', ...cases.map((test) => `  { name: ${JSON.stringify(test.name)}, run: ({ module, expect }) => {\n${test.body}\n  } },`), '];'].join('\n');

const prompt = (title: string, structure: string, summary: string) =>
  `## ${title}\n\nImplement **${structure}** from scratch.\n\n${summary}\n\nFocus on correct public behavior, predictable edge cases, and preserving the structure's invariant after every operation.`;

const complexities = (...items: DataStructureProblem['metadata']['expectedComplexities']) => items;

const dataStructureProblems: DataStructureProblem[] = [
  createProblem({
    id: 'data-structure-stack',
    title: 'Implement Stack',
    difficulty: 'easy',
    category: 'linear',
    structures: ['Stack'],
    operations: ['push', 'pop', 'peek', 'size', 'isEmpty'],
    promptMarkdown: prompt('Stack', 'Stack<T>', 'Build a LIFO stack with constant-time top operations.'),
    requirements: ['Export a `Stack<T>` class.', 'Implement `push`, `pop`, `peek`, `size`, and `isEmpty`.', 'Return `undefined` when popping or peeking an empty stack.'],
    constraints: ['Do not rely on global state.', 'Keep the API behavior deterministic.', 'Use only public methods in tests.'],
    guidedStubTs: `export class Stack<T> {\n  private items: T[];\n\n  constructor() {\n    // Step 1: Initialize the internal storage.\n    // TODO(step 1 start)\n    // Create the backing array.\n    // TODO(step 1 end)\n  }\n\n  push(value: T): void {\n    // Step 2: Add a value to the top of the stack.\n    // TODO(step 2 start)\n    // Implement push.\n    // TODO(step 2 end)\n  }\n\n  pop(): T | undefined {\n    // Step 3: Remove and return the most recently added value.\n    // TODO(step 3 start)\n    // Implement pop.\n    // TODO(step 3 end)\n  }\n\n  peek(): T | undefined {\n    // Step 4: Read the current top value without removing it.\n    // TODO(step 4 start)\n    // Implement peek.\n    // TODO(step 4 end)\n  }\n\n  size(): number {\n    // Step 5: Report how many items are stored.\n    // TODO(step 5 start)\n    // Implement size.\n    // TODO(step 5 end)\n  }\n\n  isEmpty(): boolean {\n    // Step 6: Report whether the stack is empty.\n    // TODO(step 6 start)\n    // Implement isEmpty.\n    // TODO(step 6 end)\n  }\n}\n`,
    referenceSolutionTs: `export class Stack<T> {\n  private items: T[];\n\n  constructor() {\n    this.items = [];\n  }\n\n  push(value: T): void {\n    this.items.push(value);\n  }\n\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n\n  peek(): T | undefined {\n    return this.items[this.items.length - 1];\n  }\n\n  size(): number {\n    return this.items.length;\n  }\n\n  isEmpty(): boolean {\n    return this.items.length === 0;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'starts empty', body: '    const stack = new module.Stack();\n    expect(stack.isEmpty()).toBe(true);\n    expect(stack.size()).toBe(0);' },
        { name: 'push grows size', body: '    const stack = new module.Stack();\n    stack.push(1);\n    stack.push(2);\n    expect(stack.size()).toBe(2);' },
        { name: 'peek reads latest item', body: '    const stack = new module.Stack();\n    stack.push("a");\n    stack.push("b");\n    expect(stack.peek()).toBe("b");\n    expect(stack.size()).toBe(2);' },
        { name: 'pop removes in LIFO order', body: '    const stack = new module.Stack();\n    stack.push(3);\n    stack.push(4);\n    expect(stack.pop()).toBe(4);\n    expect(stack.pop()).toBe(3);' },
        { name: 'empty pop returns undefined', body: '    const stack = new module.Stack();\n    expect(stack.pop()).toBe(undefined);\n    expect(stack.peek()).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'interleaved operations stay consistent', body: '    const stack = new module.Stack();\n    stack.push(1);\n    stack.push(2);\n    expect(stack.pop()).toBe(2);\n    stack.push(5);\n    expect(stack.peek()).toBe(5);\n    expect(stack.size()).toBe(2);' },
        { name: 'duplicate values are preserved', body: '    const stack = new module.Stack();\n    stack.push(7);\n    stack.push(7);\n    expect(stack.pop()).toBe(7);\n    expect(stack.pop()).toBe(7);' },
        { name: 'negative and zero values work', body: '    const stack = new module.Stack();\n    stack.push(0);\n    stack.push(-1);\n    expect(stack.peek()).toBe(-1);\n    expect(stack.pop()).toBe(-1);\n    expect(stack.pop()).toBe(0);' },
        { name: 'size returns to zero after drains', body: '    const stack = new module.Stack();\n    stack.push("x");\n    stack.push("y");\n    stack.pop();\n    stack.pop();\n    expect(stack.size()).toBe(0);\n    expect(stack.isEmpty()).toBe(true);' },
        { name: 'multiple peeks do not mutate state', body: '    const stack = new module.Stack();\n    stack.push(10);\n    expect(stack.peek()).toBe(10);\n    expect(stack.peek()).toBe(10);\n    expect(stack.size()).toBe(1);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'push', time: 'O(1)' },
        { operation: 'pop', time: 'O(1)' },
        { operation: 'peek', time: 'O(1)' },
        { operation: 'size', time: 'O(1)' }
      ),
      commonPitfalls: ['Forgetting to initialize storage in the constructor.', 'Changing size when peeking.', 'Returning the wrong end of the array.'],
      recallQuestions: ['Why is the top of a stack the last inserted item?', 'What should `pop` return on an empty stack?'],
      invariants: ['The logical top is always the most recently pushed item that has not been popped.', 'The reported size matches the number of stored items.']
    }
  }),
  createProblem({
    id: 'data-structure-queue',
    title: 'Implement Queue',
    difficulty: 'easy',
    category: 'linear',
    structures: ['Queue'],
    operations: ['enqueue', 'dequeue', 'peek', 'size', 'isEmpty'],
    promptMarkdown: prompt('Queue', 'Queue<T>', 'Build a FIFO queue that preserves insertion order.'),
    requirements: ['Export a `Queue<T>` class.', 'Implement `enqueue`, `dequeue`, `peek`, `size`, and `isEmpty`.', 'Dequeuing from an empty queue should return `undefined`.'],
    constraints: ['Public behavior matters more than exact internals.', 'Do not expose the backing storage directly.'],
    guidedStubTs: `export class Queue<T> {\n  private items: T[];\n  private head: number;\n\n  constructor() {\n    // Step 1: Initialize storage and the front pointer.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  enqueue(value: T): void {\n    // Step 2: Add a value at the back of the queue.\n    // TODO(step 2 start)\n    // Implement enqueue.\n    // TODO(step 2 end)\n  }\n\n  dequeue(): T | undefined {\n    // Step 3: Remove and return the oldest queued value.\n    // TODO(step 3 start)\n    // Implement dequeue.\n    // TODO(step 3 end)\n  }\n\n  peek(): T | undefined {\n    // Step 4: Inspect the current front value.\n    // TODO(step 4 start)\n    // Implement peek.\n    // TODO(step 4 end)\n  }\n\n  size(): number {\n    // Step 5: Report the number of active items.\n    // TODO(step 5 start)\n    // Implement size.\n    // TODO(step 5 end)\n  }\n\n  isEmpty(): boolean {\n    // Step 6: Return whether the queue is empty.\n    // TODO(step 6 start)\n    // Implement isEmpty.\n    // TODO(step 6 end)\n  }\n}\n`,
    referenceSolutionTs: `export class Queue<T> {\n  private items: T[];\n  private head: number;\n\n  constructor() {\n    this.items = [];\n    this.head = 0;\n  }\n\n  enqueue(value: T): void {\n    this.items.push(value);\n  }\n\n  dequeue(): T | undefined {\n    if (this.head >= this.items.length) {\n      return undefined;\n    }\n    const value = this.items[this.head];\n    this.head += 1;\n    if (this.head > 32 && this.head * 2 >= this.items.length) {\n      this.items = this.items.slice(this.head);\n      this.head = 0;\n    }\n    return value;\n  }\n\n  peek(): T | undefined {\n    return this.head >= this.items.length ? undefined : this.items[this.head];\n  }\n\n  size(): number {\n    return this.items.length - this.head;\n  }\n\n  isEmpty(): boolean {\n    return this.size() === 0;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'starts empty', body: '    const queue = new module.Queue();\n    expect(queue.isEmpty()).toBe(true);\n    expect(queue.size()).toBe(0);' },
        { name: 'enqueue adds items', body: '    const queue = new module.Queue();\n    queue.enqueue(1);\n    queue.enqueue(2);\n    expect(queue.size()).toBe(2);' },
        { name: 'peek returns oldest item', body: '    const queue = new module.Queue();\n    queue.enqueue("a");\n    queue.enqueue("b");\n    expect(queue.peek()).toBe("a");' },
        { name: 'dequeue follows FIFO order', body: '    const queue = new module.Queue();\n    queue.enqueue(5);\n    queue.enqueue(6);\n    expect(queue.dequeue()).toBe(5);\n    expect(queue.dequeue()).toBe(6);' },
        { name: 'dequeue on empty returns undefined', body: '    const queue = new module.Queue();\n    expect(queue.dequeue()).toBe(undefined);\n    expect(queue.peek()).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'interleaved enqueue and dequeue stays ordered', body: '    const queue = new module.Queue();\n    queue.enqueue(1);\n    queue.enqueue(2);\n    expect(queue.dequeue()).toBe(1);\n    queue.enqueue(3);\n    expect(queue.dequeue()).toBe(2);\n    expect(queue.dequeue()).toBe(3);' },
        { name: 'duplicate values persist independently', body: '    const queue = new module.Queue();\n    queue.enqueue(9);\n    queue.enqueue(9);\n    expect(queue.dequeue()).toBe(9);\n    expect(queue.dequeue()).toBe(9);' },
        { name: 'size tracks after partial drains', body: '    const queue = new module.Queue();\n    queue.enqueue(0);\n    queue.enqueue(-1);\n    queue.enqueue(-2);\n    queue.dequeue();\n    expect(queue.size()).toBe(2);' },
        { name: 'peek does not remove front item', body: '    const queue = new module.Queue();\n    queue.enqueue("x");\n    expect(queue.peek()).toBe("x");\n    expect(queue.size()).toBe(1);\n    expect(queue.dequeue()).toBe("x");' },
        { name: 'empty after draining all items', body: '    const queue = new module.Queue();\n    queue.enqueue(4);\n    queue.dequeue();\n    expect(queue.isEmpty()).toBe(true);\n    expect(queue.size()).toBe(0);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'enqueue', time: 'O(1)' },
        { operation: 'dequeue', time: 'O(1) amortized' },
        { operation: 'peek', time: 'O(1)' },
        { operation: 'size', time: 'O(1)' }
      ),
      commonPitfalls: ['Calling `shift()` repeatedly and accidentally making `dequeue` linear.', 'Forgetting to advance the head pointer.', 'Reading from the back instead of the front.'],
      recallQuestions: ['What does FIFO mean in practice?', 'Why can a head pointer be preferable to repeated array shifts?'],
      invariants: ['The front of the queue is always the oldest non-dequeued item.', 'Size reflects active items, not storage length.']
    }
  }),
  createProblem({
    id: 'data-structure-deque',
    title: 'Implement Deque',
    difficulty: 'easy',
    category: 'linear',
    structures: ['Deque'],
    operations: ['pushFront', 'pushBack', 'popFront', 'popBack', 'size'],
    promptMarkdown: prompt('Deque', 'Deque<T>', 'Implement a double-ended queue with efficient access to both ends.'),
    requirements: ['Export a `Deque<T>` class.', 'Support insertion and removal at both ends.', 'Return `undefined` when removing from an empty deque.'],
    constraints: ['Keep both ends consistent after interleaved operations.', 'Preserve the logical order of elements.'],
    guidedStubTs: `export class Deque<T> {\n  private items: Record<number, T>;\n  private head: number;\n  private tail: number;\n\n  constructor() {\n    // Step 1: Initialize indexed storage and boundary pointers.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  pushFront(value: T): void {\n    // Step 2: Insert a value at the front.\n    // TODO(step 2 start)\n    // Implement pushFront.\n    // TODO(step 2 end)\n  }\n\n  pushBack(value: T): void {\n    // Step 3: Insert a value at the back.\n    // TODO(step 3 start)\n    // Implement pushBack.\n    // TODO(step 3 end)\n  }\n\n  popFront(): T | undefined {\n    // Step 4: Remove and return the front item.\n    // TODO(step 4 start)\n    // Implement popFront.\n    // TODO(step 4 end)\n  }\n\n  popBack(): T | undefined {\n    // Step 5: Remove and return the back item.\n    // TODO(step 5 start)\n    // Implement popBack.\n    // TODO(step 5 end)\n  }\n\n  size(): number {\n    // Step 6: Return the active item count.\n    // TODO(step 6 start)\n    // Implement size.\n    // TODO(step 6 end)\n  }\n}\n`,
    referenceSolutionTs: `export class Deque<T> {\n  private items: Record<number, T>;\n  private head: number;\n  private tail: number;\n\n  constructor() {\n    this.items = {};\n    this.head = 0;\n    this.tail = 0;\n  }\n\n  pushFront(value: T): void {\n    this.head -= 1;\n    this.items[this.head] = value;\n  }\n\n  pushBack(value: T): void {\n    this.items[this.tail] = value;\n    this.tail += 1;\n  }\n\n  popFront(): T | undefined {\n    if (this.size() === 0) return undefined;\n    const value = this.items[this.head];\n    delete this.items[this.head];\n    this.head += 1;\n    return value;\n  }\n\n  popBack(): T | undefined {\n    if (this.size() === 0) return undefined;\n    this.tail -= 1;\n    const value = this.items[this.tail];\n    delete this.items[this.tail];\n    return value;\n  }\n\n  size(): number {\n    return this.tail - this.head;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'pushFront grows deque', body: '    const deque = new module.Deque();\n    deque.pushFront(1);\n    expect(deque.size()).toBe(1);' },
        { name: 'pushBack grows deque', body: '    const deque = new module.Deque();\n    deque.pushBack(2);\n    deque.pushBack(3);\n    expect(deque.size()).toBe(2);' },
        { name: 'popFront returns oldest front item', body: '    const deque = new module.Deque();\n    deque.pushFront(2);\n    deque.pushFront(1);\n    expect(deque.popFront()).toBe(1);' },
        { name: 'popBack returns latest back item', body: '    const deque = new module.Deque();\n    deque.pushBack(1);\n    deque.pushBack(2);\n    expect(deque.popBack()).toBe(2);' },
        { name: 'empty pops return undefined', body: '    const deque = new module.Deque();\n    expect(deque.popFront()).toBe(undefined);\n    expect(deque.popBack()).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'front and back operations interleave correctly', body: '    const deque = new module.Deque();\n    deque.pushBack(2);\n    deque.pushFront(1);\n    deque.pushBack(3);\n    expect(deque.popFront()).toBe(1);\n    expect(deque.popBack()).toBe(3);\n    expect(deque.popFront()).toBe(2);' },
        { name: 'duplicate values do not collapse', body: '    const deque = new module.Deque();\n    deque.pushFront(5);\n    deque.pushBack(5);\n    expect(deque.popFront()).toBe(5);\n    expect(deque.popBack()).toBe(5);' },
        { name: 'size resets after full drain', body: '    const deque = new module.Deque();\n    deque.pushBack(1);\n    deque.pushFront(0);\n    deque.popBack();\n    deque.popFront();\n    expect(deque.size()).toBe(0);' },
        { name: 'back after front insertions stays correct', body: '    const deque = new module.Deque();\n    deque.pushFront(3);\n    deque.pushFront(2);\n    deque.pushFront(1);\n    expect(deque.popBack()).toBe(3);' },
        { name: 'front after back insertions stays correct', body: '    const deque = new module.Deque();\n    deque.pushBack("a");\n    deque.pushBack("b");\n    expect(deque.popFront()).toBe("a");' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'pushFront', time: 'O(1)' },
        { operation: 'pushBack', time: 'O(1)' },
        { operation: 'popFront', time: 'O(1)' },
        { operation: 'popBack', time: 'O(1)' }
      ),
      commonPitfalls: ['Mixing up which pointer owns the current front or back.', 'Deleting the wrong slot when popping.', 'Returning stale values after the deque becomes empty.'],
      recallQuestions: ['How does a deque differ from a queue?', 'Which invariants make both ends safe to update independently?'],
      invariants: ['Head points at the current logical front slot.', 'Tail points one past the current logical back slot.', 'Size is always `tail - head`.']
    }
  }),
  createProblem({
    id: 'data-structure-hash-set',
    title: 'Implement HashSet',
    difficulty: 'easy',
    category: 'hashing',
    structures: ['HashSet'],
    operations: ['add', 'has', 'delete', 'size'],
    promptMarkdown: prompt('HashSet', 'HashSet<T>', 'Implement a set with unique membership semantics.'),
    requirements: ['Export a `HashSet<T extends string | number>` class.', 'Support `add`, `has`, `delete`, and `size`.', 'Adding duplicates should not grow the set.'],
    constraints: ['Only public behavior is tested.', 'Deletion should report whether a value existed.'],
    guidedStubTs: `export class HashSet<T extends string | number> {\n  private storage: Map<T, true>;\n\n  constructor() {\n    // Step 1: Initialize the set storage.\n    // TODO(step 1 start)\n    // Create the backing map.\n    // TODO(step 1 end)\n  }\n\n  add(value: T): void {\n    // Step 2: Insert a value into the set.\n    // TODO(step 2 start)\n    // Implement add.\n    // TODO(step 2 end)\n  }\n\n  has(value: T): boolean {\n    // Step 3: Report whether a value exists.\n    // TODO(step 3 start)\n    // Implement has.\n    // TODO(step 3 end)\n  }\n\n  delete(value: T): boolean {\n    // Step 4: Remove a value and report success.\n    // TODO(step 4 start)\n    // Implement delete.\n    // TODO(step 4 end)\n  }\n\n  size(): number {\n    // Step 5: Report the number of unique values.\n    // TODO(step 5 start)\n    // Implement size.\n    // TODO(step 5 end)\n  }\n}\n`,
    referenceSolutionTs: `export class HashSet<T extends string | number> {\n  private storage: Map<T, true>;\n\n  constructor() {\n    this.storage = new Map();\n  }\n\n  add(value: T): void {\n    this.storage.set(value, true);\n  }\n\n  has(value: T): boolean {\n    return this.storage.has(value);\n  }\n\n  delete(value: T): boolean {\n    return this.storage.delete(value);\n  }\n\n  size(): number {\n    return this.storage.size;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'add stores a value', body: '    const set = new module.HashSet();\n    set.add("a");\n    expect(set.has("a")).toBe(true);' },
        { name: 'size reflects unique values', body: '    const set = new module.HashSet();\n    set.add(1);\n    set.add(2);\n    expect(set.size()).toBe(2);' },
        { name: 'duplicate add does not grow size', body: '    const set = new module.HashSet();\n    set.add(1);\n    set.add(1);\n    expect(set.size()).toBe(1);' },
        { name: 'delete removes present value', body: '    const set = new module.HashSet();\n    set.add("x");\n    expect(set.delete("x")).toBe(true);\n    expect(set.has("x")).toBe(false);' },
        { name: 'delete missing value returns false', body: '    const set = new module.HashSet();\n    expect(set.delete("missing")).toBe(false);' }
      ]),
      hidden: buildTests([
        { name: 'handles negative numbers', body: '    const set = new module.HashSet();\n    set.add(-3);\n    expect(set.has(-3)).toBe(true);' },
        { name: 'removing one item leaves siblings intact', body: '    const set = new module.HashSet();\n    set.add("a");\n    set.add("b");\n    set.delete("a");\n    expect(set.has("b")).toBe(true);\n    expect(set.size()).toBe(1);' },
        { name: 're-adding after delete works', body: '    const set = new module.HashSet();\n    set.add("a");\n    set.delete("a");\n    set.add("a");\n    expect(set.has("a")).toBe(true);\n    expect(set.size()).toBe(1);' },
        { name: 'zero can be stored', body: '    const set = new module.HashSet();\n    set.add(0);\n    expect(set.has(0)).toBe(true);' },
        { name: 'size returns zero when empty', body: '    const set = new module.HashSet();\n    expect(set.size()).toBe(0);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'add', time: 'O(1) average' },
        { operation: 'has', time: 'O(1) average' },
        { operation: 'delete', time: 'O(1) average' },
        { operation: 'size', time: 'O(1)' }
      ),
      commonPitfalls: ['Treating duplicate inserts as distinct entries.', 'Returning the wrong success flag from `delete`.', 'Forgetting that empty sets still need a stable size result.'],
      recallQuestions: ['What does set membership guarantee that an array does not?', 'How should duplicates affect size?'],
      invariants: ['Each logical value appears at most once.', 'Size equals the number of unique stored values.']
    }
  }),
  createProblem({
    id: 'data-structure-linked-list',
    title: 'Implement Linked List',
    difficulty: 'easy',
    category: 'linear',
    structures: ['Linked List'],
    operations: ['append', 'prepend', 'removeHead', 'peekHead', 'toArray', 'size'],
    promptMarkdown: prompt('Linked List', 'LinkedList<T>', 'Implement a singly linked list with explicit node links and basic operations.'),
    requirements: ['Export a `LinkedList<T>` class.', 'Implement `append`, `prepend`, `removeHead`, `peekHead`, `toArray`, and `size`.', 'Preserve order for both prepend and append flows.'],
    constraints: ['Do not expose private nodes in the public API.', 'Use `undefined` when removing or peeking an empty list.'],
    guidedStubTs: `type Node<T> = {\n  value: T;\n  next: Node<T> | null;\n};\n\nexport class LinkedList<T> {\n  private head: Node<T> | null;\n  private tail: Node<T> | null;\n  private length: number;\n\n  constructor() {\n    // Step 1: Initialize empty head, tail, and length state.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  append(value: T): void {\n    // Step 2: Add a node at the end.\n    // TODO(step 2 start)\n    // Implement append.\n    // TODO(step 2 end)\n  }\n\n  prepend(value: T): void {\n    // Step 3: Add a node at the front.\n    // TODO(step 3 start)\n    // Implement prepend.\n    // TODO(step 3 end)\n  }\n\n  removeHead(): T | undefined {\n    // Step 4: Remove and return the current head value.\n    // TODO(step 4 start)\n    // Implement removeHead.\n    // TODO(step 4 end)\n  }\n\n  peekHead(): T | undefined {\n    // Step 5: Inspect the current head value.\n    // TODO(step 5 start)\n    // Implement peekHead.\n    // TODO(step 5 end)\n  }\n\n  toArray(): T[] {\n    // Step 6: Convert the list into an array in logical order.\n    // TODO(step 6 start)\n    // Implement toArray.\n    // TODO(step 6 end)\n  }\n\n  size(): number {\n    // Step 7: Report the number of nodes.\n    // TODO(step 7 start)\n    // Implement size.\n    // TODO(step 7 end)\n  }\n}\n`,
    referenceSolutionTs: `type Node<T> = {\n  value: T;\n  next: Node<T> | null;\n};\n\nexport class LinkedList<T> {\n  private head: Node<T> | null;\n  private tail: Node<T> | null;\n  private length: number;\n\n  constructor() {\n    this.head = null;\n    this.tail = null;\n    this.length = 0;\n  }\n\n  append(value: T): void {\n    const node: Node<T> = { value, next: null };\n    if (!this.head) {\n      this.head = node;\n      this.tail = node;\n    } else {\n      this.tail!.next = node;\n      this.tail = node;\n    }\n    this.length += 1;\n  }\n\n  prepend(value: T): void {\n    const node: Node<T> = { value, next: this.head };\n    this.head = node;\n    if (!this.tail) {\n      this.tail = node;\n    }\n    this.length += 1;\n  }\n\n  removeHead(): T | undefined {\n    if (!this.head) return undefined;\n    const value = this.head.value;\n    this.head = this.head.next;\n    this.length -= 1;\n    if (!this.head) {\n      this.tail = null;\n    }\n    return value;\n  }\n\n  peekHead(): T | undefined {\n    return this.head?.value;\n  }\n\n  toArray(): T[] {\n    const result: T[] = [];\n    let current = this.head;\n    while (current) {\n      result.push(current.value);\n      current = current.next;\n    }\n    return result;\n  }\n\n  size(): number {\n    return this.length;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'append builds array order', body: '    const list = new module.LinkedList();\n    list.append(1);\n    list.append(2);\n    expect(list.toArray()).toEqual([1, 2]);' },
        { name: 'prepend inserts at front', body: '    const list = new module.LinkedList();\n    list.append(2);\n    list.prepend(1);\n    expect(list.toArray()).toEqual([1, 2]);' },
        { name: 'removeHead returns first value', body: '    const list = new module.LinkedList();\n    list.append("a");\n    list.append("b");\n    expect(list.removeHead()).toBe("a");' },
        { name: 'peekHead reads current head', body: '    const list = new module.LinkedList();\n    list.prepend(3);\n    expect(list.peekHead()).toBe(3);' },
        { name: 'size reflects node count', body: '    const list = new module.LinkedList();\n    list.append(1);\n    list.append(2);\n    list.removeHead();\n    expect(list.size()).toBe(1);' }
      ]),
      hidden: buildTests([
        { name: 'empty list returns undefined when removing', body: '    const list = new module.LinkedList();\n    expect(list.removeHead()).toBe(undefined);\n    expect(list.peekHead()).toBe(undefined);' },
        { name: 'removing final node resets tail state', body: '    const list = new module.LinkedList();\n    list.append(1);\n    list.removeHead();\n    list.append(2);\n    expect(list.toArray()).toEqual([2]);' },
        { name: 'multiple prepends preserve reverse insertion order', body: '    const list = new module.LinkedList();\n    list.prepend(3);\n    list.prepend(2);\n    list.prepend(1);\n    expect(list.toArray()).toEqual([1, 2, 3]);' },
        { name: 'duplicate values remain distinct', body: '    const list = new module.LinkedList();\n    list.append(4);\n    list.append(4);\n    expect(list.toArray()).toEqual([4, 4]);' },
        { name: 'size returns zero after full drain', body: '    const list = new module.LinkedList();\n    list.append(1);\n    list.removeHead();\n    expect(list.size()).toBe(0);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'append', time: 'O(1)' },
        { operation: 'prepend', time: 'O(1)' },
        { operation: 'removeHead', time: 'O(1)' },
        { operation: 'toArray', time: 'O(n)', space: 'O(n)' }
      ),
      commonPitfalls: ['Failing to update tail when the final node is removed.', 'Losing the existing head on prepend.', 'Forgetting to keep length in sync.'],
      recallQuestions: ['Why does a singly linked list need explicit head and tail management?', 'What state changes when the list transitions between empty and non-empty?'],
      invariants: ['Head points at the first node or `null` when empty.', 'Tail points at the last node or `null` when empty.', 'Length matches the number of reachable nodes.']
    }
  }),
  createProblem({
    id: 'data-structure-min-stack',
    title: 'Implement MinStack',
    difficulty: 'medium',
    category: 'linear',
    structures: ['MinStack'],
    operations: ['push', 'pop', 'top', 'getMin'],
    promptMarkdown: prompt('MinStack', 'MinStack', 'Implement a stack that can report the current minimum in constant time.'),
    requirements: ['Export a `MinStack` class.', 'Implement `push`, `pop`, `top`, and `getMin`.', 'All operations should behave correctly across duplicate minimum values.'],
    constraints: ['Do not scan the whole stack in `getMin`.', 'Return `undefined` for empty-state reads.'],
    guidedStubTs: `export class MinStack {\n  private values: number[];\n  private minimums: number[];\n\n  constructor() {\n    // Step 1: Initialize main storage and min tracking state.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  push(value: number): void {\n    // Step 2: Push a value and update the current minimum.\n    // TODO(step 2 start)\n    // Implement push.\n    // TODO(step 2 end)\n  }\n\n  pop(): number | undefined {\n    // Step 3: Pop the latest value and synchronize min state.\n    // TODO(step 3 start)\n    // Implement pop.\n    // TODO(step 3 end)\n  }\n\n  top(): number | undefined {\n    // Step 4: Inspect the top value.\n    // TODO(step 4 start)\n    // Implement top.\n    // TODO(step 4 end)\n  }\n\n  getMin(): number | undefined {\n    // Step 5: Return the current minimum value.\n    // TODO(step 5 start)\n    // Implement getMin.\n    // TODO(step 5 end)\n  }\n}\n`,
    referenceSolutionTs: `export class MinStack {\n  private values: number[];\n  private minimums: number[];\n\n  constructor() {\n    this.values = [];\n    this.minimums = [];\n  }\n\n  push(value: number): void {\n    this.values.push(value);\n    const currentMin = this.minimums[this.minimums.length - 1];\n    this.minimums.push(currentMin === undefined ? value : Math.min(currentMin, value));\n  }\n\n  pop(): number | undefined {\n    if (this.values.length === 0) return undefined;\n    this.minimums.pop();\n    return this.values.pop();\n  }\n\n  top(): number | undefined {\n    return this.values[this.values.length - 1];\n  }\n\n  getMin(): number | undefined {\n    return this.minimums[this.minimums.length - 1];\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'reports min after pushes', body: '    const stack = new module.MinStack();\n    stack.push(3);\n    stack.push(1);\n    expect(stack.getMin()).toBe(1);' },
        { name: 'top returns latest item', body: '    const stack = new module.MinStack();\n    stack.push(4);\n    stack.push(7);\n    expect(stack.top()).toBe(7);' },
        { name: 'pop returns latest item', body: '    const stack = new module.MinStack();\n    stack.push(5);\n    stack.push(6);\n    expect(stack.pop()).toBe(6);' },
        { name: 'min updates after removing current minimum', body: '    const stack = new module.MinStack();\n    stack.push(2);\n    stack.push(1);\n    stack.pop();\n    expect(stack.getMin()).toBe(2);' },
        { name: 'empty reads return undefined', body: '    const stack = new module.MinStack();\n    expect(stack.top()).toBe(undefined);\n    expect(stack.getMin()).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'duplicate minima stay tracked', body: '    const stack = new module.MinStack();\n    stack.push(2);\n    stack.push(1);\n    stack.push(1);\n    stack.pop();\n    expect(stack.getMin()).toBe(1);' },
        { name: 'negative values affect minimum', body: '    const stack = new module.MinStack();\n    stack.push(0);\n    stack.push(-3);\n    expect(stack.getMin()).toBe(-3);' },
        { name: 'full drain resets minimum state', body: '    const stack = new module.MinStack();\n    stack.push(1);\n    stack.pop();\n    expect(stack.getMin()).toBe(undefined);' },
        { name: 'interleaved pushes and pops preserve min', body: '    const stack = new module.MinStack();\n    stack.push(5);\n    stack.push(2);\n    stack.pop();\n    stack.push(3);\n    expect(stack.getMin()).toBe(3);' },
        { name: 'pop on empty stays safe', body: '    const stack = new module.MinStack();\n    expect(stack.pop()).toBe(undefined);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'push', time: 'O(1)' },
        { operation: 'pop', time: 'O(1)' },
        { operation: 'top', time: 'O(1)' },
        { operation: 'getMin', time: 'O(1)' }
      ),
      commonPitfalls: ['Forgetting to pop from the min tracker when values are removed.', 'Breaking duplicate minimum handling.', 'Scanning the full stack inside `getMin`.'],
      recallQuestions: ['What extra invariant lets `getMin` stay constant time?', 'Why do duplicate minima need explicit handling?'],
      invariants: ['The min-tracking stack has the same length as the value stack.', 'Each min-tracker slot stores the minimum of all values up to that position.']
    }
  }),
  createProblem({
    id: 'data-structure-circular-queue',
    title: 'Implement Circular Queue',
    difficulty: 'medium',
    category: 'linear',
    structures: ['Circular Queue'],
    operations: ['enqueue', 'dequeue', 'front', 'rear', 'isFull', 'isEmpty'],
    promptMarkdown: prompt('Circular Queue', 'CircularQueue<T>', 'Implement a fixed-capacity circular buffer queue.'),
    requirements: ['Export a `CircularQueue<T>` class with a capacity constructor argument.', 'Implement `enqueue`, `dequeue`, `front`, `rear`, `isFull`, and `isEmpty`.', 'Enqueue should return `false` when the queue is full.'],
    constraints: ['Wrap head and tail indices correctly.', 'Dequeue should return `undefined` when empty.'],
    guidedStubTs: `export class CircularQueue<T> {\n  private readonly capacity: number;\n  private items: Array<T | undefined>;\n  private head: number;\n  private tail: number;\n  private length: number;\n\n  constructor(capacity: number) {\n    // Step 1: Validate and initialize circular buffer state.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  enqueue(value: T): boolean {\n    // Step 2: Insert a value when space is available.\n    // TODO(step 2 start)\n    // Implement enqueue.\n    // TODO(step 2 end)\n  }\n\n  dequeue(): T | undefined {\n    // Step 3: Remove and return the current front item.\n    // TODO(step 3 start)\n    // Implement dequeue.\n    // TODO(step 3 end)\n  }\n\n  front(): T | undefined {\n    // Step 4: Inspect the front item.\n    // TODO(step 4 start)\n    // Implement front.\n    // TODO(step 4 end)\n  }\n\n  rear(): T | undefined {\n    // Step 5: Inspect the most recently enqueued item.\n    // TODO(step 5 start)\n    // Implement rear.\n    // TODO(step 5 end)\n  }\n\n  isFull(): boolean {\n    // Step 6: Report whether the queue reached capacity.\n    // TODO(step 6 start)\n    // Implement isFull.\n    // TODO(step 6 end)\n  }\n\n  isEmpty(): boolean {\n    // Step 7: Report whether the queue is empty.\n    // TODO(step 7 start)\n    // Implement isEmpty.\n    // TODO(step 7 end)\n  }\n}\n`,
    referenceSolutionTs: `export class CircularQueue<T> {\n  private readonly capacity: number;\n  private items: Array<T | undefined>;\n  private head: number;\n  private tail: number;\n  private length: number;\n\n  constructor(capacity: number) {\n    this.capacity = Math.max(1, capacity);\n    this.items = new Array(this.capacity);\n    this.head = 0;\n    this.tail = 0;\n    this.length = 0;\n  }\n\n  enqueue(value: T): boolean {\n    if (this.isFull()) return false;\n    this.items[this.tail] = value;\n    this.tail = (this.tail + 1) % this.capacity;\n    this.length += 1;\n    return true;\n  }\n\n  dequeue(): T | undefined {\n    if (this.isEmpty()) return undefined;\n    const value = this.items[this.head];\n    this.items[this.head] = undefined;\n    this.head = (this.head + 1) % this.capacity;\n    this.length -= 1;\n    return value;\n  }\n\n  front(): T | undefined {\n    return this.isEmpty() ? undefined : this.items[this.head];\n  }\n\n  rear(): T | undefined {\n    if (this.isEmpty()) return undefined;\n    const index = (this.tail - 1 + this.capacity) % this.capacity;\n    return this.items[index];\n  }\n\n  isFull(): boolean {\n    return this.length === this.capacity;\n  }\n\n  isEmpty(): boolean {\n    return this.length === 0;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'enqueue succeeds before full', body: '    const queue = new module.CircularQueue(2);\n    expect(queue.enqueue(1)).toBe(true);\n    expect(queue.enqueue(2)).toBe(true);' },
        { name: 'enqueue fails when full', body: '    const queue = new module.CircularQueue(1);\n    queue.enqueue(1);\n    expect(queue.enqueue(2)).toBe(false);' },
        { name: 'front and rear inspect ends', body: '    const queue = new module.CircularQueue(3);\n    queue.enqueue(1);\n    queue.enqueue(2);\n    expect(queue.front()).toBe(1);\n    expect(queue.rear()).toBe(2);' },
        { name: 'dequeue removes in FIFO order', body: '    const queue = new module.CircularQueue(3);\n    queue.enqueue("a");\n    queue.enqueue("b");\n    expect(queue.dequeue()).toBe("a");' },
        { name: 'empty queue reports empty', body: '    const queue = new module.CircularQueue(2);\n    expect(queue.isEmpty()).toBe(true);\n    expect(queue.dequeue()).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'wraparound preserves order', body: '    const queue = new module.CircularQueue(2);\n    queue.enqueue(1);\n    queue.enqueue(2);\n    queue.dequeue();\n    queue.enqueue(3);\n    expect(queue.front()).toBe(2);\n    expect(queue.rear()).toBe(3);' },
        { name: 'full state clears after dequeue', body: '    const queue = new module.CircularQueue(1);\n    queue.enqueue(1);\n    queue.dequeue();\n    expect(queue.isFull()).toBe(false);\n    expect(queue.isEmpty()).toBe(true);' },
        { name: 'rear handles wrapped tail index', body: '    const queue = new module.CircularQueue(3);\n    queue.enqueue(1);\n    queue.enqueue(2);\n    queue.enqueue(3);\n    queue.dequeue();\n    queue.enqueue(4);\n    expect(queue.rear()).toBe(4);' },
        { name: 'dequeue on empty remains safe', body: '    const queue = new module.CircularQueue(2);\n    queue.dequeue();\n    expect(queue.front()).toBe(undefined);' },
        { name: 'negative values store correctly', body: '    const queue = new module.CircularQueue(2);\n    queue.enqueue(-1);\n    expect(queue.front()).toBe(-1);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'enqueue', time: 'O(1)' },
        { operation: 'dequeue', time: 'O(1)' },
        { operation: 'front', time: 'O(1)' },
        { operation: 'rear', time: 'O(1)' }
      ),
      commonPitfalls: ['Forgetting to wrap indices with modulo arithmetic.', 'Reading `rear` from the next empty tail slot.', 'Not separating capacity from current length.'],
      recallQuestions: ['Why does a circular queue need both head/tail pointers and a length?', 'Which index represents the most recently inserted item?'],
      invariants: ['Head points at the current front when non-empty.', 'Tail points at the next writable slot.', 'Length stays between `0` and `capacity`.']
    }
  }),
  createProblem({
    id: 'data-structure-hash-map',
    title: 'Implement HashMap',
    difficulty: 'medium',
    category: 'hashing',
    structures: ['HashMap'],
    operations: ['set', 'get', 'has', 'delete', 'size'],
    promptMarkdown: prompt('HashMap', 'HashMap<V>', 'Implement a key-value store with stable update and delete semantics.'),
    requirements: ['Export a `HashMap<V>` class keyed by strings.', 'Implement `set`, `get`, `has`, `delete`, and `size`.', 'Updating an existing key must not grow the map.'],
    constraints: ['Return `undefined` for missing keys in `get`.', 'Deletion should return whether a key existed.'],
    guidedStubTs: `export class HashMap<V> {\n  private storage: Map<string, V>;\n\n  constructor() {\n    // Step 1: Initialize key-value storage.\n    // TODO(step 1 start)\n    // Create the backing map.\n    // TODO(step 1 end)\n  }\n\n  set(key: string, value: V): void {\n    // Step 2: Insert or update a key.\n    // TODO(step 2 start)\n    // Implement set.\n    // TODO(step 2 end)\n  }\n\n  get(key: string): V | undefined {\n    // Step 3: Read the value for a key.\n    // TODO(step 3 start)\n    // Implement get.\n    // TODO(step 3 end)\n  }\n\n  has(key: string): boolean {\n    // Step 4: Report whether a key exists.\n    // TODO(step 4 start)\n    // Implement has.\n    // TODO(step 4 end)\n  }\n\n  delete(key: string): boolean {\n    // Step 5: Remove a key and report success.\n    // TODO(step 5 start)\n    // Implement delete.\n    // TODO(step 5 end)\n  }\n\n  size(): number {\n    // Step 6: Report the number of stored keys.\n    // TODO(step 6 start)\n    // Implement size.\n    // TODO(step 6 end)\n  }\n}\n`,
    referenceSolutionTs: `export class HashMap<V> {\n  private storage: Map<string, V>;\n\n  constructor() {\n    this.storage = new Map();\n  }\n\n  set(key: string, value: V): void {\n    this.storage.set(key, value);\n  }\n\n  get(key: string): V | undefined {\n    return this.storage.get(key);\n  }\n\n  has(key: string): boolean {\n    return this.storage.has(key);\n  }\n\n  delete(key: string): boolean {\n    return this.storage.delete(key);\n  }\n\n  size(): number {\n    return this.storage.size;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'set and get work', body: '    const map = new module.HashMap();\n    map.set("a", 1);\n    expect(map.get("a")).toBe(1);' },
        { name: 'has reports missing keys', body: '    const map = new module.HashMap();\n    expect(map.has("x")).toBe(false);' },
        { name: 'updating a key replaces value', body: '    const map = new module.HashMap();\n    map.set("a", 1);\n    map.set("a", 2);\n    expect(map.get("a")).toBe(2);' },
        { name: 'size counts unique keys', body: '    const map = new module.HashMap();\n    map.set("a", 1);\n    map.set("b", 2);\n    expect(map.size()).toBe(2);' },
        { name: 'delete removes key', body: '    const map = new module.HashMap();\n    map.set("a", 1);\n    expect(map.delete("a")).toBe(true);\n    expect(map.get("a")).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'delete missing key returns false', body: '    const map = new module.HashMap();\n    expect(map.delete("missing")).toBe(false);' },
        { name: 'empty string keys are allowed', body: '    const map = new module.HashMap();\n    map.set("", 3);\n    expect(map.get("")).toBe(3);' },
        { name: 'size stays stable on updates', body: '    const map = new module.HashMap();\n    map.set("a", 1);\n    map.set("a", 2);\n    expect(map.size()).toBe(1);' },
        { name: 'deleting one key leaves others intact', body: '    const map = new module.HashMap();\n    map.set("a", 1);\n    map.set("b", 2);\n    map.delete("a");\n    expect(map.get("b")).toBe(2);' },
        { name: 'stores falsy values', body: '    const map = new module.HashMap();\n    map.set("zero", 0);\n    expect(map.has("zero")).toBe(true);\n    expect(map.get("zero")).toBe(0);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'set', time: 'O(1) average' },
        { operation: 'get', time: 'O(1) average' },
        { operation: 'has', time: 'O(1) average' },
        { operation: 'delete', time: 'O(1) average' }
      ),
      commonPitfalls: ['Growing size on overwrites.', 'Treating falsy values as missing keys.', 'Returning the wrong boolean from `delete`.'],
      recallQuestions: ['Why should `has` be separate from `get`?', 'What behavior should updates have on existing keys?'],
      invariants: ['Each key maps to at most one current value.', 'Size equals the number of distinct stored keys.']
    }
  }),
  createProblem({
    id: 'data-structure-trie',
    title: 'Implement Trie',
    difficulty: 'medium',
    category: 'trees',
    structures: ['Trie'],
    operations: ['insert', 'search', 'startsWith'],
    promptMarkdown: prompt('Trie', 'Trie', 'Implement a prefix tree for lowercase strings.'),
    requirements: ['Export a `Trie` class.', 'Implement `insert`, `search`, and `startsWith`.', 'Searching a prefix should differ from searching a full word.'],
    constraints: ['Use public methods only.', 'An empty prefix should count as a valid prefix.'],
    guidedStubTs: `type TrieNode = {\n  children: Map<string, TrieNode>;\n  isWord: boolean;\n};\n\nexport class Trie {\n  private root: TrieNode;\n\n  constructor() {\n    // Step 1: Initialize the root node.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  insert(word: string): void {\n    // Step 2: Walk or create the path for a word.\n    // TODO(step 2 start)\n    // Implement insert.\n    // TODO(step 2 end)\n  }\n\n  search(word: string): boolean {\n    // Step 3: Return whether a full word exists.\n    // TODO(step 3 start)\n    // Implement search.\n    // TODO(step 3 end)\n  }\n\n  startsWith(prefix: string): boolean {\n    // Step 4: Return whether any word uses the prefix.\n    // TODO(step 4 start)\n    // Implement startsWith.\n    // TODO(step 4 end)\n  }\n}\n`,
    referenceSolutionTs: `type TrieNode = {\n  children: Map<string, TrieNode>;\n  isWord: boolean;\n};\n\nconst createNode = (): TrieNode => ({ children: new Map(), isWord: false });\n\nexport class Trie {\n  private root: TrieNode;\n\n  constructor() {\n    this.root = createNode();\n  }\n\n  insert(word: string): void {\n    let node = this.root;\n    for (const char of word) {\n      if (!node.children.has(char)) {\n        node.children.set(char, createNode());\n      }\n      node = node.children.get(char)!;\n    }\n    node.isWord = true;\n  }\n\n  search(word: string): boolean {\n    const node = this.walk(word);\n    return node?.isWord ?? false;\n  }\n\n  startsWith(prefix: string): boolean {\n    return Boolean(this.walk(prefix));\n  }\n\n  private walk(value: string): TrieNode | null {\n    let node = this.root;\n    for (const char of value) {\n      const next = node.children.get(char);\n      if (!next) return null;\n      node = next;\n    }\n    return node;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'inserted word can be found', body: '    const trie = new module.Trie();\n    trie.insert("cat");\n    expect(trie.search("cat")).toBe(true);' },
        { name: 'missing word returns false', body: '    const trie = new module.Trie();\n    trie.insert("cat");\n    expect(trie.search("car")).toBe(false);' },
        { name: 'prefix can be found with startsWith', body: '    const trie = new module.Trie();\n    trie.insert("apple");\n    expect(trie.startsWith("app")).toBe(true);' },
        { name: 'prefix is not automatically a full word', body: '    const trie = new module.Trie();\n    trie.insert("apple");\n    expect(trie.search("app")).toBe(false);' },
        { name: 'multiple words can share a prefix', body: '    const trie = new module.Trie();\n    trie.insert("app");\n    trie.insert("apple");\n    expect(trie.search("app")).toBe(true);' }
      ]),
      hidden: buildTests([
        { name: 'empty prefix is valid', body: '    const trie = new module.Trie();\n    trie.insert("dog");\n    expect(trie.startsWith("")).toBe(true);' },
        { name: 'disjoint prefixes stay isolated', body: '    const trie = new module.Trie();\n    trie.insert("dog");\n    trie.insert("cat");\n    expect(trie.startsWith("ca")).toBe(true);\n    expect(trie.startsWith("do")).toBe(true);' },
        { name: 'searching empty word before insert is false', body: '    const trie = new module.Trie();\n    expect(trie.search("")).toBe(false);' },
        { name: 'repeated inserts do not break word lookup', body: '    const trie = new module.Trie();\n    trie.insert("bee");\n    trie.insert("bee");\n    expect(trie.search("bee")).toBe(true);' },
        { name: 'longer missing prefix returns false', body: '    const trie = new module.Trie();\n    trie.insert("ant");\n    expect(trie.startsWith("anthem")).toBe(false);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'insert', time: 'O(k)' },
        { operation: 'search', time: 'O(k)' },
        { operation: 'startsWith', time: 'O(k)' }
      ),
      commonPitfalls: ['Marking every traversed node as a full word.', 'Confusing `search` with `startsWith`.', 'Dropping shared prefix nodes when inserting multiple words.'],
      recallQuestions: ['Why should a node distinguish “prefix exists” from “word ends here”?', 'What does `k` represent in trie complexity?'],
      invariants: ['Each node only owns edges for its direct next characters.', 'A word is present only if the final node is marked as a completed word.']
    }
  }),
  createProblem({
    id: 'data-structure-binary-search-tree',
    title: 'Implement Binary Search Tree',
    difficulty: 'medium',
    category: 'trees',
    structures: ['Binary Search Tree'],
    operations: ['insert', 'contains', 'inOrder'],
    promptMarkdown: prompt('Binary Search Tree', 'BinarySearchTree', 'Implement a BST that stores unique numeric values and can return an in-order traversal.'),
    requirements: ['Export a `BinarySearchTree` class.', 'Implement `insert`, `contains`, and `inOrder`.', 'Duplicate inserts should not create duplicate nodes.'],
    constraints: ['Preserve BST ordering.', 'Use public traversal output for tests rather than private node inspection.'],
    guidedStubTs: `type Node = {\n  value: number;\n  left: Node | null;\n  right: Node | null;\n};\n\nexport class BinarySearchTree {\n  private root: Node | null;\n\n  constructor() {\n    // Step 1: Initialize the tree root.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  insert(value: number): void {\n    // Step 2: Insert a unique value into the BST.\n    // TODO(step 2 start)\n    // Implement insert.\n    // TODO(step 2 end)\n  }\n\n  contains(value: number): boolean {\n    // Step 3: Search for a value using BST ordering.\n    // TODO(step 3 start)\n    // Implement contains.\n    // TODO(step 3 end)\n  }\n\n  inOrder(): number[] {\n    // Step 4: Return an in-order traversal.\n    // TODO(step 4 start)\n    // Implement inOrder.\n    // TODO(step 4 end)\n  }\n}\n`,
    referenceSolutionTs: `type Node = {\n  value: number;\n  left: Node | null;\n  right: Node | null;\n};\n\nexport class BinarySearchTree {\n  private root: Node | null;\n\n  constructor() {\n    this.root = null;\n  }\n\n  insert(value: number): void {\n    const node: Node = { value, left: null, right: null };\n    if (!this.root) {\n      this.root = node;\n      return;\n    }\n    let current = this.root;\n    while (true) {\n      if (value === current.value) return;\n      if (value < current.value) {\n        if (!current.left) {\n          current.left = node;\n          return;\n        }\n        current = current.left;\n      } else {\n        if (!current.right) {\n          current.right = node;\n          return;\n        }\n        current = current.right;\n      }\n    }\n  }\n\n  contains(value: number): boolean {\n    let current = this.root;\n    while (current) {\n      if (value === current.value) return true;\n      current = value < current.value ? current.left : current.right;\n    }\n    return false;\n  }\n\n  inOrder(): number[] {\n    const result: number[] = [];\n    const walk = (node: Node | null) => {\n      if (!node) return;\n      walk(node.left);\n      result.push(node.value);\n      walk(node.right);\n    };\n    walk(this.root);\n    return result;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'insert makes root searchable', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(5);\n    expect(bst.contains(5)).toBe(true);' },
        { name: 'contains returns false for missing value', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(5);\n    expect(bst.contains(9)).toBe(false);' },
        { name: 'inOrder returns sorted values', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(5);\n    bst.insert(3);\n    bst.insert(7);\n    expect(bst.inOrder()).toEqual([3, 5, 7]);' },
        { name: 'left subtree values remain searchable', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(5);\n    bst.insert(2);\n    expect(bst.contains(2)).toBe(true);' },
        { name: 'right subtree values remain searchable', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(5);\n    bst.insert(8);\n    expect(bst.contains(8)).toBe(true);' }
      ]),
      hidden: buildTests([
        { name: 'duplicate inserts do not duplicate traversal', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(4);\n    bst.insert(4);\n    expect(bst.inOrder()).toEqual([4]);' },
        { name: 'negative values sort correctly', body: '    const bst = new module.BinarySearchTree();\n    bst.insert(0);\n    bst.insert(-2);\n    bst.insert(3);\n    expect(bst.inOrder()).toEqual([-2, 0, 3]);' },
        { name: 'deep insertion keeps full ordering', body: '    const bst = new module.BinarySearchTree();\n    [5, 2, 8, 1, 3, 7, 9].forEach((value) => bst.insert(value));\n    expect(bst.inOrder()).toEqual([1, 2, 3, 5, 7, 8, 9]);' },
        { name: 'contains on empty tree is false', body: '    const bst = new module.BinarySearchTree();\n    expect(bst.contains(1)).toBe(false);' },
        { name: 'skewed insertions still searchable', body: '    const bst = new module.BinarySearchTree();\n    [1, 2, 3, 4].forEach((value) => bst.insert(value));\n    expect(bst.contains(4)).toBe(true);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'insert', time: 'O(h)' },
        { operation: 'contains', time: 'O(h)' },
        { operation: 'inOrder', time: 'O(n)', space: 'O(n)' }
      ),
      commonPitfalls: ['Inserting duplicates on one side forever.', 'Flipping the left/right comparison branches.', 'Breaking sorted traversal order.'],
      recallQuestions: ['What BST invariant does `contains` rely on?', 'Why does in-order traversal produce sorted values?'],
      invariants: ['Every node in the left subtree is smaller than the node value.', 'Every node in the right subtree is larger than the node value.']
    }
  }),
  createProblem({
    id: 'data-structure-min-heap',
    title: 'Implement MinHeap',
    difficulty: 'medium',
    category: 'heaps',
    structures: ['MinHeap'],
    operations: ['insert', 'extractMin', 'peek', 'size'],
    promptMarkdown: prompt('MinHeap', 'MinHeap', 'Implement a binary min-heap that always exposes the smallest value.'),
    requirements: ['Export a `MinHeap` class.', 'Implement `insert`, `extractMin`, `peek`, and `size`.', 'Restore heap order after every insert and extract.'],
    constraints: ['Do not sort the full array after every mutation.', 'Return `undefined` when extracting from an empty heap.'],
    guidedStubTs: `export class MinHeap {\n  private values: number[];\n\n  constructor() {\n    // Step 1: Initialize heap storage.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  insert(value: number): void {\n    // Step 2: Add a value and bubble it upward.\n    // TODO(step 2 start)\n    // Implement insert.\n    // TODO(step 2 end)\n  }\n\n  extractMin(): number | undefined {\n    // Step 3: Remove and return the minimum value.\n    // TODO(step 3 start)\n    // Implement extractMin.\n    // TODO(step 3 end)\n  }\n\n  peek(): number | undefined {\n    // Step 4: Inspect the current minimum.\n    // TODO(step 4 start)\n    // Implement peek.\n    // TODO(step 4 end)\n  }\n\n  size(): number {\n    // Step 5: Report the number of stored values.\n    // TODO(step 5 start)\n    // Implement size.\n    // TODO(step 5 end)\n  }\n}\n`,
    referenceSolutionTs: `export class MinHeap {\n  private values: number[];\n\n  constructor() {\n    this.values = [];\n  }\n\n  insert(value: number): void {\n    this.values.push(value);\n    let index = this.values.length - 1;\n    while (index > 0) {\n      const parent = Math.floor((index - 1) / 2);\n      if (this.values[parent] <= this.values[index]) break;\n      [this.values[parent], this.values[index]] = [this.values[index], this.values[parent]];\n      index = parent;\n    }\n  }\n\n  extractMin(): number | undefined {\n    if (this.values.length === 0) return undefined;\n    if (this.values.length === 1) return this.values.pop();\n    const min = this.values[0];\n    this.values[0] = this.values.pop()!;\n    let index = 0;\n    while (true) {\n      const left = index * 2 + 1;\n      const right = index * 2 + 2;\n      let smallest = index;\n      if (left < this.values.length && this.values[left] < this.values[smallest]) {\n        smallest = left;\n      }\n      if (right < this.values.length && this.values[right] < this.values[smallest]) {\n        smallest = right;\n      }\n      if (smallest === index) break;\n      [this.values[index], this.values[smallest]] = [this.values[smallest], this.values[index]];\n      index = smallest;\n    }\n    return min;\n  }\n\n  peek(): number | undefined {\n    return this.values[0];\n  }\n\n  size(): number {\n    return this.values.length;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'peek returns smallest inserted value', body: '    const heap = new module.MinHeap();\n    heap.insert(5);\n    heap.insert(2);\n    expect(heap.peek()).toBe(2);' },
        { name: 'extractMin removes smallest value', body: '    const heap = new module.MinHeap();\n    heap.insert(3);\n    heap.insert(1);\n    expect(heap.extractMin()).toBe(1);' },
        { name: 'size tracks inserts', body: '    const heap = new module.MinHeap();\n    heap.insert(1);\n    heap.insert(2);\n    expect(heap.size()).toBe(2);' },
        { name: 'extractMin on empty is undefined', body: '    const heap = new module.MinHeap();\n    expect(heap.extractMin()).toBe(undefined);' },
        { name: 'extracting once reveals next minimum', body: '    const heap = new module.MinHeap();\n    heap.insert(4);\n    heap.insert(1);\n    heap.insert(3);\n    heap.extractMin();\n    expect(heap.peek()).toBe(3);' }
      ]),
      hidden: buildTests([
        { name: 'extracting all values returns sorted order', body: '    const heap = new module.MinHeap();\n    [5, 1, 4, 2, 3].forEach((value) => heap.insert(value));\n    expect([heap.extractMin(), heap.extractMin(), heap.extractMin(), heap.extractMin(), heap.extractMin()]).toEqual([1, 2, 3, 4, 5]);' },
        { name: 'duplicate values remain stable', body: '    const heap = new module.MinHeap();\n    heap.insert(2);\n    heap.insert(2);\n    expect(heap.extractMin()).toBe(2);\n    expect(heap.extractMin()).toBe(2);' },
        { name: 'negative values bubble correctly', body: '    const heap = new module.MinHeap();\n    heap.insert(0);\n    heap.insert(-5);\n    expect(heap.peek()).toBe(-5);' },
        { name: 'size shrinks after extract', body: '    const heap = new module.MinHeap();\n    heap.insert(1);\n    heap.insert(2);\n    heap.extractMin();\n    expect(heap.size()).toBe(1);' },
        { name: 'single-element extract empties heap', body: '    const heap = new module.MinHeap();\n    heap.insert(9);\n    heap.extractMin();\n    expect(heap.peek()).toBe(undefined);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'insert', time: 'O(log n)' },
        { operation: 'extractMin', time: 'O(log n)' },
        { operation: 'peek', time: 'O(1)' },
        { operation: 'size', time: 'O(1)' }
      ),
      commonPitfalls: ['Failing to bubble values upward after insert.', 'Comparing the wrong child while sifting down.', 'Leaving the old root in place after extraction.'],
      recallQuestions: ['What heap invariant must hold between parents and children?', 'Why are insert and extract logarithmic?'],
      invariants: ['Every parent is less than or equal to its children.', 'The minimum value is always stored at index `0`.']
    }
  }),
  createProblem({
    id: 'data-structure-union-find',
    title: 'Implement Union Find',
    difficulty: 'medium',
    category: 'graphs',
    structures: ['Union Find'],
    operations: ['find', 'union', 'connected'],
    promptMarkdown: prompt('Union Find', 'UnionFind', 'Implement a disjoint-set union structure over `0..n-1`.'),
    requirements: ['Export a `UnionFind` class.', 'Implement `find`, `union`, and `connected`.', 'Unioning already-connected items should be safe.'],
    constraints: ['Indices are zero-based.', 'Public behavior should remain stable across repeated unions.'],
    guidedStubTs: `export class UnionFind {\n  private parent: number[];\n  private rank: number[];\n\n  constructor(size: number) {\n    // Step 1: Initialize parent and rank arrays.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  find(value: number): number {\n    // Step 2: Return the representative for a value.\n    // TODO(step 2 start)\n    // Implement find.\n    // TODO(step 2 end)\n  }\n\n  union(a: number, b: number): void {\n    // Step 3: Merge the sets containing a and b.\n    // TODO(step 3 start)\n    // Implement union.\n    // TODO(step 3 end)\n  }\n\n  connected(a: number, b: number): boolean {\n    // Step 4: Report whether a and b share a set.\n    // TODO(step 4 start)\n    // Implement connected.\n    // TODO(step 4 end)\n  }\n}\n`,
    referenceSolutionTs: `export class UnionFind {\n  private parent: number[];\n  private rank: number[];\n\n  constructor(size: number) {\n    this.parent = Array.from({ length: size }, (_, index) => index);\n    this.rank = Array.from({ length: size }, () => 0);\n  }\n\n  find(value: number): number {\n    if (this.parent[value] !== value) {\n      this.parent[value] = this.find(this.parent[value]);\n    }\n    return this.parent[value];\n  }\n\n  union(a: number, b: number): void {\n    const rootA = this.find(a);\n    const rootB = this.find(b);\n    if (rootA === rootB) return;\n    if (this.rank[rootA] < this.rank[rootB]) {\n      this.parent[rootA] = rootB;\n    } else if (this.rank[rootA] > this.rank[rootB]) {\n      this.parent[rootB] = rootA;\n    } else {\n      this.parent[rootB] = rootA;\n      this.rank[rootA] += 1;\n    }\n  }\n\n  connected(a: number, b: number): boolean {\n    return this.find(a) === this.find(b);\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'initially each item is its own set', body: '    const uf = new module.UnionFind(3);\n    expect(uf.connected(0, 1)).toBe(false);' },
        { name: 'union connects two items', body: '    const uf = new module.UnionFind(3);\n    uf.union(0, 1);\n    expect(uf.connected(0, 1)).toBe(true);' },
        { name: 'find returns same representative for connected items', body: '    const uf = new module.UnionFind(3);\n    uf.union(0, 2);\n    expect(uf.find(0)).toBe(uf.find(2));' },
        { name: 'transitive unions merge components', body: '    const uf = new module.UnionFind(4);\n    uf.union(0, 1);\n    uf.union(1, 2);\n    expect(uf.connected(0, 2)).toBe(true);' },
        { name: 'unconnected nodes stay separate', body: '    const uf = new module.UnionFind(4);\n    uf.union(0, 1);\n    expect(uf.connected(0, 3)).toBe(false);' }
      ]),
      hidden: buildTests([
        { name: 'unioning same component is harmless', body: '    const uf = new module.UnionFind(2);\n    uf.union(0, 1);\n    uf.union(0, 1);\n    expect(uf.connected(0, 1)).toBe(true);' },
        { name: 'self connectivity always holds', body: '    const uf = new module.UnionFind(2);\n    expect(uf.connected(1, 1)).toBe(true);' },
        { name: 'disconnected items keep distinct roots', body: '    const uf = new module.UnionFind(3);\n    expect(uf.find(0)).toBe(0);\n    expect(uf.find(2)).toBe(2);' },
        { name: 'multiple merges still connect final endpoints', body: '    const uf = new module.UnionFind(5);\n    uf.union(0, 1);\n    uf.union(2, 3);\n    uf.union(1, 3);\n    expect(uf.connected(0, 2)).toBe(true);' },
        { name: 'isolated node remains separate after other unions', body: '    const uf = new module.UnionFind(4);\n    uf.union(0, 1);\n    uf.union(1, 2);\n    expect(uf.connected(2, 3)).toBe(false);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'find', time: 'O(alpha(n)) amortized' },
        { operation: 'union', time: 'O(alpha(n)) amortized' },
        { operation: 'connected', time: 'O(alpha(n)) amortized' }
      ),
      commonPitfalls: ['Unioning raw values instead of their roots.', 'Failing to handle already-connected inputs.', 'Returning stale parent values without path compression.'],
      recallQuestions: ['Why must `union` operate on representatives rather than raw nodes?', 'What does path compression improve?'],
      invariants: ['Every node eventually points to a representative root.', 'Two items are connected if and only if their roots match.']
    }
  }),
  createProblem({
    id: 'data-structure-graph-adjacency-list',
    title: 'Implement Graph Adjacency List',
    difficulty: 'medium',
    category: 'graphs',
    structures: ['Graph Adjacency List'],
    operations: ['addVertex', 'addEdge', 'removeEdge', 'neighbors', 'hasEdge'],
    promptMarkdown: prompt('Graph Adjacency List', 'Graph', 'Implement an undirected graph with adjacency-set semantics.'),
    requirements: ['Export a `Graph` class.', 'Implement `addVertex`, `addEdge`, `removeEdge`, `neighbors`, and `hasEdge`.', 'Edges should be undirected.'],
    constraints: ['Adding an edge should create missing vertices when necessary.', 'Neighbor output should be deterministic.'],
    guidedStubTs: `export class Graph {\n  private adjacency: Map<string, Set<string>>;\n\n  constructor() {\n    // Step 1: Initialize adjacency storage.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  addVertex(vertex: string): void {\n    // Step 2: Ensure a vertex exists.\n    // TODO(step 2 start)\n    // Implement addVertex.\n    // TODO(step 2 end)\n  }\n\n  addEdge(a: string, b: string): void {\n    // Step 3: Add an undirected edge.\n    // TODO(step 3 start)\n    // Implement addEdge.\n    // TODO(step 3 end)\n  }\n\n  removeEdge(a: string, b: string): void {\n    // Step 4: Remove an undirected edge if present.\n    // TODO(step 4 start)\n    // Implement removeEdge.\n    // TODO(step 4 end)\n  }\n\n  hasEdge(a: string, b: string): boolean {\n    // Step 5: Report whether an undirected edge exists.\n    // TODO(step 5 start)\n    // Implement hasEdge.\n    // TODO(step 5 end)\n  }\n\n  neighbors(vertex: string): string[] {\n    // Step 6: Return sorted neighbors for deterministic tests.\n    // TODO(step 6 start)\n    // Implement neighbors.\n    // TODO(step 6 end)\n  }\n}\n`,
    referenceSolutionTs: `export class Graph {\n  private adjacency: Map<string, Set<string>>;\n\n  constructor() {\n    this.adjacency = new Map();\n  }\n\n  addVertex(vertex: string): void {\n    if (!this.adjacency.has(vertex)) {\n      this.adjacency.set(vertex, new Set());\n    }\n  }\n\n  addEdge(a: string, b: string): void {\n    this.addVertex(a);\n    this.addVertex(b);\n    this.adjacency.get(a)!.add(b);\n    this.adjacency.get(b)!.add(a);\n  }\n\n  removeEdge(a: string, b: string): void {\n    this.adjacency.get(a)?.delete(b);\n    this.adjacency.get(b)?.delete(a);\n  }\n\n  hasEdge(a: string, b: string): boolean {\n    return this.adjacency.get(a)?.has(b) ?? false;\n  }\n\n  neighbors(vertex: string): string[] {\n    return Array.from(this.adjacency.get(vertex) ?? []).sort();\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'addVertex creates an empty neighbor list', body: '    const graph = new module.Graph();\n    graph.addVertex("A");\n    expect(graph.neighbors("A")).toEqual([]);' },
        { name: 'addEdge connects both directions', body: '    const graph = new module.Graph();\n    graph.addEdge("A", "B");\n    expect(graph.hasEdge("A", "B")).toBe(true);\n    expect(graph.hasEdge("B", "A")).toBe(true);' },
        { name: 'neighbors are returned in sorted order', body: '    const graph = new module.Graph();\n    graph.addEdge("A", "C");\n    graph.addEdge("A", "B");\n    expect(graph.neighbors("A")).toEqual(["B", "C"]);' },
        { name: 'removeEdge removes both directions', body: '    const graph = new module.Graph();\n    graph.addEdge("A", "B");\n    graph.removeEdge("A", "B");\n    expect(graph.hasEdge("A", "B")).toBe(false);' },
        { name: 'missing edge returns false', body: '    const graph = new module.Graph();\n    expect(graph.hasEdge("A", "B")).toBe(false);' }
      ]),
      hidden: buildTests([
        { name: 'duplicate addEdge does not duplicate neighbor output', body: '    const graph = new module.Graph();\n    graph.addEdge("A", "B");\n    graph.addEdge("A", "B");\n    expect(graph.neighbors("A")).toEqual(["B"]);' },
        { name: 'adding edge creates missing vertices', body: '    const graph = new module.Graph();\n    graph.addEdge("X", "Y");\n    expect(graph.neighbors("Y")).toEqual(["X"]);' },
        { name: 'removing absent edge is safe', body: '    const graph = new module.Graph();\n    graph.removeEdge("A", "B");\n    expect(graph.hasEdge("A", "B")).toBe(false);' },
        { name: 'unrelated edges remain intact after removal', body: '    const graph = new module.Graph();\n    graph.addEdge("A", "B");\n    graph.addEdge("A", "C");\n    graph.removeEdge("A", "B");\n    expect(graph.neighbors("A")).toEqual(["C"]);' },
        { name: 'neighbor lookup on missing vertex is empty', body: '    const graph = new module.Graph();\n    expect(graph.neighbors("missing")).toEqual([]);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'addVertex', time: 'O(1) average' },
        { operation: 'addEdge', time: 'O(1) average' },
        { operation: 'removeEdge', time: 'O(1) average' },
        { operation: 'neighbors', time: 'O(d log d)', space: 'O(d)' }
      ),
      commonPitfalls: ['Treating the graph as directed by only updating one side.', 'Returning unsorted neighbors and causing unstable test output.', 'Duplicating edges in neighbor lists.'],
      recallQuestions: ['Why must an undirected edge update both adjacency sets?', 'What public behavior proves the graph stayed symmetric?'],
      invariants: ['For every undirected edge `(a, b)`, `a` lists `b` and `b` lists `a`.', 'Each neighbor set contains unique vertices only once.']
    }
  }),
  createProblem({
    id: 'data-structure-lru-cache',
    title: 'Implement LRU Cache',
    difficulty: 'medium',
    category: 'caches',
    structures: ['LRU Cache'],
    operations: ['get', 'put'],
    promptMarkdown: prompt('LRU Cache', 'LRUCache', 'Implement a least-recently-used cache with fixed capacity.'),
    requirements: ['Export an `LRUCache` class with a numeric capacity constructor.', 'Implement `get` and `put`.', 'When full, inserting a new key should evict the least recently used key.'],
    constraints: ['A successful `get` counts as recent use.', 'Return `undefined` for missing keys.'],
    guidedStubTs: `export class LRUCache {\n  private readonly capacity: number;\n  private storage: Map<string, number>;\n\n  constructor(capacity: number) {\n    // Step 1: Initialize capacity and access-ordered storage.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  get(key: string): number | undefined {\n    // Step 2: Read a key and refresh recency when found.\n    // TODO(step 2 start)\n    // Implement get.\n    // TODO(step 2 end)\n  }\n\n  put(key: string, value: number): void {\n    // Step 3: Insert or update a key and evict when necessary.\n    // TODO(step 3 start)\n    // Implement put.\n    // TODO(step 3 end)\n  }\n}\n`,
    referenceSolutionTs: `export class LRUCache {\n  private readonly capacity: number;\n  private storage: Map<string, number>;\n\n  constructor(capacity: number) {\n    this.capacity = Math.max(1, capacity);\n    this.storage = new Map();\n  }\n\n  get(key: string): number | undefined {\n    if (!this.storage.has(key)) return undefined;\n    const value = this.storage.get(key)!;\n    this.storage.delete(key);\n    this.storage.set(key, value);\n    return value;\n  }\n\n  put(key: string, value: number): void {\n    if (this.storage.has(key)) {\n      this.storage.delete(key);\n    } else if (this.storage.size >= this.capacity) {\n      const oldest = this.storage.keys().next().value;\n      if (oldest !== undefined) this.storage.delete(oldest);\n    }\n    this.storage.set(key, value);\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'stores and retrieves values', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    expect(cache.get("a")).toBe(1);' },
        { name: 'missing key returns undefined', body: '    const cache = new module.LRUCache(2);\n    expect(cache.get("missing")).toBe(undefined);' },
        { name: 'evicts least recently used key', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    cache.put("b", 2);\n    cache.put("c", 3);\n    expect(cache.get("a")).toBe(undefined);' },
        { name: 'reading a key refreshes recency', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    cache.put("b", 2);\n    cache.get("a");\n    cache.put("c", 3);\n    expect(cache.get("b")).toBe(undefined);' },
        { name: 'updating a key replaces its value', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    cache.put("a", 5);\n    expect(cache.get("a")).toBe(5);' }
      ]),
      hidden: buildTests([
        { name: 'update does not evict same key', body: '    const cache = new module.LRUCache(1);\n    cache.put("a", 1);\n    cache.put("a", 2);\n    expect(cache.get("a")).toBe(2);' },
        { name: 'capacity one still evicts oldest item', body: '    const cache = new module.LRUCache(1);\n    cache.put("a", 1);\n    cache.put("b", 2);\n    expect(cache.get("a")).toBe(undefined);\n    expect(cache.get("b")).toBe(2);' },
        { name: 'get missing key does not change eviction order', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    cache.put("b", 2);\n    cache.get("missing");\n    cache.put("c", 3);\n    expect(cache.get("a")).toBe(undefined);' },
        { name: 'recently read key survives next eviction', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    cache.put("b", 2);\n    expect(cache.get("a")).toBe(1);\n    cache.put("c", 3);\n    expect(cache.get("a")).toBe(1);' },
        { name: 'multiple puts maintain only recent keys', body: '    const cache = new module.LRUCache(2);\n    cache.put("a", 1);\n    cache.put("b", 2);\n    cache.put("c", 3);\n    cache.put("d", 4);\n    expect(cache.get("b")).toBe(undefined);\n    expect(cache.get("d")).toBe(4);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'get', time: 'O(1) average' },
        { operation: 'put', time: 'O(1) average' }
      ),
      commonPitfalls: ['Not refreshing recency on successful `get`.', 'Evicting the most recent key instead of the least recent one.', 'Treating updates as fresh insertions without removing the old key order first.'],
      recallQuestions: ['What event makes a key “recently used”?', 'Why does update order matter when a key already exists?'],
      invariants: ['Storage order always reflects least-recently-used to most-recently-used.', 'Cache size never exceeds capacity.']
    }
  }),
  createProblem({
    id: 'data-structure-priority-queue',
    title: 'Implement Priority Queue with Comparator',
    difficulty: 'hard',
    category: 'heaps',
    structures: ['Priority Queue'],
    operations: ['enqueue', 'dequeue', 'peek', 'size'],
    promptMarkdown: prompt('Priority Queue', 'PriorityQueue<T>', 'Implement a heap-backed priority queue that accepts a custom comparator.'),
    requirements: ['Export a `PriorityQueue<T>` class that accepts `(a, b) => number` in the constructor.', 'Implement `enqueue`, `dequeue`, `peek`, and `size`.', 'The comparator decides which item has higher priority.'],
    constraints: ['Do not hard-code min-heap behavior.', 'Return `undefined` for empty-state reads.'],
    guidedStubTs: `export class PriorityQueue<T> {\n  private readonly compare: (a: T, b: T) => number;\n  private values: T[];\n\n  constructor(compare: (a: T, b: T) => number) {\n    // Step 1: Store the comparator and initialize heap storage.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  enqueue(value: T): void {\n    // Step 2: Insert and bubble based on comparator priority.\n    // TODO(step 2 start)\n    // Implement enqueue.\n    // TODO(step 2 end)\n  }\n\n  dequeue(): T | undefined {\n    // Step 3: Remove and return the highest-priority value.\n    // TODO(step 3 start)\n    // Implement dequeue.\n    // TODO(step 3 end)\n  }\n\n  peek(): T | undefined {\n    // Step 4: Inspect the highest-priority value.\n    // TODO(step 4 start)\n    // Implement peek.\n    // TODO(step 4 end)\n  }\n\n  size(): number {\n    // Step 5: Report the number of values.\n    // TODO(step 5 start)\n    // Implement size.\n    // TODO(step 5 end)\n  }\n}\n`,
    referenceSolutionTs: `export class PriorityQueue<T> {\n  private readonly compare: (a: T, b: T) => number;\n  private values: T[];\n\n  constructor(compare: (a: T, b: T) => number) {\n    this.compare = compare;\n    this.values = [];\n  }\n\n  enqueue(value: T): void {\n    this.values.push(value);\n    let index = this.values.length - 1;\n    while (index > 0) {\n      const parent = Math.floor((index - 1) / 2);\n      if (this.compare(this.values[index], this.values[parent]) >= 0) break;\n      [this.values[parent], this.values[index]] = [this.values[index], this.values[parent]];\n      index = parent;\n    }\n  }\n\n  dequeue(): T | undefined {\n    if (this.values.length === 0) return undefined;\n    if (this.values.length === 1) return this.values.pop();\n    const top = this.values[0];\n    this.values[0] = this.values.pop()!;\n    let index = 0;\n    while (true) {\n      const left = index * 2 + 1;\n      const right = index * 2 + 2;\n      let best = index;\n      if (left < this.values.length && this.compare(this.values[left], this.values[best]) < 0) {\n        best = left;\n      }\n      if (right < this.values.length && this.compare(this.values[right], this.values[best]) < 0) {\n        best = right;\n      }\n      if (best === index) break;\n      [this.values[index], this.values[best]] = [this.values[best], this.values[index]];\n      index = best;\n    }\n    return top;\n  }\n\n  peek(): T | undefined {\n    return this.values[0];\n  }\n\n  size(): number {\n    return this.values.length;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'min-priority comparator returns smallest first', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    queue.enqueue(3);\n    queue.enqueue(1);\n    expect(queue.peek()).toBe(1);' },
        { name: 'dequeue respects comparator order', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    [4, 2, 5].forEach((value) => queue.enqueue(value));\n    expect(queue.dequeue()).toBe(2);' },
        { name: 'size tracks values', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    queue.enqueue(1);\n    queue.enqueue(2);\n    expect(queue.size()).toBe(2);' },
        { name: 'max-priority comparator is supported', body: '    const queue = new module.PriorityQueue((a, b) => b - a);\n    queue.enqueue(1);\n    queue.enqueue(5);\n    expect(queue.peek()).toBe(5);' },
        { name: 'empty dequeue returns undefined', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    expect(queue.dequeue()).toBe(undefined);' }
      ]),
      hidden: buildTests([
        { name: 'objects can be prioritized by field', body: '    const queue = new module.PriorityQueue((a, b) => a.priority - b.priority);\n    queue.enqueue({ id: "a", priority: 2 });\n    queue.enqueue({ id: "b", priority: 1 });\n    expect(queue.dequeue()).toEqual({ id: "b", priority: 1 });' },
        { name: 'duplicate priorities remain valid values', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    queue.enqueue(2);\n    queue.enqueue(2);\n    expect(queue.dequeue()).toBe(2);\n    expect(queue.dequeue()).toBe(2);' },
        { name: 'comparator order persists after multiple dequeues', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    [3, 1, 4, 2].forEach((value) => queue.enqueue(value));\n    expect([queue.dequeue(), queue.dequeue(), queue.dequeue(), queue.dequeue()]).toEqual([1, 2, 3, 4]);' },
        { name: 'peek on empty is undefined', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    expect(queue.peek()).toBe(undefined);' },
        { name: 'size shrinks after dequeue', body: '    const queue = new module.PriorityQueue((a, b) => a - b);\n    queue.enqueue(1);\n    queue.enqueue(2);\n    queue.dequeue();\n    expect(queue.size()).toBe(1);' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'enqueue', time: 'O(log n)' },
        { operation: 'dequeue', time: 'O(log n)' },
        { operation: 'peek', time: 'O(1)' },
        { operation: 'size', time: 'O(1)' }
      ),
      commonPitfalls: ['Hard-coding numeric min-heap behavior and ignoring the comparator.', 'Using comparator direction inconsistently in bubble-up vs sift-down.', 'Breaking object-priority comparisons by mutating values.'],
      recallQuestions: ['How does the comparator define “higher priority”?', 'Why must every heap comparison use the same comparator contract?'],
      invariants: ['The root always contains the highest-priority value according to the comparator.', 'Every parent has priority at least as high as its children.']
    }
  }),
  createProblem({
    id: 'data-structure-time-map',
    title: 'Implement Time-Based Key-Value Store',
    difficulty: 'hard',
    category: 'caches',
    structures: ['Time-Based Key-Value Store'],
    operations: ['set', 'get'],
    promptMarkdown: prompt('Time-Based Key-Value Store', 'TimeMap', 'Implement a store that can read the latest value at or before a timestamp.'),
    requirements: ['Export a `TimeMap` class.', 'Implement `set(key, value, timestamp)` and `get(key, timestamp)`.', 'Assume `set` calls for the same key arrive in non-decreasing timestamp order.'],
    constraints: ['Return an empty string when no value exists at or before the requested timestamp.', 'Use efficient lookup within each key history.'],
    guidedStubTs: `type Entry = {\n  timestamp: number;\n  value: string;\n};\n\nexport class TimeMap {\n  private storage: Map<string, Entry[]>;\n\n  constructor() {\n    // Step 1: Initialize per-key history storage.\n    // TODO(step 1 start)\n    // Prepare internal state.\n    // TODO(step 1 end)\n  }\n\n  set(key: string, value: string, timestamp: number): void {\n    // Step 2: Append a timestamped value for the key.\n    // TODO(step 2 start)\n    // Implement set.\n    // TODO(step 2 end)\n  }\n\n  get(key: string, timestamp: number): string {\n    // Step 3: Return the latest value at or before the timestamp.\n    // TODO(step 3 start)\n    // Implement get.\n    // TODO(step 3 end)\n  }\n}\n`,
    referenceSolutionTs: `type Entry = {\n  timestamp: number;\n  value: string;\n};\n\nexport class TimeMap {\n  private storage: Map<string, Entry[]>;\n\n  constructor() {\n    this.storage = new Map();\n  }\n\n  set(key: string, value: string, timestamp: number): void {\n    const history = this.storage.get(key) ?? [];\n    history.push({ timestamp, value });\n    this.storage.set(key, history);\n  }\n\n  get(key: string, timestamp: number): string {\n    const history = this.storage.get(key);\n    if (!history || history.length === 0) return '';\n    let left = 0;\n    let right = history.length - 1;\n    let answer = '';\n    while (left <= right) {\n      const mid = Math.floor((left + right) / 2);\n      if (history[mid].timestamp <= timestamp) {\n        answer = history[mid].value;\n        left = mid + 1;\n      } else {\n        right = mid - 1;\n      }\n    }\n    return answer;\n  }\n}\n`,
    tests: {
      visible: buildTests([
        { name: 'get returns exact timestamp value', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 1);\n    expect(map.get("a", 1)).toBe("x");' },
        { name: 'get returns latest earlier value', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 1);\n    map.set("a", "y", 3);\n    expect(map.get("a", 2)).toBe("x");' },
        { name: 'missing key returns empty string', body: '    const map = new module.TimeMap();\n    expect(map.get("missing", 5)).toBe("");' },
        { name: 'later timestamp returns latest value', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 1);\n    map.set("a", "y", 3);\n    expect(map.get("a", 4)).toBe("y");' },
        { name: 'timestamp before first value returns empty string', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 5);\n    expect(map.get("a", 4)).toBe("");' }
      ]),
      hidden: buildTests([
        { name: 'separate keys maintain separate histories', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 1);\n    map.set("b", "y", 2);\n    expect(map.get("b", 2)).toBe("y");' },
        { name: 'multiple updates on same key choose nearest prior value', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 1);\n    map.set("a", "y", 2);\n    map.set("a", "z", 5);\n    expect(map.get("a", 4)).toBe("y");' },
        { name: 'exact latest timestamp still wins', body: '    const map = new module.TimeMap();\n    map.set("a", "x", 1);\n    map.set("a", "z", 5);\n    expect(map.get("a", 5)).toBe("z");' },
        { name: 'empty string values are preserved', body: '    const map = new module.TimeMap();\n    map.set("a", "", 1);\n    expect(map.get("a", 1)).toBe("");' },
        { name: 'later unrelated key does not affect prior key lookup', body: '    const map = new module.TimeMap();\n    map.set("a", "first", 1);\n    map.set("b", "other", 10);\n    expect(map.get("a", 10)).toBe("first");' }
      ])
    },
    metadata: {
      expectedComplexities: complexities(
        { operation: 'set', time: 'O(1) amortized' },
        { operation: 'get', time: 'O(log n)' }
      ),
      commonPitfalls: ['Returning the first later value instead of the nearest earlier value.', 'Forgetting to separate histories by key.', 'Returning `undefined` instead of the required empty string.'],
      recallQuestions: ['Why is binary search appropriate for each key history?', 'What should `get` do when the query timestamp is earlier than every stored entry?'],
      invariants: ['Each key’s history stays in non-decreasing timestamp order.', 'A `get` lookup returns the latest value with `entry.timestamp <= queryTimestamp`.']
    }
  })
];

export { dataStructureProblems };
