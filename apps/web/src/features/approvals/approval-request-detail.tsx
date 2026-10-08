'use client';

import { CodeBlock, EnvironmentBadge, SeverityBadge, VisibilityBadge } from '@relyxus/ui';
import { CircleCheck, GitCommitHorizontal, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, type ReactNode } from 'react';

import type { ApprovalDetail } from './model';

type EvidenceSignal = ApprovalDetail['evidence'][number]['signal'];

const evidenceSignalIcons = {
  change: <GitCommitHorizontal aria-hidden className="size-4 shrink-0 text-fg-secondary" />,
  degradation: <TrendingUp aria-hidden className="size-4 shrink-0 text-critical" />,
  verification: <CircleCheck aria-hidden className="size-4 shrink-0 text-healthy" />,
} satisfies Record<EvidenceSignal, ReactNode>;

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-meta font-semibold text-fg-secondary uppercase">{title}</h3>
      {children}
    </section>
  );
}

/** Middle column (UI/UX s. 11.2): exactly what would run, why, and under which policy. */
export function ApprovalRequestDetail({ approval }: { approval: ApprovalDetail }) {
  const translateInbox = useTranslations('approvals.inbox');
  const translateEnvironments = useTranslations('domain.environments');
  const translateVisibilities = useTranslations('domain.visibilities');
  const titleId = useId();
  const { command, effectivePolicy, incident } = approval;

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-6 rounded-panel border border-control bg-surface-1 p-5"
    >
      <header className="flex flex-col gap-2">
        <p className="text-meta font-semibold text-warning uppercase">
          {translateInbox(`kinds.${approval.kind}`)}
          {incident === null ? null : ` · ${incident.reference} · ${incident.title}`}
        </p>
        <h2 id={titleId} className="text-section-title font-semibold">
          {approval.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <EnvironmentBadge
            environment={approval.environment}
            label={translateEnvironments(approval.environment)}
          />
          {incident === null ? null : (
            <>
              <SeverityBadge severity={incident.severity} />
              <VisibilityBadge
                visibility={incident.visibility}
                label={translateVisibilities(incident.visibility)}
              />
            </>
          )}
        </div>
        <p className="text-meta text-fg-secondary">
          {translateInbox('requestedBy', { name: approval.requestedByName })}
        </p>
      </header>

      {command === null ? null : (
        <DetailSection title={translateInbox('exactAction')}>
          <CodeBlock
            code={command.text}
            label={translateInbox('commandLabel')}
            copyLabels={{
              label: translateInbox('copyCommand'),
              copiedLabel: translateInbox('commandCopied'),
              failedLabel: translateInbox('copyFailed'),
            }}
          />
          {command.cluster === null || command.namespace === null ? null : (
            <p dir="ltr" className="font-mono text-meta text-fg-secondary">
              {translateInbox('commandScope', {
                cluster: command.cluster,
                namespace: command.namespace,
              })}
            </p>
          )}
        </DetailSection>
      )}

      {approval.expectedResult === null ? null : (
        <DetailSection title={translateInbox('expectedResult')}>
          <p className="text-body text-fg-primary">{approval.expectedResult}</p>
        </DetailSection>
      )}

      <DetailSection title={translateInbox('evidence')}>
        {approval.evidence.length === 0 ? (
          <p className="text-body text-fg-secondary">{translateInbox('noEvidence')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-divider">
            {approval.evidence.map((evidence) => (
              <li key={evidence.id} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
                <span className="mt-0.5">{evidenceSignalIcons[evidence.signal]}</span>
                <span className="flex flex-col">
                  <span className="text-body font-semibold text-fg-primary">
                    {evidence.summary}
                  </span>
                  <span className="text-meta text-fg-secondary">{evidence.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </DetailSection>

      {effectivePolicy === null ? null : (
        <DetailSection title={translateInbox('effectivePolicy')}>
          <p className="text-body font-semibold text-fg-primary">{effectivePolicy.name}</p>
          {effectivePolicy.constraints.length === 0 ? null : (
            <p className="text-meta text-fg-secondary">{effectivePolicy.constraints.join(' · ')}</p>
          )}
          <p className="text-meta text-fg-secondary">
            {effectivePolicy.conflicts.length === 0
              ? translateInbox('noConflicts')
              : translateInbox('conflicts', { conflicts: effectivePolicy.conflicts.join(' · ') })}
          </p>
        </DetailSection>
      )}
    </article>
  );
}
