import { z } from "zod";

export const fooSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
  videoUploadId: z.string().min(1, { message: "Required" }),
});
