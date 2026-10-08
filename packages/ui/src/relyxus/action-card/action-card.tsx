import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { CodeBlock, type CodeBlockProps } from '../../primitives/code-block/code-block';
import { EnvironmentBadge } from '../badges/incident-badges';
import type { ActionState, Environment } from '../vocabulary';

/*
 * The action and approval card (UI/UX s. 11.1) appears in the war room, the Approvals inbox,
 * chat and mobile. All nine parts are required: the exact command, target and blast radius,
 * the reason it is proposed, the policy, the approvers, the dry run, verification and
 * rollback, the expiry, and the decision. If any part cannot be shown, the decision controls
 * are withheld and the card says why. The server enforces the same rule independently.
 */

export const actionCardFactKeys = [
  'target',
  'rationale',
  'policy',
  'approvers',
  'dryRun',
  'verification',
  'expiry',
] as const;
export type ActionCardFactKey = (typeof actionCardFactKeys)[number];

/** Each fact is content to show, or null when it is unavailable. */
export type ActionCardFacts = Record<ActionCardFactKey, ReactNode | null>;

export type ActionCardProps = {
  /** Category heading, for example "Production action". */
  eyebrow: string;
  /** Names the action and its target, for example "Roll back payments-api". */
  title: string;
  environment: Environment;
  environmentLabel: string;
  state: ActionState;
  stateLabel: string;
  /** The exact command or API call that will run. */
  command: string;
  commandLabel: string;
  commandCopyLabels: CodeBlockProps['copyLabels'];
  facts: ActionCardFacts;
  factLabels: Record<ActionCardFactKey, string>;
  /** Shown in place of a missing fact, for example "Not available". */
  missingFactLabel: string;
  /** Explains why the decision is withheld, for example "This action cannot be approved: …". */
  incompleteNotice: string;
  /** Approve, Reject with reason and Ask a question. Omit for read-only contexts. */
  decision?: ReactNode;
  className?: string;
};

export function missingActionCardFacts(facts: ActionCardFacts): ActionCardFactKey[] {
  return actionCardFactKeys.filter((factKey) => facts[factKey] === null);
}

export function ActionCard({
  eyebrow,
  title,
  environment,
  environmentLabel,
  state,
  stateLabel,
  command,
  commandLabel,
  commandCopyLabels,
  facts,
  factLabels,
  missingFactLabel,
  incompleteNotice,
  decision,
  className,
}: ActionCardProps) {
  const missingFacts = missingActionCardFacts(facts);
  const isComplete = missingFacts.length === 0;
  const isAwaitingDecision = state === 'waiting-for-approval';

  return (
    <article
      data-state={state}
      aria-label={title}
      className={cn(
        'flex flex-col gap-4 rounded-panel border bg-surface-1 p-4',
        isAwaitingDecision ? 'border-warning' : 'border-control',
        className,
      )}
    >
      <header className="flex flex-col gap-2">
        <p
          className={cn(
            'text-meta font-semibold uppercase',
            isAwaitingDecision ? 'text-warning' : 'text-fg-secondary',
          )}
        >
          {eyebrow}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-panel-title font-semibold text-fg-primary">{title}</h3>
          <EnvironmentBadge environment={environment} label={environmentLabel} />
          <span className="text-meta text-fg-secondary">{stateLabel}</span>
        </div>
      </header>

      <CodeBlock code={command} label={commandLabel} copyLabels={commandCopyLabels} />

      <dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2">
        {actionCardFactKeys.map((factKey) => (
          <div key={factKey} className="contents">
            <dt className="text-meta font-semibold text-fg-tertiary uppercase">
              {factLabels[factKey]}
            </dt>
            <dd className="text-table text-fg-primary">
              {facts[factKey] ?? (
                <span className="font-semibold text-warning">{missingFactLabel}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {isComplete ? (
        decision
      ) : (
        <p
          role="note"
          className="rounded-panel border border-warning bg-warning-subtle px-3 py-2 text-table"
        >
          {incompleteNotice}
        </p>
      )}
    </article>
  );
}
