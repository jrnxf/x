import { cn } from "~/lib/utils";

export function Skeleton({
  children,
  className,
  ready,
  ...properties
}: React.HTMLAttributes<HTMLDivElement> & {
  ready?: boolean;
}) {
  if (ready) {
    return children;
  }
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...properties}
    >
      <div className="invisible">{children}</div>
    </div>
  );
}
