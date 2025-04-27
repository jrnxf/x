import Link from "next/link";

import type { RouterOutputs } from "~/trpc/react";

type Message = RouterOutputs["messages"]["list"][number]; // TODO move this to a common place

export function MessageAuthor({ message }: { message: Message }) {
  return (
    <Link
      className="bg-background ring-offset-background focus-visible:ring-ring mb-1 w-max rounded-md font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
      href={`/users/${message.user.id}`}
    >
      {message.user.name}
    </Link>
  );
}
