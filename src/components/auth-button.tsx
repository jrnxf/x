import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";

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
import { useSessionUser } from "~/lib/session";
import { logout } from "~/server/fns/auth/logout";

export function AuthButton() {
  const sessionUser = useSessionUser();

  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate: handleLogout } = useMutation({
    mutationFn: logout.serverFn,
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ["session"],
      });
      router.navigate({ to: "/auth/login" });
    },
  });

  if (!sessionUser) {
    return (
      <Button asChild variant="ghost">
        <Link to="/auth/login">login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2" asChild>
        <Button size="icon-sm" variant="ghost" className="rounded-full">
          <Avatar className="size-8">
            <AvatarImage
              alt={`Avatar for ${sessionUser.name}`}
              className="rounded-full object-cover"
              src={sessionUser.avatarUrl}
            />
            <AvatarFallback
              className="flex w-full items-center justify-center"
              name={sessionUser.name}
            />
          </Avatar>
        </Button>
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
                alt={`Avatar for ${sessionUser.name}`}
                className="rounded-full object-cover"
                height={40}
                src={sessionUser.avatarUrl}
                width={40}
              />
              <AvatarFallback
                className="flex w-full items-center justify-center"
                name={sessionUser.name}
              />
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{sessionUser.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {sessionUser.email}
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
