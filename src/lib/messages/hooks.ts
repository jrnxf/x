import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
// import { toast } from "sonner";

import { createMessage } from "~/server/fns/messages/create";
import { type Message } from "~/server/fns/messages/list";
import { type MessageEnabledEntity } from "~/server/fns/messages/shared";

export function useCreateMessage(entity: MessageEnabledEntity) {
  const { session } = useRouteContext({ from: "__root__" });

  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createMessage.serverFn,

    onMutate: async (newMessage) => {
      qc.cancelQueries({
        queryKey: ["messages", entity.type, entity.entityId],
      });

      const previousData = qc.getQueryData<Message[]>([
        "messages",
        entity.type,
        entity.entityId,
      ]);

      if (previousData && session.user) {
        qc.setQueryData(
          ["messages", entity.type, entity.entityId],
          [
            ...previousData,
            {
              content: newMessage.data.content,
              createdAt: new Date(),
              id: Math.random(),
              likes: [],
              user: session.user,
              userId: session.user.id,
            },
          ],
        );
      }

      return { previousData };
    },
    onError: (_error, _variables, ctx) => {
      if (ctx) {
        qc.setQueryData(
          ["messages", entity.type, entity.entityId],
          ctx.previousData,
        );
      }
    },
    onSettled: () => {
      qc.invalidateQueries({
        queryKey: ["messages", entity.type, entity.entityId],
      });
    },
  });
  return {
    ...mutation,
    mutate: (content: string) => {
      mutation.mutate({
        data: {
          ...entity,
          content,
        },
      });
    },
  };
}

export function useUpdateMessage(
  entity: MessageEnabledEntity,
  args: Pick<ProcedureOptions["messages"]["update"], "onSuccess">,
) {
  const { session } = useRouteContext({ from: "__root__" });

  const qc = useQueryClient();
  const utils = api.useUtils();

  return api.messages.update.useMutation<{
    previousData: ReturnType<typeof utils.messages.list.getData>;
  }>({
    onError: (error, _message, ctx) => {
      if (ctx) {
        console.log(error);
        toast(error.message);
        utils.messages.list.setData(entity, ctx.previousData);
      }
    },
    onMutate: async (editedMessage) => {
      utils.messages.list.cancel();

      const previousData = utils.messages.list.getData(entity);

      utils.messages.list.setData(entity, (prev) => {
        if (prev && sessionUser) {
          return prev.map((message) => {
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
    onSettled: () => utils.messages.list.invalidate(),
    ...args,
  });
}

// export function useDeleteMessage(
//   entity: MessageEnabledEntity,
//   args?: Pick<ProcedureOptions["messages"]["delete"], "onSuccess">,
// ) {
//   const utils = api.useUtils();

//   return api.messages.delete.useMutation<{
//     previousData: ReturnType<typeof utils.messages.list.getData>;
//   }>({
//     onError: (error, _message, ctx) => {
//       if (ctx) {
//         toast(error.message);
//         utils.messages.list.setData(entity, ctx.previousData);
//       }
//     },
//     onMutate: async (deletedMessage) => {
//       utils.messages.list.cancel();

//       const previousData = utils.messages.list.getData(entity);

//       utils.messages.list.setData(entity, (prev = []) => {
//         return prev.filter((message) => message.id !== deletedMessage.entityId);
//       });

//       return { previousData };
//     },
//     onSettled: () => utils.messages.list.invalidate(),
//     ...args,
//   });
// }

// export function useLikeUnlikeMessage(
//   entity: MessageEnabledEntity,
//   messageId: number,
// ) {
//   const { sessionUser } = useAuth();
//   const utils = api.useUtils();

//   return api.reaction.react.useMutation<{
//     previousData: ReturnType<typeof utils.messages.list.getData>;
//   }>({
//     onError: (_error, _newLikeUnlike, ctx) => {
//       if (ctx) {
//         utils.messages.list.setData(entity, ctx.previousData);
//       }
//     },
//     onMutate: (data) => {
//       utils.messages.list.cancel();

//       const previousData = utils.messages.list.getData(entity);

//       utils.messages.list.setData(entity, (prev = []) => {
//         return prev.map((message) => {
//           if (sessionUser && message.id === messageId) {
//             if (data.action === "like") {
//               return {
//                 ...message,
//                 likes: [...message.likes, { user: sessionUser }],
//               };
//             } else if (data.action === "unlike") {
//               return {
//                 ...message,
//                 likes: message.likes.filter(
//                   (like) => like.user.id !== sessionUser.id,
//                 ),
//               };
//             }
//           }
//           return message;
//         });
//       });

//       return { previousData };
//     },
//     onSettled: () => {
//       utils.messages.list.invalidate();
//     },
//   });
// }
