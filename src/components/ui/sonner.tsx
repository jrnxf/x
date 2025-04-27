"use client";

import { useTheme } from "next-themes";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProperties = React.ComponentProps<typeof Sonner>;

export function Toaster(properties: ToasterProperties) {
  const { theme = "system" } = useTheme();

  useFlashMessageToaster();

  return (
    <Sonner
      className="toaster group"
      position="top-center"
      theme={theme as ToasterProperties["theme"]}
      toastOptions={{
        classNames: {
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          description: "group-[.toast]:text-muted-foreground",
          toast:
            "group font-mono whitespace-pre-wrap toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        },
      }}
      {...properties}
    />
  );
}

function useFlashMessageToaster() {
  const [flash, setFlash] = useQueryState("flash");
  const [flashTimeout, setFlashTimeout] = useQueryState(
    "flashTimeout",
    parseAsInteger.withDefault(5000),
  );
  useEffect(() => {
    if (flash) {
      const clear = () => {
        setFlash(null);
        setFlashTimeout(null);
      };
      requestAnimationFrame(() => {
        // ensures the toast has a proper transition in
        toast(flash, {
          duration: flashTimeout,
          onAutoClose: clear,
          onDismiss: clear,
        });
      });
    }
  }, [flash, setFlash, flashTimeout, setFlashTimeout]);
}
