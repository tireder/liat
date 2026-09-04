// OTP verification – six boxes bound to one hidden input, auto-submit on the last digit
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AppText } from '../../components/AppText';
import { otpApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatPhoneDisplay, LRM } from '../../lib/format';
import { haptics } from '../../lib/haptics';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing, typography } from '../../lib/theme';

const OTP_LENGTH = 6;
const RESEND_DELAY = 45;

export default function OtpScreen() {
    const router = useRouter();
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const { login } = useAuth();
    const reduced = useReducedMotion();

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
    const inputRef = useRef<TextInput>(null);
    const submittedCode = useRef<string | null>(null);
    const shake = useSharedValue(0);

    useEffect(() => {
        if (resendTimer <= 0) return;
        const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

    const triggerShake = useCallback(() => {
        haptics.notify('error');
        if (reduced) return;
        shake.value = withSequence(
            withTiming(-8, { duration: 50 }),
            withTiming(8, { duration: 50 }),
            withTiming(-5, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    }, [reduced, shake]);

    const verify = useCallback(
        async (value: string) => {
            if (!phone || value.length !== OTP_LENGTH || isLoading) return;
            if (submittedCode.current === value) return;
            submittedCode.current = value;
            setIsLoading(true);
            setError(null);
            setInfo(null);
            try {
                const result = await otpApi.verify(phone, value);
                if (result.error || !result.data?.verified) {
                    setError(result.error || 'הקוד שגוי. בדקי את ההודעה ונסי שוב.');
                    setCode('');
                    submittedCode.current = null;
                    triggerShake();
                    setTimeout(() => inputRef.current?.focus(), 50);
                    return;
                }

                const clientName = result.data.clientName;
                const needsProfile =
                    result.data.isNewClient || !clientName || clientName.replace(/\D/g, '') === phone.replace(/\D/g, '');

                haptics.notify('success');
                Keyboard.dismiss();
                if (needsProfile) {
                    router.replace({ pathname: '/(auth)/complete-profile', params: { phone } });
                } else {
                    await login(phone, clientName || undefined);
                    router.replace('/(tabs)');
                }
            } catch {
                setError('שגיאה באימות הקוד. נסי שוב.');
                submittedCode.current = null;
                triggerShake();
            } finally {
                setIsLoading(false);
            }
        },
        [phone, isLoading, login, router, triggerShake]
    );

    const handleChange = (text: string) => {
        const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
        setCode(digits);
        setError(null);
        if (digits.length === OTP_LENGTH) verify(digits);
    };

    const handleResend = async () => {
        if (resendTimer > 0 || !phone || isLoading) return;
        setCode('');
        setError(null);
        submittedCode.current = null;
        const result = await otpApi.send(phone);
        if (result.error) {
            setError(result.error);
        } else {
            setInfo('שלחנו קוד חדש');
            setResendTimer(RESEND_DELAY);
            haptics.notify('success');
        }
        inputRef.current?.focus();
    };

    const boxes = Array.from({ length: OTP_LENGTH }, (_, i) => code[i] || '');
    const activeIndex = Math.min(code.length, OTP_LENGTH - 1);

    return (
        <Screen scroll={false} edges={['top', 'bottom']} padded={false} header={<Header title="" onBack={() => router.back()} />}>
            <View style={styles.content}>
                <Animated.View entering={enter(0, reduced)} style={styles.copy}>
                    <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>אימות</AppText>
                    <AppText variant="display" accessibilityRole="header">הקוד בדרך אלייך</AppText>
                    <AppText variant="body" tone="muted">
                        שלחנו קוד בן 6 ספרות למספר{' '}
                        <AppText variant="body" style={styles.phone}>{LRM}{formatPhoneDisplay(phone)}{LRM}</AppText>
                    </AppText>
                </Animated.View>

                <Animated.View entering={enter(1, reduced)}>
                    <Pressable
                        onPress={() => inputRef.current?.focus()}
                        accessibilityRole="none"
                        accessibilityLabel={`קוד אימות, הוזנו ${code.length} מתוך 6 ספרות`}
                    >
                        <Animated.View style={[styles.boxes, shakeStyle]}>
                            {boxes.map((digit, i) => {
                                const isActive = i === activeIndex && !isLoading;
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.box,
                                            digit ? styles.boxFilled : null,
                                            isActive ? styles.boxActive : null,
                                            error ? styles.boxError : null,
                                        ]}
                                    >
                                        <AppText style={styles.digit}>{digit}</AppText>
                                        {isActive && !digit ? <View style={styles.caret} /> : null}
                                    </View>
                                );
                            })}
                        </Animated.View>
                    </Pressable>
                    <TextInput
                        ref={inputRef}
                        value={code}
                        onChangeText={handleChange}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="sms-otp"
                        maxLength={OTP_LENGTH}
                        autoFocus
                        editable={!isLoading}
                        style={styles.hiddenInput}
                        accessibilityLabel="קוד אימות"
                        caretHidden
                    />

                    <View style={styles.status} accessibilityLiveRegion="polite">
                        {error ? (
                            <AppText variant="body-sm" tone="danger" align="center">{error}</AppText>
                        ) : info ? (
                            <AppText variant="body-sm" tone="success" align="center">{info}</AppText>
                        ) : isLoading ? (
                            <AppText variant="body-sm" tone="muted" align="center">מאמתת את הקוד…</AppText>
                        ) : null}
                    </View>
                </Animated.View>

                <Animated.View entering={enter(2, reduced)} style={styles.actions}>
                    <Button
                        label="אימות"
                        size="lg"
                        fullWidth
                        onPress={() => verify(code)}
                        disabled={code.length !== OTP_LENGTH}
                        loading={isLoading}
                    />
                    <View style={styles.resend}>
                        {resendTimer > 0 ? (
                            <AppText variant="body-sm" tone="soft" align="center">
                                אפשר לשלוח קוד חדש בעוד {LRM}{String(resendTimer).padStart(2, '0')}{LRM} שניות
                            </AppText>
                        ) : (
                            <Button label="לא קיבלת? שלחי קוד חדש" variant="text" onPress={handleResend} disabled={isLoading} haptic="none" />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        gap: spacing['2xl'],
    },
    copy: {
        gap: spacing.sm,
    },
    eyebrow: {
        textTransform: 'uppercase',
    },
    phone: {
        fontFamily: typography.fontFamily.semibold,
        color: colors.ink,
    },
    boxes: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
        direction: 'ltr',
    },
    box: {
        width: 48,
        height: 60,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.lineStrong,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxFilled: {
        borderColor: colors.ink,
        backgroundColor: colors.bg,
    },
    boxActive: {
        borderColor: colors.roseDeep,
    },
    boxError: {
        borderColor: colors.danger,
    },
    digit: {
        fontFamily: typography.fontFamily.displayMedium,
        fontSize: 28,
        lineHeight: 34,
        color: colors.ink,
    },
    caret: {
        width: 2,
        height: 24,
        backgroundColor: colors.roseDeep,
        borderRadius: 1,
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 1,
        width: 1,
    },
    status: {
        minHeight: 24,
        marginTop: spacing.md,
    },
    actions: {
        gap: spacing.md,
    },
    resend: {
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
    },
});
