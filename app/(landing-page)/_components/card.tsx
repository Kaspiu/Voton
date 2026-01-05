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
        "flex flex-col items-center justify-center w-full max-w-xl h-96 gap-6 rounded-lg border bg-background p-12 mx-6 text-primary shadow-lg dark:bg-input/30 max-sm:w-4/5 max-sm:h-fit max-sm:p-10",
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
