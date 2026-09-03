// PolishDot – a small lacquer drop whose tint is derived from an id.
// Purely decorative: it never encodes business data.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/theme';

const TINTS = [colors.rose, colors.roseSoft, colors.nude, colors.peach, colors.beige, colors.roseDeep];

function hash(seed: string): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h;
}

export function polishTint(seed: string): string {
    return TINTS[hash(seed) % TINTS.length];
}

export interface PolishDotProps {
    seed: string;
    size?: number;
}

export function PolishDot({ seed, size = 22 }: PolishDotProps) {
    const tint = polishTint(seed);
    return (
        <View
            style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint }]}
            accessible={false}
            importantForAccessibility="no"
        >
            <LinearGradient
                colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.7, y: 0.7 }}
                style={[styles.gloss, { borderRadius: size / 2 }]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        overflow: 'hidden',
        shadowColor: '#3c2820',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    gloss: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default PolishDot;
