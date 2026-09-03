// useContactSheet – "reach the salon" actions built from settings (call / WhatsApp / navigate).
import { useCallback } from 'react';
import { useSheet, SheetAction } from './ConfirmSheet';
import { useToast } from './Toast';
import { useAppData } from '../../lib/appData';
import { openMaps, openTel, openWhatsApp } from '../../lib/contact';

export function useContactSheet() {
    const { present } = useSheet();
    const { show } = useToast();
    const { businessPhone, businessWhatsApp, businessAddress, businessName } = useAppData();

    return useCallback(
        async (options?: { title?: string; message?: string; whatsappText?: string }) => {
            const actions: SheetAction[] = [];
            if (businessWhatsApp) actions.push({ id: 'whatsapp', label: 'הודעה בוואטסאפ', icon: 'logo-whatsapp', description: 'המענה המהיר ביותר' });
            if (businessPhone) actions.push({ id: 'call', label: 'שיחה לסלון', icon: 'call-outline' });
            if (businessAddress) actions.push({ id: 'navigate', label: 'ניווט לסלון', icon: 'navigate-outline', description: businessAddress });

            if (actions.length === 0) {
                show({ message: 'פרטי הקשר של הסלון אינם זמינים כרגע', tone: 'info' });
                return;
            }

            const choice = await present({
                title: options?.title || `דברי עם ${businessName}`,
                message: options?.message,
                icon: 'chatbubble-ellipses-outline',
                layout: 'list',
                actions,
                cancelLabel: 'סגירה',
            });

            let ok = true;
            if (choice === 'whatsapp') ok = await openWhatsApp(businessWhatsApp, options?.whatsappText);
            else if (choice === 'call') ok = await openTel(businessPhone);
            else if (choice === 'navigate') ok = await openMaps(businessAddress);
            if (!ok && choice) show({ message: 'לא הצלחנו לפתוח את האפליקציה המתאימה', tone: 'error' });
        },
        [present, show, businessPhone, businessWhatsApp, businessAddress, businessName]
    );
}
