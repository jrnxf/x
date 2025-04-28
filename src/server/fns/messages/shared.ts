import { z } from "zod";

export const messageEnabledEntities = ["post", "chat"] as const;

export const messageFormSchema = z.object({
  content: z.string().min(1),
});

export type MessageFormOutput = z.infer<typeof messageFormSchema>;

export const baseMessageSchema = z.object({
  entityId: z.number(), // the id of the thing receiving the message (in the case of chat just pass in -1 since there is no id)
  type: z.enum(messageEnabledEntities),
});

export type MessageEnabledEntity = z.infer<typeof baseMessageSchema>;

export const createEditMessageSchema = z.intersection(
  messageFormSchema,
  baseMessageSchema,
);
