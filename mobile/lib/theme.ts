// Design tokens — warm editorial palette shared with the web app.
// Cream grounds, charcoal ink, dusty rose used sparingly.

import { Easing } from 'react-native-reanimated';

// ===== Colors =====
const palette = {
    bg: '#fbf8f5',
    cream: '#f5efe9',
    blush: '#f8efec',
    card: '#fffdfb',
    ink: '#2a2422',
    inkMuted: '#6e615b',
    inkSoft: '#9a8d86',
    inkInverse: '#fbf8f5',
    rose: '#c4908a',
    roseDeep: '#9c665e',
    roseSoft: '#ecd7d2',
    roseMist: '#f6ebe8',
    nude: '#e6d3c6',
    beige: '#d9c5b5',
    peach: '#f3dccf',
    line: '#ebe3dd',
    lineStrong: '#d9cdc5',
    success: '#5f8a6b',
    successBg: '#e9f0ea',
    warning: '#b9853a',
    warningBg: '#f7ecdc',
    danger: '#b25a4e',
    dangerBg: '#f6e5e2',
    white: '#ffffff',
} as const;

export const colors = {
    ...palette,

    // ---- Legacy aliases (kept so untouched screens keep compiling) ----
    primary: palette.rose,
    primaryLight: palette.roseSoft,
    primaryDark: palette.roseDeep,
    accent: palette.roseSoft,
    accentDark: palette.roseDeep,
    sand: palette.cream,
    taupe: palette.inkSoft,
    background: palette.bg,
    backgroundCard: palette.card,
    backgroundAlt: palette.cream,
    backgroundDark: palette.ink,
    foreground: palette.ink,
    foregroundMuted: palette.inkMuted,
    foregroundLight: palette.inkInverse,
    border: palette.line,
    borderDark: '#3d3633',
    error: palette.danger,
} as const;

/** Returns an rgba() string for a hex token at the given alpha. */
export function alpha(hex: string, a: number): string {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ===== Spacing (8pt grid) =====
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
} as const;

// ===== Radii =====
export const radius = {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 32,
    full: 9999,
} as const;

// ===== Typography =====
const families = {
    regular: 'Heebo_400Regular',
    medium: 'Heebo_500Medium',
    semibold: 'Heebo_600SemiBold',
    bold: 'Heebo_700Bold',
    display: 'FrankRuhlLibre_400Regular',
    displayMedium: 'FrankRuhlLibre_500Medium',
} as const;

const sizes = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 44,
} as const;

/** Pixel line-heights per font size (React Native needs absolute values). */
const lineHeights = {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 38,
    '4xl': 50,
} as const;

export type TextVariant =
    | 'display-xl'
    | 'display'
    | 'display-sm'
    | 'title'
    | 'heading'
    | 'body'
    | 'body-sm'
    | 'caption'
    | 'eyebrow'
    | 'numeral';

/** Composite text styles used by <AppText variant="…"> */
export const textVariants: Record<TextVariant, { fontFamily: string; fontSize: number; lineHeight: number; letterSpacing?: number }> = {
    'display-xl': { fontFamily: families.display, fontSize: 38, lineHeight: 44 },
    display: { fontFamily: families.display, fontSize: 30, lineHeight: 36 },
    'display-sm': { fontFamily: families.display, fontSize: 24, lineHeight: 30 },
    title: { fontFamily: families.semibold, fontSize: 20, lineHeight: 26 },
    heading: { fontFamily: families.semibold, fontSize: 17, lineHeight: 24 },
    body: { fontFamily: families.regular, fontSize: 16, lineHeight: 24 },
    'body-sm': { fontFamily: families.regular, fontSize: 14, lineHeight: 20 },
    caption: { fontFamily: families.regular, fontSize: 12, lineHeight: 16 },
    eyebrow: { fontFamily: families.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
    numeral: { fontFamily: families.displayMedium, fontSize: 28, lineHeight: 32 },
};

export const typography = {
    fontFamily: families,
    fontSize: sizes,
    lineHeights,
    /** @deprecated multipliers kept for legacy screens; prefer `lineHeights` (px) */
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.65,
    },
} as const;

// ===== Shadows (tinted to the warm ground) =====
export const shadows = {
    xs: {
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    md: {
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
    },
    lg: {
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 32,
        elevation: 8,
    },
    rose: {
        shadowColor: '#9c665e',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 6,
    },
    ink: {
        shadowColor: '#2a2422',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 6,
    },
    /** @deprecated legacy alias */
    liquid: {
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
    },
} as const;

// ===== Motion =====
export const motion = {
    fast: 160,
    base: 260,
    slow: 480,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

/** @deprecated use `motion` */
export const timing = { fast: 160, base: 260, slow: 480 } as const;

/** @deprecated translucent fills from the old "glass" system */
export const glass = {
    light: alpha(palette.card, 0.6),
    medium: alpha(palette.card, 0.8),
    heavy: alpha(palette.card, 0.92),
    border: alpha(palette.white, 0.4),
    borderLight: alpha(palette.white, 0.2),
} as const;

// ===== Layout =====
export const layout = {
    /** Height reserved above the floating tab bar for scroll content */
    tabBarSpace: 112,
    screenPadding: spacing.lg,
    hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

export const theme = { colors, spacing, radius, typography, shadows, motion, layout } as const;
export type Theme = typeof theme;
