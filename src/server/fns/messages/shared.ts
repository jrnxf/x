import { z } from "zod";
import { chatMessages, postMessages } from "~/db/schema";

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

export type RecordWithMessagesType = MessageEnabledEntity["type"];

export const createUpdateMessageSchema = z.intersection(
  messageFormSchema,
  baseMessageSchema,
);

export const getTableByType = (type: RecordWithMessagesType) => {
  const table =
    type === "post" ? postMessages : type === "chat" ? chatMessages : undefined;

  if (!table) {
    throw new Error(`Invalid type: ${type}`);
  }

  return table;
};
