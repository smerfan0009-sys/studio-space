"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircle2,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
} from "lucide-react";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark")
    ? ("dark" as const)
    : ("light" as const);
}

function getServerSnapshot() {
  return "light" as const;
}

function Toaster({ ...props }: ToasterProps) {
  // Follows the app's hand-rolled `.dark` class instead of next-themes.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors
      icons={{
        success: <CheckCircle2 className="size-4" />,
        info: <Info className="size-4" />,
        warning: <TriangleAlert className="size-4" />,
        error: <OctagonX className="size-4" />,
        loading: <Loader2 className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
