'use client';

import {
  pendingApprovalEvents,
  approvalQueryKeys,
  usePendingApprovalsForMe,
} from '@/features/approvals/queries';
import { analyticsQueryKeys, useLastDaySummary } from '@/features/analytics/queries';
import {
  regulatorClockEvents,
  complianceQueryKeys,
  useActiveRegulatorClocks,
} from '@/features/compliance/queries';
import {
  incidentListEvents,
  incidentQueryKeys,
  useActiveIncidents,
} from '@/features/incidents/queries';
import {
  connectorHealthEvents,
  integrationQueryKeys,
  useConnectorHealth,
} from '@/features/integrations/queries';
import {
  businessServiceHealthEvents,
  serviceQueryKeys,
  useBusinessServicesAtRisk,
} from '@/features/services/queries';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';

/** Loads every Command Centre card and re-reads each one when its live events arrive. */
export function useCommandCentreData(workspaceSlug: string) {
  const activeIncidentsQuery = useActiveIncidents(workspaceSlug);
  const pendingApprovalsQuery = usePendingApprovalsForMe(workspaceSlug);
  const regulatorClocksQuery = useActiveRegulatorClocks(workspaceSlug);
  const servicesAtRiskQuery = useBusinessServicesAtRisk(workspaceSlug);
  const connectorsQuery = useConnectorHealth(workspaceSlug);
  const lastDayQuery = useLastDaySummary(workspaceSlug);

  useRefreshOnLiveEvents(incidentListEvents, incidentQueryKeys.active(workspaceSlug));
  useRefreshOnLiveEvents(pendingApprovalEvents, approvalQueryKeys.waitingForMe(workspaceSlug));
  useRefreshOnLiveEvents(regulatorClockEvents, complianceQueryKeys.activeClocks(workspaceSlug));
  useRefreshOnLiveEvents(
    businessServiceHealthEvents,
    serviceQueryKeys.businessServicesAtRisk(workspaceSlug),
  );
  useRefreshOnLiveEvents(connectorHealthEvents, integrationQueryKeys.connectors(workspaceSlug));
  useRefreshOnLiveEvents(incidentListEvents, analyticsQueryKeys.lastDaySummary(workspaceSlug));

  return {
    activeIncidentsQuery,
    pendingApprovalsQuery,
    regulatorClocksQuery,
    servicesAtRiskQuery,
    connectorsQuery,
    lastDayQuery,
  };
}
