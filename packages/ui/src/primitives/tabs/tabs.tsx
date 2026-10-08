import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { createContext, useContext, type ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';

/*
 * Tab state belongs in the URL (UI/UX s. 7): screens pass `value` and `onValueChange` from
 * their search parameters rather than keeping tab state locally.
 */

type TabsVariant = 'line' | 'contained';

const TabsVariantContext = createContext<TabsVariant>('line');

const tabsListVariants = cva('flex items-center', {
  variants: {
    variant: {
      line: 'gap-4 border-b border-divider',
      contained: 'gap-1 rounded-button border border-control bg-surface-1 p-1',
    },
  },
});

const tabsTriggerVariants = cva(
  [
    'inline-flex items-center gap-2 text-table font-semibold whitespace-nowrap text-fg-secondary',
    'transition-colors duration-(--rx-duration-hover) ease-standard',
    'hover:text-fg-primary disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        line: '-mb-px h-10 border-b-2 border-transparent data-[state=active]:border-fg-primary data-[state=active]:text-fg-primary',
        contained:
          'h-8 rounded-control px-3 data-[state=active]:bg-selected data-[state=active]:text-fg-primary',
      },
    },
  },
);

export type TabsProps = ComponentPropsWithRef<typeof TabsPrimitive.Root> &
  VariantProps<typeof tabsListVariants>;

export function Tabs({ variant, ...tabsProps }: TabsProps) {
  return (
    <TabsVariantContext.Provider value={variant ?? 'line'}>
      <TabsPrimitive.Root {...tabsProps} />
    </TabsVariantContext.Provider>
  );
}

export function TabsList({
  className,
  ...listProps
}: ComponentPropsWithRef<typeof TabsPrimitive.List>) {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.List className={cn(tabsListVariants({ variant }), className)} {...listProps} />
  );
}

export type TabsTriggerProps = ComponentPropsWithRef<typeof TabsPrimitive.Trigger> & {
  /** Optional count shown beside the label, for example the number of open tasks. */
  count?: number;
};

export function TabsTrigger({ className, count, children, ...triggerProps }: TabsTriggerProps) {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...triggerProps}
    >
      {children}
      {count === undefined ? null : (
        <span className="rounded-full bg-surface-2 px-1.5 text-meta text-fg-secondary tabular-nums">
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({
  className,
  ...contentProps
}: ComponentPropsWithRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-4', className)} {...contentProps} />;
}
