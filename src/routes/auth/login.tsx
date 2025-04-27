import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { login } from "~/server/fns/auth/login";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        flash: z.string().optional(),
        redirect: z.string().optional(),
      })
      .optional()
      .parse(search);
  },
});

function RouteComponent() {
  const search = Route.useSearch();
  const router = useRouter();

  const form = useForm<z.infer<typeof login.schema>>({
    defaultValues: {
      email: "",
      password: "",
      redirect: "/auth/me",
    },
    resolver: zodResolver(login.schema),
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const { data, isPending, mutate } = useMutation({
    mutationFn: login.serverFn,
    onSuccess: async (data) => {
      if (data.success) {
        const redirectPath = search?.redirect ?? "/auth/me";

        router.navigate({ to: redirectPath });
      }
    },
  });

  return (
    <div className="mx-auto w-full max-w-xl p-8" id="main-content">
      <FormProvider {...form}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit((data) => {
              mutate({
                data: {
                  ...data,
                  redirect: search?.redirect ?? "/auth/me",
                },
              });
            })(event);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input {...register("email")} autoFocus id="email" />
            <FormMessage error={errors.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input {...register("password")} id="password" type="password" />
            <FormMessage error={errors.password} />
          </div>
          {data && (
            <p className="text-destructive mt-2 font-medium">{data.message}</p>
          )}
          <div className="flex flex-row-reverse items-center justify-between">
            <Button
              disabled={isPending}
              iconLeft={
                isPending && <Loader2Icon className="size-4 animate-spin" />
              }
              type="submit"
            >
              <span>{isPending ? "Logging in" : "Log in"}</span>
            </Button>
            <Button asChild type="button" variant="secondary">
              <Link to="/auth/register">Register</Link>
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
