import { toast } from "sonner";

import type { MessageEnabledEntity } from "~/models/messages";
import type { ProcedureOptions } from "~/server/api/root";

import { useAuth } from "~/components/auth-provider";
import { api } from "~/trpc/react";

export function useCreateMessage(entity: MessageEnabledEntity) {
  const { sessionUser } = useAuth();
  const utilities = api.useUtils();

  return api.messages.create.useMutation<{
    previousData: ReturnType<typeof utilities.messages.list.getData>;
  }>({
    onError: (_error, _message, context) => {
      if (context) {
        utilities.messages.list.setData(entity, context.previousData);
      }
    },
    onMutate: async (newMessage) => {
      utilities.messages.list.cancel();

      const previousData = utilities.messages.list.getData(entity);

      utilities.messages.list.setData(entity, (previous) => {
        if (previous && sessionUser) {
          return [
            ...previous,
            {
              content: newMessage.content,
              createdAt: new Date(),
              id: Math.random(),
              likes: [],
              user: sessionUser,
              userId: sessionUser.id,
            },
          ];
        }
      });

      return { previousData };
    },
    onSettled: () => utilities.messages.list.invalidate(),
  });
}

export function useDeleteMessage(
  entity: MessageEnabledEntity,
  arguments_?: Pick<ProcedureOptions["messages"]["delete"], "onSuccess">
) {
  const utilities = api.useUtils();

  return api.messages.delete.useMutation<{
    previousData: ReturnType<typeof utilities.messages.list.getData>;
  }>({
    onError: (error, _message, context) => {
      if (context) {
        toast(error.message);
        utilities.messages.list.setData(entity, context.previousData);
      }
    },
    onMutate: async (deletedMessage) => {
      utilities.messages.list.cancel();

      const previousData = utilities.messages.list.getData(entity);

      utilities.messages.list.setData(entity, (previous = []) => {
        return previous.filter(
          (message) => message.id !== deletedMessage.entityId
        );
      });

      return { previousData };
    },
    onSettled: () => utilities.messages.list.invalidate(),
    ...arguments_,
  });
}

export function useLikeUnlikeMessage(
  entity: MessageEnabledEntity,
  messageId: number
) {
  const { sessionUser } = useAuth();
  const utilities = api.useUtils();

  return api.reaction.react.useMutation<{
    previousData: ReturnType<typeof utilities.messages.list.getData>;
  }>({
    onError: (_error, _newLikeUnlike, context) => {
      if (context) {
        utilities.messages.list.setData(entity, context.previousData);
      }
    },
    onMutate: (data) => {
      utilities.messages.list.cancel();

      const previousData = utilities.messages.list.getData(entity);

      utilities.messages.list.setData(entity, (previous = []) => {
        return previous.map((message) => {
          if (sessionUser && message.id === messageId) {
            if (data.action === "like") {
              return {
                ...message,
                likes: [...message.likes, { user: sessionUser }],
              };
            } else if (data.action === "unlike") {
              return {
                ...message,
                likes: message.likes.filter(
                  (like) => like.user.id !== sessionUser.id
                ),
              };
            }
          }
          return message;
        });
      });

      return { previousData };
    },
    onSettled: () => {
      utilities.messages.list.invalidate();
    },
  });
}

export function useUpdateMessage(
  entity: MessageEnabledEntity,
  arguments_: Pick<ProcedureOptions["messages"]["update"], "onSuccess">
) {
  const { sessionUser } = useAuth();
  const utilities = api.useUtils();

  return api.messages.update.useMutation<{
    previousData: ReturnType<typeof utilities.messages.list.getData>;
  }>({
    onError: (error, _message, context) => {
      if (context) {
        toast(error.message);
        utilities.messages.list.setData(entity, context.previousData);
      }
    },
    onMutate: async (editedMessage) => {
      utilities.messages.list.cancel();

      const previousData = utilities.messages.list.getData(entity);

      utilities.messages.list.setData(entity, (previous) => {
        if (previous && sessionUser) {
          return previous.map((message) => {
            if (message.id === editedMessage.entityId) {
              return {
                ...message,
                content: editedMessage.content,
              };
            }

            return message;
          });
        }
      });

      return { previousData };
    },
    onSettled: () => utilities.messages.list.invalidate(),
    ...arguments_,
  });
}
