import { useEffect, useState } from "react";

// Detects macOS on the client side to avoid hydration mismatch.
// Returns false during SSR and updates after mount.
export const useIsMac = (): boolean => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  return isMac;
};
