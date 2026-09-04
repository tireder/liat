// NotesStep – optional free text with quick suggestions.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '../AppText';
import { Input } from '../ui/Input';
import { Chip } from '../ui/Chip';
import { enter, useReducedMotion } from '../../lib/motion';
import { spacing } from '../../lib/theme';

const SUGGESTIONS = ['יש לי אלרגיה', 'אני בהריון', 'עיצוב מיוחד', 'אירוע קרוב'];
export const NOTES_MAX = 200;

interface NotesStepProps {
    notes: string;
    onChange: (notes: string) => void;
}

export function NotesStep({ notes, onChange }: NotesStepProps) {
    const reduced = useReducedMotion();

    return (
        <View style={styles.wrap}>
            <Animated.View entering={enter(0, reduced)} style={styles.head}>
                <AppText variant="display" accessibilityRole="header">יש משהו שכדאי שנדע?</AppText>
                <AppText variant="body" tone="muted">אלרגיות, העדפות או בקשה מיוחדת. לא חובה.</AppText>
            </Animated.View>

            <Animated.View entering={enter(1, reduced)}>
                <Input
                    label="הערות לטיפול"
                    value={notes}
                    onChangeText={onChange}
                    placeholder="למשל: אני רוצה גוון ורוד עדין…"
                    multiline
                    numberOfLines={4}
                    maxLength={NOTES_MAX}
                    showCount
                />
            </Animated.View>

            <Animated.View entering={enter(2, reduced)} style={styles.suggestions}>
                <AppText variant="eyebrow" tone="soft">הצעות מהירות</AppText>
                <View style={styles.chips}>
                    {SUGGESTIONS.map((s) => (
                        <Chip
                            key={s}
                            label={s}
                            size="sm"
                            selected={notes.includes(s)}
                            onPress={() => {
                                if (notes.includes(s)) return;
                                onChange(notes ? `${notes}\n${s}` : s);
                            }}
                        />
                    ))}
                </View>
            </Animated.View>
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
    suggestions: {
        gap: spacing.sm,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
});

export default NotesStep;
