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
  title: {
    default: "Imdbo — Extract Product Data from Images",
    template: "%s · Imdbo",
  },
  description:
    "Upload product packaging images and automatically extract barcode, brand, weight, and 7 other fields — with confidence scores on every value.",
  keywords: [
    "product data extraction",
    "barcode scanner",
    "packaging OCR",
    "product information",
    "AI extraction",
  ],
  authors: [{ name: "Imdbo" }],
  openGraph: {
    title: "Imdbo — Extract Product Data from Images",
    description:
      "Upload product packaging images and automatically extract 10 structured fields with confidence scores.",
    type: "website",
    siteName: "Imdbo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imdbo — Extract Product Data from Images",
    description:
      "Upload product packaging images and automatically extract 10 structured fields with confidence scores.",
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23000'/><text x='50' y='68' font-size='52' font-weight='bold' text-anchor='middle' fill='white' font-family='sans-serif'>i</text></svg>",
      },
    ],
  },
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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
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
