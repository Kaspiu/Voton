import { Zap, ShieldCheck, Target } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Instant performance",
    description:
      "Minimal loading times. IndexedDB storage ensures instant access, millisecond search, and auto-saving.",
  },
  {
    icon: ShieldCheck,
    title: "True privacy",
    description:
      "Local-first design. No servers, no tracking. Your data stays securely on your device.",
  },
  {
    icon: Target,
    title: "Focused simplicity",
    description:
      "No distractions. A clean interface designed to help you think, write, and organize.",
  },
];

const WhyVoton = () => {
  return (
    <div className="flex w-full flex-col items-center gap-12 py-24">
      <h2 className="text-5xl font-bold text-center max-lg:text-3xl">
        Why Voton?
      </h2>

      <div className="flex justify-center max-w-6xl max-xl:max-w-3xl max-lg:max-w-3/4 max-lg:flex-col max-lg:items-center">
        {reasons.map((reason, index) => {
          const Icon = reason.icon;
          return (
            <div
              key={index}
              className="group flex w-full flex-col items-center gap-4 rounded-lg p-8 text-center transition-all max-lg:rounded-md max-lg:max-w-4/5 hover:bg-accent dark:hover:bg-input/30"
            >
              <div className="rounded-md bg-primary p-3 text-primary-foreground transition-all group-hover:shadow-md group-hover:-translate-y-1">
                <Icon className="h-6 w-6 max-lg:w-4 max-lg:h-4" />
              </div>
              <h3 className="text-3xl font-bold max-lg:text-2xl">
                {reason.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-sm:text-base">
                {reason.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhyVoton;
