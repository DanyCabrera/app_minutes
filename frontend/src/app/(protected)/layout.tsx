import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { adminRequiresAal2 } from "@/lib/env";
import { isJwtAal2 } from "@/lib/jwt-aal";
import { getMyRole } from "@/lib/session-role";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getMyRole();

  if (role === "admin" && adminRequiresAal2()) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!isJwtAal2(session?.access_token)) {
      redirect("/account/mfa");
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar email={user?.email ?? null} role={role} />
      <SidebarInset>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-5 sm:py-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
