import { type HTMLAttributes } from "react";

import { cn, getFlagEmoji } from "~/lib/utils";

export function FlagEmoji({
  className,
  location,
  ...rest
}: HTMLAttributes<HTMLParagraphElement> & {
  location: null | { countryCode: string };
}) {
  const emoji = location ? getFlagEmoji(location.countryCode) : null;

  if (!emoji) {
    return null;
  }

  return (
    <p {...rest} className={cn("leading-none", className)}>
      {emoji}
    </p>
  );
}
