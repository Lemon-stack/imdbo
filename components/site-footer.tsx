import Link from "next/link";
import { SiteContainer } from "./site-container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <SiteContainer className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Imdbo. Extract product data from images.</p>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Submissions
          </Link>
        </nav>
      </SiteContainer>
    </footer>
  );
}