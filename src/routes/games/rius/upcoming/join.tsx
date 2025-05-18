import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { type z } from "zod";
import { Button } from "~/components/ui/button";
import { FormMessage, FormSubmitButton } from "~/components/ui/form";
import { FormOpsProvider } from "~/components/ui/form-ops-provider";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { VideoInput } from "~/components/video-input";
import { useCreateSet } from "~/lib/hooks/rius";
import { createRiuSet } from "~/server/fns/games/rius/sets";
import { getUpcomingRiuRoster } from "~/server/fns/games/rius/upcoming/roster";

export const Route = createFileRoute("/games/rius/upcoming/join")({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      getUpcomingRiuRoster.queryOptions(),
    );
  },
});

function RouteComponent() {
  const { data } = useSuspenseQuery(getUpcomingRiuRoster.queryOptions());

  return (
    <div>
      <h1>Join</h1>
      {data.authUserSets && data.authUserSets.length === 3 ? (
        <>
          <p>You have already uploaded all the allowable sets!</p>
          <Button asChild>
            <Link to="/games/rius/upcoming">Back</Link>
          </Button>
        </>
      ) : (
        <JoinRiuForm />
      )}
    </div>
  );
}

function JoinRiuForm() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<z.infer<typeof createRiuSet.schema>>({
    resolver: zodResolver(createRiuSet.schema),
  });

  const createSet = useCreateSet();

  return (
    <div className="mx-auto w-full max-w-xl">
      <FormOpsProvider>
        <form
          className="flex flex-col gap-4"
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit((data) => {
              createSet.mutate({ data });
            })(event);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input {...register("name")} id="name" />
            <FormMessage error={errors.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea {...register("description")} id="description" rows={2} />
            <FormMessage error={errors.description} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUploadId">Video</Label>
            <Controller
              control={control}
              name="videoUploadId"
              render={({ field: { onChange } }) => {
                return <VideoInput id="videoUploadId" onChange={onChange} />;
              }}
            />
            <FormMessage error={errors.videoUploadId} />
          </div>

          <div className="flex justify-between gap-2">
            <Button asChild type="button" variant="outline">
              <Link to="/games/rius/upcoming">Cancel</Link>
            </Button>
            <FormSubmitButton busy={createSet.isPending} />
          </div>
        </form>
      </FormOpsProvider>
    </div>
  );
}
