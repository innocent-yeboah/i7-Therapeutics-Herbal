/**
 * Brand photography served from `/public/hero` for fast LCP and consistent quality.
 */
export const HERO_SLIDES = [
  {
    id: "clinic-session",
    src: "/hero/hero-clinic.png",
    alt: "Licensed massage therapist performing therapeutic back massage for a client in a bright i7 Therapeutics treatment room",
  },
] as const;

export type HeroSlide = (typeof HERO_SLIDES)[number];
