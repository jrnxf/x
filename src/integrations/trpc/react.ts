import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { TRPCRouter } from "~/integrations/trpc/router";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<TRPCRouter>();
