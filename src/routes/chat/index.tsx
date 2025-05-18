import { createFileRoute } from "@tanstack/react-router";
import { listMessages } from "~/server/fns/messages/list";
import { ChatMessagesView } from "~/views/chat-messages";

export const Route = createFileRoute("/chat/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.messages.list.queryOptions({
        recordId: -1,
        type: "chat",
      }),
    );
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div
      className="mx-auto flex w-full max-w-xl grow flex-col px-4 pb-4"
      id="main-content"
    >
      <ChatMessagesView />
    </div>
  );
}
