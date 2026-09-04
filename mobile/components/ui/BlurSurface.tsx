// BlurSurface – real blur on iOS, translucent cream fallback on Android.
import React, { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { alpha, colors } from '../../lib/theme';

export interface BlurSurfaceProps {
    children?: ReactNode;
    intensity?: number;
    tint?: 'light' | 'dark';
    style?: StyleProp<ViewStyle>;
}

export function BlurSurface({ children, intensity = 40, tint = 'light', style }: BlurSurfaceProps) {
    if (Platform.OS === 'ios') {
        return (
            <BlurView intensity={intensity} tint={tint === 'dark' ? 'dark' : 'light'} style={[styles.base, style]}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: tint === 'dark' ? alpha(colors.ink, 0.35) : alpha(colors.card, 0.55) }]} />
                {children}
            </BlurView>
        );
    }
    return (
        <View style={[styles.base, { backgroundColor: tint === 'dark' ? alpha(colors.ink, 0.9) : alpha(colors.card, 0.94) }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});

export default BlurSurface;
