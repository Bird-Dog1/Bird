import { DashboardNav } from "@/components/navigation/dashboard-nav";
import { AdminLayout } from "@/components/admin/admin-shell";
import { requireUserProfile } from "@/lib/auth/guards";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await requireUserProfile();

  if (profile.role === "admin") {
    return <AdminLayout profile={profile}>{children}</AdminLayout>;
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
      <DashboardNav role={profile.role} />
      <section className="min-w-0">{children}</section>
    </main>
  );
}
