"use client";

import Link from "next/link";

import type { LikeableEntity } from "~/models/likes";

import { useAuth } from "~/components/auth-provider";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type RouterOutputs } from "~/trpc/react";

type Message = RouterOutputs["messages"]["list"][number];

export function MessageTabs({
  // close,
  defaultValue = "reactions",
  // entity,
  message,
  // tabs,
}: {
  // close: () => void;
  defaultValue?: string;
  // entity: MessageEnabledEntity;
  message: Message;
  // tabs: {
  //   edit: {
  //     setValue: (nextValue: string) => void;
  //     value: string;
  //   };
  // };
}) {
  const { sessionUser } = useAuth();

  const isUserMessage = Boolean(
    sessionUser && sessionUser.id === message.user.id,
  );

  // const updateMessage = useUpdateMessage(entity, { onSuccess: close });

  // const onUpdateMessage = (nextContent: string) => {
  //   updateMessage.mutate({
  //     content: nextContent,
  //     entityId: message.id,
  //     type: entity.type,
  //   });
  // };

  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList>
        <TabsTrigger value="reactions">Reactions</TabsTrigger>
        {isUserMessage && <TabsTrigger value="edit">Edit</TabsTrigger>}
      </TabsList>
      <TabsContent value="reactions">
        <LikesSection entity={message} />
      </TabsContent>
      {isUserMessage && <TabsContent value="edit">gone</TabsContent>}
    </Tabs>
  );
}

function LikesSection({ entity }: { entity: LikeableEntity }) {
  if (entity.likes.length === 0) {
    return <p className="text-muted-foreground mt-1">No reactions</p>;
  }

  return (
    <div className="flex flex-col items-start">
      {entity.likes.map((like) => (
        <Button
          asChild
          className="w-max justify-start"
          key={like.user.id}
          size="sm"
          variant="link"
        >
          <Link href={`/users/${like.user.id}`}>{like.user.name}</Link>
        </Button>
      ))}
    </div>
  );
}
