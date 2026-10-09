import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PostIncidentReviewPage } from '@/features/post-incident-review/post-incident-review-page';

type PostIncidentReviewRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

export async function generateMetadata({
  params,
}: PostIncidentReviewRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  const translateReview = await getTranslations('postIncidentReview');
  return { title: translateReview('documentTitle', { reference: incidentReference }) };
}

export default async function PostIncidentReviewRoute({ params }: PostIncidentReviewRouteProps) {
  const { incidentReference } = await params;
  return <PostIncidentReviewPage incidentReference={decodeURIComponent(incidentReference)} />;
}
