/**
 * Brand photography served from `/public/hero` for fast LCP and consistent quality.
 */
export const HERO_SLIDES = [
  {
    id: "clinic-session",
    src: "/hero/hero-clinic.png",
    alt: "Licensed massage therapist performing therapeutic back massage for a client in a bright i7 Therapeutics treatment room",
    imageClassName: "object-cover object-center",
  },
  {
    id: "integrated-collage",
    src: "/hero/hero-collage.png",
    alt: "Collage of therapeutic massage, cupping therapy, wood therapy, and the i7 Therapeutics clinical team in a professional clinic setting",
    imageClassName:
      "object-cover object-[center_50%_44%] sm:object-[center_50%_42%] md:object-[center_50%_40%]",
  },
] as const satisfies readonly {
  id: string;
  src: string;
  alt: string;
  imageClassName: string;
}[];

export type HeroSlide = (typeof HERO_SLIDES)[number];
