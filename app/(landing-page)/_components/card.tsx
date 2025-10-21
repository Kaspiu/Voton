import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const Card = ({
  className,
  icon: Icon,
  title,
  description,
}: CardProps) => {
  return (
    <div
      className={cn(
        "mx-6 flex w-full max-w-lg flex-col items-center gap-6 rounded-md border bg-background p-12 text-primary shadow-lg dark:bg-input/30 max-sm:w-3/4 max-sm:p-8",
        className
      )}
    >
      <div className="rounded-md bg-primary p-3 text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-lg">{description}</p>
    </div>
  );
};
