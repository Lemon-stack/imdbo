import type { Metadata } from "next";
import { Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadProvider } from "@/components/upload-provider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imdbo — Extract Product Data from Images",
  description:
    "Upload product packaging images and automatically extract barcode, brand, weight, and 7 other fields.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistMono.variable,
        "font-sans",
        bricolage.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <UploadProvider>
            <AppHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </UploadProvider>
        </Providers>
      </body>
    </html>
  );
}
