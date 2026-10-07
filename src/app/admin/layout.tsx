import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminShell>
      <AdminNavigation />
      {children}
    </AdminShell>
  );
}
