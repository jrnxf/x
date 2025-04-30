import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn, getUserInitials, preferCdn } from "~/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>, "src"> & {
    src?: null | string;
  }
>(({ className, src, ...props }, ref) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square h-full w-full", className)}
    ref={ref}
    src={src ? preferCdn(src) : undefined}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  Omit<
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
    "children"
  > & {
    name: string;
  }
>(({ className, name, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "bg-muted flex h-full w-full items-center justify-center rounded-full",
      className,
    )}
    ref={ref}
    {...props}
  >
    {getUserInitials(name)}
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
