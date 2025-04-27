import { redirect } from "next/navigation";
import qs from "query-string";

export function redirectWithFlash(
  url: string,
  flash: string,
  flashTimeout = 5000,
) {
  redirect(
    qs.stringifyUrl({
      query: {
        flash,
        flashTimeout,
      },
      url,
    }),
  );
}
