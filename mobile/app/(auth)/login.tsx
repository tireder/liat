// Login – phone number entry (OTP flow)
import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppText } from '../../components/AppText';
import { otpApi } from '../../lib/api';
import { useAppData } from '../../lib/appData';
import { maskPhoneInput } from '../../lib/format';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing } from '../../lib/theme';
import { ImageTile } from '../../components/ui/ImageTile';
import { BRAND_IMAGES } from '../../lib/brand';

export default function LoginScreen() {
    const router = useRouter();
    const reduced = useReducedMotion();
    const { businessName } = useAppData();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const digits = phone.replace(/\D/g, '');
    const isValid = digits.length === 10 && digits.startsWith('05');

    const validate = () => {
        if (digits.length !== 10) return 'מספר טלפון צריך להכיל 10 ספרות';
        if (!digits.startsWith('05')) return 'מספר טלפון נייד מתחיל ב-05';
        return null;
    };

    const handleSendOtp = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await otpApi.send(digits);
            if (result.error) {
                setError(result.error);
            } else {
                router.push({ pathname: '/(auth)/otp', params: { phone: digits } });
            }
        } catch {
            setError('לא הצלחנו לשלוח את הקוד. נסי שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Screen scroll={false} edges={['top', 'bottom']} padded={false}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
                <View style={styles.content}>
                    <Animated.View entering={enter(0, reduced)} style={styles.brand}>
                        <ImageTile source={BRAND_IMAGES.logo} decorative borderRadius={radius.lg} style={styles.logo} />
                        <AppText variant="display-xl" align="center" style={styles.wordmark}>
                            {businessName}
                        </AppText>
                        <AppText variant="eyebrow" tone="soft" align="center" style={styles.eyebrow}>
                            nail artist
                        </AppText>
                    </Animated.View>

                    <Animated.View entering={enter(1, reduced)} style={styles.copy}>
                        <AppText variant="display" accessibilityRole="header">ברוכה הבאה</AppText>
                        <AppText variant="body" tone="muted" style={styles.subtitle}>
                            נשלח לך קוד ב-SMS כדי להתחבר. בלי סיסמאות, בלי טפסים.
                        </AppText>
                    </Animated.View>

                    <Animated.View entering={enter(2, reduced)}>
                        <Input
                            label="מספר טלפון נייד"
                            value={phone}
                            onChangeText={(t) => {
                                setPhone(maskPhoneInput(t));
                                setError(null);
                            }}
                            placeholder="050-000-0000"
                            keyboardType="phone-pad"
                            textContentType="telephoneNumber"
                            autoComplete="tel"
                            maxLength={12}
                            editable={!isLoading}
                            ltr
                            error={error}
                            returnKeyType="done"
                            onSubmitEditing={handleSendOtp}
                        />
                        <Button
                            label="שלחי לי קוד"
                            size="lg"
                            fullWidth
                            onPress={handleSendOtp}
                            disabled={!isValid}
                            loading={isLoading}
                            style={styles.button}
                        />
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <AppText variant="caption" tone="soft" align="center">
                        בהתחברות את מאשרת את
                    </AppText>
                    <View style={styles.links}>
                        <Button label="תנאי השימוש" variant="text" size="sm" onPress={() => router.push('/terms')} haptic="none" />
                        <AppText variant="caption" tone="soft">·</AppText>
                        <Button label="מדיניות הפרטיות" variant="text" size="sm" onPress={() => router.push('/privacy-policy')} haptic="none" />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        gap: spacing['2xl'],
    },
    brand: {
        alignItems: 'center',
        gap: 2,
    },
    logo: {
        width: 88,
        height: 88,
        marginBottom: spacing.md,
    },
    wordmark: {
        fontSize: 48,
        lineHeight: 56,
        color: colors.ink,
    },
    eyebrow: {
        textTransform: 'uppercase',
        letterSpacing: 3,
    },
    copy: {
        gap: spacing.sm,
    },
    subtitle: {
        maxWidth: 320,
    },
    button: {
        marginTop: spacing.md,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.xl,
    },
    links: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
});
