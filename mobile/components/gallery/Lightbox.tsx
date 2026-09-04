// Lightbox – full-screen viewer with swipe, pinch-zoom, pan-to-dismiss and captions.
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../AppText';
import { PressableScale } from '../ui/PressableScale';
import { Chevron, Icon } from '../ui/Icon';
import type { GalleryImage } from '../../lib/api';
import { a11yButton } from '../../lib/a11y';
import { haptics } from '../../lib/haptics';
import { LRM } from '../../lib/format';
import { colors, radius, spacing } from '../../lib/theme';

interface LightboxProps {
    images: GalleryImage[];
    index: number | null;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
    const insets = useSafeAreaInsets();
    const { width, height } = Dimensions.get('window');
    const visible = index !== null && index >= 0 && index < images.length;
    const image = visible ? images[index!] : null;

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const [zoomed, setZoomed] = useState(false);

    useEffect(() => {
        scale.value = 1;
        savedScale.value = 1;
        tx.value = 0;
        ty.value = 0;
        setZoomed(false);
    }, [index, scale, savedScale, tx, ty]);

    const goTo = (next: number) => {
        if (next < 0 || next >= images.length) return;
        haptics.selection();
        onIndexChange(next);
    };

    const pinch = useMemo(
        () =>
            Gesture.Pinch()
                .onUpdate((e) => {
                    scale.value = Math.min(4, Math.max(1, savedScale.value * e.scale));
                })
                .onEnd(() => {
                    savedScale.value = scale.value;
                    if (scale.value <= 1.05) {
                        scale.value = withSpring(1);
                        savedScale.value = 1;
                        tx.value = withSpring(0);
                        ty.value = withSpring(0);
                        runOnJS(setZoomed)(false);
                    } else {
                        runOnJS(setZoomed)(true);
                    }
                }),
        [scale, savedScale, tx, ty]
    );

    const pan = useMemo(
        () =>
            Gesture.Pan()
                .onUpdate((e) => {
                    if (savedScale.value > 1) {
                        tx.value = e.translationX;
                        ty.value = e.translationY;
                    } else {
                        ty.value = e.translationY;
                        tx.value = e.translationX * 0.6;
                    }
                })
                .onEnd((e) => {
                    if (savedScale.value > 1) return;
                    if (Math.abs(e.translationY) > 110 || Math.abs(e.velocityY) > 900) {
                        runOnJS(onClose)();
                        return;
                    }
                    // Horizontal swipe changes image; RTL reading order → swipe left = next
                    if (e.translationX < -60 || e.velocityX < -700) runOnJS(goTo)((index ?? 0) + 1);
                    else if (e.translationX > 60 || e.velocityX > 700) runOnJS(goTo)((index ?? 0) - 1);
                    tx.value = withTiming(0, { duration: 180 });
                    ty.value = withTiming(0, { duration: 180 });
                }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [index, images.length, onClose, savedScale, tx, ty]
    );

    const doubleTap = useMemo(
        () =>
            Gesture.Tap()
                .numberOfTaps(2)
                .onEnd(() => {
                    const next = savedScale.value > 1 ? 1 : 2.2;
                    scale.value = withSpring(next);
                    savedScale.value = next;
                    tx.value = withSpring(0);
                    ty.value = withSpring(0);
                    runOnJS(setZoomed)(next > 1);
                }),
        [scale, savedScale, tx, ty]
    );

    const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

    const imageStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
    }));
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: 1 - Math.min(Math.abs(ty.value) / 400, 0.6),
    }));

    if (!visible || !image) return null;

    const canPrev = index! > 0;
    const canNext = index! < images.length - 1;

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
            <StatusBar style="light" />
            <View style={styles.root} accessibilityViewIsModal>
                <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />

                <GestureDetector gesture={composed}>
                    <Animated.View style={[styles.imageWrap, { width, height: height * 0.72 }, imageStyle]}>
                        <Image
                            source={{ uri: image.image_url }}
                            style={styles.image}
                            contentFit="contain"
                            transition={200}
                            cachePolicy="memory-disk"
                            accessibilityLabel={image.title || 'עבודת ציפורניים'}
                            accessible
                        />
                    </Animated.View>
                </GestureDetector>

                <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
                    <PressableScale onPress={onClose} style={styles.roundBtn} {...a11yButton('סגירה')}>
                        <Icon name="close" size={22} tone="inverse" />
                    </PressableScale>
                    <View style={styles.counter}>
                        <AppText variant="caption" tone="inverse">{LRM}{index! + 1} / {images.length}{LRM}</AppText>
                    </View>
                </View>

                <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]} pointerEvents="box-none">
                    {image.title || image.description ? (
                        <View style={styles.caption}>
                            {image.title ? <AppText variant="heading" tone="inverse">{image.title}</AppText> : null}
                            {image.description ? <AppText variant="body-sm" style={styles.captionBody}>{image.description}</AppText> : null}
                        </View>
                    ) : null}
                    {!zoomed && images.length > 1 ? (
                        <View style={styles.nav}>
                            <PressableScale onPress={() => goTo(index! - 1)} disabled={!canPrev} style={[styles.roundBtn, !canPrev ? styles.disabled : null]} {...a11yButton('תמונה קודמת', { disabled: !canPrev })}>
                                <Chevron direction="back" size={22} tone="inverse" />
                            </PressableScale>
                            <PressableScale onPress={() => goTo(index! + 1)} disabled={!canNext} style={[styles.roundBtn, !canNext ? styles.disabled : null]} {...a11yButton('תמונה הבאה', { disabled: !canNext })}>
                                <Chevron direction="forward" size={22} tone="inverse" />
                            </PressableScale>
                        </View>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {
        backgroundColor: 'rgba(20, 16, 14, 0.96)',
    },
    imageWrap: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    topBar: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roundBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.3,
    },
    counter: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.full,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    bottom: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        bottom: 0,
        gap: spacing.lg,
    },
    caption: {
        gap: 2,
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: radius.md,
        padding: spacing.md,
    },
    captionBody: {
        color: 'rgba(251,248,245,0.8)',
    },
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default Lightbox;
