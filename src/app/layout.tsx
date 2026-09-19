import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NELSON COMPUTER INSTITUTE - Best Computer Coaching",
  description: "Nelson Computer Institute - Best Computer Coaching with Govt Certificate & 100% Placement Support. Courses: ADCA, DCA, CCC, Tally, O Level, Python, AI, Web Development.",
  keywords: ["Nelson Computer Institute", "Computer Coaching", "ADCA", "DCA", "CCC", "Tally", "Computer Course", "IT Training"],
  authors: [{ name: "Nelson Computer Institute" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "NELSON COMPUTER INSTITUTE",
    description: "Best Computer Coaching with Govt Certificate & 100% Placement Support",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
