// DateTimeStep – calendar + availability. Closed / blocked / error / empty states
// come straight from the availability API and the salon's operating hours.
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '../AppText';
import { CalendarMonth } from './CalendarMonth';
import { TimeSlotGroups } from './TimeSlotGroups';
import { Button } from '../ui/Button';
import { Icon, IconName } from '../ui/Icon';
import { SkeletonBlock } from '../SkeletonLoader';
import { calendarApi } from '../../lib/api';
import type { OperatingHour, Service, Artist } from '../../lib/api';
import { filterPastSlots } from '../../lib/booking';
import { formatDateLong, LRM } from '../../lib/format';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing } from '../../lib/theme';

type SlotState =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'ready'; slots: string[] }
    | { kind: 'closed' }
    | { kind: 'blocked' }
    | { kind: 'error'; message: string };

interface DateTimeStepProps {
    service: Service | null;
    artist: Artist | null;
    date: string | null;
    time: string | null;
    onSelectDate: (dateKey: string) => void;
    onSelectTime: (time: string) => void;
    operatingHours?: OperatingHour[] | null;
    bufferMinutes: number;
    reschedule?: boolean;
}

export function DateTimeStep({ service, artist, date, time, onSelectDate, onSelectTime, operatingHours, bufferMinutes, reschedule }: DateTimeStepProps) {
    const reduced = useReducedMotion();
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [slotState, setSlotState] = useState<SlotState>({ kind: 'idle' });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!date || !service) {
            setSlotState({ kind: 'idle' });
            return;
        }
        let cancelled = false;
        setSlotState({ kind: 'loading' });
        calendarApi.getAvailable(date, service.id, artist?.id).then((result) => {
            if (cancelled) return;
            if (result.error || !result.data) {
                setSlotState({ kind: 'error', message: result.error || 'שגיאה בטעינת השעות' });
                return;
            }
            if (result.data.closed) return setSlotState({ kind: 'closed' });
            if (result.data.blocked) return setSlotState({ kind: 'blocked' });
            setSlotState({ kind: 'ready', slots: filterPastSlots(date, result.data.slots, bufferMinutes) });
        });
        return () => {
            cancelled = true;
        };
    }, [date, service, artist, bufferMinutes, reloadKey]);

    return (
        <View style={styles.wrap}>
            <Animated.View entering={enter(0, reduced)} style={styles.head}>
                <AppText variant="display" accessibilityRole="header">{reschedule ? 'בחרי מועד חדש' : 'מתי נוח לך?'}</AppText>
                {service ? (
                    <AppText variant="body" tone="muted">
                        {service.name} · {LRM}{service.duration}{LRM} דקות
                    </AppText>
                ) : null}
            </Animated.View>

            <Animated.View entering={enter(1, reduced)}>
                <CalendarMonth
                    month={month}
                    selected={date}
                    onSelect={onSelectDate}
                    onPrevMonth={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                    onNextMonth={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                    operatingHours={operatingHours}
                />
            </Animated.View>

            {date ? (
                <View style={styles.slotsSection}>
                    <AppText variant="heading" accessibilityRole="header">
                        שעות פנויות · {formatDateLong(date)}
                    </AppText>

                    {slotState.kind === 'loading' ? (
                        <View style={styles.skeletonRow} accessibilityLabel="טוען שעות" accessible>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <SkeletonBlock key={i} width={84} height={44} borderRadius={radius.full} />
                            ))}
                        </View>
                    ) : null}

                    {slotState.kind === 'closed' ? <Notice icon="moon-outline" text="הסלון סגור ביום זה. בחרי יום אחר." /> : null}
                    {slotState.kind === 'blocked' ? <Notice icon="lock-closed-outline" text="היום הזה חסום ביומן. בחרי יום אחר." /> : null}
                    {slotState.kind === 'ready' && slotState.slots.length === 0 ? (
                        <Notice icon="hourglass-outline" text="כל השעות ביום זה תפוסות. נסי תאריך אחר." />
                    ) : null}
                    {slotState.kind === 'error' ? (
                        <Notice icon="cloud-offline-outline" text={slotState.message} tone="danger">
                            <Button label="נסי שוב" variant="secondary" size="sm" onPress={() => setReloadKey((k) => k + 1)} />
                        </Notice>
                    ) : null}
                    {slotState.kind === 'ready' && slotState.slots.length > 0 ? (
                        <TimeSlotGroups slots={slotState.slots} selected={time} onSelect={onSelectTime} />
                    ) : null}
                </View>
            ) : (
                <Animated.View entering={enter(2, reduced)}>
                    <AppText variant="body-sm" tone="soft" align="center">בחרי תאריך כדי לראות שעות פנויות</AppText>
                </Animated.View>
            )}
        </View>
    );
}

function Notice({ icon, text, tone = 'neutral', children }: { icon: IconName; text: string; tone?: 'neutral' | 'danger'; children?: React.ReactNode }) {
    return (
        <View style={[styles.notice, tone === 'danger' ? styles.noticeDanger : null]} accessibilityLiveRegion="polite">
            <Icon name={icon} size={20} tone={tone === 'danger' ? 'danger' : 'roseDeep'} />
            <AppText variant="body-sm" tone={tone === 'danger' ? 'danger' : 'muted'} style={styles.noticeText}>{text}</AppText>
            {children}
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
    slotsSection: {
        gap: spacing.md,
    },
    skeletonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    notice: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.cream,
    },
    noticeDanger: {
        backgroundColor: colors.dangerBg,
    },
    noticeText: {
        flex: 1,
    },
});

export default DateTimeStep;
