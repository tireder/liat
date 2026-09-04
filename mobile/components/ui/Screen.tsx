// Screen – safe-area container with optional scroll, refresh and tab-bar clearance.
import React, { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, layout, spacing } from '../../lib/theme';

export interface ScreenProps {
    children?: ReactNode;
    scroll?: boolean;
    withTabBar?: boolean;
    padded?: boolean;
    refreshing?: boolean;
    onRefresh?: () => void;
    statusBar?: 'dark' | 'light';
    background?: string;
    contentStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    edges?: ('top' | 'bottom' | 'left' | 'right')[];
    header?: ReactNode;
    footer?: ReactNode;
    keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
}

export function Screen({
    children,
    scroll = true,
    withTabBar = false,
    padded = true,
    refreshing = false,
    onRefresh,
    statusBar = 'dark',
    background = colors.bg,
    contentStyle,
    style,
    edges = ['top'],
    header,
    footer,
    keyboardShouldPersistTaps = 'handled',
}: ScreenProps) {
    const insets = useSafeAreaInsets();
    const bottomPad = withTabBar ? layout.tabBarSpace + insets.bottom : spacing.xl + insets.bottom;

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: background }, style]} edges={edges}>
            <StatusBar style={statusBar} />
            {header}
            {scroll ? (
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[padded ? styles.padded : null, { paddingBottom: bottomPad }, contentStyle]}
                    keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.roseDeep} /> : undefined
                    }
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.flex, padded ? styles.padded : null, contentStyle]}>{children}</View>
            )}
            {footer}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    padded: {
        paddingHorizontal: layout.screenPadding,
    },
});

export default Screen;
