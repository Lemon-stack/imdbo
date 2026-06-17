"use client";

import Link from "next/link";
import { SiteContainer } from "@/components/site-container";
import { LobsterTaskShowcase } from "@/components/lobster-task-showcase";
import { HeroLobsterHands } from "@/components/hero-lobster-hands";

const YOUTUBE_VIDEO_URL = "https://youtu.be/RR-KAuNGVfI";
const YOUTUBE_THUMBNAIL_URL = "https://img.youtube.com/vi/RR-KAuNGVfI/maxresdefault.jpg";

const HOW_IT_WORKS = [
  {
    title: "Upload images",
    body: "Open the dashboard upload modal and add the front package image. Add the back image when it contains extra details.",
  },
  {
    title: "Extract fields",
    body: "Click Extract Data. The extractor reads the package and returns the structured submission fields with confidence.",
  },
  {
    title: "Review and export",
    body: "Review the submission table, open row details when needed, and export the collected data as CSV.",
  },
];

const FAQS = [
  {
    question: "Do users need an account to upload?",
    answer: "No. The current flow lets users upload from the dashboard modal without authentication.",
  },
  {
    question: "Can users upload one image?",
    answer: "Yes. The front image is required and the back image is optional.",
  },
  {
    question: "Where does CSV show?",
    answer: "CSV is export-only. The dashboard renders a table and the Export CSV button downloads the file.",
  },
  {
    question: "What will the setup guide cover?",
    answer: "The setup guide lives in the docs and covers OpenAI credits, API keys, database connection, migrations, local startup, and Vercel deployment.",
  },
];

function VideoEmbed() {
  return (
    <a
      href={YOUTUBE_VIDEO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Watch the Imdbo demo video on YouTube"
      className="group block overflow-hidden rounded-2xl border border-border bg-black shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-video">
        <img
          src={YOUTUBE_THUMBNAIL_URL}
          alt="Imdbo demo video preview"
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="relative inline-flex h-24 w-24 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0DDE53]/45" />
            <span className="absolute inline-flex h-20 w-20 animate-pulse rounded-full border border-white/70 bg-white/20 backdrop-blur-sm" />
            <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#0042AB] shadow-[0_14px_40px_rgba(0,0,0,0.32)] transition-transform group-hover:scale-110">
              <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            </span>
          </span>
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-black/65 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
          Watch the demo
        </div>
      </div>
    </a>
  );
}

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-18">
        <HeroLobsterHands />
        <SiteContainer>
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-xl space-y-6">
              <h1 className="text-5xl font-bold leading-[1.04] tracking-[-0.5px] text-foreground sm:text-6xl">
                Do more with less action.
              </h1>
              <p className="max-w-md text-lg leading-7 tracking-[-0.5px] text-foreground">
                Upload one or two product photos, review the extracted fields in a submissions table, then export the finished data as CSV.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/dashboard?upload=1"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#0042AB] px-6 text-sm font-semibold tracking-[-0.5px] text-white transition-transform active:translate-y-px"
                  style={{ backgroundImage: "var(--cta-gradient)" }}
                >
                  Upload an image
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm font-semibold tracking-[-0.5px] text-primary transition-colors hover:bg-muted"
                >
                  View submissions
                </Link>
              </div>
            </div>
            <VideoEmbed />
          </div>
        </SiteContainer>
      </section>

      <section id="how-it-works" className="py-14">
        <LobsterTaskShowcase />
        <SiteContainer>
          <div className="mb-6 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.5px] text-foreground">How it works</h2>
            <p className="mt-2 text-base text-muted-foreground">
              The core workflow stays on the dashboard: upload, extract, review, export.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.title} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                  {index + 1}
                </div>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      <section id="faq" className="py-14">
        <SiteContainer>
          <div className="mb-6 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-[-0.5px] text-foreground">FAQ</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Short answers for the upload and export flow.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-border bg-card p-4">
                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>
    </>
  );
}
