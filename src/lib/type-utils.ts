import { type NextRequest, type NextResponse } from "next/server";

export type NextResponseData<
  T extends (request: NextRequest, arguments_: never) => Promise<NextResponse>,
> = Awaited<ReturnType<T>> extends NextResponse<infer K> ? K : never;

export type Prettify<T> = NonNullable<unknown> & {
  [K in keyof T]: T[K];
};
