"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteContainer } from "./site-container";
import { useTheme } from "./theme-provider";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
    >
      {theme === "light" ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354Z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
        </svg>
      )}
    </button>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const linkClass =
    "rounded-full border border-transparent px-2.5 py-2 text-sm font-semibold tracking-[-0.5px] text-muted-foreground transition-colors hover:border-[#2670DC] hover:bg-muted hover:text-foreground";

  return (
    <header className="pt-4">
      <SiteContainer>
        <div className="mx-auto flex min-h-12 w-fit max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl border border-border bg-card/90 px-3 py-2 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 px-1">
            <span className="font-serif text-2xl text-foreground tracking-normal">
              Imdbo
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-1">
            {pathname !== "/" && (
              <Link
                href="/"
                className={linkClass}
              >
                Home
              </Link>
            )}
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className={linkClass}
              >
                Submissions
              </Link>
            )}
            <Link
              href="/#how-it-works"
              className={linkClass}
            >
              How it works
            </Link>
            <Link
              href="/docs/setup"
              target="_blank"
              rel="noreferrer"
              className={linkClass}
            >
              Setup
            </Link>
            <Link
              href="/#faq"
              className={linkClass}
            >
              FAQ
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </SiteContainer>
    </header>
  );
}
