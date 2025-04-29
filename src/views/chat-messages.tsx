import { useSuspenseQuery } from "@tanstack/react-query";
import { useCreateMessage } from "~/lib/messages/hooks";
// import { useCreateMessage } from "~/lib/hooks/messages";
import { listMessages } from "~/server/fns/messages/list";
import { MessagesView } from "~/views/messages";

export function ChatMessagesView() {
  const { data: chatMessages } = useSuspenseQuery(
    listMessages.queryOptions({
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
