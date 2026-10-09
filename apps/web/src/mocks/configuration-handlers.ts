import { collectionHandlers } from './collection-handlers';
import {
  incidentTypeFixtures,
  policyFixtures,
  runbookFixtures,
} from './fixtures/configuration-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for policies, runbooks and incident types. */

export const configurationHandlers = [
  ...collectionHandlers(
    'policies',
    () => policyFixtures,
    ({ id, name, autonomy, state }) => ({ id, name, autonomy, state }),
  ),
  ...collectionHandlers(
    'runbooks',
    runbookFixtures,
    ({ id, name, source, version, lastTestedAt, isReviewDue }) => ({
      id,
      name,
      source,
      version,
      lastTestedAt,
      isReviewDue,
    }),
  ),
  ...collectionHandlers(
    'settings/incident-types',
    () => incidentTypeFixtures,
    ({ id, name, version, state }) => ({ id, name, version, state }),
  ),
];
