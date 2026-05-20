import { DashboardNav } from "@/components/navigation/dashboard-nav";
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

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8">
      <DashboardNav role={profile.role} />
      <section>{children}</section>
    </main>
  );
}
