import type { Metadata } from "next";
import { Geist_Mono, Inter, Kalam, Newsreader } from "next/font/google";
import Script from "next/script";
import { auth } from "@/lib/auth";
import { Nav } from "@/components/nav";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headline serif for the new "warm editorial minimalism" identity —
// replaces Fraunces site-wide.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  weight: "700",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tyler elam.",
  description: "Tyler Elam — builder, writer, and curious generalist based in Atlanta.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${newsreader.variable} ${kalam.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <Nav session={session} />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
