import { z } from 'zod';

export const UserSchema = z.object({
  first_name: z.string().min(3),
  last_name: z.string().optional(),
  age: z.number().optional(),
  email: z.string().email(),
  courses: z.array(z.string()).default([]),
  subscribed: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>; 