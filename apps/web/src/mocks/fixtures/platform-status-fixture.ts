import type { PlatformStatus } from '@/shell/platform/platform-status';

/* DEVELOPMENT FIXTURE. Relyxus reporting itself healthy with every capability working. */
export const platformStatusFixture: PlatformStatus = {
  health: 'healthy',
  capabilities: [
    { capability: 'alert-intake', state: 'working' },
    { capability: 'investigations', state: 'working' },
    { capability: 'ai-reasoning', state: 'working' },
    { capability: 'approvals', state: 'working' },
    { capability: 'notifications', state: 'working' },
    { capability: 'integrations', state: 'working' },
  ],
  notices: [],
};
