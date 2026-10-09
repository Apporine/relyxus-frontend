import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { WallModePage } from '@/features/wall-mode/wall-mode-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateWall = await getTranslations('wallMode');
  return { title: translateWall('title') };
}

export default function WallModeRoute() {
  return <WallModePage />;
}
