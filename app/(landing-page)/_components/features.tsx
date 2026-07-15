import {
  DatabaseBackup,
  FileText,
  FolderTree,
  LockKeyhole,
  LucideIcon,
  Palette,
} from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FIRST_ROW_FEATURES: FeatureCardProps[] = [
  {
    icon: FolderTree,
    title: "Infinite organization",
    description:
      "Create unlimited folders and pages with infinite nesting. Pin key items to the top for instant access and build hierarchies as simple or complex as your mind demands.",
  },
  {
    icon: Palette,
    title: "Visual identity",
    description:
      "Add custom cover images, choose from hundreds of emoji icons, and color-code folders to categorize your workspace uniquely.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy by design",
    description:
      "Zero servers. Zero tracking. Zero compromises. Your data lives securely in your browser's IndexedDB, giving you complete control.",
  },
];

const SECOND_ROW_FEATURES: FeatureCardProps[] = [
  {
    icon: DatabaseBackup,
    title: "One-click backup",
    description:
      "Export your entire workspace to a single JSON file in seconds. Import it on any device. Your knowledge base travels with you in a single, portable file.",
  },
  {
    icon: FileText,
    title: "Rich text editing",
    description:
      "A clean, distraction-free editor. Format text with headers, lists, and more. Track your progress with live word and character counts.",
  },
];

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="group flex flex-1 flex-col items-center gap-4 rounded-lg border bg-background p-8 shadow-xs text-center transition-all hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50">
    <div className="p-2">
      <Icon className="h-8 w-8 max-lg:h-6 max-lg:w-6" />
    </div>
    <h3 className="text-2xl font-bold max-lg:text-xl">{title}</h3>
    <p className="text-base leading-relaxed text-muted-foreground transition-all group-hover:text-primary/70 max-sm:text-sm">
      {description}
    </p>
  </div>
);

const Features = () => {
  return (
    <div id="features" className="flex w-full flex-col items-center py-24">
      <div className="mb-12 flex max-w-6xl flex-col items-center gap-4 text-center max-xl:max-w-3xl max-lg:max-w-3/4">
        <h2 className="text-5xl font-bold max-lg:text-3xl">
          Build your thinking space.
        </h2>
        <p className="text-xl text-muted-foreground max-sm:text-lg">
          From daily journals to research databases, Voton adapts to your
          workflow. Create a knowledge system that grows with you.
        </p>
      </div>

      <div className="mb-8 flex w-full max-w-6xl gap-8 max-xl:max-w-3xl max-lg:max-w-3/4 max-lg:flex-col">
        {FIRST_ROW_FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="flex w-full max-w-4xl gap-8 max-xl:max-w-2xl max-lg:max-w-3/4 max-lg:flex-col">
        {SECOND_ROW_FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default Features;
