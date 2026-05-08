/**
 * Brand photography served from `/public/hero` for fast LCP and consistent quality.
 * Optional `imageClassName` adjusts crop and grade for specific scenes (e.g. busy backgrounds).
 */
export const HERO_SLIDES = [
  {
    id: "clinic-session",
    src: "/hero/hero-clinic.png",
    alt: "Collage of therapeutic massage, wood therapy, restorative bodywork, and the i7 Therapeutics clinical team in a modern clinic",
  },
  {
    id: "community-outreach",
    src: "/hero/hero-community.png",
    alt: "Two i7 Therapeutics team members in branded polos smile at an outdoor community and schools outreach event",
    imageClassName:
      "object-cover object-[center_50%_42%] brightness-[1.04] contrast-[1.08] saturate-[1.07] md:object-[center_48%_40%] lg:object-[center_46%_38%]",
  },
] as const;

export type HeroSlide = (typeof HERO_SLIDES)[number];
