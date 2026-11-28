import { cn } from "@/lib/utils";

const STEPS = ["Connect Hetzner", "Server", "Launch"];

export default function Stepper({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {STEPS.map((label, index) => (
        <li
          key={label}
          aria-current={index === current ? "step" : undefined}
          className="flex flex-col gap-1"
        >
          <span
            className={cn(
              "h-1 rounded-full",
              index <= current ? "bg-primary" : "bg-muted",
            )}
          />
          <span
            className={cn(
              "text-xs",
              index === current ? "font-medium" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
