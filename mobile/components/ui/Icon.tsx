// Typed icon wrapper + RTL-aware chevron.
import React from 'react';
import { I18nManager, StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../lib/theme';

export type IconName = keyof typeof Ionicons.glyphMap;

export type IconTone = 'ink' | 'muted' | 'soft' | 'inverse' | 'rose' | 'roseDeep' | 'danger' | 'success' | 'warning';

const TONE: Record<IconTone, string> = {
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

export interface IconProps {
    name: IconName;
    size?: number;
    tone?: IconTone;
    color?: string;
    style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 20, tone = 'ink', color, style }: IconProps) {
    return <Ionicons name={name} size={size} color={color || TONE[tone]} style={style} accessible={false} importantForAccessibility="no" />;
}

interface ChevronProps extends Omit<IconProps, 'name'> {
    direction?: 'forward' | 'back' | 'down' | 'up';
}

/** In RTL "forward" points left and "back" points right. */
export function Chevron({ direction = 'forward', ...rest }: ChevronProps) {
    const rtl = I18nManager.isRTL;
    const name: IconName =
        direction === 'down'
            ? 'chevron-down'
            : direction === 'up'
                ? 'chevron-up'
                : direction === 'forward'
                    ? rtl ? 'chevron-back' : 'chevron-forward'
                    : rtl ? 'chevron-forward' : 'chevron-back';
    return <Icon name={name} {...rest} />;
}

export default Icon;
