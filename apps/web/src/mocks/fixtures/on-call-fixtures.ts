import type {
  EscalationChain,
  OnCallScheduleDetail,
  OnCallScheduleSummary,
} from '@/features/on-call/model';

/*
 * DEVELOPMENT FIXTURE. On-call schedules for the Payments / UK demo workspace (Figma frame 28).
 */

const DEMO_WORKSPACE_SLUG = 'payments-uk';

type ScheduleFixture = OnCallScheduleDetail;

const scheduleFixtures: ScheduleFixture[] = [
  {
    id: 'payments-primary',
    name: 'Payments primary',
    currentOnCallLabel: 'A. Rahman now',
    current: { label: 'A. Rahman until 18:00 UTC' },
    next: { label: 'Sara Malik 18:00 to 02:00' },
    coverageGaps: [{ label: 'Sat 10 · 14:00 to 16:00' }],
    override: null,
    swapRequestsPending: 1,
    dstChecks: [{ label: 'Sun 11 · 01:00' }],
  },
  {
    id: 'payments-secondary',
    name: 'Payments secondary',
    currentOnCallLabel: 'M. Khan now',
    current: { label: 'M. Khan until 22:00 UTC' },
    next: { label: 'Daniel Okafor 22:00 to 06:00' },
    coverageGaps: [],
    override: null,
    swapRequestsPending: 0,
    dstChecks: [{ label: 'Sun 11 · 01:00' }],
  },
  {
    id: 'identity-primary',
    name: 'Identity primary',
    currentOnCallLabel: 'Sara M. now',
    current: { label: 'Sara Malik until 20:00 UTC' },
    next: { label: 'Leila Haddad 20:00 to 04:00' },
    coverageGaps: [{ label: 'Fri 9 · 08:00 to 10:00' }],
    override: { label: 'Omar Siddiqui Fri 9 · 08:00 to 12:00' },
    swapRequestsPending: 0,
    dstChecks: [],
  },
  {
    id: 'platform-primary',
    name: 'Platform primary',
    currentOnCallLabel: 'N. Shah now',
    current: { label: 'N. Shah until 17:30 UTC' },
    next: { label: 'A. Rahman 17:30 to 01:30' },
    coverageGaps: [],
    override: null,
    swapRequestsPending: 2,
    dstChecks: [{ label: 'Sun 11 · 01:00' }],
  },
];

const escalationBySchedule: Record<string, EscalationChain> = {
  'payments-primary': {
    steps: [
      { stepNumber: 1, delayLabel: null, targetLabel: 'Primary on call', isLeadership: false },
      {
        stepNumber: 2,
        delayLabel: 'After 5m',
        targetLabel: 'Secondary on call',
        isLeadership: false,
      },
      { stepNumber: 3, delayLabel: 'After 12m', targetLabel: 'Payments lead', isLeadership: true },
      { stepNumber: 4, delayLabel: 'After 20m', targetLabel: 'Head of SRE', isLeadership: true },
    ],
  },
  'payments-secondary': {
    steps: [
      { stepNumber: 1, delayLabel: null, targetLabel: 'Secondary on call', isLeadership: false },
      {
        stepNumber: 2,
        delayLabel: 'After 5m',
        targetLabel: 'Primary on call',
        isLeadership: false,
      },
      { stepNumber: 3, delayLabel: 'After 15m', targetLabel: 'Payments lead', isLeadership: true },
    ],
  },
  'identity-primary': {
    steps: [
      { stepNumber: 1, delayLabel: null, targetLabel: 'Identity primary', isLeadership: false },
      { stepNumber: 2, delayLabel: 'After 10m', targetLabel: 'Security lead', isLeadership: true },
    ],
  },
  'platform-primary': {
    steps: [
      { stepNumber: 1, delayLabel: null, targetLabel: 'Platform primary', isLeadership: false },
      {
        stepNumber: 2,
        delayLabel: 'After 8m',
        targetLabel: 'Platform secondary',
        isLeadership: false,
      },
      { stepNumber: 3, delayLabel: 'After 20m', targetLabel: 'Head of SRE', isLeadership: true },
    ],
  },
};

function fixturesFor(workspaceSlug: string): ScheduleFixture[] {
  return workspaceSlug === DEMO_WORKSPACE_SLUG ? scheduleFixtures : [];
}

export function onCallSchedulesFor(workspaceSlug: string): OnCallScheduleSummary[] {
  return fixturesFor(workspaceSlug).map(({ id, name, currentOnCallLabel }) => ({
    id,
    name,
    currentOnCallLabel,
  }));
}

export function onCallScheduleDetailFor(
  workspaceSlug: string,
  scheduleId: string,
): OnCallScheduleDetail | null {
  return fixturesFor(workspaceSlug).find((schedule) => schedule.id === scheduleId) ?? null;
}

export function escalationChainFor(
  workspaceSlug: string,
  scheduleId: string,
): EscalationChain | null {
  if (fixturesFor(workspaceSlug).every((schedule) => schedule.id !== scheduleId)) {
    return null;
  }
  return escalationBySchedule[scheduleId] ?? { steps: [] };
}
