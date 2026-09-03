// Header – inner-screen header with RTL-aware back chevron and optional large serif title.
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '../AppText';
import { PressableScale } from './PressableScale';
import { Chevron } from './Icon';
import { a11yButton } from '../../lib/a11y';
import { colors, spacing } from '../../lib/theme';

export interface HeaderProps {
    title: string;
    eyebrow?: string;
    onBack?: () => void;
    showBack?: boolean;
    right?: ReactNode;
    left?: ReactNode;
    large?: boolean;
    tone?: 'light' | 'dark';
}

export function Header({ title, eyebrow, onBack, showBack = true, right, left, large = false, tone = 'light' }: HeaderProps) {
    const router = useRouter();
    const handleBack = onBack || (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)')));
    const inverse = tone === 'dark';

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                <View style={styles.side}>
                    {showBack ? (
                        <PressableScale
                            onPress={handleBack}
                            style={[styles.iconBtn, inverse ? styles.iconBtnDark : null]}
                            {...a11yButton('חזרה')}
                        >
                            <Chevron direction="back" size={20} tone={inverse ? 'inverse' : 'ink'} />
                        </PressableScale>
                    ) : left}
                </View>
                {!large ? (
                    <AppText variant="heading" tone={inverse ? 'inverse' : 'ink'} align="center" style={styles.centerTitle} accessibilityRole="header" numberOfLines={1}>
                        {title}
                    </AppText>
                ) : <View style={styles.centerTitle} />}
                <View style={[styles.side, styles.sideEnd]}>{right}</View>
            </View>
            {large ? (
                <View style={styles.large}>
                    {eyebrow ? (
                        <AppText variant="eyebrow" tone={inverse ? 'inverse' : 'roseDeep'} style={styles.eyebrow}>
                            {eyebrow}
                        </AppText>
                    ) : null}
                    <AppText variant="display" tone={inverse ? 'inverse' : 'ink'} accessibilityRole="header">
                        {title}
                    </AppText>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
    },
    side: {
        width: 64,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sideEnd: {
        justifyContent: 'flex-end',
    },
    centerTitle: {
        flex: 1,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: colors.lineStrong,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnDark: {
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderColor: 'rgba(255,255,255,0.28)',
    },
    large: {
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.xs,
    },
    eyebrow: {
        textTransform: 'uppercase',
    },
});

export default Header;
