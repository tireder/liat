// useCourseRegistration – confirm sheet → API → toast, shared by list and detail.
import { useCallback, useState } from 'react';
import { useSheet } from '../feedback/ConfirmSheet';
import { useToast } from '../feedback/Toast';
import { useAuth } from '../../lib/auth';
import { useAppData } from '../../lib/appData';
import { coursesApi, Course } from '../../lib/api';
import { formatCourseDate } from '../../lib/courses';

export function useCourseRegistration() {
    const { phone, name: authName } = useAuth();
    const { confirm } = useSheet();
    const { show } = useToast();
    const { clientName: appClientName, refreshBootstrap, refreshBookings } = useAppData();
    const [busyId, setBusyId] = useState<string | null>(null);

    const register = useCallback(
        async (course: Course): Promise<boolean> => {
            if (!phone) return false;
            const name = (appClientName || authName || '').trim();

            const ok = await confirm({
                title: `להירשם ל${course.name}?`,
                message: `${formatCourseDate(course.date)}${course.duration ? ` · ${course.duration}` : ''}. ניצור איתך קשר לאישור ולפרטי התשלום.`,
                icon: 'school-outline',
                confirmLabel: 'כן, רשמי אותי',
                cancelLabel: 'לא עכשיו',
            });
            if (!ok) return false;

            setBusyId(course.id);
            const result = await coursesApi.register(course.id, phone, name || phone);
            setBusyId(null);

            if (result.error) {
                show({ message: result.error, tone: 'error', duration: 5000 });
                return false;
            }
            show({ message: 'נרשמת בהצלחה. ניצור איתך קשר בקרוב.', tone: 'success' });
            refreshBootstrap(true);
            refreshBookings(phone, true);
            return true;
        },
        [phone, appClientName, authName, confirm, show, refreshBootstrap, refreshBookings]
    );

    return { register, busyId };
}
