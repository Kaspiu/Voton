import Link from "next/link";
import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <div className="flex w-full items-center justify-between p-6">
      <Link href="/" className="select-none">
        <Logo />
      </Link>

      <p className="text-sm font-medium text-muted-foreground">© 2026 Voton</p>
    </div>
  );
};

export default Footer;
