"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { HERO_SLIDES } from "@/lib/hero-slides";

const INTERVAL_MS = 6500;

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: "next" | "prev" | number) => {
    setActive((i) => {
      if (typeof dir === "number") return dir;
      const len = HERO_SLIDES.length;
      if (dir === "next") return (i + 1) % len;
      return (i - 1 + len) % len;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => go("next"), INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused, go]);

  return (
    <section
      className="relative isolate min-h-[min(92vh,920px)] w-full overflow-hidden border-b border-[var(--border)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured imagery"
    >
      {/* Slides — full-bleed crossfade */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== active}
          className={`pointer-events-none absolute inset-0 transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none ${
            i === active ? "z-[1] opacity-100" : "z-0 opacity-0"
          }`}
        >
          <div
            key={i === active ? `${slide.id}-active` : `${slide.id}-idle`}
            className={`absolute inset-0 ${i === active ? "hero-kenburns" : ""} motion-reduce:animate-none`}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              priority={i === 0}
              quality={88}
            />
          </div>
        </div>
      ))}

      {/* Overlays: readability + brand tint */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-[#0f2912]/85 via-[#1e3a5f]/55 to-transparent sm:from-[#0f2912]/80 sm:via-[#1e3a5f]/45"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/50 via-transparent to-black/25"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[min(92vh,920px)] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/90 sm:text-sm">
            Awoshie Last Stop · Accra, Ghana
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.12] text-balance sm:text-5xl lg:text-6xl">
            Holistic healing rooted in tradition, guided by care.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {BRAND.name} brings together herbal wisdom, therapeutic touch, and mindful coaching
            — online and in person — so you can feel balanced in body and mind.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#256628] hover:shadow-xl"
            >
              Book a session
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/70 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-[var(--secondary)]"
            >
              Browse herbal products
            </Link>
          </div>
        </div>

        {/* Captions + controls */}
        <div className="mt-auto flex w-full flex-col gap-6 pt-16 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm text-white/75 motion-safe:transition-opacity motion-safe:duration-500">
            <span className="sr-only">Current slide: </span>
            {HERO_SLIDES[active]?.alt}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex gap-2 rounded-full bg-black/25 px-2 py-2 backdrop-blur-md"
              role="tablist"
              aria-label="Slide indicators"
            >
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Show slide ${i + 1}: ${slide.alt}`}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full motion-safe:transition-all ${
                    i === active
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/65"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go("prev")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:bg-white/15"
                aria-label="Previous slide"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go("next")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition hover:bg-white/15"
                aria-label="Next slide"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
