import type { Metadata } from "next";

import { SiteHeader } from "@/components/navigation/site-header";
import { getCurrentUserProfile } from "@/lib/auth/guards";

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

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SiteHeader
          email={session?.profile.email ?? session?.user.email}
          role={session?.profile.role}
        />
        {children}
      </body>
    </html>
  );
}
