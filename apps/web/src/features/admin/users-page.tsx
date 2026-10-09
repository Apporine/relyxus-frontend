'use client';

import { useLocale, useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation } from './admin-area-navigation';
import type { UserDetail } from './model';
import { userQueries } from './queries';

function UserIdentity({ user }: { user: UserDetail }) {
  const translateUsers = useTranslations('admin.users');
  const format = useRelyxusFormat();
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  return (
    <Panel title={user.name}>
      <BoxedFacts
        facts={[
          { label: translateUsers('identitySource'), value: user.identitySource },
          {
            label: translateUsers('status'),
            value: translateUsers(`statuses.${user.status}`),
            className: user.status === 'suspended' ? 'text-critical' : undefined,
          },
          {
            label: translateUsers('teams'),
            value: user.teams.length === 0 ? translateUsers('none') : listFormat.format(user.teams),
          },
          {
            label: translateUsers('roles'),
            value: user.roles.length === 0 ? translateUsers('none') : listFormat.format(user.roles),
          },
          {
            label: translateUsers('lastSignIn'),
            value:
              user.lastSignInAt === null
                ? translateUsers('neverSignedIn')
                : format.dateAndTime(new Date(user.lastSignInAt)),
          },
          { label: translateUsers('activeSessions'), value: String(user.activeSessionCount) },
        ]}
      />
    </Panel>
  );
}

function AccessControls({ user }: { user: UserDetail }) {
  const translateUsers = useTranslations('admin.users');
  return (
    <Panel title={translateUsers('accessControls')}>
      <StackedFacts
        facts={[
          {
            label: translateUsers('directoryManaged'),
            value: translateUsers(user.isDirectoryManaged ? 'yes' : 'no'),
          },
          {
            label: translateUsers('delegatedApprovals'),
            value: user.delegatedApprovalsTo ?? translateUsers('none'),
          },
          {
            label: translateUsers('accessReview'),
            value: translateUsers(`accessReviews.${user.accessReview}`),
            className: user.accessReview === 'overdue' ? 'text-critical' : undefined,
          },
          {
            label: translateUsers('breakGlass'),
            value: translateUsers(user.hasBreakGlassAccess ? 'yes' : 'no'),
            className: user.hasBreakGlassAccess ? 'text-warning' : undefined,
          },
        ]}
      />
    </Panel>
  );
}

/** Users, teams, roles and access (UI/UX s. 13.8, Figma frame 32). */
export function UsersPage() {
  const translateUsers = useTranslations('admin.users');
  const { workspace } = useCurrentWorkspace();
  const listQuery = userQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'user',
    listQuery.data?.map((user) => user.id),
  );
  const detailQuery = userQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateUsers('title')}
        description={translateUsers('description')}
        actions={
          <UnavailableAction
            label={translateUsers('inviteUser')}
            reason={translateUsers('inviteUserUnavailable')}
          />
        }
      />
      <AdminAreaNavigation current="users" />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateUsers('title')}
        detailSectionName={translateUsers('detailSectionName')}
        renderList={(users) => (
          <SelectableListPanel
            title={translateUsers('listTitle')}
            emptyText={translateUsers('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={users.map((user) => ({
              id: user.id,
              title: user.name,
              meta: translateUsers('listMeta', {
                status: translateUsers(`statuses.${user.status}`),
                team: user.primaryTeamName ?? translateUsers('noTeam'),
              }),
            }))}
          />
        )}
        renderDetail={(user) => <UserIdentity user={user} />}
        renderAside={(user) => <AccessControls user={user} />}
      />
    </div>
  );
}
