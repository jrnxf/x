import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useLogin } from "~/lib/session";
import { loginSchema } from "~/models/auth";

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
  const form = useForm<z.infer<typeof loginSchema>>({
    defaultValues: {
      email: "",
      password: "",
      redirect: "/",
    },
    resolver: zodResolver(loginSchema),
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = form;

  const { data, isPending, mutate } = useLogin();

  return (
    <div className="mx-auto w-full max-w-xl p-8" id="main-content">
      <FormProvider {...form}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit((data) => {
              mutate(data);
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
          {data && data.errorMessage && (
            <p className="text-destructive mt-2 font-medium">
              {data.errorMessage}
            </p>
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
