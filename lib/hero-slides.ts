/**
 * Hero imagery: remote Unsplash URLs (allowed in `next.config.mjs` `remotePatterns`).
 * Replace with `/public/hero/*.png` when you add brand assets there.
 */
export const HERO_SLIDES = [
  {
    id: "clinic-session",
    src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=85",
    alt: "Licensed massage therapist performing therapeutic back massage for a client in a bright clinic setting",
    imageClassName: "object-cover object-center",
  },
  {
    id: "herbal-wellness",
    src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1920&q=85",
    alt: "Herbal wellness and natural healing — plants, care, and therapeutic calm",
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
