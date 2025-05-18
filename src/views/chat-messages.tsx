import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/integrations/trpc/react";
import { useCreateMessage } from "~/lib/messages/hooks";
// import { useCreateMessage } from "~/lib/hooks/messages";
import { MessagesView } from "~/views/messages";

export function ChatMessagesView() {
  const trpc = useTRPC();
  const { data: chatMessages } = useSuspenseQuery(
    trpc.messages.list.queryOptions({
      recordId: -1,
      type: "chat",
    }),
  );

  const { mutate: createChatMessage } = useCreateMessage({
    recordId: -1,
    type: "chat",
  });
  return (
    <MessagesView
      record={{ recordId: -1, type: "chat" }}
      messages={chatMessages}
      onMessageCreated={createChatMessage}
    />
  );
}
