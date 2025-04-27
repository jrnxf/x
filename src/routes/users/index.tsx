import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useLoaderDeps,
  useSearch,
} from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpIcon, FilterIcon } from "lucide-react";
import { parseAsArrayOf, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useEventListener } from "usehooks-ts";
import { z } from "zod";

import {
  Tray,
  TrayClose,
  TrayContent,
  TrayTitle,
  TrayTrigger,
} from "~/components/tray";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MultiSelect } from "~/components/ui/multi-select";
import { WrappedBadges } from "~/components/wrapped-badges";
import { USER_DISCIPLINES } from "~/db/schema";
import { cn } from "~/lib/utils";
import { listUsers } from "~/server/fns/users/list";
import { UserView } from "~/views/user";

export const Route = createFileRoute("/users/")({
  component: RouteComponent,
  validateSearch: listUsers.schema,
  loaderDeps: ({ search }) => {
    return search;
  },
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureInfiniteQueryData(
      listUsers.infiniteQueryOptions(deps),
    );
  },
});

function FiltersTray() {
  const x = Route.useSearch();
  const [search, setSearch] = useState("");
  const [disciplines, setDisciplines] = useState(USER_DISCIPLINES);

  return (
    <Tray>
      <TrayTrigger asChild>
        <Button variant="outline">
          Filters <FilterIcon className="size-4" />
        </Button>
      </TrayTrigger>
      <TrayContent>
        <TrayTitle>Filters</TrayTitle>
        <div className="flex flex-col items-start gap-2">
          <Input
            className="max-w-[300px]"
            id="search"
            onChange={(evt) => setSearch(evt.target.value)}
            placeholder="Search users"
            value={search}
          />
          <MultiSelect
            buttonLabel="Disciplines"
            onOptionCheckedChange={(option, checked) => {
              if (checked) {
                setDisciplines([...disciplines, option]);
              } else {
                setDisciplines(disciplines.filter((d) => d !== option));
              }
            }}
            options={USER_DISCIPLINES}
            selections={disciplines}
          />

          <TrayClose asChild>
            <Button
              className="self-end"
              onClick={() => {
                setQuerySearch(search);
                setQueryDisciplines(disciplines);
              }}
            >
              Apply
            </Button>
          </TrayClose>
        </div>
      </TrayContent>
    </Tray>
  );
}

function RouteComponent() {
  const {
    data: usersPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(listUsers.infiniteQueryOptions());

  const [selectedUserIdx, setSelectedUserIdx] = useState(-1);

  const users = useMemo(() => usersPages.pages.flat(), [usersPages]);
  const selectedUser = users[selectedUserIdx];

  const selectUser = (idx: number) => {
    setSelectedUserIdx(idx);
  };

  const goToNextUser = () => {
    setSelectedUserIdx((selectedUserIdx + 1) % users.length);
  };

  const goToPreviousUser = () => {
    setSelectedUserIdx((selectedUserIdx - 1 + users.length) % users.length);
  };

  return (
    <div
      className="relative mx-auto flex min-h-0 w-full max-w-5xl grow flex-col gap-4 p-4"
      id="main-content"
    >
      <div className="grid w-full grid-cols-1 gap-3">
        <div className="flex justify-end gap-2">
          <FiltersTray />
        </div>
        {users.length === 0 && (
          <p className="text-muted-foreground">No users found</p>
        )}
        {users.map((user, idx) => {
          return (
            <Tray key={user.id}>
              <TrayTrigger asChild>
                <button
                  className={cn(
                    "w-full space-y-2 rounded-md border bg-white p-3 text-left dark:bg-[#0a0a0a]",
                    "ring-offset-background",
                    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden",
                  )}
                  data-user-name={user.name}
                  onClick={() => selectUser(idx)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 rounded-full">
                      <AvatarImage alt={user.name} src={user.avatarUrl} />
                      <AvatarFallback className="text-xs" name={user.name} />
                    </Avatar>
                    <p className="truncate text-base">{user.name}</p>
                  </div>
                  {user.bio && (
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                      {user.bio}
                    </p>
                  )}

                  <WrappedBadges content={user.disciplines} />
                </button>
              </TrayTrigger>
              <TrayContent
                className="h-[90dvh] w-full sm:max-w-3xl"
                iconButtonSlot={
                  <UpDownArrows
                    goToNext={goToNextUser}
                    goToPrevious={goToPreviousUser}
                  />
                }
              >
                <TrayTitle className="sr-only">{selectedUser?.name}</TrayTitle>
                {selectedUser && <UserView user={selectedUser} />}
              </TrayContent>
            </Tray>
          );
        })}
      </div>
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}

function UpDownArrows({
  goToNext,
  goToPrevious,
}: React.HTMLAttributes<HTMLDivElement> & {
  goToNext: () => void;
  goToPrevious: () => void;
}) {
  useEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      goToNext();
    } else if (e.key === "ArrowUp") {
      goToPrevious();
    }
  });

  return (
    <>
      <Button onClick={goToNext} size="icon" variant="outline">
        <ArrowDownIcon className="size-4" />
      </Button>
      <Button onClick={goToPrevious} size="icon" variant="outline">
        <ArrowUpIcon className="size-4" />
      </Button>
    </>
  );
}
