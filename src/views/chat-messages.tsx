"use client";

import { useCreateMessage } from "~/lib/hooks/messages";
import { api } from "~/trpc/react";
import { MessagesView } from "~/views/messages";

const refetchIntervalMs = 10_000;

export function ChatMessagesView() {
  const [chatMessages] = api.messages.list.useSuspenseQuery(
    {
      entityId: -1, // doesn't matter for chat
      type: "chat",
    },
    {
      refetchInterval: refetchIntervalMs,
    },
  );

  const createChatMessage = useCreateMessage({
    entityId: -1, // doesn't matter for chat
    type: "chat",
  });

  return (
    <MessagesView
      entity={{ entityId: -1, type: "chat" }}
      messages={chatMessages}
      onMessageCreated={(newMessage) => {
        createChatMessage.mutate({
          content: newMessage,
          entityId: -1,
          type: "chat",
        });
      }}
    />
  );
}
