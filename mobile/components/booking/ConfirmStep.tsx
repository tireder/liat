// ConfirmStep – ticket-style summary before submitting.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Icon, IconName } from '../ui/Icon';
import type { Artist, Service } from '../../lib/api';
import { addMinutes, dateParts, formatDateLong, formatPrice, LRM } from '../../lib/format';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface ConfirmStepProps {
    service: Service | null;
    artist: Artist | null;
    date: string;
    time: string;
    notes: string;
    address?: string;
    cancelHoursBefore: number;
    reschedule?: boolean;
    locked?: { artist: boolean; service: boolean };
}

export function ConfirmStep({ service, artist, date, time, notes, address, cancelHoursBefore, reschedule, locked }: ConfirmStepProps) {
    const reduced = useReducedMotion();
    const parts = dateParts(date);
    const end = service ? addMinutes(time, service.duration) : null;

    return (
        <View style={styles.wrap}>
            <Animated.View entering={enter(0, reduced)} style={styles.head}>
                <AppText variant="display" accessibilityRole="header">{reschedule ? 'אישור המועד החדש' : 'רגע לפני שקובעים'}</AppText>
                <AppText variant="body" tone="muted">בדקי שהפרטים נכונים ואשרי</AppText>
            </Animated.View>

            <Animated.View entering={enter(1, reduced)} style={styles.ticket}>
                <View style={styles.ticketTop}>
                    <View style={styles.dateBlock}>
                        <AppText style={styles.dateDay}>{LRM}{parts.day}{LRM}</AppText>
                        <AppText variant="caption" tone="roseDeep" style={styles.dateMonth}>{parts.month}</AppText>
                    </View>
                    <View style={styles.ticketInfo}>
                        <AppText variant="title">{service?.name || 'טיפול'}</AppText>
                        <AppText variant="body-sm" tone="muted">{formatDateLong(date)}</AppText>
                        <AppText variant="body" style={styles.time}>
                            {LRM}{time}{end ? ` – ${end}` : ''}{LRM}
                        </AppText>
                    </View>
                </View>

                <View style={styles.dash} />

                <View style={styles.rows}>
                    {artist ? (
                        <Row icon="person-outline" label="אמנית" value={artist.name} locked={locked?.artist} />
                    ) : null}
                    {service ? (
                        <Row icon="time-outline" label="משך" value={`${service.duration} דקות`} ltr />
                    ) : null}
                    {address ? <Row icon="location-outline" label="כתובת" value={address} /> : null}
                    {notes ? <Row icon="chatbox-ellipses-outline" label="הערות" value={notes} /> : null}
                </View>

                {service ? (
                    <View style={styles.priceRow}>
                        <AppText variant="body" tone="muted">לתשלום בסלון</AppText>
                        <AppText style={styles.price}>{formatPrice(service.price)}</AppText>
                    </View>
                ) : null}
            </Animated.View>

            {locked?.service ? (
                <Animated.View entering={enter(2, reduced)} style={styles.lockedNote}>
                    <Icon name="lock-closed-outline" size={16} tone="soft" />
                    <AppText variant="caption" tone="soft" style={styles.flex}>
                        בשינוי מועד הטיפול והאמנית נשארים כפי שנקבעו. לשינוי טיפול בטלי את התור וקבעי חדש.
                    </AppText>
                </Animated.View>
            ) : null}

            <Animated.View entering={enter(3, reduced)} style={styles.policy}>
                <AppText variant="caption" tone="muted">
                    ביטול או שינוי מועד עד {LRM}{cancelHoursBefore}{LRM} שעות לפני התור — בלי עלות. מעבר לכך יש ליצור קשר עם הסלון.
                </AppText>
            </Animated.View>
        </View>
    );
}

function Row({ icon, label, value, locked, ltr }: { icon: IconName; label: string; value: string; locked?: boolean; ltr?: boolean }) {
    return (
        <View style={styles.row}>
            <View style={styles.rowIcon}>
                <Icon name={icon} size={16} tone="roseDeep" />
            </View>
            <View style={styles.rowText}>
                <AppText variant="caption" tone="soft">{label}</AppText>
                <AppText variant="body" style={ltr ? styles.ltr : null}>{ltr ? `${LRM}${value}${LRM}` : value}</AppText>
            </View>
            {locked ? <Icon name="lock-closed-outline" size={14} tone="soft" /> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: spacing.lg,
    },
    head: {
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    flex: {
        flex: 1,
    },
    ticket: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        padding: spacing.lg,
        gap: spacing.md,
    },
    ticketTop: {
        flexDirection: 'row',
        gap: spacing.lg,
        alignItems: 'center',
    },
    dateBlock: {
        width: 68,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
    },
    dateDay: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 32,
        lineHeight: 36,
        color: colors.ink,
    },
    dateMonth: {
        fontFamily: typography.fontFamily.semibold,
    },
    ticketInfo: {
        flex: 1,
        gap: 2,
    },
    time: {
        fontFamily: typography.fontFamily.semibold,
        writingDirection: 'ltr',
        textAlign: 'right',
    },
    dash: {
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.lineStrong,
        borderRadius: 1,
    },
    rows: {
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    rowIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowText: {
        flex: 1,
    },
    ltr: {
        writingDirection: 'ltr',
        textAlign: 'right',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    price: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 26,
        lineHeight: 30,
        color: colors.ink,
    },
    lockedNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    policy: {
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.cream,
    },
});

export default ConfirmStep;
