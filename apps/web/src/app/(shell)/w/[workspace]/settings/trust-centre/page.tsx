import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { TrustCentreAdminPage } from '@/features/trust-centre/trust-centre-admin-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateTrust = await getTranslations('trustCentre');
  return { title: translateTrust('title') };
}

export default function TrustCentreAdminRoute() {
  return <TrustCentreAdminPage />;
}
