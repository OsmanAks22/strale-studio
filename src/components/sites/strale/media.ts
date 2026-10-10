/**
 * Campaign photography and video for the homepage and menus. Put files in public/sites/strale/media/
 * and set the path (e.g. "/sites/strale/media/hero.mp4"). Empty slots render a tonal placeholder
 * with the exact same geometry, so the layout never changes when real media arrives.
 */
export type Media = { image?: string; video?: string; poster?: string };

export const media = {
  /** Full-bleed hero, 100dvh − 42px on desktop, 4:5 on mobile. Video autoplays muted on loop. */
  hero: {} as Media,
  /** Two-up 4:5 cards under "Bu Hafta Gelen Stoklar". */
  contentCards: [{}, {}] as Media[],
  /** 4:5 tiles in "Kategoriler", keyed by category slug. */
  categories: {} as Partial<Record<string, Media>>,
  /** Inset banner: 600px tall on desktop, separate 4:5 media on mobile. */
  banner: { desktop: {} as Media, mobile: {} as Media },
  /** 336×420 feature image in each mega menu, keyed by nav label. */
  menu: {} as Partial<Record<string, Media>>,
};
