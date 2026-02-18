import Link from "next/link";

import { Logo } from "@/components/logo";

const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-between p-6">
      <Link href="/" className="select-none">
        <Logo />
      </Link>

      <p className="text-sm font-medium text-muted-foreground">© 2026 Voton</p>
    </footer>
  );
};

export default Footer;
