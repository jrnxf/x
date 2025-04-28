import { useSuspenseQuery } from "@tanstack/react-query";
import { useCreateMessage } from "~/lib/messages/hooks";
// import { useCreateMessage } from "~/lib/hooks/messages";
import { listMessages } from "~/server/fns/messages/list";
import { MessagesView } from "~/views/messages";

export function ChatMessagesView() {
  const { data: chatMessages } = useSuspenseQuery(
    listMessages.queryOptions({
      entityId: -1,
      type: "chat",
    }),
  );

  const { mutate: createChatMessage } = useCreateMessage({
    entityId: -1,
    type: "chat",
  });
  return (
    <MessagesView
      entity={{ entityId: -1, type: "chat" }}
      messages={chatMessages}
      onMessageCreated={createChatMessage}
    />
  );
}
