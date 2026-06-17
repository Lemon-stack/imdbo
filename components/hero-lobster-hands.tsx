"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HeroLobsterHands() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(".hero-lobster-peek-left", {
        xPercent: -18,
        rotate: -8,
        autoAlpha: 0.62,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      gsap.to(".hero-lobster-peek-right", {
        xPercent: 18,
        rotate: 8,
        autoAlpha: 0.62,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden [contain:paint]">
      <div className="hero-lobster-peek-left absolute -left-28 top-24 h-44 w-44 rotate-[18deg] opacity-95 sm:-left-36 sm:top-28 sm:h-56 sm:w-56 lg:-left-48 lg:top-32 lg:h-72 lg:w-72">
        <Image
          src="/assets/lobster-blue.png"
          alt=""
          width={500}
          height={500}
          className="h-full w-full object-contain object-left drop-shadow-[0_24px_44px_rgba(0,34,89,0.16)]"
          draggable={false}
        />
      </div>
      <div className="hero-lobster-peek-right absolute -right-28 bottom-20 h-44 w-44 rotate-[-18deg] scale-x-[-1] opacity-95 sm:-right-36 sm:bottom-24 sm:h-56 sm:w-56 lg:-right-48 lg:bottom-28 lg:h-72 lg:w-72">
        <Image
          src="/assets/lobster-blue.png"
          alt=""
          width={500}
          height={500}
          className="h-full w-full object-contain object-left drop-shadow-[0_24px_44px_rgba(0,34,89,0.14)]"
          draggable={false}
        />
      </div>
    </div>
  );
}
