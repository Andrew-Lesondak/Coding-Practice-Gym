import { SystemDesignDrill } from '../types/systemDesignDrill';

const reqTemplate = `## Step 1: Requirements and scope
[TEMPLATE_START step=1]
- Functional requirements:
  - TODO:
- Non-functional requirements:
  - TODO:
- Out of scope:
  - TODO:
[TEMPLATE_END step=1]
`;

const apiTemplate = `## Step 2: APIs and entities
[TEMPLATE_START step=2]
- Entities:
  - TODO:
- APIs:
  - TODO:
[TEMPLATE_END step=2]
`;

const dataScalingTemplate = `## Step 4: Data model + storage choice
[TEMPLATE_START step=4]
- Data model:
  - TODO:
- Storage choice:
  - TODO:
[TEMPLATE_END step=4]

## Step 7: Scaling strategy
[TEMPLATE_START step=7]
- Partitioning/sharding:
  - TODO:
- Queues/background processing:
  - TODO:
[TEMPLATE_END step=7]
`;

const reliabilityTemplate = `## Step 8: Reliability
[TEMPLATE_START step=8]
- Retries/backpressure:
  - TODO:
- DLQ/fallbacks:
  - TODO:
[TEMPLATE_END step=8]
`;

const tradeoffTemplate = `## Step 12: Tradeoffs + alternatives
[TEMPLATE_START step=12]
- Tradeoffs:
  - TODO:
- Alternatives:
  - TODO:
[TEMPLATE_END step=12]
`;

export const systemDesignDrills: SystemDesignDrill[] = [
  {
    id: 'req-url-shortener',
    title: 'Clarify URL Shortener Requirements',
    type: 'requirements',
    difficulty: 'easy',
    relatedPromptId: 'url-shortener',
    promptMarkdown: 'You are asked to design a URL shortener. Clarify requirements and scope.',
    stepsIncluded: [1],
    starterTemplateMarkdown: reqTemplate,
    rubricSubset: { categoryIds: ['requirements'], itemIds: ['req-functional', 'req-nonfunctional'] },
    referenceNotes: ['Clarify custom aliases', 'Estimate read/write ratio', 'Define analytics scope'],
    timeLimitMinutes: 6,
    recallQuestions: ['What is out of scope?']
  },
  {
    id: 'req-news-feed',
    title: 'Requirements for News Feed',
    type: 'requirements',
    difficulty: 'medium',
    relatedPromptId: 'news-feed',
    promptMarkdown: 'Define requirements for a personalized news feed.',
    stepsIncluded: [1],
    starterTemplateMarkdown: reqTemplate,
    rubricSubset: { categoryIds: ['requirements'], itemIds: ['req-functional', 'req-nonfunctional'] },
    referenceNotes: ['Define ranking expectations', 'Latency budgets', 'Consistency expectations'],
    timeLimitMinutes: 7,
    recallQuestions: ['What is the freshness target?']
  },
  {
    id: 'req-chat',
    title: 'Requirements for Chat',
    type: 'requirements',
    difficulty: 'easy',
    relatedPromptId: 'chat-system',
    promptMarkdown: 'Clarify the requirements for a real-time chat system.',
    stepsIncluded: [1],
    starterTemplateMarkdown: reqTemplate,
    rubricSubset: { categoryIds: ['requirements'], itemIds: ['req-functional', 'req-nonfunctional'] },
    referenceNotes: ['Presence vs typing indicators', 'Group size limits', 'Message retention'],
    timeLimitMinutes: 5,
    recallQuestions: ['What is the expected concurrency?']
  },
  {
    id: 'api-notifications',
    title: 'APIs + Entities for Notifications',
    type: 'api',
    difficulty: 'medium',
    relatedPromptId: 'notifications',
    promptMarkdown: 'Define core entities and APIs for a notification system.',
    stepsIncluded: [2],
    starterTemplateMarkdown: apiTemplate,
    rubricSubset: { categoryIds: ['architecture'], itemIds: ['arch-high-level', 'arch-storage'] },
    referenceNotes: ['Notification entity', 'Delivery preference entity', 'Send/Status APIs'],
    timeLimitMinutes: 8,
    recallQuestions: ['What is the core entity?']
  },
  {
    id: 'api-ride',
    title: 'Entities + APIs for Ride Dispatch',
    type: 'api',
    difficulty: 'hard',
    relatedPromptId: 'ride-sharing',
    promptMarkdown: 'Define entities and APIs for ride matching.',
    stepsIncluded: [2],
    starterTemplateMarkdown: apiTemplate,
    rubricSubset: { categoryIds: ['architecture'], itemIds: ['arch-high-level'] },
    referenceNotes: ['Driver availability entity', 'Match request API', 'ETA API'],
    timeLimitMinutes: 10,
    recallQuestions: ['How do you represent driver state?']
  },
  {
    id: 'api-file-storage',
    title: 'File Storage APIs',
    type: 'api',
    difficulty: 'medium',
    relatedPromptId: 'file-storage',
    promptMarkdown: 'Define APIs and entities for file storage.',
    stepsIncluded: [2],
    starterTemplateMarkdown: apiTemplate,
    rubricSubset: { categoryIds: ['architecture'], itemIds: ['arch-high-level'] },
    referenceNotes: ['File metadata entity', 'Upload/download APIs'],
    timeLimitMinutes: 7,
    recallQuestions: ['What metadata is required?']
  },
  {
    id: 'data-news-feed',
    title: 'Data + Scaling for News Feed',
    type: 'data-scaling',
    difficulty: 'hard',
    relatedPromptId: 'news-feed',
    promptMarkdown: 'Choose storage and scaling for a news feed.',
    stepsIncluded: [4, 7],
    starterTemplateMarkdown: dataScalingTemplate,
    rubricSubset: { categoryIds: ['architecture', 'scaling'], itemIds: ['arch-storage', 'scale-sharding'] },
    referenceNotes: ['Fanout strategy impacts storage', 'Sharding by user or post'],
    timeLimitMinutes: 10,
    recallQuestions: ['What is the hottest key?']
  },
  {
    id: 'data-metrics',
    title: 'Storage + Scaling for Metrics',
    type: 'data-scaling',
    difficulty: 'medium',
    relatedPromptId: 'metrics-pipeline',
    promptMarkdown: 'Define storage choice and scaling for metrics ingestion.',
    stepsIncluded: [4, 7],
    starterTemplateMarkdown: dataScalingTemplate,
    rubricSubset: { categoryIds: ['architecture', 'scaling'], itemIds: ['arch-storage', 'scale-sharding'] },
    referenceNotes: ['Time-series DB', 'Partition by time/tenant'],
    timeLimitMinutes: 10,
    recallQuestions: ['How do you avoid hot partitions?']
  },
  {
    id: 'data-file-storage',
    title: 'Scaling for File Storage',
    type: 'data-scaling',
    difficulty: 'hard',
    relatedPromptId: 'file-storage',
    promptMarkdown: 'Choose storage and scaling approach for file storage.',
    stepsIncluded: [4, 7],
    starterTemplateMarkdown: dataScalingTemplate,
    rubricSubset: { categoryIds: ['architecture', 'scaling'], itemIds: ['arch-storage', 'scale-sharding'] },
    referenceNotes: ['Chunk storage, metadata DB', 'Shard by user'],
    timeLimitMinutes: 10,
    recallQuestions: ['How do you handle big files?']
  },
  {
    id: 'reliability-notifications',
    title: 'Reliability for Notifications',
    type: 'reliability',
    difficulty: 'medium',
    relatedPromptId: 'notifications',
    promptMarkdown: 'Handle retries, backpressure, and DLQ for notifications.',
    stepsIncluded: [8],
    starterTemplateMarkdown: reliabilityTemplate,
    rubricSubset: { categoryIds: ['scaling'], itemIds: ['reliability'] },
    referenceNotes: ['Retry with backoff', 'DLQ for failed sends'],
    timeLimitMinutes: 8,
    recallQuestions: ['How to avoid duplicate sends?']
  },
  {
    id: 'reliability-chat',
    title: 'Reliability for Chat',
    type: 'reliability',
    difficulty: 'hard',
    relatedPromptId: 'chat-system',
    promptMarkdown: 'Plan reliability for real-time chat delivery.',
    stepsIncluded: [8],
    starterTemplateMarkdown: reliabilityTemplate,
    rubricSubset: { categoryIds: ['scaling'], itemIds: ['reliability'] },
    referenceNotes: ['Ack/retry flow', 'DLQ for failed deliveries'],
    timeLimitMinutes: 9,
    recallQuestions: ['What happens when a client reconnects?']
  },
  {
    id: 'tradeoff-cache',
    title: 'Cache vs DB Tradeoff',
    type: 'tradeoffs',
    difficulty: 'easy',
    relatedPromptId: 'url-shortener',
    promptMarkdown: 'Choose between cache-heavy vs DB-heavy architecture for URL redirects.',
    stepsIncluded: [12],
    starterTemplateMarkdown: tradeoffTemplate,
    rubricSubset: { categoryIds: ['architecture'], itemIds: ['arch-high-level'] },
    referenceNotes: ['Cache improves latency but adds invalidation risk'],
    timeLimitMinutes: 6,
    recallQuestions: ['What is the main tradeoff?']
  },
  {
    id: 'tradeoff-fanout',
    title: 'Fanout Tradeoff Drill',
    type: 'tradeoffs',
    difficulty: 'medium',
    relatedPromptId: 'news-feed',
    promptMarkdown: 'Compare fanout-on-write vs fanout-on-read.',
    stepsIncluded: [12],
    starterTemplateMarkdown: tradeoffTemplate,
    rubricSubset: { categoryIds: ['architecture'], itemIds: ['arch-high-level'] },
    referenceNotes: ['Write-heavy vs read-heavy tradeoff'],
    timeLimitMinutes: 7,
    recallQuestions: ['Which approach scales better?']
  }
];
