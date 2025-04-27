import * as React from "react";

import { cn } from "~/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...properties }, reference) => {
    return (
      <textarea
        className={cn(
          "border-input bg-background ring-offset-background flex min-h-[80px] w-full rounded-md border px-3 py-2",
          "placeholder:text-muted-foreground",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={reference}
        rows={7}
        {...properties}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
