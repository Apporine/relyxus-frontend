import { createListDetailQueries } from '@/lib/api/list-detail-queries';

import { runbookDetailSchema, runbookListSchema } from './model';

export const runbookQueries = createListDetailQueries('runbooks', {
  list: runbookListSchema,
  detail: runbookDetailSchema,
});
