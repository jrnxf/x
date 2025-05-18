/* eslint-disable perfectionist/sort-objects */

import { z } from "zod";

export const baseAuthSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const loginSchema = baseAuthSchema.extend({
  redirect: z.string(),
});

export type LoginArgs = z.infer<typeof loginSchema>;

export const registerSchema = baseAuthSchema.extend({
  bio: z.string().trim(),
  name: z.string().trim().min(1, { message: "Required" }),
});

export type RegisterArgs = z.infer<typeof registerSchema>;
