import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/button';
import { FormField } from '../form-field/form-field';
import { Textarea } from '../input/input';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const meta = {
  title: 'Base/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InlineDecisionWithReason: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Change severity</Button>
      </DialogTrigger>
      <DialogContent closeLabel="Close dialog">
        <DialogHeader>
          <DialogTitle>Lower INC-2041 from SEV1 to SEV2</DialogTitle>
          <DialogDescription>
            Regulator clocks already started stay active. Stakeholder updates move to every 60
            minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FormField label="Reason" isRequired requiredLabel="Required">
            {(controlProps) => <Textarea {...controlProps} />}
          </FormField>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="primary">Lower to SEV2</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
