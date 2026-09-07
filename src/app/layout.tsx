import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono, Kalam } from "next/font/google";
import Script from "next/script";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import { CommandPalette } from "@/components/command-palette";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  weight: "700",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "life-of-tyla",
  description: "Tyler Elam's personal hub — journal, calendar, ideas, work, and photography.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${kalam.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Nav session={session} />
        <div className="flex flex-1 flex-col">{children}</div>
        {session?.user?.role === "OWNER" && <CommandPalette />}
      </body>
    </html>
  );
}
