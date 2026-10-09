import { createListDetailQueries } from '@/lib/api/list-detail-queries';

import { policyDetailSchema, policyListSchema } from './model';

export const policyQueries = createListDetailQueries('policies', {
  list: policyListSchema,
  detail: policyDetailSchema,
});
