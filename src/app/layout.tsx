import type { Metadata } from "next";

import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getCurrentUserProfile } from "@/lib/auth/guards";
import { getEffectiveRole } from "@/lib/auth/roles";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Bird Dog",
    template: "%s | Bird Dog",
  },
  description:
    "Marketplace and dealership SaaS for monthly vehicle rentals backed by Supabase.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentUserProfile();
  const role = session ? getEffectiveRole(session.user, session.profile) : undefined;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader
          email={session?.profile.email ?? session?.user.email}
          role={role}
        />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
