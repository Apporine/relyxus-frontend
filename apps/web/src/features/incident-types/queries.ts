import { createListDetailQueries } from '@/lib/api/list-detail-queries';

import { incidentTypeDetailSchema, incidentTypeListSchema } from './model';

export const incidentTypeQueries = createListDetailQueries('settings/incident-types', {
  list: incidentTypeListSchema,
  detail: incidentTypeDetailSchema,
});
