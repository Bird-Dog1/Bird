import { AdminLayout } from "@/components/admin/admin-shell";
import { DashboardNav } from "@/components/navigation/dashboard-nav";
import { getCurrentUserProfile } from "@/lib/auth/guards";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUserProfile();

  if (!session) {
    return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>;
  }

  if (session.profile.role === "admin") {
    return <AdminLayout profile={session.profile}>{children}</AdminLayout>;
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
      <DashboardNav role={session.profile.role} />
      <section className="min-w-0">{children}</section>
    </main>
  );
}
