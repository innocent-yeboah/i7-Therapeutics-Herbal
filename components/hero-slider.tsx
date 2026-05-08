"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { HERO_SLIDES } from "@/lib/hero-slides";

const INTERVAL_MS = 7200;

function randomSlideIndex(length: number, avoid: number): number {
  if (length <= 1) return 0;
  let next = avoid;
  while (next === avoid) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

export function HeroSlider() {
  const len = HERO_SLIDES.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setActive((i) => randomSlideIndex(len, i));
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused, len]);

  const current = HERO_SLIDES[active]!;

  return (
    <section
      className="relative isolate min-h-[min(92vh,920px)] w-full overflow-hidden border-b border-[var(--border)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured imagery — random views"
    >
      {/* Slides — full-bleed crossfade */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== active}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            i === active ? "z-[1] opacity-100" : "z-0 opacity-0"
          }`}
        >
          <div
            key={i === active ? `${slide.id}-active` : `${slide.id}-idle`}
            className={`absolute inset-0 ${i === active ? "hero-kenburns" : ""} motion-reduce:animate-none`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={i === 0}
              quality={90}
            />
          </div>
        </div>
      ))}

      {/* Overlays: depth, legibility — extra weight for high-contrast clinical lighting (e.g. infrared) */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-[#0a1628]/90 via-[#0f2912]/76 to-[#1e3a5f]/42 sm:from-[#0a1628]/85 sm:via-[#0f2912]/68 sm:to-[#1e3a5f]/36"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/58 via-transparent to-black/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_75%_55%_at_65%_42%,transparent,rgba(0,0,0,0.34))]"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[min(92vh,920px)] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/90 sm:text-[0.8125rem]">
            Awoshie Last Stop · Accra, Ghana
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.12] text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Holistic healing rooted in tradition, guided by care.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/88 sm:text-lg">
            {BRAND.name} brings together herbal wisdom, therapeutic touch, and mindful coaching
            — online and in person — so you can feel balanced in body and mind.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#256628] hover:shadow-xl"
            >
              Book a session
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-white/65 bg-white/[0.12] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white hover:bg-white hover:text-[var(--secondary)]"
            >
              Browse herbal products
            </Link>
          </div>
        </div>

        {/* Scene caption — random rotating views, no index or progress chrome */}
        <div className="mt-auto w-full pt-14 sm:pt-20">
          <div className="border-t border-white/20 pt-7">
            <div key={current.id} className="hero-caption-in max-w-xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-white/55">
                Random views · {current.kicker}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/88 sm:text-base">
                <span className="sr-only">Current scene: </span>
                {current.caption}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
