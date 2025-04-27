"use client";

import { Link } from "@tanstack/react-router";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function NavButtons() {
  return (
    <>
      <NavButton href="/chat">chat</NavButton>
      <NavButton href="/posts">posts</NavButton>
      <NavButton href="/users">users</NavButton>
      <NavButton href="/games/rius/active">games</NavButton>
    </>
  );
}

function NavButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  const pathname = usePathname();

  const isActive = pathname.startsWith(href);

  return (
    <Button asChild className={cn(isActive && "bg-secondary")} variant="ghost">
      <Link to={href}>{children}</Link>
    </Button>
  );
}
