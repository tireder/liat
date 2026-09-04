// Review – rate a completed appointment
import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { AppText } from '../../components/AppText';
import { InteractiveStarRating } from '../../components/StarRating';
import { useToast } from '../../components/feedback/Toast';
import { reviewsApi } from '../../lib/api';
import { useAppData } from '../../lib/appData';
import { haptics } from '../../lib/haptics';
import { enter, useReducedMotion } from '../../lib/motion';
import { colors, radius, spacing } from '../../lib/theme';

const RATING_LABEL: Record<number, string> = {
    1: 'לא טוב',
    2: 'יכול להשתפר',
    3: 'טוב',
    4: 'מעולה',
    5: 'מושלם',
};

export default function ReviewScreen() {
    const router = useRouter();
    const reduced = useReducedMotion();
    const { token } = useLocalSearchParams<{ token: string }>();
    const { show } = useToast();
    const { refreshReviews, businessName } = useAppData();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0 || !token) return;
        setIsSubmitting(true);
        try {
            const result = await reviewsApi.submit(token, rating, comment.trim() || undefined);
            if (result.error) {
                show({ message: result.error, tone: 'error', duration: 5000 });
                return;
            }
            haptics.notify('success');
            setIsSuccess(true);
            refreshReviews();
        } catch {
            show({ message: 'לא הצלחנו לשלוח את הביקורת. נסי שוב.', tone: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Screen scroll={false} edges={['top', 'bottom']} header={<Header title="" showBack={false} />}>
                <Animated.View entering={enter(0, reduced)} style={styles.success}>
                    <View style={styles.successIcon}>
                        <Icon name="checkmark" size={32} tone="inverse" />
                    </View>
                    <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>תודה</AppText>
                    <AppText variant="display" align="center" accessibilityRole="header">הביקורת נשלחה</AppText>
                    <AppText variant="body" tone="muted" align="center" style={styles.successText}>
                        היא תופיע באתר אחרי אישור. תודה שעזרת ל{businessName} להשתפר.
                    </AppText>
                    <View style={styles.successActions}>
                        <Button label="חזרה לדף הבית" size="lg" fullWidth onPress={() => router.replace('/(tabs)')} />
                        <Button label="לקביעת תור נוסף" variant="secondary" fullWidth onPress={() => router.replace('/(tabs)/book')} />
                    </View>
                </Animated.View>
            </Screen>
        );
    }

    return (
        <Screen edges={['top']} header={<Header title="דירוג הטיפול" />} keyboardShouldPersistTaps="handled">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <Animated.View entering={enter(0, reduced)} style={styles.copy}>
                    <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>הדעה שלך חשובה</AppText>
                    <AppText variant="display" accessibilityRole="header">איך היה הטיפול?</AppText>
                    <AppText variant="body" tone="muted">הביקורת מוצגת עם שם פרטי בלבד ועוזרת ללקוחות אחרות לבחור.</AppText>
                </Animated.View>

                <Animated.View entering={enter(1, reduced)} style={styles.ratingCard}>
                    <InteractiveStarRating rating={rating} onRatingChange={setRating} size={42} />
                    <AppText variant="heading" tone={rating ? 'roseDeep' : 'soft'} align="center" accessibilityLiveRegion="polite" style={styles.ratingLabel}>
                        {rating ? RATING_LABEL[rating] : 'בחרי דירוג'}
                    </AppText>
                </Animated.View>

                <Animated.View entering={enter(2, reduced)}>
                    <Input
                        label="כמה מילים (לא חובה)"
                        value={comment}
                        onChangeText={setComment}
                        placeholder="ספרי לנו על החוויה שלך…"
                        multiline
                        maxLength={500}
                        showCount
                    />
                    <Button label="שלחי ביקורת" size="lg" fullWidth onPress={handleSubmit} disabled={rating === 0} loading={isSubmitting} style={styles.submit} />
                </Animated.View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    copy: {
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    eyebrow: {
        textTransform: 'uppercase',
    },
    ratingCard: {
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.xl,
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
        marginBottom: spacing.xl,
    },
    ratingLabel: {
        minHeight: 24,
    },
    submit: {
        marginTop: spacing.md,
    },
    success: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingBottom: spacing['3xl'],
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.ink,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    successText: {
        maxWidth: 300,
    },
    successActions: {
        alignSelf: 'stretch',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
});
