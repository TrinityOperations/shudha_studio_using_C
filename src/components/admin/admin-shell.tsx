"use client";

import { usePathname } from "next/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = pathname === "/admin/login" || pathname === "/admin/unauthorized";
  return (
    <div className={standalone ? "min-h-screen" : "min-h-screen lg:pl-72"}>
      {children}
    </div>
  );
}
