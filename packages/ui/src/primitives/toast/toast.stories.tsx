import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/button';
import { useToast, type ToastOptions } from './toast';

const exampleToasts: ToastOptions[] = [
  { tone: 'success', title: 'Task assigned to M. Khan' },
  { tone: 'info', title: 'Stakeholder update scheduled for 12:45 GST' },
  {
    tone: 'warning',
    title: 'ServiceNow sync delayed',
    description: 'Changes will retry for up to 24 hours. Reference RX-3C91.',
  },
  {
    tone: 'error',
    title: 'Note was not saved',
    description: 'The connection dropped before the save completed. Reference RX-7F2A.',
  },
];

function ToastGallery() {
  const { showToast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      {exampleToasts.map((toast) => (
        <Button key={toast.tone} onClick={() => showToast(toast)}>
          Show {toast.tone}
        </Button>
      ))}
      <Button
        onClick={() =>
          showToast({
            tone: 'success',
            title: 'Evidence pinned',
            action: {
              label: 'Undo',
              alternativeText: 'Unpin it from the evidence list',
              onSelect: () => undefined,
            },
          })
        }
      >
        Show undo
      </Button>
    </div>
  );
}

const meta = {
  title: 'Base/Toast',
  component: ToastGallery,
} satisfies Meta<typeof ToastGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tones: Story = {};
