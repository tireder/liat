// RatingArc – the average rating as five stars laid along an arch, each star
// filled to its exact fraction, with the score in serif under the crown.
// Read-only; the review count only goes into the accessibility label.
import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { AppText } from '../AppText';
import { LRM } from '../../lib/format';
import { colors, typography } from '../../lib/theme';

export interface RatingArcProps {
    rating: number;
    count?: number;
    /** Total width of the arc in px */
    width?: number;
    style?: object;
}

const STAR_COUNT = 5;
/** Half of the angular spread of the arch, in degrees */
const HALF_SPREAD = 44;

/** Five-point star centred on 0,0 with outer radius r */
function starPath(r: number): string {
    const inner = r * 0.42;
    const pts: string[] = [];
    for (let k = 0; k < 10; k++) {
        const rad = ((-90 + k * 36) * Math.PI) / 180;
        const rr = k % 2 === 0 ? r : inner;
        pts.push(`${(Math.cos(rad) * rr).toFixed(2)},${(Math.sin(rad) * rr).toFixed(2)}`);
    }
    return `M${pts.join('L')}Z`;
}

export function RatingArc({ rating, count, width = 208, style }: RatingArcProps) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const value = Math.max(0, Math.min(STAR_COUNT, rating));

    const starR = width * 0.062; // outer radius of a star
    const radius = width * 0.58; // arch radius
    const cx = width / 2;
    const cy = radius + starR + 2; // arch centre sits below the drawing
    const height = Math.ceil(cy - radius * Math.sin(((90 - HALF_SPREAD) * Math.PI) / 180) + starR + 2);
    const scoreTop = starR * 2.1;
    const scoreSize = width * 0.2;
    // The score hangs below the arch, so the block must be tall enough for it
    const blockHeight = Math.ceil(Math.max(height, scoreTop + scoreSize * 1.1 + 18));
    const d = starPath(starR);

    // RTL: star 1 is on the right (angle < 90°), star 5 on the left
    const stars = Array.from({ length: STAR_COUNT }, (_, i) => {
        const angle = 90 - HALF_SPREAD + (i * (HALF_SPREAD * 2)) / (STAR_COUNT - 1);
        const rad = (angle * Math.PI) / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy - radius * Math.sin(rad);
        const tilt = 90 - angle; // follow the arch tangent
        const fraction = Math.max(0, Math.min(1, value - i));
        return { x, y, tilt, fraction, key: `${uid}s${i}` };
    });

    const label = `דירוג ממוצע ${value.toFixed(1)} מתוך 5${count ? `, על סמך ${count} ביקורות` : ''}`;

    return (
        <View style={[styles.wrap, { width, height: blockHeight }, style]} accessible accessibilityRole="image" accessibilityLabel={label}>
            <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <Defs>
                    {stars.map((s) => (
                        <ClipPath id={`${s.key}c`} key={`${s.key}c`}>
                            {/* Fill grows from the right edge, matching the RTL reading order */}
                            <Rect x={starR - s.fraction * starR * 2} y={-starR} width={s.fraction * starR * 2} height={starR * 2} />
                        </ClipPath>
                    ))}
                </Defs>
                {stars.map((s) => (
                    <G key={s.key} transform={`translate(${s.x.toFixed(2)} ${s.y.toFixed(2)}) rotate(${s.tilt.toFixed(2)})`}>
                        <Path d={d} fill={colors.roseMist} stroke={colors.roseSoft} strokeWidth={1} strokeLinejoin="round" />
                        {s.fraction > 0 ? <Path d={d} fill={colors.rose} clipPath={`url(#${s.key}c)`} /> : null}
                    </G>
                ))}
            </Svg>
            <View style={[styles.score, { top: scoreTop }]} pointerEvents="none">
                <AppText style={[styles.scoreText, { fontSize: scoreSize, lineHeight: scoreSize * 1.1 }]} maxFontSizeMultiplier={1.1}>
                    {LRM}{value.toFixed(1)}{LRM}
                </AppText>
                <AppText variant="eyebrow" tone="soft" style={styles.outOf} maxFontSizeMultiplier={1.1}>
                    מתוך {LRM}5{LRM}
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignSelf: 'center',
        alignItems: 'center',
    },
    score: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    scoreText: {
        fontFamily: typography.fontFamily.display,
        color: colors.ink,
        textAlign: 'center',
        writingDirection: 'ltr',
    },
    outOf: {
        marginTop: -2,
        textTransform: 'uppercase',
    },
});

export default RatingArc;
