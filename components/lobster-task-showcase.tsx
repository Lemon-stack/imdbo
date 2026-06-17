"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WORKFLOW_STEPS = [
  {
    label: "Upload",
    className: "left-[2%] top-[31%] border-[#2670DC] bg-[#E9F3FF]/95 text-[#002259]",
  },
  {
    label: "Extract",
    className: "right-[0%] top-[28%] border-[#0DDE53] bg-white/95 text-[#002259]",
  },
  {
    label: "Review",
    className: "left-[7%] bottom-[28%] border-[#B75000] bg-white/95 text-[#002259]",
  },
  {
    label: "Export CSV",
    className: "right-[5%] bottom-[26%] border-[#0042AB] bg-[#D7E7FE]/95 text-[#002259]",
  },
];

export function LobsterTaskShowcase() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(".lobster-rig", {
        autoAlpha: 1,
        y: 190,
        scale: 0.78,
        rotate: -5,
      });
      gsap.set(".workflow-step", { autoAlpha: 0, y: 96, scale: 0.82 });
      gsap.set(".workflow-trail", { autoAlpha: 0, scaleX: 0 });
      gsap.set(".workflow-title", { autoAlpha: 1, y: 0 });
      gsap.to(".lobster-bob", {
        y: -14,
        rotate: 1.5,
        duration: 1.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top 80%",
          end: "bottom 25%",
          scrub: 0.7,
        },
      });

      timeline
        .to(".workflow-title", { autoAlpha: 0, y: -18, duration: 0.12 }, 0.18)
        .to(".lobster-rig", { y: 20, scale: 0.92, rotate: 0, duration: 0.28 }, 0.18)
        .to(".workflow-trail", { autoAlpha: 1, scaleX: 1, duration: 0.14 }, 0.34)
        .to(".workflow-step", { autoAlpha: 1, y: 0, scale: 1, stagger: 0.035, duration: 0.18 }, 0.4)
        .to(".lobster-rig", { y: 0, rotate: 2, duration: 0.16 }, 0.6)
        .to(".workflow-step", { y: -10, stagger: 0.025, duration: 0.14 }, 0.62)
        .to(".lobster-rig", { y: 210, scale: 0.78, rotate: 5, autoAlpha: 1, duration: 0.24 }, 0.78)
        .to(".workflow-step", { y: 120, scale: 0.78, autoAlpha: 0, stagger: 0.025, duration: 0.18 }, 0.8)
        .to(".workflow-trail", { autoAlpha: 0, scaleX: 0.2, duration: 0.12 }, 0.9);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label="Scroll workflow transition"
      className="relative min-h-[680px] overflow-hidden"
    >
      <div className="relative flex min-h-[680px] items-start justify-center px-4 py-12">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px origin-center workflow-trail bg-gradient-to-r from-transparent via-[#2670DC]/45 to-transparent" />

        <div className="workflow-title absolute left-1/2 top-12 z-30 w-[min(680px,88vw)] -translate-x-1/2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.05em] text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.5px] text-foreground sm:text-4xl">
            Upload, extract, review, export.
          </h2>
        </div>

        <div className="lobster-rig absolute left-1/2 top-28 z-10 w-[min(460px,72vw)] -translate-x-1/2 translate-y-[190px] rotate-[-5deg] opacity-100">
          <div className="lobster-bob relative">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.label}
                className={`workflow-step absolute z-20 rounded-full border-2 px-4 py-2 text-sm font-semibold tracking-[-0.5px] shadow-[0_10px_30px_rgba(0,34,89,0.12)] backdrop-blur ${step.className}`}
              >
                {step.label}
              </div>
            ))}
            <Image
              src="/assets/lobster-blue.png"
              alt="Blue lobster carrying workflow tasks"
              width={900}
              height={900}
              priority={false}
              className="h-auto w-full select-none drop-shadow-[0_26px_44px_rgba(0,34,89,0.18)]"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
