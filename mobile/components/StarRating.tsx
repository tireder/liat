// StarRating – read-only display and an accessible interactive picker.
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../lib/theme';
import { haptics } from '../lib/haptics';
import { HIT_SLOP } from '../lib/a11y';

interface StarRatingProps {
    rating: number;
    size?: number;
    showEmpty?: boolean;
    color?: string;
}

export function StarRating({ rating, size = 16, showEmpty = true, color = colors.rose }: StarRatingProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(<Ionicons key={i} name="star" size={size} color={color} style={styles.star} />);
        } else if (i === fullStars && hasHalfStar) {
            stars.push(<Ionicons key={i} name="star-half" size={size} color={color} style={styles.star} />);
        } else if (showEmpty) {
            stars.push(<Ionicons key={i} name="star-outline" size={size} color={colors.roseSoft} style={styles.star} />);
        }
    }

    return (
        <View style={[styles.container, { flexDirection: 'row-reverse' }]} accessible accessibilityRole="image" accessibilityLabel={`דירוג ${rating.toFixed(1)} מתוך 5`}>
            {stars}
        </View>
    );
}

interface InteractiveStarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: number;
}

export function InteractiveStarRating({ rating, onRatingChange, size = 36 }: InteractiveStarRatingProps) {
    return (
        <View style={[styles.container, { flexDirection: 'row-reverse' }]} accessibilityRole="radiogroup" accessibilityLabel="דירוג">
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                    key={star}
                    onPress={() => {
                        haptics.selection();
                        onRatingChange(star);
                    }}
                    style={styles.starButton}
                    hitSlop={HIT_SLOP}
                    accessibilityRole="radio"
                    accessibilityLabel={`${star} כוכבים`}
                    accessibilityState={{ selected: star <= rating, checked: star === rating }}
                >
                    <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={size} color={star <= rating ? colors.rose : colors.roseSoft} />
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    star: {
        marginHorizontal: 1,
    },
    starButton: {
        padding: spacing.xs,
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
