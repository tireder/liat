// TimeSlotGroups – "polish rack" of time chips grouped by part of day.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Chip } from '../ui/Chip';
import { groupSlots } from '../../lib/booking';
import { enter, useReducedMotion } from '../../lib/motion';
import { LRM } from '../../lib/format';
import { spacing } from '../../lib/theme';

interface TimeSlotGroupsProps {
    slots: string[];
    selected: string | null;
    onSelect: (time: string) => void;
}

export function TimeSlotGroups({ slots, selected, onSelect }: TimeSlotGroupsProps) {
    const reduced = useReducedMotion();
    const groups = groupSlots(slots);

    return (
        <View style={styles.wrap}>
            {groups.map((group, gi) => (
                <Animated.View key={group.key} entering={enter(gi, reduced)} style={styles.group}>
                    <AppText variant="eyebrow" tone="soft" style={styles.label}>{group.label}</AppText>
                    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={`שעות ${group.label}`}>
                        {group.slots.map((time) => (
                            <Chip
                                key={time}
                                label={`${LRM}${time}${LRM}`}
                                accessibilityLabel={`שעה ${time}`}
                                selected={selected === time}
                                onPress={() => onSelect(time)}
                                style={styles.chip}
                                ltr
                            />
                        ))}
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: spacing.lg,
    },
    group: {
        gap: spacing.sm,
    },
    label: {
        letterSpacing: 0.6,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    chip: {
        minWidth: 84,
    },
});

export default TimeSlotGroups;
