/**
 * High-resolution Unsplash photography (license: Unsplash License — free commercial use).
 * Curated for a premium wellness / spa / herbal aesthetic.
 */
export const HERO_SLIDES = [
  {
    id: "spa-serenity",
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2400&q=88",
    alt: "Serene spa interior with warm lighting and natural stone",
  },
  {
    id: "botanical-herbs",
    src: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=2400&q=88",
    alt: "Fresh herbs and botanical ingredients for natural wellness",
  },
  {
    id: "mindful-wellness",
    src: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=2400&q=88",
    alt: "Calm wellness and mindful movement in a peaceful studio",
  },
  {
    id: "therapeutic-touch",
    src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=2400&q=88",
    alt: "Therapeutic spa treatment and restorative body care",
  },
  {
    id: "herbal-tea-ritual",
    src: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=2400&q=88",
    alt: "Herbal tea and ritual ceramics for holistic calm",
  },
] as const;

export type HeroSlide = (typeof HERO_SLIDES)[number];
