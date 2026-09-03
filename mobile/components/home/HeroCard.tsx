// HeroCard – photo hero with greeting, today's hours and the profile button.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { ImageTile } from '../ui/ImageTile';
import { PressableScale } from '../ui/PressableScale';
import type { GalleryImage, OperatingHour } from '../../lib/api';
import { getTodayHours } from '../../lib/hours';
import { a11yButton } from '../../lib/a11y';
import { LRM } from '../../lib/format';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface HeroCardProps {
    name: string | null;
    image?: GalleryImage | null;
    businessName: string;
    operatingHours?: OperatingHour[] | null;
    onProfile: () => void;
}

export function HeroCard({ name, image, businessName, operatingHours, onProfile }: HeroCardProps) {
    const today = getTodayHours(operatingHours);
    const openToday = !!(today && today.active && today.openTime && today.closeTime);
    const initial = (name || businessName).trim().charAt(0);

    return (
        <ImageTile uri={image?.image_url} alt={image?.title || undefined} decorative borderRadius={radius.xl} scrim="full" style={styles.hero}>
            <View style={styles.topRow}>
                <View style={styles.brand}>
                    <AppText variant="eyebrow" style={styles.brandText}>{businessName} · nail artist</AppText>
                </View>
                <PressableScale onPress={onProfile} style={styles.profile} {...a11yButton('הפרופיל שלי')}>
                    <AppText style={styles.profileInitial}>{initial}</AppText>
                </PressableScale>
            </View>

            <View style={styles.copy}>
                <AppText variant="display-xl" tone="inverse" accessibilityRole="header" style={styles.greeting}>
                    {name ? `שלום, ${name}` : 'שלום'}
                </AppText>
                <AppText variant="body" style={styles.sub}>
                    {openToday
                        ? `הסלון פתוח היום עד ${LRM}${today!.closeTime!.slice(0, 5)}${LRM}`
                        : today && !openToday
                            ? 'הסלון סגור היום — אפשר לקבוע תור להמשך השבוע'
                            : 'מה נעשה היום?'}
                </AppText>
            </View>
        </ImageTile>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: 300,
        justifyContent: 'space-between',
        padding: spacing.lg,
        paddingBottom: spacing['3xl'] + spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brand: {
        backgroundColor: 'rgba(251,248,245,0.18)',
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
    },
    brandText: {
        color: colors.inkInverse,
        textTransform: 'uppercase',
    },
    profile: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(251,248,245,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInitial: {
        fontFamily: typography.fontFamily.display,
        fontSize: 20,
        lineHeight: 24,
        color: colors.ink,
    },
    copy: {
        gap: spacing.xs,
    },
    greeting: {
        color: colors.white,
    },
    sub: {
        color: 'rgba(251,248,245,0.85)',
    },
});

export default HeroCard;
