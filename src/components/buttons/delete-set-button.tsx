import { Loader2Icon, TrashIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useDeleteSet } from "~/lib/hooks/rius";

export default function DeleteSetButton({ setId }: { setId: number }) {
  const deleteSet = useDeleteSet();

  return (
    <Button
      className="focus:bg-red-700 focus:text-white"
      onClick={() =>
        deleteSet.mutate({
          data: {
            setId,
          },
        })
      }
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      {deleteSet.isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <TrashIcon className="size-4" />
      )}
    </Button>
  );
}
