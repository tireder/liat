// CalendarMonth – month grid that disables past days and days the salon is closed.
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../AppText';
import { PressableScale } from '../ui/PressableScale';
import { Chevron } from '../ui/Icon';
import type { OperatingHour } from '../../lib/api';
import { HEBREW_DAYS_SHORT, HEBREW_MONTHS, LRM, toDateKey } from '../../lib/format';
import { isDayOpen } from '../../lib/hours';
import { haptics } from '../../lib/haptics';
import { a11yButton } from '../../lib/a11y';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface CalendarMonthProps {
    month: Date;
    selected: string | null;
    onSelect: (dateKey: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    operatingHours?: OperatingHour[] | null;
    maxMonthsAhead?: number;
}

interface DayCell {
    key: string;
    date: Date | null;
    isToday: boolean;
    disabled: boolean;
    closed: boolean;
}

export function CalendarMonth({ month, selected, onSelect, onPrevMonth, onNextMonth, operatingHours, maxMonthsAhead = 6 }: CalendarMonthProps) {
    const today = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    const cells = useMemo<DayCell[]>(() => {
        const year = month.getFullYear();
        const m = month.getMonth();
        const first = new Date(year, m, 1);
        const last = new Date(year, m + 1, 0);
        const out: DayCell[] = [];
        for (let i = 0; i < first.getDay(); i++) out.push({ key: `pad-${i}`, date: null, isToday: false, disabled: true, closed: false });
        for (let d = 1; d <= last.getDate(); d++) {
            const date = new Date(year, m, d);
            const closed = !isDayOpen(operatingHours, date.getDay());
            const past = date < today;
            out.push({ key: toDateKey(date), date, isToday: date.getTime() === today.getTime(), disabled: past || closed, closed });
        }
        return out;
    }, [month, operatingHours, today]);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const canGoPrev = month > thisMonth;
    const limit = new Date(today.getFullYear(), today.getMonth() + maxMonthsAhead, 1);
    const canGoNext = month < limit;
    const hasClosedDays = cells.some((c) => c.closed);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <PressableScale onPress={onPrevMonth} disabled={!canGoPrev} style={styles.navBtn} {...a11yButton('חודש קודם', { disabled: !canGoPrev })}>
                    <Chevron direction="back" size={18} tone={canGoPrev ? 'ink' : 'soft'} />
                </PressableScale>
                <AppText variant="display-sm" accessibilityRole="header" accessibilityLiveRegion="polite">
                    {HEBREW_MONTHS[month.getMonth()]} {LRM}{month.getFullYear()}{LRM}
                </AppText>
                <PressableScale onPress={onNextMonth} disabled={!canGoNext} style={styles.navBtn} {...a11yButton('חודש הבא', { disabled: !canGoNext })}>
                    <Chevron direction="forward" size={18} tone={canGoNext ? 'ink' : 'soft'} />
                </PressableScale>
            </View>

            <View style={styles.weekRow} accessible={false}>
                {HEBREW_DAYS_SHORT.map((d) => (
                    <AppText key={d} variant="caption" tone="soft" align="center" style={styles.weekDay}>
                        {d}
                    </AppText>
                ))}
            </View>

            <View style={styles.grid}>
                {cells.map((cell) => {
                    const isSelected = !!cell.date && selected === cell.key;
                    return (
                        <View key={cell.key} style={styles.cell}>
                            {cell.date ? (
                                <Pressable
                                    onPress={() => {
                                        if (cell.disabled) return;
                                        haptics.selection();
                                        onSelect(cell.key);
                                    }}
                                    disabled={cell.disabled}
                                    style={[
                                        styles.day,
                                        cell.isToday && !isSelected ? styles.dayToday : null,
                                        isSelected ? styles.daySelected : null,
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${cell.date.getDate()} ב${HEBREW_MONTHS[cell.date.getMonth()]}${cell.closed ? ', סגור' : ''}${cell.isToday ? ', היום' : ''}`}
                                    accessibilityState={{ selected: isSelected, disabled: cell.disabled }}
                                >
                                    <AppText
                                        style={[
                                            styles.dayText,
                                            isSelected ? styles.dayTextSelected : null,
                                            cell.disabled ? styles.dayTextDisabled : null,
                                            cell.closed && !isSelected ? styles.dayTextClosed : null,
                                        ]}
                                    >
                                        {cell.date.getDate()}
                                    </AppText>
                                </Pressable>
                            ) : null}
                        </View>
                    );
                })}
            </View>

            {hasClosedDays ? (
                <AppText variant="caption" tone="soft" style={styles.legend}>
                    ימים מחוקים — הסלון סגור
                </AppText>
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
        padding: spacing.md,
        gap: spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.lineStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekRow: {
        flexDirection: 'row',
    },
    weekDay: {
        flex: 1,
        fontFamily: typography.fontFamily.medium,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        padding: 2,
    },
    day: {
        flex: 1,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    dayToday: {
        borderColor: colors.rose,
    },
    daySelected: {
        backgroundColor: colors.ink,
        borderColor: colors.ink,
    },
    dayText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 15,
        lineHeight: 20,
        color: colors.ink,
    },
    dayTextSelected: {
        color: colors.inkInverse,
        fontFamily: typography.fontFamily.semibold,
    },
    dayTextDisabled: {
        color: colors.lineStrong,
    },
    dayTextClosed: {
        textDecorationLine: 'line-through',
        color: colors.inkSoft,
    },
    legend: {
        marginTop: spacing.xs,
    },
});

export default CalendarMonth;
