"use client";
// context https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

// nextjs requires that we wrap anything that needs the useSearchParams hook in
// Suspense. since I only need the params for things that occur after the load
// is finished (e.g. form submission) and I don't want to block the UI w/
// suspense, this is a good way of setting the redirect in a non-UI blocking way

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import { useFormContext } from "react-hook-form";

export const RedirectInput = React.memo(Suspender);

function Suspendend() {
  const { register, setValue } = useFormContext();
  const searchParameters = useSearchParams();

  useEffect(() => {
    const redirect = searchParameters.get("redirect");

    if (redirect) {
      setValue("redirect", redirect);
    }
  }, [searchParameters, setValue]);

  return <input {...register("redirect")} hidden type="hidden" />;
}

function Suspender() {
  return (
    <Suspense>
      <Suspendend />
    </Suspense>
  );
}
