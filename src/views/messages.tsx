import { useRouteContext } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";

import { BaseMessageForm } from "~/components/forms/message";
import { MessageAuthor } from "~/components/messages/message-author";
import { MessageBubble } from "~/components/messages/message-bubble";
import { useScroll } from "~/lib/use-scroll";
import { cn } from "~/lib/utils";
import { type listMessages } from "~/server/fns/messages/list";
import { type RecordWithMessages } from "~/server/fns/messages/shared";
import { type ServerFnReturn } from "~/server/types";

type Message = ServerFnReturn<typeof listMessages.serverFn>[number];

export function MessagesView({
  record,
  messages,
  onMessageCreated,
}: {
  record: RecordWithMessages;
  messages: Message[];
  onMessageCreated: (newMessage: string) => void;
}) {
  const scrollCountReference = useRef(0);

  const { session } = useRouteContext({ from: "__root__" });

  const { ref, scrollTo } = useScroll();

  const lastChatMessageByUserId = messages.at(-1)?.userId;
  const chatMessageCount = messages.length;

  useLayoutEffect(() => {
    scrollTo("bottom", Number.MAX_SAFE_INTEGER);
  }, [scrollTo]);

  useLayoutEffect(() => {
    const initialLoad = scrollCountReference.current === 0;

    const lastMessageIsFromAuthUser =
      session.user && session.user.id === lastChatMessageByUserId;

    // if the page is just loading OR the last message submitted was from the
    // authenticated user, we should scroll to the bottom of the chat otherwise
    // if the new message is from a different user, don't scroll down to the
    // bottom of the thread unless the user is within 400px of the bottom
    // already
    const threshold =
      initialLoad || lastMessageIsFromAuthUser ? Number.MAX_SAFE_INTEGER : 400;

    // Why scroll on initial load if `ssr-load-scrolled-to-bottom` exists?
    // `ssr-load-scrolled-to-bottom` only works if the page is first rendered on
    // the server - in cases where the page is rendered on the client (eg
    // browser back button), we need to scroll to the bottom manually
    scrollTo("bottom", threshold);
    scrollCountReference.current++;
  }, [scrollTo, lastChatMessageByUserId, chatMessageCount, session.user]);

  return (
    <>
      {messages.length === 0 && (
        <p className="text-muted-foreground mt-1">No messages</p>
      )}
      <div
        className={cn(
          // TODO: tanstack router's scroll restoration makes this kinda weird
          // since the scroll restoration persists on refreshes too. I might opt
          // to just not re-enable this but keeping it around for now. If I do re-enable,
          // I'll need to uncomment out the ScrollBottomProvider in __root
          // "ssr-load-scrolled-to-bottom",
          "-mx-4 flex grow basis-0 flex-col gap-2 overflow-y-auto p-4",
        )}
        ref={ref}
      >
        {messages.map((message, index) => {
          const isUserMessage = Boolean(
            session.user && session.user.id === message.user.id,
          );

          const isNewSection = messages[index - 1]?.user.id !== message.user.id;

          return (
            <div
              className={cn(
                "flex max-w-full flex-col",
                isUserMessage && "items-end",
              )}
              key={message.id}
            >
              {isNewSection && (
                <div className={cn("mb-1", index !== 0 && "mt-4")}>
                  <MessageAuthor message={message} />
                </div>
              )}
              <div
                className={cn("flex w-full", isUserMessage && "justify-end")}
              >
                <MessageBubble record={record} message={message} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="shrink-0">
        <BaseMessageForm
          onSubmit={(newMessage) => {
            scrollTo("bottom", Infinity);
            onMessageCreated(newMessage);
          }}
        />
      </div>
    </>
  );
}
