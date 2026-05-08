"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { HERO_SLIDES } from "@/lib/hero-slides";

const INTERVAL_MS = 7200;

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const len = HERO_SLIDES.length;
    const t = window.setInterval(() => {
      setActive((i) => (i + 1) % len);
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [paused]);

  const current = HERO_SLIDES[active]!;
  const slideCount = HERO_SLIDES.length;
  const indexLabel = String(active + 1).padStart(2, "0");

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

      {/* Overlays: depth, legibility, brand tint */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-br from-[#0a1628]/88 via-[#0f2912]/72 to-[#1e3a5f]/40 sm:from-[#0a1628]/82 sm:via-[#0f2912]/65 sm:to-[#1e3a5f]/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-transparent to-black/[0.18]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,transparent,rgba(0,0,0,0.28))]"
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

        {/* Slide context — editorial caption + index */}
        <div className="mt-auto w-full pt-14 sm:pt-20">
          <div className="flex flex-col gap-5 border-t border-white/20 pt-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
            <div key={current.id} className="hero-caption-in max-w-xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.26em] text-white/55">
                {current.kicker}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/88 sm:text-base">
                <span className="sr-only">Current slide: </span>
                {current.caption}
              </p>
            </div>
            <div
              className="flex shrink-0 items-baseline gap-2 tabular-nums text-white/45 motion-safe:transition-opacity motion-safe:duration-500"
              aria-hidden
            >
              <span className="text-lg font-medium text-white/80">{indexLabel}</span>
              <span className="text-sm">/</span>
              <span className="text-sm">{String(slideCount).padStart(2, "0")}</span>
            </div>
          </div>
          <div className="mt-4 h-0.5 w-full max-w-md overflow-hidden rounded-full bg-white/15 sm:max-w-xl">
            <div
              key={active}
              className={`hero-slide-progress h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-300/90 via-white/90 to-sky-200/80 ${paused ? "hero-slide-progress--paused" : ""}`}
              style={{ "--hero-progress-ms": `${INTERVAL_MS}ms` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
