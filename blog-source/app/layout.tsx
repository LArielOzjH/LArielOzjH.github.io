import type { Metadata } from "next";
import { Chakra_Petch, Geom, Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"]
});

const geom = Geom({
 variable: "--font-geom",
 subsets: ["latin"]
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: "LArielo Jotting",
    template: "%s | LArielo Jotting"
  },
  description: "Research notes on machine learning systems, hardware, experiments."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${raleway.variable} ${geom.variable} ${chakraPetch.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
