'use client';

import { cn } from '@relyxus/ui';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { requestApi } from '@/lib/api/http-client';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailLayout } from '@/lib/ui/list-detail-layout';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { postIncidentReviewSchema, type PostIncidentReview, type SectionAuthorship } from './model';

const authorshipClassNames = {
  'ai-generated': 'text-ai',
  'human-edited': 'text-healthy',
  mixed: 'text-fg-secondary',
  pending: 'text-warning',
} satisfies Record<SectionAuthorship, string>;

export function usePostIncidentReview(workspaceSlug: string, incidentReference: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'incidents', incidentReference, 'review'],
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents/${encodeURIComponent(incidentReference)}/review`,
          responseSchema: postIncidentReviewSchema,
          signal,
        })
      ).data,
  });
}

/** Reviewers who have not signed; a SEV1 review cannot complete while any remain. */
export function unsignedReviewers(review: PostIncidentReview) {
  return review.reviewers.filter((reviewer) => reviewer.signedAt === null);
}

function sectionAnchorId(sectionId: string): string {
  return `review-section-${sectionId}`;
}

function SectionIndex({ review }: { review: PostIncidentReview }) {
  const translateReview = useTranslations('postIncidentReview');
  return (
    <Panel title={translateReview('sections')}>
      <ul className="flex flex-col gap-2">
        {review.sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${sectionAnchorId(section.id)}`}
              className="flex flex-col gap-1 rounded-panel border border-divider p-3 hover:bg-surface-2"
            >
              <span className="text-body font-semibold">{section.name}</span>
              <span
                className={cn('text-meta font-semibold', authorshipClassNames[section.authorship])}
              >
                {translateReview(`authorships.${section.authorship}`)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ReviewDocument({ review }: { review: PostIncidentReview }) {
  const translateReview = useTranslations('postIncidentReview');
  return (
    <Panel title={translateReview('document')}>
      <div className="flex flex-col gap-5">
        {review.sections.map((section) => (
          <section
            key={section.id}
            id={sectionAnchorId(section.id)}
            aria-labelledby={`${sectionAnchorId(section.id)}-heading`}
            className="flex scroll-mt-24 flex-col gap-2"
          >
            <h3
              id={`${sectionAnchorId(section.id)}-heading`}
              className="text-meta font-semibold text-fg-tertiary uppercase"
            >
              {section.name}
            </h3>
            <p
              className={cn(
                'rounded-panel border border-control bg-raised px-4 py-3 text-table',
                section.content === null && 'text-warning',
              )}
            >
              {section.content ?? translateReview('notWritten')}
            </p>
          </section>
        ))}
      </div>
    </Panel>
  );
}

function RequiredReviewers({ review }: { review: PostIncidentReview }) {
  const translateReview = useTranslations('postIncidentReview');
  const format = useRelyxusFormat();
  return (
    <Panel title={translateReview('reviewers')}>
      <StackedFacts
        facts={review.reviewers.map((reviewer) => ({
          label: translateReview('reviewerLabel', { name: reviewer.name, role: reviewer.role }),
          value:
            reviewer.signedAt === null
              ? translateReview('pending')
              : translateReview('signedAt', {
                  time: format.dateAndTime(new Date(reviewer.signedAt)),
                }),
          className: reviewer.signedAt === null ? 'text-warning' : 'text-healthy',
        }))}
      />
    </Panel>
  );
}

/** Post-incident review (UI/UX s. 12.4, Figma frame 19). */
export function PostIncidentReviewPage({ incidentReference }: { incidentReference: string }) {
  const translateReview = useTranslations('postIncidentReview');
  const format = useRelyxusFormat();
  const { workspace } = useCurrentWorkspace();
  const reviewQuery = usePostIncidentReview(workspace.slug, incidentReference);

  if (reviewQuery.isPending) {
    return <PageLoadingState />;
  }
  if (reviewQuery.isError) {
    return isHiddenOrMissing(reviewQuery.error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={reviewQuery.error}
        sectionName={translateReview('title')}
        onRetry={() => void reviewQuery.refetch()}
      />
    );
  }

  const review = reviewQuery.data;
  const unsignedCount = unsignedReviewers(review).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateReview('title')}
        description={translateReview('subtitle', {
          incident: review.incidentReference,
          title: review.incidentTitle,
          severity: review.severity,
          due: format.dateAndTime(new Date(review.dueAt)),
        })}
        actions={
          <UnavailableAction
            label={translateReview('completeReview')}
            reason={
              unsignedCount > 0
                ? translateReview('completeBlocked', { count: unsignedCount })
                : translateReview('completeUnavailable')
            }
          />
        }
      />
      <ListDetailLayout
        list={<SectionIndex review={review} />}
        detail={<ReviewDocument review={review} />}
        aside={<RequiredReviewers review={review} />}
      />
    </div>
  );
}
