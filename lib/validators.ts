import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  price: z.number().positive(),
  currency: z.string().default('USD'),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  radius: z.number().optional(),
  scheduledAt: z.string().datetime().optional(),
  deadline: z.string().datetime().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['open', 'assigned', 'in-progress', 'completed', 'cancelled']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
