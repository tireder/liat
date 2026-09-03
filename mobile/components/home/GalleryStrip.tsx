// GalleryStrip – horizontal peek at the latest work.
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PressableScale } from '../ui/PressableScale';
import { ImageTile } from '../ui/ImageTile';
import type { GalleryImage } from '../../lib/api';
import { radius, spacing } from '../../lib/theme';

interface GalleryStripProps {
    images: GalleryImage[];
    onPress: (index: number) => void;
}

export function GalleryStrip({ images, onPress }: GalleryStripProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
            {images.map((img, i) => (
                <PressableScale
                    key={img.id}
                    onPress={() => onPress(i)}
                    haptic="selection"
                    accessibilityRole="imagebutton"
                    accessibilityLabel={img.title || 'עבודת ציפורניים'}
                    style={[styles.tile, i % 3 === 1 ? styles.tileTall : null]}
                >
                    <ImageTile uri={img.image_url} decorative borderRadius={radius.md} style={StyleSheet.absoluteFill} />
                </PressableScale>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        marginHorizontal: -spacing.lg,
    },
    row: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        alignItems: 'flex-end',
    },
    tile: {
        width: 124,
        height: 150,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
    tileTall: {
        height: 172,
    },
});

export default GalleryStrip;
