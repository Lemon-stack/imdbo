"use client";

import { UploadForm } from "@/components/upload-form";
import { SiteContainer } from "@/components/site-container";
import { useUpload } from "@/components/upload-provider";

const EXAMPLE_FIELDS = [
  { label: "Barcode", value: "5012345678900", confidence: 0.95 },
  { label: "Brand", value: "Coca-Cola", confidence: 0.92 },
  { label: "Product Name", value: "Coke Zero 500ml", confidence: 0.85 },
  { label: "Weight", value: "500ml", confidence: 0.91 },
  { label: "Packaging", value: "Bottle", confidence: 0.8 },
  { label: "Country", value: "USA", confidence: 0.76 },
];

function ConfidenceDot({ score }: { score: number }) {
  const color =
    score >= 0.8 ? "bg-green-500" : score >= 0.5 ? "bg-yellow-500" : "bg-red-500";
  return <span className={`w-1.5 h-1.5 rounded-full ${color}`} />;
}

function ExampleCard() {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-2">
        <div className="aspect-square bg-muted flex items-center justify-center p-6 border-r border-border">
          <div className="text-center space-y-2">
            <div className="w-20 h-24 mx-auto bg-background border border-border rounded-md flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">Product image</p>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Extracted</span>
            <span className="text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-medium">87% avg</span>
          </div>
          {EXAMPLE_FIELDS.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-2 py-1 border-b border-border last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <ConfidenceDot score={field.confidence} />
                <span className="text-xs text-muted-foreground truncate">{field.label}</span>
              </div>
              <span className="text-xs font-medium text-foreground truncate">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { title: "Upload", body: "Drop front and back images of any product package." },
  { title: "Extract", body: "AI reads the packaging and pulls 10 structured fields." },
  { title: "Verify", body: "Review confidence scores, edit anything that's off, export." },
];

export default function Home() {
  const { openUpload } = useUpload();

  return (
    <>
      <section className="py-16 sm:py-24">
        <SiteContainer>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                13 fields per image
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight leading-[1.05]">
                Extract product data from images.
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Upload packaging photos and automatically pull barcode, brand, weight, and 12 more fields — with confidence scores on every value.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={openUpload}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-md text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload an image
                </button>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground px-3 py-2.5 transition-colors"
                >
                  How it works
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </a>
              </div>
            </div>
            <ExampleCard />
          </div>
        </SiteContainer>
      </section>

      <section className="pb-16">
        <SiteContainer size="narrow">
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-1">Try it now</h2>
            <p className="text-sm text-muted-foreground mb-6">Front image required, back optional.</p>
            <UploadForm />
          </div>
        </SiteContainer>
      </section>

      <section id="how-it-works" className="py-16 border-t border-border">
        <SiteContainer>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">How it works</h2>
            <p className="text-muted-foreground mt-2">Three steps, no signup.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="bg-card border border-border rounded-xl p-6 space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-foreground pt-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </SiteContainer>
      </section>

      <section className="py-12 border-t border-border">
        <SiteContainer>
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-foreground">13</div>
              <p className="text-sm text-muted-foreground">Fields per image</p>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-foreground">2</div>
              <p className="text-sm text-muted-foreground">Image angles</p>
            </div>
            <div className="text-center space-y-1">
              <div className="text-3xl font-bold text-foreground">0</div>
              <p className="text-sm text-muted-foreground">Logins required</p>
            </div>
          </div>
        </SiteContainer>
      </section>
    </>
  );
}
