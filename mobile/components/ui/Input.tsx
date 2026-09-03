// Input – labelled text field with error/helper text and RTL-aware alignment.
import React, { forwardRef, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing, typography } from '../../lib/theme';

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string | null;
    helper?: string;
    ltr?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    showCount?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
    { label, error, helper, ltr, containerStyle, style, multiline, showCount, maxLength, value, onFocus, onBlur, ...rest },
    ref
) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={containerStyle}>
            {label ? (
                <AppText variant="body-sm" style={styles.label}>
                    {label}
                </AppText>
            ) : null}
            <TextInput
                ref={ref}
                value={value}
                multiline={multiline}
                maxLength={maxLength}
                placeholderTextColor={colors.inkSoft}
                accessibilityLabel={label}
                onFocus={(e) => {
                    setFocused(true);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    onBlur?.(e);
                }}
                style={[
                    styles.input,
                    multiline ? styles.multiline : null,
                    ltr ? styles.ltr : styles.rtl,
                    focused ? styles.focused : null,
                    error ? styles.error : null,
                    style,
                ]}
                {...rest}
            />
            <View style={styles.footer}>
                {error ? (
                    <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite" style={styles.footerText}>
                        {error}
                    </AppText>
                ) : helper ? (
                    <AppText variant="caption" tone="soft" style={styles.footerText}>
                        {helper}
                    </AppText>
                ) : (
                    <View />
                )}
                {showCount && maxLength ? (
                    <AppText variant="caption" tone="soft" style={{ writingDirection: 'ltr' }}>
                        {(value?.length ?? 0)}/{maxLength}
                    </AppText>
                ) : null}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    label: {
        fontFamily: typography.fontFamily.medium,
        color: colors.ink,
        marginBottom: spacing.sm,
    },
    input: {
        minHeight: 54,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.lineStrong,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontFamily: typography.fontFamily.regular,
        fontSize: 17,
        color: colors.ink,
    },
    multiline: {
        minHeight: 120,
        textAlignVertical: 'top',
        lineHeight: 24,
    },
    rtl: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    ltr: {
        textAlign: 'left',
        writingDirection: 'ltr',
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.5,
    },
    focused: {
        borderColor: colors.roseDeep,
    },
    error: {
        borderColor: colors.danger,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
        minHeight: 16,
    },
    footerText: {
        flex: 1,
    },
});

export default Input;
