// Motion presets built on Reanimated; every entrance respects Reduce Motion.
import { FadeIn, FadeInDown, FadeOut, useReducedMotion as useReanimatedReducedMotion } from 'react-native-reanimated';
import { motion } from './theme';

export function useReducedMotion(): boolean {
    return useReanimatedReducedMotion();
}

/** Staggered content entrance: `entering={enter(index)}`. */
export function enter(index = 0, reduced = false) {
    if (reduced) return FadeIn.duration(1);
    return FadeInDown.duration(motion.base)
        .delay(Math.min(index, 8) * 40)
        .easing(motion.easing)
        .springify()
        .damping(18);
}

export function fadeIn(reduced = false, duration = motion.base) {
    return FadeIn.duration(reduced ? 1 : duration);
}

export function fadeOut(reduced = false, duration = motion.fast) {
    return FadeOut.duration(reduced ? 1 : duration);
}

export const durations = motion;
