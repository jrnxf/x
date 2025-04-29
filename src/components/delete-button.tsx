import { Button } from "~/components/ui/button";

/**
 *
 * @param recordId the id of the record to delete
 * @param serverAction the serverAction to process the delete
 * @returns
 */
export function DeleteButton({
  recordId,
  serverAction,
}: {
  recordId: number;
  serverAction: (recordId: number) => void;
}) {
  return (
    <Button
      onClick={() => {
        serverAction(recordId);
      }}
      variant="destructive"
    >
      Delete
    </Button>
  );
}
