/**
 * Hero carousel images — brand photography in `/public/hero`.
 */
export const HERO_SLIDES = [
  {
    id: "clinic-session",
    src: "/hero/hero-clinic-session.png",
    alt: "i7 Therapeutics therapist in branded blue polo performing a therapeutic back massage in a bright Accra clinic, with studio logo and garden view",
    imageClassName: "object-cover object-[center_42%]",
  },
  {
    id: "clinic-collage",
    src: "/hero/hero-clinic-collage.png",
    alt: "Collage of i7 Therapeutics care: therapeutic massage, cupping, wood therapy, and the clinical team at reception",
    imageClassName:
      "object-cover object-center sm:object-[center_45%] md:object-[center_40%]",
  },
] as const satisfies readonly {
  id: string;
  src: string;
  alt: string;
  imageClassName: string;
}[];

export type HeroSlide = (typeof HERO_SLIDES)[number];
