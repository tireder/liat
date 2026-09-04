// Help & contact – real salon details from settings, hours, FAQ
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Screen } from '../components/ui/Screen';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Chevron, Icon, IconName } from '../components/ui/Icon';
import { PressableScale } from '../components/ui/PressableScale';
import { AppText } from '../components/AppText';
import { useToast } from '../components/feedback/Toast';
import { useAppData } from '../lib/appData';
import { groupOperatingHours, isOpenToday, getTodayHours } from '../lib/hours';
import { openMaps, openTel, openWhatsApp } from '../lib/contact';
import { formatPhoneDisplay, LRM } from '../lib/format';
import { enter, useReducedMotion } from '../lib/motion';
import { colors, radius, spacing, typography } from '../lib/theme';

export default function HelpScreen() {
    const reduced = useReducedMotion();
    const { show } = useToast();
    const { settings, businessPhone, businessWhatsApp, businessAddress, businessName, cancelHoursBefore } = useAppData();
    const hours = groupOperatingHours(settings.operatingHours);
    const openToday = isOpenToday(settings.operatingHours);
    const today = getTodayHours(settings.operatingHours);

    const faqs = [
        {
            q: 'איך מבטלים או משנים תור?',
            a: `במסך "התורים שלי" ליד התור. עד ${cancelHoursBefore} שעות לפני המועד השינוי מיידי; מאוחר יותר יש ליצור קשר ישירות עם הסלון.`,
        },
        { q: 'לא קיבלתי קוד SMS', a: 'ודאי שהמספר נכון ושהמכשיר מקבל הודעות. אחרי 45 שניות אפשר לבקש קוד חדש במסך האימות.' },
        { q: 'התורים שלי לא מופיעים', a: 'ודאי שאת מחוברת עם אותו מספר טלפון שבו קבעת. משכי למטה כדי לרענן, או צאי והיכנסי שוב.' },
        { q: 'איך נרשמים לקורס?', a: 'בלשונית "קורסים" בחרי את הקורס ולחצי "הרשמה". נאשר את ההרשמה בשיחה קצרה ונשלח פרטי תשלום.' },
        { q: 'איך מפעילים תזכורות?', a: 'בפרופיל, תחת "התראות". אם ההתראות כבויות בהגדרות המכשיר, נפתח לך את ההגדרות משם.' },
    ];

    const fail = () => show({ message: 'לא הצלחנו לפתוח את האפליקציה המתאימה', tone: 'error' });

    return (
        <Screen header={<Header title="עזרה ויצירת קשר" />}>
            <View style={styles.list}>
                {businessWhatsApp || businessPhone ? (
                    <Animated.View entering={enter(0, reduced)}>
                        <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>דברי איתנו</AppText>
                        <View style={styles.contactGrid}>
                            {businessWhatsApp ? (
                                <ContactTile icon="logo-whatsapp" title="וואטסאפ" sub="המענה המהיר ביותר" onPress={() => openWhatsApp(businessWhatsApp, `היי ${businessName}, יש לי שאלה`).then((ok) => !ok && fail())} />
                            ) : null}
                            {businessPhone ? (
                                <ContactTile icon="call-outline" title="שיחה" sub={formatPhoneDisplay(businessPhone)} ltrSub onPress={() => openTel(businessPhone).then((ok) => !ok && fail())} />
                            ) : null}
                        </View>
                    </Animated.View>
                ) : null}

                {businessAddress ? (
                    <Animated.View entering={enter(1, reduced)}>
                        <Card onPress={() => openMaps(businessAddress).then((ok) => !ok && fail())} accessibilityLabel={`ניווט לסלון, ${businessAddress}`}>
                            <View style={styles.row}>
                                <View style={styles.iconWrap}>
                                    <Icon name="location-outline" size={20} tone="roseDeep" />
                                </View>
                                <View style={styles.rowText}>
                                    <AppText variant="caption" tone="soft">איפה אנחנו</AppText>
                                    <AppText variant="heading">{businessAddress}</AppText>
                                    <AppText variant="body-sm" tone="roseDeep">ניווט ב-Waze או במפות</AppText>
                                </View>
                                <Chevron direction="forward" size={16} tone="soft" />
                            </View>
                        </Card>
                    </Animated.View>
                ) : null}

                {hours.length > 0 ? (
                    <Animated.View entering={enter(2, reduced)}>
                        <Card>
                            <View style={styles.hoursHead}>
                                <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrowInline}>שעות פעילות</AppText>
                                <Badge label={openToday ? `פתוח היום עד ${today!.closeTime!.slice(0, 5)}` : 'סגור היום'} tone={openToday ? 'success' : 'neutral'} />
                            </View>
                            {hours.map((row, i) => {
                                const isToday = row.days.includes(new Date().getDay());
                                return (
                                    <View key={row.label} style={[styles.hoursRow, i === hours.length - 1 ? styles.hoursRowLast : null]}>
                                        <AppText variant="body" tone={isToday ? 'roseDeep' : 'muted'} style={isToday ? styles.todayText : null}>{row.label}</AppText>
                                        <AppText variant="body" tone={row.closed ? 'soft' : isToday ? 'roseDeep' : 'ink'} style={[styles.hoursValue, isToday ? styles.todayText : null]}>
                                            {row.hours}
                                        </AppText>
                                    </View>
                                );
                            })}
                        </Card>
                    </Animated.View>
                ) : null}

                <Animated.View entering={enter(3, reduced)}>
                    <AppText variant="eyebrow" tone="roseDeep" style={styles.eyebrow}>שאלות נפוצות</AppText>
                    <Card padding={spacing.sm}>
                        {faqs.map((f, i) => (
                            <FaqRow key={f.q} q={f.q} a={f.a} last={i === faqs.length - 1} />
                        ))}
                    </Card>
                </Animated.View>
            </View>
        </Screen>
    );
}

function ContactTile({ icon, title, sub, onPress, ltrSub }: { icon: IconName; title: string; sub: string; onPress: () => void; ltrSub?: boolean }) {
    return (
        <PressableScale onPress={onPress} haptic="impact" accessibilityRole="button" accessibilityLabel={`${title}, ${sub}`} style={styles.tile}>
            <View style={styles.tileIcon}>
                <Icon name={icon} size={24} tone="roseDeep" />
            </View>
            <AppText variant="heading">{title}</AppText>
            <AppText variant="caption" tone="muted" style={ltrSub ? styles.ltr : null}>{ltrSub ? `${LRM}${sub}${LRM}` : sub}</AppText>
        </PressableScale>
    );
}

function FaqRow({ q, a, last }: { q: string; a: string; last?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <View style={[styles.faq, last ? styles.faqLast : null]}>
            <PressableScale onPress={() => setOpen((v) => !v)} haptic="selection" accessibilityRole="button" accessibilityLabel={q} accessibilityState={{ expanded: open }} style={styles.faqHead}>
                <AppText variant="body" style={styles.faqQ}>{q}</AppText>
                <Chevron direction={open ? 'up' : 'down'} size={16} tone="soft" />
            </PressableScale>
            {open ? (
                <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
                    <AppText variant="body-sm" tone="muted" style={styles.faqA}>{a}</AppText>
                </Animated.View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        gap: spacing.lg,
    },
    eyebrow: {
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
    },
    eyebrowInline: {
        textTransform: 'uppercase',
    },
    contactGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    tile: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.xs,
        padding: spacing.lg,
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.line,
    },
    tileIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    ltr: {
        writingDirection: 'ltr',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.roseMist,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowText: {
        flex: 1,
        gap: 2,
    },
    hoursHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
    },
    hoursRowLast: {
        borderBottomWidth: 0,
    },
    hoursValue: {
        writingDirection: 'ltr',
        fontVariant: ['tabular-nums'],
    },
    todayText: {
        fontFamily: typography.fontFamily.semibold,
    },
    faq: {
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        paddingHorizontal: spacing.sm,
    },
    faqLast: {
        borderBottomWidth: 0,
    },
    faqHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        minHeight: 52,
    },
    faqQ: {
        flex: 1,
        fontFamily: typography.fontFamily.medium,
    },
    faqA: {
        paddingBottom: spacing.md,
    },
});
