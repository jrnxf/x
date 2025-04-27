import { z } from "zod";

export const baseAuthSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
