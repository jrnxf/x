import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "~/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ asChild = false, className, ...properties }, reference) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn(
        "text-card-foreground rounded-lg border p-4 shadow-xs",
        "ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
        className,
      )}
      ref={reference}
      {...properties}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...properties }, reference) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    ref={reference}
    {...properties}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...properties }, reference) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h3
    className={cn(
      "text-2xl leading-none font-semibold tracking-tight",
      className,
    )}
    ref={reference}
    {...properties}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...properties }, reference) => (
  <p
    className={cn("text-muted-foreground text-sm", className)}
    ref={reference}
    {...properties}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...properties }, reference) => (
  <div
    className={cn("pt-4 break-words whitespace-pre-wrap", className)}
    ref={reference}
    {...properties}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...properties }, reference) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    ref={reference}
    {...properties}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
