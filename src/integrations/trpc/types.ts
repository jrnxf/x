import { type DefaultErrorShape } from "@trpc/server/unstable-core-do-not-import";
import { type typeToFlattenedError } from "zod";

export type EnhancedErrorShape = DefaultErrorShape & {
  data: DefaultErrorShape["data"] & {
    zodError?: typeToFlattenedError<unknown, string>;
  };
};
