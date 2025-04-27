"use client";

import { Button } from "~/components/ui/button";

/**
 *
 * @param entityId the id of the entity to delete
 * @param serverAction the serverAction to process the delete
 * @returns
 */
export function DeleteButton({
  entityId,
  serverAction,
}: {
  entityId: number;
  serverAction: (entityId: number) => void;
}) {
  return (
    <Button
      onClick={() => {
        serverAction(entityId);
      }}
      variant="destructive"
    >
      Delete
    </Button>
  );
}
