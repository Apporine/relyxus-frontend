import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { PublicTrustCentrePage } from '@/features/trust-centre/public-trust-centre-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateTrust = await getTranslations('trustCentre');
  return { title: translateTrust('publicTitle') };
}

export default function TrustCentreRoute() {
  return <PublicTrustCentrePage />;
}
