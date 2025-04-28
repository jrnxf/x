import { Link, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Json } from "~/lib/dx/json";
import { logout } from "~/server/fns/auth/logout";

export function AuthButton() {
  const {
    session: { user },
  } = useRouteContext({ from: "__root__" });

  const handleLogout = useServerFn(logout.serverFn);

  if (!user) {
    return (
      <Button asChild variant="ghost">
        <Link to="/auth/login">login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarImage
            alt={`Avatar for ${user.name}`}
            className="rounded-full object-cover"
            src={user.avatarUrl}
          />
          <AvatarFallback
            className="flex w-full items-center justify-center"
            name={user.name}
          />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-56 rounded-lg"
        side="right"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8">
              <AvatarImage
                alt={`Avatar for ${user.name}`}
                className="rounded-full object-cover"
                height={40}
                src={user.avatarUrl}
                width={40}
              />
              <AvatarFallback
                className="flex w-full items-center justify-center"
                name={user.name}
              />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/">Home</Link>
        </DropdownMenuItem>
        {/* <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
         */}
        <DropdownMenuItem onSelect={() => handleLogout()}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SessionJson() {
  const { session } = useRouteContext({ from: "__root__" });

  return <Json data={session} />;
}
