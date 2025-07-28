// utils/validation.ts
import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  type: z.enum(['user', 'bot', 'system']),
  content: z.string().min(1).max(2000),
  timestamp: z.date(),
  intent: z.string().optional(),
});

export const validateMessage = (data: unknown) => {
  return MessageSchema.safeParse(data);
};