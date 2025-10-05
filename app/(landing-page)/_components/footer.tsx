import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <div className="flex w-full items-center justify-between bg-background p-6">
      <Logo />
      <p className="text-sm font-medium text-ring">
        © 2025 Voton
        <span className="max-sm:hidden">. All Rights Reserved.</span>
      </p>
    </div>
  );
};

export default Footer;
