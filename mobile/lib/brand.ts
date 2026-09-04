// Bundled brand photography (used where the online gallery has nothing yet).
export const BRAND_IMAGES = {
    hero: require('../assets/images/hero.jpg') as number,
    salon: require('../assets/images/salon.jpg') as number,
    logo: require('../assets/logo.png') as number,
    nails: [
        require('../assets/images/nails-1.jpg') as number,
        require('../assets/images/nails-2.jpg') as number,
        require('../assets/images/nails-3.jpg') as number,
    ],
} as const;

/** Deterministic pick from the bundled nail photos. */
export function brandNailImage(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return BRAND_IMAGES.nails[h % BRAND_IMAGES.nails.length];
}
