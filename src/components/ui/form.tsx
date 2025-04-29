import { Loader2Icon } from "lucide-react";
import { type FieldError, type Merge } from "react-hook-form";

import {
  Button,
  type ButtonProps as ButtonProperties,
} from "~/components/ui/button";
import { useFormOps } from "~/components/ui/form-ops-provider";

export function FormMessage({
  error,
}: {
  error: Merge<FieldError, (FieldError | undefined)[]> | undefined;
}) {
  return error ? (
    <p className="text-destructive text-sm font-medium">{error.message}</p>
  ) : null;
}

export function FormSubmitButton({
  busy,
  busyText = "Submitting",
  idleText = "Submit",
  ...properties
}: ButtonProperties & {
  busy?: boolean;
  busyText?: string;
  idleText?: string;
}) {
  const { uploadInProgress } = useFormOps();
  const disabled = busy || uploadInProgress;

  return (
    <Button
      disabled={disabled}
      iconLeft={busy && <Loader2Icon className="size-4 animate-spin" />}
      type="submit"
      {...properties}
    >
      <span>{busy ? busyText : idleText}</span>
    </Button>
  );
}
