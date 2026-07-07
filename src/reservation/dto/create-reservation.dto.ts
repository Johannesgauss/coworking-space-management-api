import { z } from 'zod';

export const createReservationSchema = z
  .object({
    roomId: z
      .string()
      .uuid({ message: 'O ID da sala deve ser um UUID válido.' }),
    date: z.string().transform((str) => new Date(str)),
    startTime: z.string().transform((str) => new Date(str)),
    endTime: z.string().transform((str) => new Date(str)),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'O horário de término deve ser maior que o horário de início.',
    path: ['endTime'],
  });

export type CreateReservationDto = z.infer<typeof createReservationSchema>;
