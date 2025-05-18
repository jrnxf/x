import { z } from "zod";

export const gameUploadSchema = z.object({
  uploadId: z.string().nullable(),
});

export const baseRiuSetSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
});

export const createRiuSetSchema = baseRiuSetSchema.extend({
  videoUploadId: z.string().min(1, { message: "Required" }),
});

export type CreateRiuSetArgs = z.infer<typeof createRiuSetSchema>;

export const editRiuSetSchema = baseRiuSetSchema;

export type EditRiuSetArgs = z.infer<typeof editRiuSetSchema>;

export const createRiuSubmissionSchema = z.object({
  riuSetId: z.number().positive({ message: "Required" }),
  videoUploadId: z.string().min(1, { message: "Required" }),
});

export type CreateRiuSubmissionArgs = z.infer<typeof createRiuSubmissionSchema>;
