"use client";

import { HeartIcon } from "lucide-react";
import { useRef, useState } from "react";

import type { MessageEnabledEntity } from "~/models/messages";

import { useAuth } from "~/components/auth-provider";
import { EditMessageForm } from "~/components/forms/message";
import { RecordOptions } from "~/components/record-options";
import { Tray, TrayContent, TrayTitle } from "~/components/tray";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useDeleteMessage, useLikeUnlikeMessage } from "~/lib/hooks/messages";
import { cn, preprocessText } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

type Message = RouterOutputs["messages"]["list"][number];

export function MessageBubble({
  entity,
  message,
}: {
  entity: MessageEnabledEntity;
  message: Message;
}) {
  const { sessionUser } = useAuth();

  const likeUnlike = useLikeUnlikeMessage(entity, message.id);
  const deleteMessage = useDeleteMessage(entity);

  const onDeleteMessage = () => {
    deleteMessage.mutate({ entityId: message.id, type: entity.type });
  };

  const isUserMessage = Boolean(
    sessionUser && sessionUser.id === message.user.id,
  );

  const messageType = `${entity.type}Message` as const;

  const [isReactionsOpen, setIsReactionsOpen] = useState(false);
  const [isEditMessageOpen, setIsEditMessageOpen] = useState(false);
  const reactionsTriggerReference = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="relative flex w-max max-w-[80%] items-center gap-1 rounded-md border bg-white px-3 py-2 text-left text-sm font-normal whitespace-pre-wrap dark:bg-[#0a0a0a]"
      style={{ wordBreak: "break-word" }}
    >
      {message.likes.length > 0 && (
        <div
          className={cn(
            "absolute top-0 flex -translate-y-1/2 items-center rounded-xl bg-red-600 px-1.5 text-xs text-[10px] text-white",
            isUserMessage
              ? "left-0 -translate-x-1/3"
              : "right-0 translate-x-1/3",
          )}
        >
          <HeartIcon className="mr-1 size-2 fill-white" />
          {message.likes.length}
        </div>
      )}

      <p className="leading-relaxed">{preprocessText(message.content)}</p>

      <RecordOptions
        onDeleteRecord={onDeleteMessage}
        onEditRecord={() => setIsEditMessageOpen(true)}
        onLikeUnlike={(action) => {
          likeUnlike.mutate({
            action,
            entityId: message.id,
            type: messageType,
          });
        }}
        onShowReactions={() => setIsReactionsOpen(true)}
        record={message}
      />

      <ReactionsTray
        message={message}
        onOpenChange={setIsReactionsOpen}
        open={isReactionsOpen}
        triggerRef={reactionsTriggerReference}
      />

      <EditMessageTray
        entity={entity}
        message={message}
        onOpenChange={setIsEditMessageOpen}
        open={isEditMessageOpen}
      />
    </div>
  );
}

function EditMessageTray({
  entity,
  message,
  onOpenChange,
  open,
}: {
  entity: MessageEnabledEntity;
  message: Message;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Tray onOpenChange={onOpenChange} open={open}>
      <TrayContent
        className="flex max-h-3/4 grow flex-col gap-2"
        dialogClassName="p-0"
      >
        <TrayTitle className="sr-only">Reactions</TrayTitle>
        <EditMessageForm
          entity={entity}
          message={message}
          onSuccess={() => {
            onOpenChange(false);
          }}
        />
      </TrayContent>
    </Tray>
  );
}

/**
 * NOTE: I tried having the markup look like:
 * dropdown-menu
 *   tray
 *     tray-trigger (reactions)
 *     tray-content
 *
 * this worked great in chrome but safari could not render the layout correctly,
 * so opting for this method instead where the focus returns on close but
 * without the nested markup
 */
function ReactionsTray({
  message,
  onOpenChange,
  open,
  triggerRef,
}: {
  message: Message;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  triggerRef?: React.RefObject<HTMLElement>;
}) {
  return (
    <Tray onOpenChange={onOpenChange} open={open}>
      <TrayContent
        className="flex grow flex-col gap-2"
        drawerClassName="min-h-[400px]"
        onCloseAutoFocus={() => {
          triggerRef?.current?.focus();
        }}
      >
        <TrayTitle className="sr-only">Reactions</TrayTitle>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-semibold uppercase">
            Reactions
          </p>
          {message.likes.length === 0 && (
            <p className="text-muted-foreground text-sm">No reactions yet</p>
          )}
          {message.likes.map((like) => (
            <div className="flex items-center gap-2" key={like.user.id}>
              <Avatar className="size-6 rounded-lg">
                <AvatarImage
                  alt={like.user.name}
                  height={28}
                  quality={70}
                  src={like.user.avatarUrl}
                  width={28}
                />
                <AvatarFallback className="text-xs" name={like.user.name} />
              </Avatar>
              <p className="truncate text-base">{like.user.name}</p>
            </div>
          ))}
        </div>
      </TrayContent>
    </Tray>
  );
}
