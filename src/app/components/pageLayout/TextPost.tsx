import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TextPostProps = {
  title: ReactNode;
  body: ReactNode;
  className?: string;
};

export function TextPost({ title, body, className }: TextPostProps) {
  return (
    <div
      className={cn(
        "dark:bg-neutral-700 rounded-md bg-neutral-300 py-2 px-4",
        className
      )}
    >
      <h3 className="text-xl py-4 px-2">{title}</h3>
      <p className="text-normal p-2">{body}</p>
    </div>
  );
}
