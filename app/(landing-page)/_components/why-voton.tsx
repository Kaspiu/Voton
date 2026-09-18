const REASONS = [
  {
    title: "Instant performance",
    description:
      "Minimal loading times. IndexedDB storage ensures instant access, millisecond search, and auto-saving.",
  },
  {
    title: "True privacy",
    description:
      "Local-first design. No servers, no tracking. Your data stays securely on your device.",
  },
  {
    title: "Focused simplicity",
    description:
      "No distractions. A clean interface with a dedicated Focus mode designed to help you think, write, and organize.",
  },
];

const WhyVoton = () => {
  return (
    <div className="flex w-full flex-col items-center gap-12 py-24">
      <h2 className="text-center text-5xl font-bold max-lg:text-3xl">
        Why Voton?
      </h2>

      <div className="flex max-w-6xl justify-center max-xl:max-w-3xl max-lg:max-w-3/4 max-lg:flex-col max-lg:items-center">
        {REASONS.map(({ title, description }) => (
          <div
            key={title}
            className="group flex w-full flex-col items-center gap-4 rounded-lg p-8 text-center transition-all hover:bg-accent max-lg:max-w-4/5 max-lg:rounded-md dark:hover:bg-input/30"
          >
            <h3 className="text-2xl font-bold max-lg:text-xl">{title}</h3>
            <p className="text-lg leading-relaxed text-muted-foreground max-sm:text-base">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyVoton;
