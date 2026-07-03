import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string(),
  capacity: z.number().int().positive(),
  description: z.string(),
});

export type CreateRoomDto = z.infer<typeof createRoomSchema>;
