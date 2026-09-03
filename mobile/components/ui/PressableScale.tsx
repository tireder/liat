// PressableScale – press feedback (scale 0.97) with optional haptics.
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { haptics } from '../../lib/haptics';
import { useReducedMotion } from '../../lib/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
    haptic?: 'selection' | 'impact' | 'none';
    pressOpacity?: number;
}

export function PressableScale({
    children,
    style,
    scaleTo = 0.97,
    haptic = 'none',
    pressOpacity = 0.92,
    onPressIn,
    onPressOut,
    onPress,
    disabled,
    ...rest
}: PressableScaleProps) {
    const reduced = useReducedMotion();
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: reduced ? 1 : 1 - pressed.value * (1 - scaleTo) }],
        opacity: 1 - pressed.value * (1 - pressOpacity),
    }));

    return (
        <AnimatedPressable
            {...rest}
            disabled={disabled}
            onPressIn={(e) => {
                pressed.value = withTiming(1, { duration: 90 });
                onPressIn?.(e);
            }}
            onPressOut={(e) => {
                pressed.value = withSpring(0, { damping: 16, stiffness: 220 });
                onPressOut?.(e);
            }}
            onPress={(e) => {
                if (haptic === 'selection') haptics.selection();
                else if (haptic === 'impact') haptics.impact('light');
                onPress?.(e);
            }}
            style={[style, animatedStyle, disabled ? { opacity: 0.5 } : null]}
        >
            {children}
        </AnimatedPressable>
    );
}

export default PressableScale;
