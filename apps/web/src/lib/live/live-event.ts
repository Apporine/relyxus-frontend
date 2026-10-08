import { z } from 'zod';

/*
 * Every state change is published as a versioned event, for example incident.declared.v1,
 * in a CloudEvents envelope (Product s. 22A). The live connection delivers the same events
 * to the browser; it is a delivery channel, never the system of record.
 */
export const liveEventSchema = z.object({
  specversion: z.literal('1.0'),
  id: z.string().min(1),
  type: z.string().min(1),
  source: z.string().min(1),
  time: z.iso.datetime({ offset: true }),
  subject: z.string().optional(),
  data: z.unknown(),
});

export type LiveEvent = z.infer<typeof liveEventSchema>;
