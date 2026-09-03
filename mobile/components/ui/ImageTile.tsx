// ImageTile – expo-image with a cream placeholder, fade transition and a11y label.
// Accepts a remote `uri` or a bundled `source` (require) — the former wins when both are given.
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image, ImageContentFit, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, motion, radius } from '../../lib/theme';

export interface ImageTileProps {
    uri?: string | null;
    source?: number | ImageSource | null;
    alt?: string;
    aspectRatio?: number;
    borderRadius?: number;
    contentFit?: ImageContentFit;
    style?: StyleProp<ViewStyle>;
    priority?: 'low' | 'normal' | 'high';
    decorative?: boolean;
    recyclingKey?: string;
    scrim?: 'none' | 'bottom' | 'full';
    children?: React.ReactNode;
}

export function ImageTile({
    uri,
    source,
    alt,
    aspectRatio,
    borderRadius = radius.md,
    contentFit = 'cover',
    style,
    priority = 'normal',
    decorative = false,
    recyclingKey,
    scrim = 'none',
    children,
}: ImageTileProps) {
    const resolved = uri ? { uri } : source || null;

    return (
        <View
            style={[styles.wrap, { borderRadius, aspectRatio }, style]}
            accessible={!decorative && !!alt}
            accessibilityRole={!decorative && alt ? 'image' : undefined}
            accessibilityLabel={!decorative ? alt : undefined}
            importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
        >
            {resolved ? (
                <Image
                    source={resolved}
                    style={StyleSheet.absoluteFill}
                    contentFit={contentFit}
                    transition={motion.base}
                    cachePolicy="memory-disk"
                    priority={priority}
                    recyclingKey={recyclingKey || uri || undefined}
                    placeholderContentFit="cover"
                />
            ) : (
                <LinearGradient
                    colors={[colors.blush, colors.peach, colors.nude]}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {scrim !== 'none' ? (
                <LinearGradient
                    colors={
                        scrim === 'full'
                            ? ['rgba(28,22,20,0.15)', 'rgba(28,22,20,0.55)', 'rgba(28,22,20,0.82)']
                            : ['transparent', 'rgba(28,22,20,0.2)', 'rgba(28,22,20,0.7)']
                    }
                    locations={scrim === 'full' ? [0, 0.55, 1] : [0.3, 0.6, 1]}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
            ) : null}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        overflow: 'hidden',
        backgroundColor: colors.cream,
    },
});

export default ImageTile;
