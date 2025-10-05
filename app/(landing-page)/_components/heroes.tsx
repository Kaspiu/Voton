import { ArrowUpDown, Folders, LockKeyhole, Palette } from "lucide-react";

import { Card } from "./card";

const cardData = [
  [
    {
      icon: Folders,
      title: "Hierarchical Organization",
      description:
        "Create nested pages within pages to build your perfect knowledge structure. Organize your thoughts with unlimited nesting levels and intuitive sidebar navigation that works like your mind.",
    },
    {
      icon: Palette,
      title: "Visual Personalization",
      description:
        "Make every page uniquely yours with custom cover images and emoji icons. Upload images to set the perfect mood for each note and transform your workspace into an inspiring canvas.",
    },
  ],
  [
    {
      icon: LockKeyhole,
      title: "True Offline-First",
      description:
        "Your data lives entirely in your browser - no servers, no accounts required. Work anywhere with complete privacy and lightning-fast performance thanks to local IndexedDB storage.",
    },
    {
      icon: ArrowUpDown,
      title: "Seamless Data Portability",
      description:
        "Export all your notes to a single JSON file and import them on any device instantly. Switch between computers or backup your thoughts with just one click.",
    },
  ],
];

const Heroes = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-y-12 py-24">
      {cardData.map((cardGroup, groupIndex) => (
        <div
          key={groupIndex}
          className="flex flex-wrap items-center justify-center gap-y-12 text-center"
        >
          {cardGroup.map((card, cardIndex) => (
            <Card key={cardIndex} {...card} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Heroes;
