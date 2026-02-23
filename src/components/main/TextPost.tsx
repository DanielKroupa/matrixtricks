import type { ReactNode } from "react";

import { cn } from "@/utils/utils";

type TextPostProps = {
  title: ReactNode;
  body: ReactNode;
  className?: string;
};

export function TextPost({ title, body, className }: TextPostProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-neutral-300 px-4 py-2 dark:bg-neutral-700",
        className,
      )}
    >
      <h3 className="px-2 py-4 text-xl">{title}</h3>
      <p className="text-normal p-2">{body}</p>
    </div>
  );
}
