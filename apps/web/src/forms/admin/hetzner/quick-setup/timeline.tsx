import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconCircle,
  IconCircleCheckFilled,
  IconLoader2,
} from "@tabler/icons-react";

export type TimelineItem = {
  label: string;
  sub?: string;
  state: "done" | "active" | "pending" | "warning";
};

const ICONS = {
  done: {
    Icon: IconCircleCheckFilled,
    className: "text-primary",
    text: "Done",
  },
  active: {
    Icon: IconLoader2,
    className: "animate-spin text-primary",
    text: "In progress",
  },
  pending: {
    Icon: IconCircle,
    className: "text-muted-foreground",
    text: "Pending",
  },
  warning: {
    Icon: IconAlertTriangle,
    className: "text-yellow-500",
    text: "Warning",
  },
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const { Icon, className, text } = ICONS[item.state];
        return (
          <li key={index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Icon aria-hidden className={cn("size-5 shrink-0", className)} />
              {index < items.length - 1 && (
                <span
                  className={cn(
                    "my-1 w-px flex-1",
                    item.state === "done" ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col pb-4">
              <span
                className={cn(
                  "text-sm font-medium",
                  item.state === "pending" && "text-muted-foreground",
                )}
              >
                {item.label}
                <span className="sr-only">: {text}</span>
              </span>
              {item.sub && (
                <span className="text-xs break-words text-muted-foreground">
                  {item.sub}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
