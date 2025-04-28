/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteContext } from "@tanstack/react-router";
import { CornerDownLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { useAuth } from "~/components/auth-provider";
// import { LoginAndReturnButton } from "~/components/login-and-return-button";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
// import { useUpdateMessage } from "~/lib/hooks/messages";
import {
  type MessageFormOutput,
  messageFormSchema,
} from "~/server/fns/messages/shared";

export function BaseMessageForm({
  initialContent,
  onSubmit,
}: {
  initialContent?: string;
  onSubmit: (content: string) => void;
}) {
  const { session } = useRouteContext({ from: "__root__" });
  const { getValues, handleSubmit, register, setFocus, setValue } =
    useForm<MessageFormOutput>({
      defaultValues: {
        content: initialContent,
      },
      resolver: zodResolver(messageFormSchema),
    });

  const reset = () => {
    setValue("content", "");
  };

  if (!session.user) {
    return (
      <div className="grid place-items-center pt-3">
        <p>log in to chat</p>
        {/* <LoginAndReturnButton>Log in to chat</LoginAndReturnButton> */}
      </div>
    );
  }

  return (
    <form
      className="bg-background focus-within:ring-ring relative w-full overflow-clip rounded-lg border p-3 focus-within:ring-2"
      method="post"
      onClick={() => setFocus("content")}
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit((data) => {
          onSubmit(data.content);
          reset();
        })(event);
      }}
    >
      <div className="flex flex-col items-end gap-4">
        <div className="w-full space-y-2">
          <Textarea
            {...register("content")}
            className="resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
            id="content"
            onKeyDown={(event) => {
              if (event.code === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                // hitting enter submits, enter while holding shift gives you a
                // new line
                const message = getValues().content;
                if (message) {
                  onSubmit(message);
                  reset();
                }
              }
            }}
            rows={4}
          />
        </div>
        <Button
          iconRight={<CornerDownLeftIcon className="size-4" />}
          type="submit"
        >
          Send
        </Button>
      </div>
    </form>
  );
}

// export function EditMessageForm({
//   entity,
//   message,
//   onSuccess,
// }: {
//   entity: MessageEnabledEntity;
//   message: {
//     content: string;
//     id: number;
//   };
//   onSuccess?: () => void;
// }) {
//   const updateMessage = useUpdateMessage(entity, {
//     onSuccess: () => {
//       onSuccess?.();
//     },
//   });

//   const onUpdateMessage = (nextContent: string) => {
//     updateMessage.mutate({
//       content: nextContent,
//       entityId: message.id,
//       type: entity.type,
//     });
//   };

//   return (
//     <BaseMessageForm
//       initialContent={message.content}
//       onSubmit={onUpdateMessage}
//     />
//   );
// }
