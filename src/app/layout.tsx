import type { Metadata, Viewport } from "next";
import { Mukta, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const mukta = Mukta({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "devanagari"],
  variable: "--font-mukta",
  display: "swap",
});

const tiroHindi = Tiro_Devanagari_Hindi({
  weight: "400",
  subsets: ["latin", "devanagari"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://janmanch.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "JanManch | Digital Town Hall & Citizen Agora",
  description:
    "India's modern platform for citizen-to-citizen democratic discourse, perspective sharing, and structured policy debates.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JanManch",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "JanManch | Digital Town Hall & Citizen Agora",
    description:
      "India's modern platform for citizen-to-citizen democratic discourse, perspective sharing, and structured policy debates.",
    url: siteUrl,
    siteName: "JanManch Citizen Agora",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "JanManch Digital Town Hall & Citizen Agora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JanManch | Digital Town Hall & Citizen Agora",
    description:
      "India's modern platform for citizen-to-citizen democratic discourse, perspective sharing, and structured policy debates.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F5F9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mukta.variable} ${tiroHindi.variable} h-full bg-paper`}>
      <head>
        <meta name="theme-color" content="#F6F5F9" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full bg-paper text-ink font-body antialiased selection:bg-accent selection:text-white">
        {children}
      </body>
    </html>
  );
}
