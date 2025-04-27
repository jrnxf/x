import { ChevronDownIcon } from "lucide-react";
import { useRef } from "react";

import { useAuth } from "~/components/auth-provider";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function RecordOptions({
  onDeleteRecord,
  onEditRecord,
  onLikeUnlike,
  onShowReactions,
  record,
}: {
  onDeleteRecord: () => void;
  onEditRecord: () => void;
  onLikeUnlike: (action: "like" | "unlike") => void;
  onShowReactions: () => void;
  record: {
    likes: {
      user: {
        avatarUrl: null | string;
        id: number;
        name: string;
      };
    }[];
    user: {
      id: number;
    };
  };
}) {
  const { isAuthenticated, sessionUser } = useAuth();
  const menuTriggerReference = useRef<HTMLButtonElement>(null);

  if (!isAuthenticated && record.likes.length === 0) {
    return null;
  }

  const isOwnedByAuthUser = Boolean(
    sessionUser && sessionUser.id === record.user.id,
  );

  const isLikedByAuthUser = Boolean(
    sessionUser && record.likes.some((like) => like.user.id === sessionUser.id),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="transition-none"
          ref={menuTriggerReference}
          size="fit"
          variant="ghost"
        >
          <ChevronDownIcon className="size-5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent collisionPadding={8}>
        <DropdownMenuGroup>
          {isAuthenticated && (
            <DropdownMenuItem
              onClick={() => {
                onLikeUnlike(isLikedByAuthUser ? "unlike" : "like");
              }}
            >
              {isLikedByAuthUser ? "Unlike" : "Like"}
            </DropdownMenuItem>
          )}

          {record.likes.length > 0 && (
            <DropdownMenuItem onSelect={onShowReactions}>
              Reactions
            </DropdownMenuItem>
          )}

          {isOwnedByAuthUser && (
            <>
              <DropdownMenuItem onClick={onEditRecord}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-destructive"
                onClick={onDeleteRecord}
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
