// useBookingActions – cancel / reschedule / calendar / contact, shared by Home and Appointments.
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSheet } from '../feedback/ConfirmSheet';
import { useToast } from '../feedback/Toast';
import { useContactSheet } from '../feedback/ContactSheet';
import { useAuth } from '../../lib/auth';
import { useAppData } from '../../lib/appData';
import { bookingsApi, Booking } from '../../lib/api';
import { addBookingToCalendar, canModify as canModifyBooking } from '../../lib/booking';
import { openAppSettings } from '../../lib/contact';
import { formatDateLong, formatTime, LRM } from '../../lib/format';

export function useBookingActions() {
    const router = useRouter();
    const { phone } = useAuth();
    const { confirm } = useSheet();
    const { show } = useToast();
    const contactSheet = useContactSheet();
    const { cancelHoursBefore, businessName, invalidateBookings, invalidateSlots, refreshBookings } = useAppData();

    const canModify = useCallback((b: Booking) => canModifyBooking(b, cancelHoursBefore), [cancelHoursBefore]);

    const contactForChange = useCallback(
        (b?: Booking) =>
            contactSheet({
                title: 'לשינוי או ביטול צרי קשר',
                message: `לא ניתן לבטל או לשנות תור פחות מ-${cancelHoursBefore} שעות לפני המועד. נשמח לעזור ישירות.`,
                whatsappText: b
                    ? `היי, אני רוצה לשנות את התור שלי ל${b.service?.name || 'טיפול'} ב-${formatDateLong(b.date)} בשעה ${formatTime(b.start_time)}`
                    : undefined,
            }),
        [contactSheet, cancelHoursBefore]
    );

    const cancel = useCallback(
        async (b: Booking) => {
            if (!phone) return;
            if (!canModify(b)) return contactForChange(b);

            const ok = await confirm({
                title: 'לבטל את התור?',
                message: `${b.service?.name || 'טיפול'} · ${formatDateLong(b.date)} · ${LRM}${formatTime(b.start_time)}${LRM}`,
                icon: 'calendar-clear-outline',
                confirmLabel: 'כן, בטלי את התור',
                cancelLabel: 'השאירי',
                destructive: true,
            });
            if (!ok) return;

            const result = await bookingsApi.cancel(b.id, phone);
            if (result.error) {
                show({ message: result.error, tone: 'error' });
                return;
            }
            invalidateBookings();
            invalidateSlots();
            refreshBookings(phone, true);
            show({ message: 'התור בוטל', tone: 'success', action: { label: 'לקביעת תור חדש', onPress: () => router.push('/(tabs)/book') } });
        },
        [phone, canModify, contactForChange, confirm, show, invalidateBookings, invalidateSlots, refreshBookings, router]
    );

    const change = useCallback(
        (b: Booking) => {
            if (!canModify(b)) return contactForChange(b);
            router.push(`/(tabs)/book?reschedule=${b.id}`);
        },
        [canModify, contactForChange, router]
    );

    const addToCalendar = useCallback(
        async (b: Booking) => {
            const result = await addBookingToCalendar(b, businessName);
            if (result.ok) {
                show({ message: 'התור נוסף ליומן עם תזכורת שעה לפני', tone: 'success' });
                return;
            }
            if (result.reason === 'permission') {
                const open = await confirm({
                    title: 'נדרשת גישה ליומן',
                    message: 'אפשרי גישה ליומן בהגדרות המכשיר כדי להוסיף את התור.',
                    icon: 'calendar-outline',
                    confirmLabel: 'פתחי הגדרות',
                    cancelLabel: 'לא עכשיו',
                });
                if (open) openAppSettings();
                return;
            }
            show({ message: result.reason === 'no-calendar' ? 'לא נמצא יומן במכשיר' : 'לא הצלחנו להוסיף ליומן', tone: 'error' });
        },
        [businessName, show, confirm]
    );

    const review = useCallback(
        (b: Booking) => {
            if (b.review_token) router.push(`/review/${b.review_token}`);
        },
        [router]
    );

    return { canModify, cancel, change, addToCalendar, contactForChange, review };
}
