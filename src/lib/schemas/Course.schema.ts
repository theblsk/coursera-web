import { z } from 'zod';

export const CourseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
});

export type Course = z.infer<typeof CourseSchema>; 