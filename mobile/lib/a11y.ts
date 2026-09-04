// Accessibility helpers — consistent labels, roles and touch targets.
import type { AccessibilityRole, AccessibilityState } from 'react-native';

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export function a11yButton(label: string, state?: { disabled?: boolean; selected?: boolean; busy?: boolean }, hint?: string) {
    const accessibilityState: AccessibilityState = {};
    if (state?.disabled !== undefined) accessibilityState.disabled = state.disabled;
    if (state?.selected !== undefined) accessibilityState.selected = state.selected;
    if (state?.busy !== undefined) accessibilityState.busy = state.busy;
    return {
        accessible: true,
        accessibilityRole: 'button' as AccessibilityRole,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityState,
        hitSlop: HIT_SLOP,
    };
}

export function a11yHeader(label?: string) {
    return {
        accessibilityRole: 'header' as AccessibilityRole,
        ...(label ? { accessibilityLabel: label } : {}),
    };
}

export function a11yTab(label: string, selected: boolean) {
    return {
        accessible: true,
        accessibilityRole: 'tab' as AccessibilityRole,
        accessibilityLabel: label,
        accessibilityState: { selected },
    };
}

export function a11yImage(label: string) {
    return {
        accessible: true,
        accessibilityRole: 'image' as AccessibilityRole,
        accessibilityLabel: label,
    };
}
