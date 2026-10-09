import type { ComplianceOverview } from '@/features/compliance/model';

/*
 * DEVELOPMENT FIXTURE. Compliance Centre for the Payments / UK demo (Figma frame 16). The
 * restricted incident INC-1999 is omitted, as the server omits it for this viewer.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * MILLISECONDS_PER_MINUTE).toISOString();

export function complianceOverviewFor(workspaceSlug: string): ComplianceOverview | null {
  if (workspaceSlug !== 'payments-uk') {
    return null;
  }
  return {
    incidents: [
      {
        reference: 'INC-2041',
        title: 'Card authorisation failures in UK',
        classification: 'major-ict',
        clock: { deadlineAt: minutesFromNow(221), isSubmitted: false },
        reportState: 'draft',
        ownerName: 'A. Rahman',
      },
      {
        reference: 'INC-2038',
        title: 'Settlement queue lag in eu-west-2',
        classification: 'review-needed',
        clock: null,
        reportState: 'none',
        ownerName: null,
      },
      {
        reference: 'INC-2031',
        title: 'Duplicate settlement postings',
        classification: 'reportable',
        clock: { deadlineAt: minutesFromNow(-2_880), isSubmitted: true },
        reportState: 'amendment',
        ownerName: 'N. Ali',
      },
      {
        reference: 'INC-2029',
        title: 'Status page stale component data',
        classification: 'not-reportable',
        clock: null,
        reportState: 'closed',
        ownerName: 'S. Evans',
      },
    ],
    deadlines: [
      {
        id: 'deadline-dora',
        obligationName: 'DORA initial notice',
        subject: 'INC-2041',
        dueAt: minutesFromNow(221),
      },
      {
        id: 'deadline-tolerance',
        obligationName: 'Impact tolerance',
        subject: 'Card payments',
        dueAt: minutesFromNow(11),
      },
      {
        id: 'deadline-rule-review',
        obligationName: 'Rule package review',
        subject: 'UK DORA v4',
        dueAt: minutesFromNow(2 * 24 * 60),
      },
    ],
    evidencePacks: [
      { incidentReference: 'INC-2041', completenessPercent: 87, missingSourceCount: 2 },
      { incidentReference: 'INC-2031', completenessPercent: 100, missingSourceCount: 0 },
      { incidentReference: 'INC-2029', completenessPercent: 96, missingSourceCount: 1 },
    ],
  };
}
