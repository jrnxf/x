import * as React from "react";

import { cn } from "~/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...properties }, reference) => {
    return (
      <input
        className={cn(
          "border-input bg-background ring-offset-background flex h-11 w-full rounded-md border px-4 py-2",
          "file:border-0 file:bg-transparent file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={reference}
        type={type}
        {...properties}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
