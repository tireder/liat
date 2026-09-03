// Book – multi-step wizard (artist → treatment → date & time → notes → confirm)
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Button } from '../../components/ui/Button';
import { AppText } from '../../components/AppText';
import { BookingSkeleton } from '../../components/SkeletonLoader';
import { StepProgress } from '../../components/booking/StepProgress';
import { ArtistStep } from '../../components/booking/ArtistStep';
import { ServiceStep } from '../../components/booking/ServiceStep';
import { DateTimeStep } from '../../components/booking/DateTimeStep';
import { NotesStep } from '../../components/booking/NotesStep';
import { ConfirmStep } from '../../components/booking/ConfirmStep';
import { STEP_LABEL, useBookingWizard } from '../../components/booking/useBookingWizard';
import { SuccessOverlay } from '../../components/feedback/SuccessOverlay';
import { useToast } from '../../components/feedback/Toast';
import { useContactSheet } from '../../components/feedback/ContactSheet';
import { useAuth } from '../../lib/auth';
import { useAppData } from '../../lib/appData';
import { bookingsApi, Booking } from '../../lib/api';
import { addBookingToCalendar } from '../../lib/booking';
import { haptics } from '../../lib/haptics';
import { colors, layout, spacing } from '../../lib/theme';

export default function BookScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { reschedule, service: serviceParam } = useLocalSearchParams<{ reschedule?: string; service?: string }>();
    const { phone } = useAuth();
    const { show } = useToast();
    const contactSheet = useContactSheet();
    const {
        services,
        artists,
        bookings,
        settings,
        bufferMinutes,
        cancelHoursBefore,
        businessName,
        businessAddress,
        isBootstrapLoading,
        refreshBookings,
        invalidateBookings,
        invalidateSlots,
    } = useAppData();

    const wizard = useBookingWizard();
    const { state, currentStep, canContinue, init: initWizard, reset: resetWizard } = wizard;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState<{ booking: Booking | null; pending: boolean } | null>(null);

    // Initialise once per param set; background refreshes never reset progress
    useEffect(() => {
        if (isBootstrapLoading) return;
        if (reschedule && bookings.length === 0) return; // wait for bookings to arrive
        initWizard({ artists, services, bookings, rescheduleId: reschedule || null, serviceParam: serviceParam || null });
    }, [isBootstrapLoading, artists, services, bookings, reschedule, serviceParam, initWizard]);

    // Make sure bookings are loaded for reschedule mode
    useEffect(() => {
        if (phone && reschedule) refreshBookings(phone);
    }, [phone, reschedule, refreshBookings]);

    // Leaving the tab after a success (or with stale params) starts fresh next time
    useFocusEffect(
        useCallback(() => {
            return () => {
                if (success) {
                    setSuccess(null);
                    resetWizard();
                    router.setParams({ reschedule: '', service: '' });
                }
            };
        }, [success, resetWizard, router])
    );

    const visibleServices = useMemo(() => {
        if (!state.artist) return services;
        return services.filter((s) => state.artist!.serviceIds.includes(s.id));
    }, [services, state.artist]);

    const labels = state.steps.map((s) => STEP_LABEL[s]);

    const handleSubmit = async () => {
        if (!phone || !state.service || !state.date || !state.time || isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (state.mode === 'reschedule' && state.rescheduleId) {
                const result = await bookingsApi.reschedule(state.rescheduleId, {
                    phone,
                    date: state.date,
                    startTime: state.time,
                    notes: state.notes || undefined,
                });
                if (result.error) return show({ message: result.error, tone: 'error', duration: 5000 });
                if (!result.data?.success) return show({ message: 'השרת לא עיבד את הבקשה. נסי שוב מאוחר יותר.', tone: 'error' });
                invalidateBookings();
                invalidateSlots();
                refreshBookings(phone, true);
                setSuccess({ booking: result.data.booking || null, pending: !!result.data.pending });
            } else {
                const result = await bookingsApi.create({
                    phone,
                    serviceId: state.service.id,
                    date: state.date,
                    startTime: state.time,
                    notes: state.notes || undefined,
                    artistId: state.artist?.id,
                });
                if (result.error) return show({ message: result.error, tone: 'error', duration: 5000 });
                invalidateBookings();
                invalidateSlots();
                refreshBookings(phone, true);
                setSuccess({ booking: result.data?.booking || null, pending: false });
            }
        } catch {
            show({ message: 'לא הצלחנו לקבוע את התור. נסי שוב.', tone: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const finish = (to: '/(tabs)' | '/(tabs)/appointments') => {
        setSuccess(null);
        resetWizard();
        router.setParams({ reschedule: '', service: '' });
        router.replace(to);
    };

    const handleCalendarFromSuccess = async () => {
        if (!success) return;
        const b: Booking | null =
            success.booking ||
            (state.service && state.date && state.time
                ? {
                      id: 'new',
                      client_id: '',
                      service_id: state.service.id,
                      date: state.date,
                      start_time: state.time,
                      end_time: '',
                      status: 'pending',
                      notes: state.notes,
                      service: state.service,
                  }
                : null);
        if (!b) return;
        const result = await addBookingToCalendar(b, businessName);
        show({ message: result.ok ? 'התור נוסף ליומן' : 'לא הצלחנו להוסיף ליומן', tone: result.ok ? 'success' : 'error' });
    };

    const isReschedule = state.mode === 'reschedule';
    const title = isReschedule ? 'שינוי מועד' : 'קביעת תור';
    const loading = isBootstrapLoading || !state.initialized;

    const showBack = state.stepIndex > 0;
    const showNext = currentStep === 'datetime' || currentStep === 'notes';
    const showSubmit = currentStep === 'confirm';

    return (
        <Screen
            scroll
            withTabBar
            header={
                <View>
                    <Header
                        title={title}
                        showBack={isReschedule}
                        onBack={() => router.replace('/(tabs)/appointments')}
                    />
                    {!loading ? <StepProgress labels={labels} index={state.stepIndex} /> : null}
                </View>
            }
            footer={
                !loading && (showBack || showNext || showSubmit) ? (
                    <View style={[styles.footer, { paddingBottom: layout.tabBarSpace + insets.bottom - spacing.xl }]}>
                        {showBack ? <Button label="חזרה" variant="secondary" onPress={wizard.back} haptic="selection" /> : null}
                        {showNext ? (
                            <Button label="המשך" onPress={wizard.next} disabled={!canContinue} style={styles.grow} />
                        ) : null}
                        {showSubmit ? (
                            <Button
                                label={isReschedule ? 'אישור המועד החדש' : 'אשרי וקבעי תור'}
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                style={styles.grow}
                            />
                        ) : null}
                    </View>
                ) : null
            }
        >
            {loading ? (
                <BookingSkeleton />
            ) : isReschedule && !state.rescheduleBooking ? (
                <View style={styles.missing}>
                    <AppText variant="display-sm" align="center">לא מצאנו את התור</AppText>
                    <AppText variant="body" tone="muted" align="center">ייתכן שהוא בוטל או שהקישור אינו תקף.</AppText>
                    <Button label="לתורים שלי" onPress={() => router.replace('/(tabs)/appointments')} />
                </View>
            ) : (
                <Animated.View key={`${state.initKey}-${currentStep}`} entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)} style={styles.step}>
                    {currentStep === 'artist' ? (
                        <ArtistStep artists={artists} selected={state.artist} onSelect={(a) => { haptics.selection(); wizard.selectArtist(a); }} onContact={() => contactSheet()} />
                    ) : null}
                    {currentStep === 'service' ? (
                        <ServiceStep
                            services={visibleServices}
                            artist={state.artist}
                            selected={state.service}
                            preselectedId={state.preselectedServiceId}
                            onSelect={(s) => { haptics.selection(); wizard.selectService(s); }}
                            onContact={() => contactSheet()}
                        />
                    ) : null}
                    {currentStep === 'datetime' ? (
                        <DateTimeStep
                            service={state.service}
                            artist={state.artist}
                            date={state.date}
                            time={state.time}
                            onSelectDate={wizard.selectDate}
                            onSelectTime={(t) => { haptics.selection(); wizard.selectTime(t); }}
                            operatingHours={settings.operatingHours}
                            bufferMinutes={bufferMinutes}
                            reschedule={isReschedule}
                        />
                    ) : null}
                    {currentStep === 'notes' ? <NotesStep notes={state.notes} onChange={wizard.setNotes} /> : null}
                    {currentStep === 'confirm' && state.date && state.time ? (
                        <ConfirmStep
                            service={state.service}
                            artist={state.artist}
                            date={state.date}
                            time={state.time}
                            notes={state.notes}
                            address={businessAddress}
                            cancelHoursBefore={cancelHoursBefore}
                            reschedule={isReschedule}
                            locked={state.locked}
                        />
                    ) : null}
                </Animated.View>
            )}

            <SuccessOverlay
                visible={!!success}
                eyebrow={success?.pending ? 'ממתין לאישור' : isReschedule ? 'שינוי מועד' : 'התור נקבע'}
                title={success?.pending ? 'בקשת השינוי נשלחה' : isReschedule ? 'המועד עודכן' : 'התור שלך נקבע'}
                subtitle={
                    success?.pending
                        ? 'הסלון יאשר את המועד החדש ותקבלי הודעה.'
                        : 'שלחנו לך SMS עם כל הפרטים. נתראה בסלון.'
                }
                primaryAction={{ label: 'לתורים שלי', onPress: () => finish('/(tabs)/appointments') }}
                secondaryAction={{ label: 'הוסיפי ליומן', onPress: handleCalendarFromSuccess }}
            />
        </Screen>
    );
}

const styles = StyleSheet.create({
    step: {
        paddingTop: spacing.sm,
    },
    grow: {
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.line,
    },
    missing: {
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing['3xl'],
    },
});
