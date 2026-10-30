import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mandje | Bespaar op je boodschappen",
  description:
    "Vergelijk voorbeeldprijzen voor je boodschappenlijstje en ontdek winkels in je buurt.",
  applicationName: "Mandje",
  openGraph: {
    title: "Mandje | Bespaar op je boodschappen",
    description:
      "Vergelijk voorbeeldprijzen voor je boodschappenlijstje en ontdek winkels in je buurt.",
    locale: "nl_NL",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8f5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
