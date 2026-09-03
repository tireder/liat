// ArtistStep – choose who will do the treatment.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Card } from '../ui/Card';
import { Chevron } from '../ui/Icon';
import { EmptyState } from '../ui/EmptyState';
import { StarRating } from '../StarRating';
import type { Artist } from '../../lib/api';
import { enter, useReducedMotion } from '../../lib/motion';
import { LRM } from '../../lib/format';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface ArtistStepProps {
    artists: Artist[];
    selected: Artist | null;
    onSelect: (artist: Artist) => void;
    onContact: () => void;
}

export function ArtistStep({ artists, selected, onSelect, onContact }: ArtistStepProps) {
    const reduced = useReducedMotion();

    if (artists.length === 0) {
        return (
            <EmptyState
                icon="people-outline"
                title="אין אמניות זמינות כרגע"
                body="נסי לרענן, או דברי איתנו ונקבע יחד."
                action={{ label: 'דברי איתנו', onPress: onContact, icon: 'chatbubble-ellipses-outline' }}
                compact
            />
        );
    }

    return (
        <View style={styles.wrap}>
            <Animated.View entering={enter(0, reduced)} style={styles.head}>
                <AppText variant="display" accessibilityRole="header">אצל מי תרצי להתפנק?</AppText>
                <AppText variant="body" tone="muted">בחרי את האמנית לטיפול</AppText>
            </Animated.View>

            <View style={styles.list} accessibilityRole="radiogroup">
                {artists.map((artist, i) => {
                    const isSelected = selected?.id === artist.id;
                    const hasRating = !!artist.averageRating && artist.averageRating > 0 && !!artist.totalReviews;
                    return (
                        <Animated.View key={artist.id} entering={enter(i + 1, reduced)}>
                            <Card
                                onPress={() => onSelect(artist)}
                                accessibilityLabel={`${artist.name}, ${artist.serviceIds.length} טיפולים`}
                                style={[styles.card, isSelected ? styles.cardSelected : null]}
                                padding={spacing.lg}
                            >
                                <View style={styles.row}>
                                    <View style={styles.avatar}>
                                        <AppText style={styles.avatarText}>{artist.name.trim().charAt(0)}</AppText>
                                    </View>
                                    <View style={styles.info}>
                                        <AppText variant="heading">{artist.name}</AppText>
                                        <AppText variant="body-sm" tone="muted">
                                            {LRM}{artist.serviceIds.length}{LRM} טיפולים זמינים
                                        </AppText>
                                        {hasRating ? (
                                            <View style={styles.rating}>
                                                <StarRating rating={artist.averageRating!} size={13} />
                                                <AppText variant="caption" tone="soft">
                                                    {LRM}{artist.averageRating!.toFixed(1)}{LRM} · {LRM}{artist.totalReviews}{LRM} ביקורות
                                                </AppText>
                                            </View>
                                        ) : null}
                                    </View>
                                    <Chevron direction="forward" size={18} tone="soft" />
                                </View>
                            </Card>
                        </Animated.View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: spacing.xl,
    },
    head: {
        gap: spacing.xs,
    },
    list: {
        gap: spacing.md,
    },
    card: {
        borderWidth: 1.5,
    },
    cardSelected: {
        borderColor: colors.ink,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: typography.fontFamily.display,
        fontSize: 24,
        lineHeight: 30,
        color: colors.roseDeep,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: 2,
    },
});

export default ArtistStep;
