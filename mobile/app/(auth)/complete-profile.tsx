// Complete profile – first name for new clients
import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppText } from '../../components/AppText';
import { clientsApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { formatPhoneDisplay, LRM } from '../../lib/format';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing } from '../../lib/theme';

export default function CompleteProfileScreen() {
    const router = useRouter();
    const { phone } = useLocalSearchParams<{ phone: string }>();
    const { login } = useAuth();
    const reduced = useReducedMotion();

    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const trimmed = name.trim();
        if (!trimmed) return setError('איך לקרוא לך?');
        if (trimmed.length < 2) return setError('השם צריך להכיל לפחות 2 תווים');
        if (!phone) return setError('חסר מספר טלפון. חזרי להתחברות.');

        setIsLoading(true);
        setError(null);
        Keyboard.dismiss();
        try {
            const result = await clientsApi.updateName(phone, trimmed);
            if (result.error || !result.data?.success) {
                setError(result.error || 'לא הצלחנו לשמור את השם. נסי שוב.');
                return;
            }
            await login(phone, trimmed);
            router.replace('/(tabs)');
        } catch {
            setError('שגיאה בחיבור לשרת. נסי שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Screen
            scroll={false}
            edges={['top', 'bottom']}
            padded={false}
            header={<Header title="" onBack={() => router.replace('/(auth)/login')} />}
        >
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
                <View style={styles.content}>
                    <Animated.View entering={enter(0, reduced)} style={styles.copy}>
                        <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>צעד אחרון</AppText>
                        <AppText variant="display" accessibilityRole="header">נעים להכיר</AppText>
                        <AppText variant="body" tone="muted">
                            השם יופיע בפרופיל ובהודעות שנשלח לך על התורים.
                        </AppText>
                    </Animated.View>

                    <Animated.View entering={enter(1, reduced)} style={styles.phoneCard}>
                        <AppText variant="caption" tone="soft">מספר הטלפון שלך</AppText>
                        <AppText variant="heading" style={styles.phone}>{LRM}{formatPhoneDisplay(phone)}{LRM}</AppText>
                    </Animated.View>

                    <Animated.View entering={enter(2, reduced)}>
                        <Input
                            label="השם שלך"
                            value={name}
                            onChangeText={(t) => {
                                setName(t);
                                setError(null);
                            }}
                            placeholder="למשל: נועה"
                            autoFocus
                            editable={!isLoading}
                            autoComplete="name"
                            textContentType="name"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                            error={error}
                        />
                        <Button
                            label="המשך"
                            size="lg"
                            fullWidth
                            onPress={handleSubmit}
                            disabled={!name.trim()}
                            loading={isLoading}
                            style={styles.button}
                        />
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.lg,
        gap: spacing.xl,
    },
    copy: {
        gap: spacing.sm,
    },
    eyebrow: {
        textTransform: 'uppercase',
    },
    phoneCard: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.line,
        padding: spacing.lg,
        gap: 2,
    },
    phone: {
        writingDirection: 'ltr',
        textAlign: 'right',
    },
    button: {
        marginTop: spacing.md,
    },
});
