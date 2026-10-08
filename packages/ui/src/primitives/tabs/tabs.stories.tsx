import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta = {
  title: 'Base/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {
  render: () => (
    <Tabs defaultValue="classification">
      <TabsList aria-label="Incident compliance">
        <TabsTrigger value="classification">Classification</TabsTrigger>
        <TabsTrigger value="clocks" count={2}>
          Clocks
        </TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="evidence">Evidence</TabsTrigger>
        <TabsTrigger value="submissions" disabled>
          Submission log
        </TabsTrigger>
      </TabsList>
      <TabsContent value="classification">Classification content</TabsContent>
      <TabsContent value="clocks">Clock content</TabsContent>
      <TabsContent value="reports">Report content</TabsContent>
      <TabsContent value="evidence">Evidence content</TabsContent>
    </Tabs>
  ),
};

export const Contained: Story = {
  render: () => (
    <Tabs defaultValue="timeline" variant="contained">
      <TabsList aria-label="Incident activity" className="w-fit">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="tasks" count={4}>
          Tasks
        </TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">Timeline events</TabsContent>
      <TabsContent value="tasks">Task list</TabsContent>
    </Tabs>
  ),
};
