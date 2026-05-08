/**
 * Brand photography served from `/public/hero` for fast LCP and consistent quality.
 */
export const HERO_SLIDES = [
  {
    id: "clinic-session",
    src: "/hero/hero-clinic.png",
    alt: "Licensed massage therapist performs therapeutic back work for a client at i7 Therapeutics",
    kicker: "In-clinic care",
    caption:
      "Therapeutic massage in a bright, clinical environment—where professionalism meets calm.",
  },
  {
    id: "integrated-services",
    src: "/hero/hero-services.png",
    alt: "Collage of therapeutic massage, cupping, wood therapy, and the i7 Therapeutics clinical team",
    kicker: "Integrated therapies",
    caption:
      "From manual therapy to cupping and specialist techniques—delivered by an aligned clinical team.",
  },
] as const;

export type HeroSlide = (typeof HERO_SLIDES)[number];
