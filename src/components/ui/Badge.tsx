import { cn } from "@/utils/utils";

export default function Badge({
  label = "VIP",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-yellow-600 px-2 py-0.5 text-xs font-semibold text-white select-none",
        className,
      )}
    >
      {label}
    </span>
  );
}
