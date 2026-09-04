// AppText – the only text primitive. Applies the design-system variants,
// the user's text-size preference (by scaling font size, never transforms)
// and RTL writing direction by default.
import React, { useMemo } from 'react';
import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useTextSize } from '../lib/textSize';
import { colors, textVariants, TextVariant } from '../lib/theme';

export type TextTone = 'ink' | 'muted' | 'soft' | 'inverse' | 'rose' | 'roseDeep' | 'danger' | 'success' | 'warning';

const TONE_COLOR: Record<TextTone, string> = {
    ink: colors.ink,
    muted: colors.inkMuted,
    soft: colors.inkSoft,
    inverse: colors.inkInverse,
    rose: colors.rose,
    roseDeep: colors.roseDeep,
    danger: colors.danger,
    success: colors.success,
    warning: colors.warning,
};

export interface AppTextProps extends TextProps {
    variant?: TextVariant;
    tone?: TextTone;
    align?: 'auto' | 'start' | 'center' | 'end' | 'left' | 'right';
    children?: React.ReactNode;
}

const ALIGN: Record<NonNullable<AppTextProps['align']>, TextStyle['textAlign']> = {
    auto: 'auto',
    start: 'left',
    center: 'center',
    end: 'right',
    left: 'left',
    right: 'right',
};

export function AppText({ style, variant, tone, align, maxFontSizeMultiplier, ...props }: AppTextProps) {
    const { scale } = useTextSize();

    const computed = useMemo(() => {
        const flat = StyleSheet.flatten([
            variant ? textVariants[variant] : null,
            tone ? { color: TONE_COLOR[tone] } : null,
            align ? { textAlign: ALIGN[align] } : null,
            style,
        ]) as TextStyle | undefined;

        const out: TextStyle = { writingDirection: 'rtl', ...(flat || {}) };
        if (scale !== 1) {
            if (typeof out.fontSize === 'number') out.fontSize = Math.round(out.fontSize * scale * 10) / 10;
            if (typeof out.lineHeight === 'number') out.lineHeight = Math.round(out.lineHeight * scale * 10) / 10;
        }
        return out;
    }, [style, variant, tone, align, scale]);

    return <RNText style={computed} maxFontSizeMultiplier={maxFontSizeMultiplier ?? 1.3} {...props} />;
}

export default AppText;
