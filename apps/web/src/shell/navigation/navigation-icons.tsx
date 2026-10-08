import {
  BookOpen,
  Boxes,
  ChartLine,
  CircleAlert,
  FlaskConical,
  Gauge,
  Landmark,
  PhoneCall,
  Plug,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { NavigationAreaId } from './navigation-model';

/** Navigation icons sit beside their labels and alone in the collapsed sidebar, with a tooltip. */
export const navigationIcons = {
  'command-centre': Gauge,
  incidents: CircleAlert,
  approvals: ShieldCheck,
  'on-call': PhoneCall,
  services: Boxes,
  'ai-quality': FlaskConical,
  analytics: ChartLine,
  policies: Scale,
  runbooks: BookOpen,
  compliance: Landmark,
  audit: ScrollText,
  integrations: Plug,
  admin: Settings,
} satisfies Record<NavigationAreaId, LucideIcon>;
