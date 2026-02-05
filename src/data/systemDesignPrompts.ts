import { SystemDesignPrompt } from '../types/systemDesign';

const defaultStub = `## Step 1: Requirements and scope
[TEMPLATE_START step=1]
- Functional requirements:
  - TODO:
- Non-functional requirements:
  - TODO:
- Out of scope:
  - TODO:
[TEMPLATE_END step=1]

## Step 2: APIs and entities
[TEMPLATE_START step=2]
- Entities:
  - TODO:
- APIs:
  - TODO:
[TEMPLATE_END step=2]

## Step 3: High-level architecture
[TEMPLATE_START step=3]
- Architecture diagram:
  - TODO:
- Components:
  - TODO:
[TEMPLATE_END step=3]

## Step 4: Data model + storage choice
[TEMPLATE_START step=4]
- Data model:
  - TODO:
- Storage choice:
  - TODO:
[TEMPLATE_END step=4]

## Step 5: Caching strategy
[TEMPLATE_START step=5]
- What to cache:
  - TODO:
- Invalidation:
  - TODO:
[TEMPLATE_END step=5]

## Step 6: Consistency + idempotency
[TEMPLATE_START step=6]
- Consistency model:
  - TODO:
- Idempotency:
  - TODO:
[TEMPLATE_END step=6]

## Step 7: Scaling strategy
[TEMPLATE_START step=7]
- Partitioning/sharding:
  - TODO:
- Queues/background processing:
  - TODO:
[TEMPLATE_END step=7]

## Step 8: Reliability
[TEMPLATE_START step=8]
- Retries/backpressure:
  - TODO:
- DLQ/fallbacks:
  - TODO:
[TEMPLATE_END step=8]

## Step 9: Observability
[TEMPLATE_START step=9]
- Metrics/logs/tracing:
  - TODO:
- SLOs/alerts:
  - TODO:
[TEMPLATE_END step=9]

## Step 10: Security + abuse prevention
[TEMPLATE_START step=10]
- AuthN/AuthZ:
  - TODO:
- Abuse prevention:
  - TODO:
[TEMPLATE_END step=10]

## Step 11: Cost considerations
[TEMPLATE_START step=11]
- Cost drivers:
  - TODO:
- Optimizations:
  - TODO:
[TEMPLATE_END step=11]

## Step 12: Tradeoffs + alternatives
[TEMPLATE_START step=12]
- Tradeoffs:
  - TODO:
- Alternatives:
  - TODO:
[TEMPLATE_END step=12]
`;

const defaultRubric = {
  categories: [
    {
      id: 'requirements',
      title: 'Requirements & Scope',
      weight: 1,
      items: [
        { id: 'req-functional', text: 'Functional requirements captured', weight: 1, suggestionKeywords: ['requirements'] },
        { id: 'req-nonfunctional', text: 'Non-functional requirements captured', weight: 1, suggestionKeywords: ['latency', 'availability'] }
      ]
    },
    {
      id: 'architecture',
      title: 'Architecture & Data',
      weight: 2,
      items: [
        { id: 'arch-high-level', text: 'High-level components identified', weight: 1, suggestionKeywords: ['service', 'gateway'] },
        { id: 'arch-storage', text: 'Storage choice justified', weight: 1, suggestionKeywords: ['database', 'storage'] }
      ]
    },
    {
      id: 'scaling',
      title: 'Scaling & Reliability',
      weight: 2,
      items: [
        { id: 'scale-sharding', text: 'Partitioning/sharding strategy', weight: 1, suggestionKeywords: ['shard', 'partition'] },
        { id: 'reliability', text: 'Reliability plan (retries/DLQ)', weight: 1, suggestionKeywords: ['retry', 'dlq'] }
      ]
    },
    {
      id: 'observability',
      title: 'Observability & Security',
      weight: 1,
      items: [
        { id: 'observability', text: 'Metrics/logs/tracing', weight: 1, suggestionKeywords: ['metrics', 'logs', 'tracing'] },
        { id: 'security', text: 'Security/abuse prevention', weight: 1, suggestionKeywords: ['auth', 'rate limit'] }
      ]
    }
  ]
};

export const systemDesignPrompts: SystemDesignPrompt[] = [
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    difficulty: 'easy',
    domain: 'web',
    tags: ['links', 'caching', 'storage'],
    promptMarkdown: 'Design a URL shortener service (like bit.ly).',
    requirements: {
      functional: ['Shorten URLs', 'Redirect to original URL', 'Analytics (click counts)'],
      nonFunctional: ['Low latency redirects', 'High availability']
    },
    scale: {
      traffic: '50K rps redirects, 2K rps writes',
      storage: '1B URLs',
      retention: 'Store for 5 years'
    },
    constraints: ['Custom aliases supported', 'Deletion is eventual'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Use a write path that generates unique IDs, store mapping, and read via cache + DB.',
      keyDecisions: [
        { decision: 'ID generation with base62', why: 'Short, unique identifiers', alternatives: ['UUID', 'hash'] }
      ]
    },
    recallQuestions: ['What is the read/write ratio?', 'How do you prevent hot keys?'],
    commonPitfalls: ['Ignoring cache invalidation', 'No plan for collisions']
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    difficulty: 'easy',
    domain: 'platform',
    tags: ['rate limiting', 'tokens', 'redis'],
    promptMarkdown: 'Design a distributed rate limiter for APIs.',
    requirements: {
      functional: ['Per-user limits', 'Per-IP limits', 'Burst handling'],
      nonFunctional: ['Low overhead', 'Consistent enforcement']
    },
    scale: {
      traffic: '100K rps',
      storage: 'Hot counters only',
      retention: 'Seconds/minutes'
    },
    constraints: ['Multiple regions'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Use token bucket counters in Redis with LUA for atomicity.',
      keyDecisions: [
        { decision: 'Redis for counters', why: 'Low-latency atomic ops', alternatives: ['In-memory', 'DB'] }
      ]
    },
    recallQuestions: ['How do you avoid race conditions?', 'How to handle burst traffic?'],
    commonPitfalls: ['No global consistency', 'Hot key contention']
  },
  {
    id: 'notifications',
    title: 'Notification System',
    difficulty: 'medium',
    domain: 'messaging',
    tags: ['push', 'queues', 'fanout'],
    promptMarkdown: 'Design a notification system for email/SMS/push.',
    requirements: {
      functional: ['Multi-channel delivery', 'User preferences', 'Delivery status'],
      nonFunctional: ['Scalable fanout', 'Retries with backoff']
    },
    scale: {
      traffic: '1M notifications/day',
      storage: 'Delivery logs',
      retention: '90 days'
    },
    constraints: ['Must support user opt-out'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Queue-based fanout with channel-specific workers.',
      keyDecisions: [
        { decision: 'Queue per channel', why: 'Isolate failures', alternatives: ['Single queue'] }
      ]
    },
    recallQuestions: ['How to handle retries?', 'How to handle preference changes?'],
    commonPitfalls: ['No idempotency for sends', 'No backpressure']
  },
  {
    id: 'chat-system',
    title: 'Chat/Messaging System',
    difficulty: 'medium',
    domain: 'messaging',
    tags: ['websocket', 'fanout', 'storage'],
    promptMarkdown: 'Design a real-time chat system.',
    requirements: {
      functional: ['1:1 and group chats', 'Presence', 'Message history'],
      nonFunctional: ['Low latency', 'Ordered delivery']
    },
    scale: {
      traffic: '200K concurrent connections',
      storage: 'Message history',
      retention: '1 year'
    },
    constraints: ['Offline sync'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'WebSocket gateway + message broker + storage per conversation.',
      keyDecisions: [
        { decision: 'Broker for fanout', why: 'Reliable delivery', alternatives: ['Direct push'] }
      ]
    },
    recallQuestions: ['How to scale WebSockets?', 'How to ensure ordering?'],
    commonPitfalls: ['Missing offline flow', 'No backpressure']
  },
  {
    id: 'news-feed',
    title: 'News Feed',
    difficulty: 'hard',
    domain: 'social',
    tags: ['fanout', 'ranking', 'cache'],
    promptMarkdown: 'Design a news feed system for a social app.',
    requirements: {
      functional: ['Post feed', 'Ranking', 'Follow graph'],
      nonFunctional: ['Fast reads', 'Freshness']
    },
    scale: {
      traffic: '500K rps reads',
      storage: 'Post history',
      retention: '2 years'
    },
    constraints: ['Mix of pull/push allowed'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Hybrid fanout with caching and ranking service.',
      keyDecisions: [
        { decision: 'Hybrid fanout', why: 'Balance write/read load', alternatives: ['Fanout on write'] }
      ]
    },
    recallQuestions: ['When to use fanout-on-write?', 'How to rank?'],
    commonPitfalls: ['Ignoring celebrity problem', 'No cache strategy']
  },
  {
    id: 'file-storage',
    title: 'File Storage (Dropbox-like)',
    difficulty: 'hard',
    domain: 'storage',
    tags: ['files', 'chunking', 'sync'],
    promptMarkdown: 'Design a file storage and sync system.',
    requirements: {
      functional: ['Upload/download', 'Sync across devices', 'Version history'],
      nonFunctional: ['Durability', 'Low latency downloads']
    },
    scale: {
      traffic: 'Large files, 1M users',
      storage: 'Petabytes',
      retention: 'Forever'
    },
    constraints: ['Deduplication recommended'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Chunk files, store metadata separately, sync via events.',
      keyDecisions: [
        { decision: 'Chunking with content hash', why: 'Dedup and resumable uploads', alternatives: ['Whole file'] }
      ]
    },
    recallQuestions: ['How to handle conflict resolution?', 'How to ensure durability?'],
    commonPitfalls: ['No sync conflict handling', 'No chunking']
  },
  {
    id: 'metrics-pipeline',
    title: 'Metrics/Logging Pipeline',
    difficulty: 'medium',
    domain: 'observability',
    tags: ['ingestion', 'aggregation', 'storage'],
    promptMarkdown: 'Design a metrics and logging pipeline.',
    requirements: {
      functional: ['Ingest metrics', 'Query dashboards', 'Alerting'],
      nonFunctional: ['High throughput', 'Cost control']
    },
    scale: {
      traffic: 'Millions of events/sec',
      storage: 'Time series store',
      retention: '13 months'
    },
    constraints: ['Multi-tenant'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Stream ingestion -> aggregation -> time-series DB.',
      keyDecisions: [
        { decision: 'Aggregation before storage', why: 'Reduce cost', alternatives: ['Store raw only'] }
      ]
    },
    recallQuestions: ['How to handle hot partitions?', 'How to downsample?'],
    commonPitfalls: ['No backpressure', 'High cost storage']
  },
  {
    id: 'ride-sharing',
    title: 'Ride Sharing Dispatch',
    difficulty: 'hard',
    domain: 'logistics',
    tags: ['geo', 'matching', 'dispatch'],
    promptMarkdown: 'Design a ride-sharing dispatch system.',
    requirements: {
      functional: ['Match riders to drivers', 'ETA estimation', 'Surge pricing'],
      nonFunctional: ['Low latency matching', 'High availability']
    },
    scale: {
      traffic: '100K concurrent sessions',
      storage: 'Geo indexes',
      retention: '1 year rides'
    },
    constraints: ['Real-time updates'],
    guidedDesignStubMarkdown: defaultStub,
    rubric: defaultRubric,
    reference: {
      overviewMarkdown: 'Geo index + dispatch service + realtime updates.',
      keyDecisions: [
        { decision: 'Geo-hash index', why: 'Fast nearby search', alternatives: ['R-tree'] }
      ]
    },
    recallQuestions: ['How to handle driver availability?', 'How to scale location updates?'],
    commonPitfalls: ['No geo indexing', 'Ignoring surge fairness']
  }
];
