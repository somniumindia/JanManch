import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <head>
        <meta name="theme-color" content="#2563EB" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
