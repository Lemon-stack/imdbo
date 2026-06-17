import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, Space_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { UploadProvider } from "@/components/upload-provider";
import { RootProvider } from "fumadocs-ui/provider/next";
import { AppChrome } from "@/components/app-chrome";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Imdbo — Extract Product Data from Images",
    template: "%s · Imdbo",
  },
  description:
    "Upload product packaging images and automatically extract 13 structured fields — barcode, brand, weight, packaging type, and more — with confidence scores on every value.",
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
        instrumentSans.variable,
        instrumentSerif.variable,
        spaceMono.variable,
        "font-sans",
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){document.documentElement.classList.remove('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RootProvider>
          <Providers>
            <UploadProvider>
              <AppChrome>{children}</AppChrome>
            </UploadProvider>
          </Providers>
        </RootProvider>
      </body>
    </html>
  );
}
