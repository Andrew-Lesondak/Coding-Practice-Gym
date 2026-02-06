export type StepSuggestion = { step: number; reason: string };

const categoryStepMap: Record<string, number> = {
  requirements: 1,
  apis: 2,
  entities: 2,
  architecture: 3,
  data: 4,
  storage: 4,
  caching: 5,
  cache: 5,
  consistency: 6,
  idempotency: 6,
  scaling: 7,
  queues: 7,
  reliability: 8,
  observability: 9,
  security: 10,
  cost: 11,
  tradeoffs: 12
};

export const getSuggestedStepForCategory = (categoryId: string) => {
  const key = categoryId.toLowerCase();
  return categoryStepMap[key] ?? 3;
};

export const getSuggestedStepForItem = (itemId: string, categoryId: string) => {
  const itemKey = itemId.toLowerCase();
  for (const key of Object.keys(categoryStepMap)) {
    if (itemKey.includes(key)) return categoryStepMap[key];
  }
  return getSuggestedStepForCategory(categoryId);
};

export const getSuggestedStepForDecision = (decisionText: string) => {
  const text = decisionText.toLowerCase();
  if (text.includes('cache')) return 5;
  if (text.includes('consistency') || text.includes('idempot')) return 6;
  if (text.includes('shard') || text.includes('partition') || text.includes('queue') || text.includes('scale')) return 7;
  if (text.includes('retry') || text.includes('dlq') || text.includes('reliab')) return 8;
  if (text.includes('observ')) return 9;
  if (text.includes('auth') || text.includes('security') || text.includes('abuse')) return 10;
  if (text.includes('cost')) return 11;
  if (text.includes('tradeoff') || text.includes('alternative')) return 12;
  if (text.includes('data') || text.includes('storage') || text.includes('database')) return 4;
  return 3;
};

export const buildWhyItMatters = (categoryTitle: string, itemText: string) => {
  return `${categoryTitle}: ${itemText}`;
};
