/**
 * Brand photography served from `/public/hero` for fast LCP and consistent quality.
 * Optional `imageClassName` adjusts crop and grade for specific scenes (e.g. busy backgrounds).
 */
export const HERO_SLIDES = [
  {
    id: "heat-therapy",
    src: "/hero/hero-heat-therapy.png",
    alt: "Clinician in protective gloves treating a client's foot with hands-on care under therapeutic infrared heat",
    kicker: "Targeted recovery",
    caption:
      "Hands-on lower-limb work supported by therapeutic heat—precise, attentive care in session.",
  },
  {
    id: "clinic-session",
    src: "/hero/hero-clinic.png",
    alt: "Collage of therapeutic massage, wood therapy, restorative bodywork, and the i7 Therapeutics clinical team in a modern clinic",
    kicker: "Integrated therapies",
    caption:
      "Massage, wood therapy, and advanced bodywork—skilled clinicians delivering calm, precise care in one practice.",
  },
  {
    id: "community-outreach",
    src: "/hero/hero-community.png",
    alt: "Two i7 Therapeutics team members in branded polos smile at an outdoor community and schools outreach event",
    kicker: "Community & outreach",
    caption:
      "Trusted clinicians showing up where wellness matters—partners, schools, and neighborhoods across Accra.",
    imageClassName:
      "object-cover object-[center_50%_42%] brightness-[1.04] contrast-[1.08] saturate-[1.07] md:object-[center_48%_40%] lg:object-[center_46%_38%]",
  },
] as const;

export type HeroSlide = (typeof HERO_SLIDES)[number];
