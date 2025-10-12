import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <div className="flex w-full items-center justify-between bg-background p-6">
      <Logo />
      <p className="text-sm font-medium text-ring">© 2025 Voton</p>
    </div>
  );
};

export default Footer;
