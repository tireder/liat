// ServiceStep – pick a treatment (rows with PolishDot, duration pill and serif price).
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { PolishDot } from '../ui/PolishDot';
import { EmptyState } from '../ui/EmptyState';
import type { Artist, Service } from '../../lib/api';
import { enter, useReducedMotion } from '../../lib/motion';
import { formatPrice, LRM } from '../../lib/format';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface ServiceStepProps {
    services: Service[];
    artist: Artist | null;
    selected: Service | null;
    preselectedId?: string | null;
    onSelect: (service: Service) => void;
    onContact: () => void;
}

export function ServiceStep({ services, artist, selected, preselectedId, onSelect, onContact }: ServiceStepProps) {
    const reduced = useReducedMotion();

    if (services.length === 0) {
        return (
            <EmptyState
                icon="color-palette-outline"
                title={artist ? `ל${artist.name} אין טיפולים זמינים כרגע` : 'אין טיפולים זמינים כרגע'}
                body="דברי איתנו ונמצא לך פתרון."
                action={{ label: 'דברי איתנו', onPress: onContact, icon: 'chatbubble-ellipses-outline' }}
                compact
            />
        );
    }

    const ordered = preselectedId
        ? [...services].sort((a, b) => (a.id === preselectedId ? -1 : b.id === preselectedId ? 1 : 0))
        : services;

    return (
        <View style={styles.wrap}>
            <Animated.View entering={enter(0, reduced)} style={styles.head}>
                <AppText variant="display" accessibilityRole="header">איזה טיפול היום?</AppText>
                <AppText variant="body" tone="muted">
                    {artist ? `הטיפולים של ${artist.name}` : 'בחרי טיפול ונמשיך לבחירת מועד'}
                </AppText>
            </Animated.View>

            <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel="טיפולים">
                {ordered.map((service, i) => {
                    const isSelected = selected?.id === service.id;
                    const isPreselected = preselectedId === service.id;
                    return (
                        <Animated.View key={service.id} entering={enter(i + 1, reduced)}>
                            <Card
                                onPress={() => onSelect(service)}
                                accessibilityLabel={`${service.name}, ${service.duration} דקות, ${formatPrice(service.price)}`}
                                style={[styles.card, isSelected ? styles.cardSelected : null]}
                                padding={spacing.lg}
                            >
                                <View style={styles.row}>
                                    <View style={styles.check}>
                                        {isSelected ? <Icon name="checkmark" size={16} tone="inverse" /> : <PolishDot seed={service.id} size={18} />}
                                    </View>
                                    <View style={styles.info}>
                                        <View style={styles.titleRow}>
                                            <AppText variant="heading">{service.name}</AppText>
                                            {isPreselected ? (
                                                <View style={styles.tag}>
                                                    <AppText variant="caption" tone="roseDeep" style={styles.tagText}>נבחר מהאתר</AppText>
                                                </View>
                                            ) : null}
                                        </View>
                                        {service.description ? (
                                            <AppText variant="body-sm" tone="muted" numberOfLines={2}>{service.description}</AppText>
                                        ) : null}
                                        <View style={styles.meta}>
                                            <View style={styles.duration}>
                                                <Icon name="time-outline" size={13} tone="soft" />
                                                <AppText variant="caption" tone="muted">{LRM}{service.duration}{LRM} דק׳</AppText>
                                            </View>
                                            <AppText style={styles.price}>{formatPrice(service.price)}</AppText>
                                        </View>
                                    </View>
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
        backgroundColor: colors.bg,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    check: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        backgroundColor: 'transparent',
    },
    info: {
        flex: 1,
        gap: spacing.xs,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    tag: {
        backgroundColor: colors.roseMist,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    tagText: {
        fontFamily: typography.fontFamily.semibold,
    },
    meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginTop: spacing.xs,
    },
    duration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    price: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 20,
        lineHeight: 24,
        color: colors.ink,
    },
});

export default ServiceStep;
