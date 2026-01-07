import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MiniAppProvider from "./components/MiniAppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_URL || "https://your-app.com";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Locate Me",
    description: "A Farcaster mini app to locate and share your position.",
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/embed-image.png`,
        button: {
          title: "Launch Locate Me",
          action: {
            type: "launch_miniapp",
            name: "Locate Me",
            url: appUrl,
            splashImageUrl: `${appUrl}/splash.png`,
            splashBackgroundColor: "#000000",
          },
        },
      }),
      'base:app_id': '695ebda33ee38216e9af4ae2',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MiniAppProvider>{children}</MiniAppProvider>
      </body>
    </html>
  );
}
