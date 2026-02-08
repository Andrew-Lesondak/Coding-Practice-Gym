import { QuizQuestion } from '../types/quiz';

const tf = (
  id: string,
  topic: QuizQuestion['topic'],
  subtopic: string,
  difficulty: QuizQuestion['difficulty'],
  promptMarkdown: string,
  answer: boolean,
  explanationMarkdown: string,
  tags: string[]
): QuizQuestion => ({
  id,
  topic,
  subtopic,
  difficulty,
  type: 'true_false',
  promptMarkdown,
  correct: { true_false: answer },
  explanationMarkdown,
  tags
});

const sc = (
  id: string,
  topic: QuizQuestion['topic'],
  subtopic: string,
  difficulty: QuizQuestion['difficulty'],
  promptMarkdown: string,
  choices: QuizQuestion['choices'],
  correctId: string,
  explanationMarkdown: string,
  tags: string[]
): QuizQuestion => ({
  id,
  topic,
  subtopic,
  difficulty,
  type: 'single_choice',
  promptMarkdown,
  choices,
  correct: { single_choice: correctId },
  explanationMarkdown,
  tags
});

const mc = (
  id: string,
  topic: QuizQuestion['topic'],
  subtopic: string,
  difficulty: QuizQuestion['difficulty'],
  promptMarkdown: string,
  choices: QuizQuestion['choices'],
  correctIds: string[],
  explanationMarkdown: string,
  tags: string[]
): QuizQuestion => ({
  id,
  topic,
  subtopic,
  difficulty,
  type: 'multiple_choice',
  promptMarkdown,
  choices,
  correct: { multiple_choice: correctIds },
  explanationMarkdown,
  tags
});

const jsQuestions: QuizQuestion[] = [
  tf('js-tf-1', 'javascript', 'closures', 'easy', 'A closure can access variables from its outer scope even after the outer function returns.', true, 'Closures retain access to lexical scope.', ['closures', 'scope']),
  tf('js-tf-2', 'javascript', 'this', 'easy', '`this` inside an arrow function is dynamically bound at call time.', false, 'Arrow functions capture `this` from the surrounding scope.', ['this', 'arrow']),
  tf('js-tf-3', 'javascript', 'hoisting', 'easy', 'Function declarations are hoisted before variable assignments.', true, 'Function declarations are hoisted with their bodies.', ['hoisting']),
  tf('js-tf-4', 'javascript', 'promises', 'easy', 'A promise can transition from pending to fulfilled or rejected only once.', true, 'Promise state is immutable after resolution.', ['promises']),
  tf('js-tf-5', 'javascript', 'event-loop', 'medium', 'Microtasks run before the next macrotask.', true, 'Promise callbacks are microtasks and run before timers.', ['event-loop']),
  tf('js-tf-6', 'javascript', 'coercion', 'medium', '`"5" - 1` evaluates to 4.', true, 'The `-` operator coerces to number.', ['coercion']),
  tf('js-tf-7', 'javascript', 'arrays', 'easy', '`Array.prototype.map` mutates the original array.', false, 'map returns a new array.', ['arrays']),
  tf('js-tf-8', 'javascript', 'objects', 'easy', '`Object.freeze` makes all nested objects immutable.', false, 'Freeze is shallow.', ['objects']),
  tf('js-tf-9', 'javascript', 'async', 'medium', 'An `async` function always returns a promise.', true, 'Return values are wrapped in a promise.', ['async']),
  tf('js-tf-10', 'javascript', 'prototypes', 'medium', 'Instances inherit methods through the prototype chain.', true, 'Prototype chain lookup handles inheritance.', ['prototypes']),
  tf('js-tf-11', 'javascript', 'scope', 'easy', '`let` is block-scoped.', true, 'let/const are block-scoped.', ['scope']),
  tf('js-tf-12', 'javascript', 'promises', 'medium', 'Calling `.then` executes the callback immediately in the same call stack.', false, 'Then callbacks are queued as microtasks.', ['promises']),
  tf('js-tf-13', 'javascript', 'types', 'easy', '`typeof null` is `"object"`.', true, 'This is a long-standing JS quirk.', ['types']),
  tf('js-tf-14', 'javascript', 'strict', 'medium', 'In strict mode, `this` inside a plain function defaults to the global object.', false, 'In strict mode it is `undefined`.', ['strict']),
  tf('js-tf-15', 'javascript', 'modules', 'medium', 'ES modules are always in strict mode.', true, 'Modules are strict by default.', ['modules']),

  sc(
    'js-sc-1',
    'javascript',
    'closures',
    'easy',
    'What does this return?\n\n```js\nfunction outer(){\n  let x = 1;\n  return () => x++;\n}\nconst f = outer();\nconsole.log(f(), f());\n```',
    [
      { id: 'a', text: '1 2' },
      { id: 'b', text: '2 3' },
      { id: 'c', text: '1 1' },
      { id: 'd', text: '2 2' }
    ],
    'a',
    'The closure increments `x` on each call: 1 then 2.',
    ['closures']
  ),
  sc(
    'js-sc-2',
    'javascript',
    'this',
    'medium',
    'What is `this` in a plain function call in strict mode?',
    [
      { id: 'a', text: 'Global object' },
      { id: 'b', text: 'undefined' },
      { id: 'c', text: 'The function itself' },
      { id: 'd', text: 'window only in browsers' }
    ],
    'b',
    '`this` is `undefined` in strict mode when not called as a method.',
    ['this', 'strict']
  ),
  sc(
    'js-sc-3',
    'javascript',
    'promises',
    'medium',
    'Which queue runs promise callbacks?',
    [
      { id: 'a', text: 'Macrotask queue' },
      { id: 'b', text: 'Microtask queue' },
      { id: 'c', text: 'Render queue' },
      { id: 'd', text: 'Call stack directly' }
    ],
    'b',
    'Promise `.then` callbacks are microtasks.',
    ['event-loop', 'promises']
  ),
  sc(
    'js-sc-4',
    'javascript',
    'arrays',
    'easy',
    'Which method removes the last element and returns it?',
    [
      { id: 'a', text: 'shift' },
      { id: 'b', text: 'pop' },
      { id: 'c', text: 'push' },
      { id: 'd', text: 'slice' }
    ],
    'b',
    '`pop` removes and returns the last element.',
    ['arrays']
  ),
  sc(
    'js-sc-5',
    'javascript',
    'objects',
    'easy',
    'How do you create a new object that inherits from `proto`?',
    [
      { id: 'a', text: 'Object.create(proto)' },
      { id: 'b', text: 'Object.assign(proto)' },
      { id: 'c', text: 'new Object(proto)' },
      { id: 'd', text: 'proto()' }
    ],
    'a',
    'Object.create sets the prototype of the new object.',
    ['objects', 'prototypes']
  ),
  sc(
    'js-sc-6',
    'javascript',
    'async',
    'easy',
    'What does an `async` function return?',
    [
      { id: 'a', text: 'The raw value' },
      { id: 'b', text: 'A promise' },
      { id: 'c', text: 'A generator' },
      { id: 'd', text: 'undefined' }
    ],
    'b',
    'Async functions always return a promise.',
    ['async']
  ),
  sc(
    'js-sc-7',
    'javascript',
    'coercion',
    'medium',
    'What is `[] + {}` evaluated as?',
    [
      { id: 'a', text: '[object Object]' },
      { id: 'b', text: '0' },
      { id: 'c', text: '[object Object]0' },
      { id: 'd', text: 'NaN' }
    ],
    'a',
    'Array is coerced to "" then concatenated with object string.',
    ['coercion']
  ),
  sc(
    'js-sc-8',
    'javascript',
    'scope',
    'easy',
    'Which keyword creates block-scoped variables?',
    [
      { id: 'a', text: 'var' },
      { id: 'b', text: 'let' },
      { id: 'c', text: 'function' },
      { id: 'd', text: 'with' }
    ],
    'b',
    '`let` is block-scoped.',
    ['scope']
  ),
  sc(
    'js-sc-9',
    'javascript',
    'event-loop',
    'medium',
    'Which runs first?\n\n```js\nsetTimeout(() => console.log("t"), 0);\nPromise.resolve().then(() => console.log("p"));\n```',
    [
      { id: 'a', text: 't then p' },
      { id: 'b', text: 'p then t' },
      { id: 'c', text: 'Order is random' },
      { id: 'd', text: 'Neither runs' }
    ],
    'b',
    'Microtasks (promise) run before macrotasks (timeout).',
    ['event-loop']
  ),
  sc(
    'js-sc-10',
    'javascript',
    'prototypes',
    'medium',
    'Where does JS look up a missing property on an object?',
    [
      { id: 'a', text: 'The constructor only' },
      { id: 'b', text: 'The prototype chain' },
      { id: 'c', text: 'Global scope' },
      { id: 'd', text: 'Module registry' }
    ],
    'b',
    'Property lookup walks the prototype chain.',
    ['prototypes']
  ),
  sc(
    'js-sc-11',
    'javascript',
    'arrays',
    'medium',
    'Which method creates a new array with elements that pass a predicate?',
    [
      { id: 'a', text: 'map' },
      { id: 'b', text: 'filter' },
      { id: 'c', text: 'reduce' },
      { id: 'd', text: 'forEach' }
    ],
    'b',
    'filter returns items that match the predicate.',
    ['arrays']
  ),
  sc(
    'js-sc-12',
    'javascript',
    'promises',
    'medium',
    'Which method waits for all promises and rejects on first rejection?',
    [
      { id: 'a', text: 'Promise.all' },
      { id: 'b', text: 'Promise.any' },
      { id: 'c', text: 'Promise.race' },
      { id: 'd', text: 'Promise.resolve' }
    ],
    'a',
    'Promise.all rejects as soon as any promise rejects.',
    ['promises']
  ),
  sc(
    'js-sc-13',
    'javascript',
    'hoisting',
    'medium',
    'What happens with `let` before initialization?',
    [
      { id: 'a', text: 'It is `undefined`' },
      { id: 'b', text: 'It throws ReferenceError' },
      { id: 'c', text: 'It is `null`' },
      { id: 'd', text: 'It is a global' }
    ],
    'b',
    'Temporal Dead Zone causes ReferenceError.',
    ['hoisting']
  ),
  sc(
    'js-sc-14',
    'javascript',
    'objects',
    'medium',
    'Which creates a shallow copy of an object?',
    [
      { id: 'a', text: 'JSON.parse(JSON.stringify(obj))' },
      { id: 'b', text: 'Object.assign({}, obj)' },
      { id: 'c', text: 'structuredClone(obj)' },
      { id: 'd', text: 'Object.freeze(obj)' }
    ],
    'b',
    'Object.assign copies enumerable own properties shallowly.',
    ['objects']
  ),
  sc(
    'js-sc-15',
    'javascript',
    'async',
    'medium',
    'What does `await` do to a promise?',
    [
      { id: 'a', text: 'Blocks the event loop' },
      { id: 'b', text: 'Pauses the async function and resumes later' },
      { id: 'c', text: 'Converts it to a callback' },
      { id: 'd', text: 'Cancels it if slow' }
    ],
    'b',
    'Await pauses the async function until the promise settles.',
    ['async']
  ),
  sc(
    'js-sc-16',
    'javascript',
    'types',
    'easy',
    'What is the result of `typeof NaN`?',
    [
      { id: 'a', text: 'number' },
      { id: 'b', text: 'NaN' },
      { id: 'c', text: 'undefined' },
      { id: 'd', text: 'object' }
    ],
    'a',
    '`NaN` is of type number.',
    ['types']
  ),
  sc(
    'js-sc-17',
    'javascript',
    'functions',
    'easy',
    'Which method sets `this` and invokes immediately?',
    [
      { id: 'a', text: 'call' },
      { id: 'b', text: 'bind' },
      { id: 'c', text: 'applyLater' },
      { id: 'd', text: 'wrap' }
    ],
    'a',
    '`call` invokes immediately with a specified `this`.',
    ['this']
  ),
  sc(
    'js-sc-18',
    'javascript',
    'functions',
    'medium',
    'Which method returns a new function with bound `this`?',
    [
      { id: 'a', text: 'call' },
      { id: 'b', text: 'bind' },
      { id: 'c', text: 'apply' },
      { id: 'd', text: 'invoke' }
    ],
    'b',
    'bind returns a new function.',
    ['this']
  ),
  sc(
    'js-sc-19',
    'javascript',
    'objects',
    'easy',
    'Which syntax checks if a property exists on an object (including prototype)?',
    [
      { id: 'a', text: 'obj.hasOwnProperty("x")' },
      { id: 'b', text: '"x" in obj' },
      { id: 'c', text: 'Object.keys(obj).includes("x")' },
      { id: 'd', text: 'obj.x !== undefined' }
    ],
    'b',
    '`in` checks the prototype chain too.',
    ['objects']
  ),
  sc(
    'js-sc-20',
    'javascript',
    'promises',
    'medium',
    'Which resolves when any promise fulfills and ignores rejections until all reject?',
    [
      { id: 'a', text: 'Promise.race' },
      { id: 'b', text: 'Promise.any' },
      { id: 'c', text: 'Promise.all' },
      { id: 'd', text: 'Promise.allSettled' }
    ],
    'b',
    'Promise.any fulfills on first fulfillment.',
    ['promises']
  ),
  sc(
    'js-sc-21',
    'javascript',
    'coercion',
    'hard',
    'What is `"" == 0`?',
    [
      { id: 'a', text: 'true' },
      { id: 'b', text: 'false' },
      { id: 'c', text: 'TypeError' },
      { id: 'd', text: 'NaN' }
    ],
    'a',
    'Loose equality coerces both to number 0.',
    ['coercion']
  ),
  sc(
    'js-sc-22',
    'javascript',
    'arrays',
    'medium',
    'Which method flattens one level of nested arrays?',
    [
      { id: 'a', text: 'flat' },
      { id: 'b', text: 'join' },
      { id: 'c', text: 'concatAll' },
      { id: 'd', text: 'flatten' }
    ],
    'a',
    '`flat()` defaults to depth 1.',
    ['arrays']
  ),

  mc(
    'js-mc-1',
    'javascript',
    'event-loop',
    'medium',
    'Which are microtasks?',
    [
      { id: 'a', text: 'Promise.then callbacks' },
      { id: 'b', text: 'setTimeout callbacks' },
      { id: 'c', text: 'queueMicrotask callbacks' },
      { id: 'd', text: 'requestAnimationFrame callbacks' }
    ],
    ['a', 'c'],
    'Promise callbacks and queueMicrotask are microtasks.',
    ['event-loop']
  ),
  mc(
    'js-mc-2',
    'javascript',
    'arrays',
    'easy',
    'Which methods do NOT mutate the original array?',
    [
      { id: 'a', text: 'map' },
      { id: 'b', text: 'filter' },
      { id: 'c', text: 'push' },
      { id: 'd', text: 'slice' }
    ],
    ['a', 'b', 'd'],
    'map/filter/slice are non-mutating; push mutates.',
    ['arrays']
  ),
  mc(
    'js-mc-3',
    'javascript',
    'objects',
    'medium',
    'Which create a shallow copy?',
    [
      { id: 'a', text: 'Object.assign({}, obj)' },
      { id: 'b', text: '{ ...obj }' },
      { id: 'c', text: 'structuredClone(obj)' },
      { id: 'd', text: 'JSON.parse(JSON.stringify(obj))' }
    ],
    ['a', 'b'],
    'Assign and spread are shallow; structuredClone and JSON clone are deep-ish.',
    ['objects']
  ),
  mc(
    'js-mc-4',
    'javascript',
    'promises',
    'medium',
    'Which promise methods always resolve (never reject)?',
    [
      { id: 'a', text: 'Promise.allSettled' },
      { id: 'b', text: 'Promise.resolve' },
      { id: 'c', text: 'Promise.all' },
      { id: 'd', text: 'Promise.any' }
    ],
    ['a', 'b'],
    'allSettled and resolve always fulfill.',
    ['promises']
  ),
  mc(
    'js-mc-5',
    'javascript',
    'this',
    'medium',
    'Which can change `this` for a function call?',
    [
      { id: 'a', text: 'call' },
      { id: 'b', text: 'apply' },
      { id: 'c', text: 'bind' },
      { id: 'd', text: 'map' }
    ],
    ['a', 'b', 'c'],
    'call/apply invoke with a specified this; bind creates a bound function.',
    ['this']
  ),
  mc(
    'js-mc-6',
    'javascript',
    'hoisting',
    'medium',
    'Which are hoisted?',
    [
      { id: 'a', text: 'Function declarations' },
      { id: 'b', text: 'var declarations' },
      { id: 'c', text: 'let declarations (usable before init)' },
      { id: 'd', text: 'class declarations (usable before init)' }
    ],
    ['a', 'b', 'd'],
    'Function/class/var declarations are hoisted, but let/class are in TDZ.',
    ['hoisting']
  ),
  mc(
    'js-mc-7',
    'javascript',
    'async',
    'medium',
    'Which statements are true about `async/await`?',
    [
      { id: 'a', text: 'await can only be used inside async functions' },
      { id: 'b', text: 'await blocks the event loop' },
      { id: 'c', text: 'await pauses the async function' },
      { id: 'd', text: 'async functions return promises' }
    ],
    ['a', 'c', 'd'],
    'await pauses the async function; it does not block the event loop.',
    ['async']
  ),
  mc(
    'js-mc-8',
    'javascript',
    'coercion',
    'hard',
    'Which expressions are `true`?',
    [
      { id: 'a', text: '[] == ""' },
      { id: 'b', text: '[] == 0' },
      { id: 'c', text: '{} == {}' },
      { id: 'd', text: 'null == undefined' }
    ],
    ['a', 'b', 'd'],
    'Loose equality coerces arrays to "", null == undefined is true.',
    ['coercion']
  ),
  mc(
    'js-mc-9',
    'javascript',
    'arrays',
    'easy',
    'Which array methods can take a callback?',
    [
      { id: 'a', text: 'map' },
      { id: 'b', text: 'filter' },
      { id: 'c', text: 'forEach' },
      { id: 'd', text: 'pop' }
    ],
    ['a', 'b', 'c'],
    'map/filter/forEach take callbacks.',
    ['arrays']
  ),
  mc(
    'js-mc-10',
    'javascript',
    'objects',
    'medium',
    'Which are valid ways to set a prototype?',
    [
      { id: 'a', text: 'Object.create(proto)' },
      { id: 'b', text: 'Object.setPrototypeOf(obj, proto)' },
      { id: 'c', text: 'obj.__proto__ = proto' },
      { id: 'd', text: 'Object.assign(obj, proto)' }
    ],
    ['a', 'b', 'c'],
    'Assign does not set prototype.',
    ['prototypes']
  ),
  mc(
    'js-mc-11',
    'javascript',
    'promises',
    'medium',
    'Which methods return a new promise?',
    [
      { id: 'a', text: 'then' },
      { id: 'b', text: 'catch' },
      { id: 'c', text: 'finally' },
      { id: 'd', text: 'resolve' }
    ],
    ['a', 'b', 'c'],
    'then/catch/finally return new promises.',
    ['promises']
  ),
  mc(
    'js-mc-12',
    'javascript',
    'scope',
    'easy',
    'Which create block scope?',
    [
      { id: 'a', text: 'let' },
      { id: 'b', text: 'const' },
      { id: 'c', text: 'var' },
      { id: 'd', text: 'function' }
    ],
    ['a', 'b', 'd'],
    'Function declarations create function scope, and let/const are block-scoped.',
    ['scope']
  ),
  mc(
    'js-mc-13',
    'javascript',
    'event-loop',
    'medium',
    'Which are macrotasks?',
    [
      { id: 'a', text: 'setTimeout' },
      { id: 'b', text: 'setInterval' },
      { id: 'c', text: 'Promise.then' },
      { id: 'd', text: 'MessageChannel' }
    ],
    ['a', 'b', 'd'],
    'Timers and MessageChannel are macrotasks; Promise.then is microtask.',
    ['event-loop']
  ),
  mc(
    'js-mc-14',
    'javascript',
    'types',
    'medium',
    'Which values are falsy?',
    [
      { id: 'a', text: '0' },
      { id: 'b', text: '""' },
      { id: 'c', text: '[]' },
      { id: 'd', text: 'null' }
    ],
    ['a', 'b', 'd'],
    'Empty array is truthy.',
    ['types']
  ),
  mc(
    'js-mc-15',
    'javascript',
    'arrays',
    'medium',
    'Which methods can change array length?',
    [
      { id: 'a', text: 'push' },
      { id: 'b', text: 'pop' },
      { id: 'c', text: 'slice' },
      { id: 'd', text: 'splice' }
    ],
    ['a', 'b', 'd'],
    'push/pop/splice mutate length; slice does not.',
    ['arrays']
  ),
  mc(
    'js-mc-16',
    'javascript',
    'functions',
    'medium',
    'Which statements about arrow functions are true?',
    [
      { id: 'a', text: 'They have their own `this`' },
      { id: 'b', text: 'They cannot be used as constructors' },
      { id: 'c', text: 'They capture lexical `this`' },
      { id: 'd', text: 'They have `arguments` binding' }
    ],
    ['b', 'c'],
    'Arrow functions capture lexical this and can’t be used with new.',
    ['functions']
  ),
  mc(
    'js-mc-17',
    'javascript',
    'promises',
    'hard',
    'Which statements about `Promise.race` are true?',
    [
      { id: 'a', text: 'It settles with the first settled promise' },
      { id: 'b', text: 'It waits for all promises to settle' },
      { id: 'c', text: 'It can reject if the first settled is rejection' },
      { id: 'd', text: 'It always fulfills if any promise fulfills' }
    ],
    ['a', 'c'],
    'race settles on the first settlement, which can be rejection.',
    ['promises']
  ),
  mc(
    'js-mc-18',
    'javascript',
    'objects',
    'medium',
    'Which are valid property access patterns?',
    [
      { id: 'a', text: 'obj.key' },
      { id: 'b', text: 'obj["key"]' },
      { id: 'c', text: 'obj[key]' },
      { id: 'd', text: 'obj{key}' }
    ],
    ['a', 'b', 'c'],
    'Bracket notation accepts strings/variables.',
    ['objects']
  ),
  mc(
    'js-mc-19',
    'javascript',
    'coercion',
    'hard',
    'Which are true about `Number(" ")` and `Boolean(" ")`?',
    [
      { id: 'a', text: 'Number(" ") is 0' },
      { id: 'b', text: 'Number(" ") is NaN' },
      { id: 'c', text: 'Boolean(" ") is true' },
      { id: 'd', text: 'Boolean(" ") is false' }
    ],
    ['a', 'c'],
    'Whitespace string coerces to 0; non-empty string is truthy.',
    ['coercion']
  ),
  mc(
    'js-mc-20',
    'javascript',
    'modules',
    'medium',
    'Which are true about ES modules?',
    [
      { id: 'a', text: 'They are strict by default' },
      { id: 'b', text: 'Imports are hoisted' },
      { id: 'c', text: 'They use dynamic scoping' },
      { id: 'd', text: 'They execute once per module instance' }
    ],
    ['a', 'b', 'd'],
    'Modules are strict, imports are hoisted, and modules are singletons.',
    ['modules']
  ),
  mc(
    'js-mc-21',
    'javascript',
    'arrays',
    'medium',
    'Which iterate left-to-right?',
    [
      { id: 'a', text: 'reduce' },
      { id: 'b', text: 'reduceRight' },
      { id: 'c', text: 'forEach' },
      { id: 'd', text: 'map' }
    ],
    ['a', 'c', 'd'],
    'reduceRight iterates right-to-left.',
    ['arrays']
  ),
  mc(
    'js-mc-22',
    'javascript',
    'scope',
    'medium',
    'Which are in the temporal dead zone (TDZ) before initialization?',
    [
      { id: 'a', text: 'let' },
      { id: 'b', text: 'const' },
      { id: 'c', text: 'var' },
      { id: 'd', text: 'function declarations' }
    ],
    ['a', 'b'],
    'let/const are in TDZ; var/function are hoisted differently.',
    ['scope']
  ),
  mc(
    'js-mc-23',
    'javascript',
    'prototypes',
    'medium',
    'Which are true about prototypes?',
    [
      { id: 'a', text: 'Functions have a `prototype` property' },
      { id: 'b', text: 'Objects have `__proto__` linking to prototype' },
      { id: 'c', text: 'Prototype chain lookup stops at null' },
      { id: 'd', text: 'Prototype chain is per-instance copy' }
    ],
    ['a', 'b', 'c'],
    'Prototype chain is shared, not copied per instance.',
    ['prototypes']
  )
];

const reactQuestions: QuizQuestion[] = [
  tf('react-tf-1', 'react', 'hooks', 'easy', 'Hooks must be called in the same order on every render.', true, 'Rules of Hooks require stable call order.', ['hooks']),
  tf('react-tf-2', 'react', 'useEffect', 'easy', 'An effect without a dependency array runs after every render.', true, 'No deps means run after every render.', ['useEffect']),
  tf('react-tf-3', 'react', 'state', 'easy', 'Calling setState in React is always synchronous.', false, 'State updates may be batched.', ['state']),
  tf('react-tf-4', 'react', 'rendering', 'medium', 'A component re-renders when its state changes.', true, 'State updates trigger re-render.', ['rendering']),
  tf('react-tf-5', 'react', 'keys', 'easy', 'Keys help React identify items between renders.', true, 'Keys aid reconciliation.', ['keys']),
  tf('react-tf-6', 'react', 'memo', 'medium', '`React.memo` prevents re-render when props are referentially equal.', true, 'memo uses shallow prop comparison.', ['memo']),
  tf('react-tf-7', 'react', 'useMemo', 'medium', '`useMemo` guarantees a value will not recompute if dependencies are the same.', true, 'Dependencies control recomputation.', ['useMemo']),
  tf('react-tf-8', 'react', 'useCallback', 'medium', '`useCallback` memoizes a function reference.', true, 'It returns a stable function between renders.', ['useCallback']),
  tf('react-tf-9', 'react', 'context', 'medium', 'Updating context value can re-render all consumers.', true, 'Consumers re-render when provider value changes.', ['context']),
  tf('react-tf-10', 'react', 'refs', 'easy', 'Updating a ref triggers a re-render.', false, 'Refs are mutable without re-render.', ['refs']),
  tf('react-tf-11', 'react', 'lifecycle', 'medium', 'Effects run before the DOM is painted.', false, 'useEffect runs after paint; useLayoutEffect runs before paint.', ['useEffect']),
  tf('react-tf-12', 'react', 'state', 'medium', 'Using a functional updater avoids stale state issues.', true, 'Functional updater uses latest state.', ['state']),
  tf('react-tf-13', 'react', 'rendering', 'medium', 'React can batch multiple state updates into a single render.', true, 'Batching reduces renders.', ['rendering']),
  tf('react-tf-14', 'react', 'hooks', 'medium', 'Hooks can be called conditionally if the condition is stable.', false, 'Hooks must not be conditional.', ['hooks']),
  tf('react-tf-15', 'react', 'effects', 'medium', 'Cleaning up an effect runs before the next effect of the same type.', true, 'Cleanup runs before re-running effect.', ['useEffect']),

  sc(
    'react-sc-1',
    'react',
    'hooks',
    'easy',
    'Which hook manages local component state?',
    [
      { id: 'a', text: 'useState' },
      { id: 'b', text: 'useEffect' },
      { id: 'c', text: 'useMemo' },
      { id: 'd', text: 'useRef' }
    ],
    'a',
    'useState stores local state and triggers re-render.',
    ['hooks']
  ),
  sc(
    'react-sc-2',
    'react',
    'useEffect',
    'easy',
    'When does an effect with an empty dependency array run?',
    [
      { id: 'a', text: 'Every render' },
      { id: 'b', text: 'Only on mount and unmount' },
      { id: 'c', text: 'Only before first render' },
      { id: 'd', text: 'Only on updates' }
    ],
    'b',
    'It runs after mount and cleanup on unmount.',
    ['useEffect']
  ),
  sc(
    'react-sc-3',
    'react',
    'rendering',
    'medium',
    'What is the primary purpose of keys in lists?',
    [
      { id: 'a', text: 'Styling list items' },
      { id: 'b', text: 'Preserving element identity' },
      { id: 'c', text: 'Sorting items' },
      { id: 'd', text: 'Preventing rendering' }
    ],
    'b',
    'Keys help React match elements between renders.',
    ['keys']
  ),
  sc(
    'react-sc-4',
    'react',
    'memo',
    'medium',
    'Which hook memoizes a value based on dependencies?',
    [
      { id: 'a', text: 'useMemo' },
      { id: 'b', text: 'useCallback' },
      { id: 'c', text: 'useRef' },
      { id: 'd', text: 'useEffect' }
    ],
    'a',
    'useMemo memoizes computed values.',
    ['useMemo']
  ),
  sc(
    'react-sc-5',
    'react',
    'memo',
    'medium',
    'Which hook memoizes a function?',
    [
      { id: 'a', text: 'useMemo' },
      { id: 'b', text: 'useCallback' },
      { id: 'c', text: 'useState' },
      { id: 'd', text: 'useReducer' }
    ],
    'b',
    'useCallback memoizes a function reference.',
    ['useCallback']
  ),
  sc(
    'react-sc-6',
    'react',
    'state',
    'medium',
    'Which is the correct way to update state based on previous state?',
    [
      { id: 'a', text: 'setCount(count + 1)' },
      { id: 'b', text: 'setCount(prev => prev + 1)' },
      { id: 'c', text: 'count++' },
      { id: 'd', text: 'setCount = count + 1' }
    ],
    'b',
    'Functional updater ensures latest state.',
    ['state']
  ),
  sc(
    'react-sc-7',
    'react',
    'refs',
    'easy',
    'Which hook gives you a mutable ref that persists across renders?',
    [
      { id: 'a', text: 'useState' },
      { id: 'b', text: 'useRef' },
      { id: 'c', text: 'useEffect' },
      { id: 'd', text: 'useMemo' }
    ],
    'b',
    'useRef provides a mutable .current.',
    ['refs']
  ),
  sc(
    'react-sc-8',
    'react',
    'context',
    'medium',
    'Which hook reads a context value?',
    [
      { id: 'a', text: 'useContext' },
      { id: 'b', text: 'useReducer' },
      { id: 'c', text: 'useMemo' },
      { id: 'd', text: 'useCallback' }
    ],
    'a',
    'useContext reads the nearest provider value.',
    ['context']
  ),
  sc(
    'react-sc-9',
    'react',
    'rendering',
    'medium',
    'Which reconciler behavior is true?',
    [
      { id: 'a', text: 'React always re-renders the DOM subtree fully' },
      { id: 'b', text: 'React compares element types and keys to decide reuse' },
      { id: 'c', text: 'React never reuses DOM nodes' },
      { id: 'd', text: 'React uses XPath to map nodes' }
    ],
    'b',
    'Element type + key determine reuse.',
    ['rendering']
  ),
  sc(
    'react-sc-10',
    'react',
    'effects',
    'medium',
    'When does `useLayoutEffect` run?',
    [
      { id: 'a', text: 'After paint' },
      { id: 'b', text: 'Before paint' },
      { id: 'c', text: 'Only on mount' },
      { id: 'd', text: 'Only on unmount' }
    ],
    'b',
    'useLayoutEffect runs before the browser paints.',
    ['useEffect']
  ),
  sc(
    'react-sc-11',
    'react',
    'state',
    'medium',
    'What does React do when you call setState with the same value?',
    [
      { id: 'a', text: 'Always re-render' },
      { id: 'b', text: 'Bail out in many cases' },
      { id: 'c', text: 'Throw error' },
      { id: 'd', text: 'Restart app' }
    ],
    'b',
    'React may bail out if the state value is identical.',
    ['state']
  ),
  sc(
    'react-sc-12',
    'react',
    'hooks',
    'medium',
    'Where should custom hooks be called?',
    [
      { id: 'a', text: 'Inside callbacks' },
      { id: 'b', text: 'At top level of components/hooks' },
      { id: 'c', text: 'Inside conditionals' },
      { id: 'd', text: 'Inside loops' }
    ],
    'b',
    'Hooks must be called at top level to preserve order.',
    ['hooks']
  ),
  sc(
    'react-sc-13',
    'react',
    'memo',
    'medium',
    'What does React.memo compare by default?',
    [
      { id: 'a', text: 'Deep equality' },
      { id: 'b', text: 'Shallow equality' },
      { id: 'c', text: 'Reference only for objects' },
      { id: 'd', text: 'Always re-render' }
    ],
    'b',
    'React.memo uses shallow comparison by default.',
    ['memo']
  ),
  sc(
    'react-sc-14',
    'react',
    'keys',
    'easy',
    'Which is the best key for a list?',
    [
      { id: 'a', text: 'Array index' },
      { id: 'b', text: 'Stable unique id from data' },
      { id: 'c', text: 'Math.random()' },
      { id: 'd', text: 'Date.now()' }
    ],
    'b',
    'Stable ids avoid mismatches on re-order.',
    ['keys']
  ),
  sc(
    'react-sc-15',
    'react',
    'context',
    'medium',
    'What triggers re-render of context consumers?',
    [
      { id: 'a', text: 'Any provider re-render' },
      { id: 'b', text: 'Provider value reference change' },
      { id: 'c', text: 'Provider children change' },
      { id: 'd', text: 'Only if useMemo is absent' }
    ],
    'b',
    'Consumers update when the context value changes.',
    ['context']
  ),
  sc(
    'react-sc-16',
    'react',
    'rendering',
    'medium',
    'What is a common reason for unnecessary re-renders?',
    [
      { id: 'a', text: 'Stable props' },
      { id: 'b', text: 'New object/function props each render' },
      { id: 'c', text: 'Memoized callbacks' },
      { id: 'd', text: 'useMemo values' }
    ],
    'b',
    'New references break shallow equality.',
    ['rendering']
  ),
  sc(
    'react-sc-17',
    'react',
    'effects',
    'medium',
    'What does returning a function from useEffect do?',
    [
      { id: 'a', text: 'Runs before the effect' },
      { id: 'b', text: 'Defines cleanup logic' },
      { id: 'c', text: 'Stops rendering' },
      { id: 'd', text: 'Runs only once' }
    ],
    'b',
    'The returned function is used for cleanup.',
    ['useEffect']
  ),
  sc(
    'react-sc-18',
    'react',
    'state',
    'hard',
    'What does React batch by default?',
    [
      { id: 'a', text: 'Only updates inside promises' },
      { id: 'b', text: 'Updates inside event handlers' },
      { id: 'c', text: 'All updates, always' },
      { id: 'd', text: 'Only updates inside timeouts' }
    ],
    'b',
    'React batches updates in event handlers by default.',
    ['state']
  ),
  sc(
    'react-sc-19',
    'react',
    'hooks',
    'medium',
    'Which hook is best for expensive computation?',
    [
      { id: 'a', text: 'useMemo' },
      { id: 'b', text: 'useEffect' },
      { id: 'c', text: 'useRef' },
      { id: 'd', text: 'useLayoutEffect' }
    ],
    'a',
    'useMemo memoizes expensive calculations.',
    ['useMemo']
  ),
  sc(
    'react-sc-20',
    'react',
    'refs',
    'medium',
    'When would you use `useRef` over `useState`?',
    [
      { id: 'a', text: 'To trigger a re-render' },
      { id: 'b', text: 'To store mutable value without re-render' },
      { id: 'c', text: 'To memoize a component' },
      { id: 'd', text: 'To fetch data' }
    ],
    'b',
    'useRef stores mutable values without rendering.',
    ['refs']
  ),
  sc(
    'react-sc-21',
    'react',
    'rendering',
    'medium',
    'Which statement about props is true?',
    [
      { id: 'a', text: 'Props are mutable' },
      { id: 'b', text: 'Props are read-only' },
      { id: 'c', text: 'Props are stored in state' },
      { id: 'd', text: 'Props are only for DOM elements' }
    ],
    'b',
    'Props are read-only inputs to components.',
    ['rendering']
  ),
  sc(
    'react-sc-22',
    'react',
    'state',
    'medium',
    'What does `useReducer` help with?',
    [
      { id: 'a', text: 'Complex state transitions' },
      { id: 'b', text: 'Fetching data' },
      { id: 'c', text: 'CSS styling' },
      { id: 'd', text: 'Memoizing components' }
    ],
    'a',
    'useReducer is useful for complex state logic.',
    ['state']
  ),

  mc(
    'react-mc-1',
    'react',
    'hooks',
    'medium',
    'Which are Rules of Hooks?',
    [
      { id: 'a', text: 'Call hooks at top level' },
      { id: 'b', text: 'Call hooks conditionally if stable' },
      { id: 'c', text: 'Only call hooks from React functions' },
      { id: 'd', text: 'Call hooks inside loops' }
    ],
    ['a', 'c'],
    'Hooks must be called at the top level and only from React functions.',
    ['hooks']
  ),
  mc(
    'react-mc-2',
    'react',
    'useEffect',
    'medium',
    'Which dependencies cause the effect to re-run?',
    [
      { id: 'a', text: 'Values in the dependency array that changed' },
      { id: 'b', text: 'Any state change in the app' },
      { id: 'c', text: 'Any render' },
      { id: 'd', text: 'No dependencies array' }
    ],
    ['a', 'd'],
    'Changed deps re-run; no deps means run after every render.',
    ['useEffect']
  ),
  mc(
    'react-mc-3',
    'react',
    'keys',
    'medium',
    'Which are good key choices?',
    [
      { id: 'a', text: 'Stable database id' },
      { id: 'b', text: 'Array index when list is static' },
      { id: 'c', text: 'Math.random() each render' },
      { id: 'd', text: 'Date.now() each render' }
    ],
    ['a', 'b'],
    'Stable ids are best; index only if list never reorders.',
    ['keys']
  ),
  mc(
    'react-mc-4',
    'react',
    'memo',
    'medium',
    'Which help reduce re-renders?',
    [
      { id: 'a', text: 'React.memo' },
      { id: 'b', text: 'useMemo' },
      { id: 'c', text: 'useCallback' },
      { id: 'd', text: 'useEffect' }
    ],
    ['a', 'b', 'c'],
    'memo/useMemo/useCallback reduce re-renders by stabilizing values.',
    ['memo']
  ),
  mc(
    'react-mc-5',
    'react',
    'state',
    'medium',
    'Which statements about state updates are true?',
    [
      { id: 'a', text: 'setState may be batched' },
      { id: 'b', text: 'setState is always synchronous' },
      { id: 'c', text: 'Functional updater uses latest state' },
      { id: 'd', text: 'Multiple setState in one event can merge' }
    ],
    ['a', 'c', 'd'],
    'React batches updates; functional updater avoids stale state.',
    ['state']
  ),
  mc(
    'react-mc-6',
    'react',
    'context',
    'medium',
    'Which are true about Context?',
    [
      { id: 'a', text: 'Consumers re-render when value reference changes' },
      { id: 'b', text: 'Context replaces all props' },
      { id: 'c', text: 'Context is global mutable state' },
      { id: 'd', text: 'Context can avoid prop drilling' }
    ],
    ['a', 'd'],
    'Context avoids prop drilling and updates consumers on value change.',
    ['context']
  ),
  mc(
    'react-mc-7',
    'react',
    'effects',
    'medium',
    'Which are valid useEffect cleanup triggers?',
    [
      { id: 'a', text: 'Before the next effect run' },
      { id: 'b', text: 'On component unmount' },
      { id: 'c', text: 'Before initial mount' },
      { id: 'd', text: 'On every render even if deps unchanged' }
    ],
    ['a', 'b'],
    'Cleanup runs before re-run and on unmount.',
    ['useEffect']
  ),
  mc(
    'react-mc-8',
    'react',
    'refs',
    'easy',
    'Which are valid ref use cases?',
    [
      { id: 'a', text: 'Access DOM nodes' },
      { id: 'b', text: 'Store mutable value without re-render' },
      { id: 'c', text: 'Trigger re-render' },
      { id: 'd', text: 'Replace state for UI' }
    ],
    ['a', 'b'],
    'Refs are for DOM access and mutable values without rendering.',
    ['refs']
  ),
  mc(
    'react-mc-9',
    'react',
    'rendering',
    'medium',
    'Which can cause child re-renders?',
    [
      { id: 'a', text: 'Parent renders with new props object' },
      { id: 'b', text: 'Parent renders with same props references' },
      { id: 'c', text: 'Context value changes' },
      { id: 'd', text: 'Child uses React.memo with unchanged props' }
    ],
    ['a', 'c'],
    'New props references and context changes can re-render children.',
    ['rendering']
  ),
  mc(
    'react-mc-10',
    'react',
    'hooks',
    'hard',
    'Which are true about custom hooks?',
    [
      { id: 'a', text: 'They must start with "use"' },
      { id: 'b', text: 'They can call other hooks' },
      { id: 'c', text: 'They must return JSX' },
      { id: 'd', text: 'They follow Rules of Hooks' }
    ],
    ['a', 'b', 'd'],
    'Custom hooks can call hooks and must follow the Rules of Hooks.',
    ['hooks']
  ),
  mc(
    'react-mc-11',
    'react',
    'state',
    'medium',
    'Which are valid useState initializers?',
    [
      { id: 'a', text: 'useState(0)' },
      { id: 'b', text: 'useState(() => compute())' },
      { id: 'c', text: 'useState(compute())' },
      { id: 'd', text: 'useState(setState)' }
    ],
    ['a', 'b', 'c'],
    'Lazy initializer avoids recomputation; direct value is allowed.',
    ['state']
  ),
  mc(
    'react-mc-12',
    'react',
    'rendering',
    'hard',
    'Which help avoid unnecessary renders?',
    [
      { id: 'a', text: 'Splitting components' },
      { id: 'b', text: 'Memoizing props' },
      { id: 'c', text: 'Using keys on non-lists' },
      { id: 'd', text: 'Using React.memo' }
    ],
    ['a', 'b', 'd'],
    'Component splitting and memoization reduce render surface.',
    ['rendering']
  ),
  mc(
    'react-mc-13',
    'react',
    'effects',
    'medium',
    'Which values should be included in a dependency array when used inside an effect?',
    [
      { id: 'a', text: 'State/props referenced inside the effect' },
      { id: 'b', text: 'Functions from props used inside the effect' },
      { id: 'c', text: 'Values not referenced by the effect' },
      { id: 'd', text: 'Random constants each render' }
    ],
    ['a', 'b'],
    'Include everything referenced inside the effect body.',
    ['useEffect']
  ),
  mc(
    'react-mc-14',
    'react',
    'context',
    'medium',
    'Which are typical context use cases?',
    [
      { id: 'a', text: 'Theme' },
      { id: 'b', text: 'Locale/i18n' },
      { id: 'c', text: 'Temporary animation state in one component' },
      { id: 'd', text: 'Auth user session' }
    ],
    ['a', 'b', 'd'],
    'Context is good for app-wide settings and session info.',
    ['context']
  ),
  mc(
    'react-mc-15',
    'react',
    'keys',
    'medium',
    'Which are risks of using array index as key in reorderable lists?',
    [
      { id: 'a', text: 'State mismatch between items' },
      { id: 'b', text: 'Better performance' },
      { id: 'c', text: 'Incorrect DOM reuse' },
      { id: 'd', text: 'Stable identity' }
    ],
    ['a', 'c'],
    'Index keys can cause incorrect reuse when order changes.',
    ['keys']
  ),
  mc(
    'react-mc-16',
    'react',
    'hooks',
    'medium',
    'Which hooks cause re-render when their values change?',
    [
      { id: 'a', text: 'useState' },
      { id: 'b', text: 'useReducer' },
      { id: 'c', text: 'useRef' },
      { id: 'd', text: 'useEffect' }
    ],
    ['a', 'b'],
    'State and reducer updates trigger re-render.',
    ['hooks']
  ),
  mc(
    'react-mc-17',
    'react',
    'rendering',
    'medium',
    'Which statements about StrictMode are true?',
    [
      { id: 'a', text: 'It can double-invoke render in dev' },
      { id: 'b', text: 'It affects production behavior' },
      { id: 'c', text: 'It helps surface side-effects' },
      { id: 'd', text: 'It disables hooks' }
    ],
    ['a', 'c'],
    'StrictMode is dev-only and helps surface side effects.',
    ['rendering']
  ),
  mc(
    'react-mc-18',
    'react',
    'memo',
    'medium',
    'Which change invalidates useMemo cache?',
    [
      { id: 'a', text: 'A dependency reference change' },
      { id: 'b', text: 'A non-dependency state change' },
      { id: 'c', text: 'A prop used but not listed' },
      { id: 'd', text: 'React devtools open' }
    ],
    ['a', 'c'],
    'useMemo recalculates when listed deps change; missing deps is a bug.',
    ['useMemo']
  ),
  mc(
    'react-mc-19',
    'react',
    'state',
    'medium',
    'Which are valid patterns for updating arrays in state?',
    [
      { id: 'a', text: 'setItems([...items, newItem])' },
      { id: 'b', text: 'items.push(newItem); setItems(items)' },
      { id: 'c', text: 'setItems(items.concat(newItem))' },
      { id: 'd', text: 'setItems(items.filter(...))' }
    ],
    ['a', 'c', 'd'],
    'Prefer immutable updates.',
    ['state']
  ),
  mc(
    'react-mc-20',
    'react',
    'effects',
    'medium',
    'Which are reasons to use useLayoutEffect?',
    [
      { id: 'a', text: 'Measure DOM before paint' },
      { id: 'b', text: 'Log analytics after paint' },
      { id: 'c', text: 'Synchronously reflow layout' },
      { id: 'd', text: 'Fetch data' }
    ],
    ['a', 'c'],
    'useLayoutEffect runs before paint for layout measurements.',
    ['useEffect']
  ),
  mc(
    'react-mc-21',
    'react',
    'hooks',
    'medium',
    'Which dependencies should be included in useCallback?',
    [
      { id: 'a', text: 'Values referenced inside the callback' },
      { id: 'b', text: 'The setState function' },
      { id: 'c', text: 'Static constants' },
      { id: 'd', text: 'Functions from props' }
    ],
    ['a', 'd'],
    'Include values referenced inside the callback, including functions from props.',
    ['useCallback']
  ),
  mc(
    'react-mc-22',
    'react',
    'context',
    'medium',
    'Which are typical downsides of overusing context?',
    [
      { id: 'a', text: 'Unnecessary re-renders' },
      { id: 'b', text: 'Easier to debug' },
      { id: 'c', text: 'Tight coupling to provider' },
      { id: 'd', text: 'Faster initial load' }
    ],
    ['a', 'c'],
    'Context can cause wider re-renders and coupling.',
    ['context']
  ),
  mc(
    'react-mc-23',
    'react',
    'rendering',
    'hard',
    'Which statements about reconciliation are true?',
    [
      { id: 'a', text: 'React compares element types first' },
      { id: 'b', text: 'Keys override type comparison' },
      { id: 'c', text: 'Different types unmount/remount' },
      { id: 'd', text: 'Keys are only for arrays' }
    ],
    ['a', 'c', 'd'],
    'Different types cause remount; keys are used primarily in arrays.',
    ['rendering']
  )
];

export const quizQuestions: QuizQuestion[] = [...jsQuestions, ...reactQuestions];
