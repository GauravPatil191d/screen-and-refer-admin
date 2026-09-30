import type { Metadata } from "next";
import "./globals.css";
import { CMSShell } from "@/components/cms-shell";
import { LoginProvider } from "@/context/LoginContext";

export const metadata: Metadata = {
  title: "Screen & Refer - Doctor Portal",
  description: "Screen & Refer Clinical Doctor Portal and Referral System",
  icons: {
    icon: "/images/screening-refer-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F5F9FF] text-[#172B4D]">
        <LoginProvider>
          <CMSShell>{children}</CMSShell>
        </LoginProvider>
      </body>
    </html>
  );
}
