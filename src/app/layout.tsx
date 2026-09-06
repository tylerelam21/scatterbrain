import type { Metadata } from "next";
import { Caveat, Fraunces, Geist, Geist_Mono } from "next/font/google";
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

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "scatterbrain",
  description: "Portfolio, journal, calendar, and brain in one place.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}
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
