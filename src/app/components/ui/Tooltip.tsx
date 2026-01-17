import type { ReactNode } from "react";

type TooltipProps = {
  text: string;
  children: ReactNode;
  position?: "top" | "bottom";
};

export function Tooltip({ text, children, position = "top" }: TooltipProps) {
  return (
    <div className="relative group flex justify-center items-center">
      {children}

      <div
        className={`absolute left-1/2 -translate-x-1/2whitespace-nowrap px-2 py-1 rounded dark:bg-neutral-500 bg-neutral-300  text-sm shadow-md
          opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out
          ${position === "top" ? "bottom-14" : "top-14"}
        `}
      >
        {text}

        <div
          className={`absolute left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-l-transparent border-r-transparent
            ${
              position === "top"
                ? "top-full border-t-8 dark:border-t-neutral-500 border-t-neutral-300"
                : "bottom-full border-b-8 dark:border-b-neutral-50 border-b-neutral-300"
            }
          `}
        />
      </div>
    </div>
  );
}
