// AppointmentTicket – the signature appointment card (serif date block, dashed rule, status).
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import type { Booking } from '../../lib/api';
import { getStatusInfo } from '../../lib/booking';
import { dateParts, formatDateLong, formatDateShort, formatTimeRange, formatTime, LRM, relativeDayLabel } from '../../lib/format';
import { colors, radius, spacing, typography } from '../../lib/theme';

export interface AppointmentTicketProps {
    booking: Booking;
    variant?: 'hero' | 'list';
    upcoming?: boolean;
    modifiable?: boolean;
    onChange?: () => void;
    onCancel?: () => void;
    onCalendar?: () => void;
    onContact?: () => void;
    onReview?: () => void;
}

export function AppointmentTicket({ booking, variant = 'list', upcoming = false, modifiable = false, onChange, onCancel, onCalendar, onContact, onReview }: AppointmentTicketProps) {
    const parts = dateParts(booking.date);
    const status = getStatusInfo(booking.status);
    const isHero = variant === 'hero';
    const serviceName = booking.service?.name || 'טיפול ציפורניים';
    const showRequested = booking.status === 'pending_change' && booking.requested_date;

    return (
        <View style={[styles.card, isHero ? styles.cardHero : null]} accessible accessibilityLabel={`${serviceName}, ${formatDateLong(booking.date)}, ${formatTime(booking.start_time)}, ${status.label}`}>
            <View style={styles.top}>
                <View style={[styles.dateBlock, isHero ? styles.dateBlockHero : null]}>
                    <AppText style={[styles.dateDay, isHero ? styles.dateDayHero : null]}>{LRM}{parts.day}{LRM}</AppText>
                    <AppText variant="caption" style={styles.dateMonth}>{parts.month}</AppText>
                </View>
                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <AppText variant={isHero ? 'title' : 'heading'} style={styles.flex} numberOfLines={2}>{serviceName}</AppText>
                        {isHero && upcoming ? (
                            <View style={styles.countdown}>
                                <AppText variant="caption" tone="roseDeep" style={styles.countdownText}>{relativeDayLabel(booking.date)}</AppText>
                            </View>
                        ) : null}
                    </View>
                    <AppText variant="body-sm" tone="muted">{formatDateLong(booking.date)}</AppText>
                    <View style={styles.timeRow}>
                        <Icon name="time-outline" size={14} tone="soft" />
                        <AppText variant="body-sm" style={styles.time}>{formatTimeRange(booking.start_time, booking.end_time)}</AppText>
                    </View>
                </View>
            </View>

            {showRequested ? (
                <View style={styles.requested}>
                    <Icon name="swap-horizontal-outline" size={14} tone="warning" />
                    <AppText variant="caption" tone="warning">
                        מבוקש: {formatDateShort(booking.requested_date!)} {booking.requested_time ? `${LRM}${formatTime(booking.requested_time)}${LRM}` : ''}
                    </AppText>
                </View>
            ) : null}

            <View style={styles.dash} />

            <View style={styles.footer}>
                <Badge label={status.label} tone={status.tone} />
                {booking.status === 'completed' && booking.review_token && onReview ? (
                    <Button label="כתבי ביקורת" variant="ghost" size="sm" icon="star-outline" onPress={onReview} />
                ) : null}
            </View>

            {upcoming && (onChange || onCancel || onCalendar || onContact) ? (
                <View style={styles.actions}>
                    {modifiable ? (
                        <>
                            {onChange ? <Button label="שינוי מועד" variant="secondary" size="sm" icon="create-outline" onPress={onChange} /> : null}
                            {onCancel ? <Button label="ביטול" variant="danger" size="sm" icon="close-outline" onPress={onCancel} /> : null}
                        </>
                    ) : onContact ? (
                        <Button label="לשינוי או ביטול צרי קשר" variant="ghost" size="sm" icon="chatbubble-ellipses-outline" onPress={onContact} />
                    ) : null}
                    {onCalendar ? <Button label="ליומן" variant="secondary" size="sm" icon="calendar-outline" onPress={onCalendar} /> : null}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        padding: spacing.lg,
        gap: spacing.md,
    },
    cardHero: {
        borderColor: colors.roseSoft,
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 6,
    },
    flex: {
        flex: 1,
    },
    top: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'flex-start',
    },
    dateBlock: {
        width: 58,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
    },
    dateBlockHero: {
        width: 68,
        backgroundColor: colors.ink,
    },
    dateDay: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 26,
        lineHeight: 30,
        color: colors.ink,
    },
    dateDayHero: {
        fontSize: 32,
        lineHeight: 36,
        color: colors.inkInverse,
    },
    dateMonth: {
        fontFamily: typography.fontFamily.semibold,
        color: colors.roseDeep,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    countdown: {
        backgroundColor: colors.roseMist,
        borderRadius: radius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
    },
    countdownText: {
        fontFamily: typography.fontFamily.semibold,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    time: {
        fontFamily: typography.fontFamily.medium,
        color: colors.ink,
        writingDirection: 'ltr',
    },
    requested: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.warningBg,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        alignSelf: 'flex-start',
    },
    dash: {
        height: 0,
        borderTopWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.lineStrong,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.sm,
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
});

export default AppointmentTicket;
