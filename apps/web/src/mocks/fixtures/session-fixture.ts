import { navigationAreaIds } from '@/shell/navigation/navigation-model';
import type { Session } from '@/shell/session/session';

/*
 * DEVELOPMENT FIXTURE. Fictional people and workspaces used by Mock Service Worker while the
 * API is being built (ADR 0004). Never imported by production code paths.
 */
export const sessionFixture: Session = {
  user: {
    id: 'user-sara-malik',
    displayName: 'Sara Malik',
    email: 'sara.malik@example.com',
  },
  workspaces: [
    {
      slug: 'payments-uk',
      name: 'Payments / UK',
      dataRegionCode: 'GB',
      deploymentMode: 'self-hosted',
      accessibleAreas: [...navigationAreaIds],
    },
    {
      slug: 'cards-uae',
      name: 'Cards / UAE',
      dataRegionCode: 'AE',
      deploymentMode: 'dedicated',
      accessibleAreas: [
        'command-centre',
        'incidents',
        'approvals',
        'on-call',
        'services',
        'compliance',
      ],
    },
  ],
};
