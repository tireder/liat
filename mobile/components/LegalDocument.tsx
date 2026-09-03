// LegalDocument – shared layout for terms / privacy screens.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from './ui/Screen';
import { Header } from './ui/Header';
import { Button } from './ui/Button';
import { Icon, IconName } from './ui/Icon';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../lib/theme';

export interface LegalSection {
    title: string;
    body: string;
}

interface LegalDocumentProps {
    title: string;
    icon: IconName;
    updated: string;
    intro: string;
    sections: LegalSection[];
    footerNote?: string;
}

export function LegalDocument({ title, icon, updated, intro, sections, footerNote }: LegalDocumentProps) {
    const router = useRouter();
    return (
        <Screen header={<Header title={title} />}>
            <View style={styles.updated}>
                <Icon name={icon} size={16} tone="roseDeep" />
                <AppText variant="caption" tone="muted">עודכן לאחרונה: {updated}</AppText>
            </View>

            <View style={styles.intro}>
                <AppText variant="body">{intro}</AppText>
            </View>

            {sections.map((s, i) => (
                <View key={s.title} style={styles.section}>
                    <AppText variant="heading" accessibilityRole="header">
                        {i + 1}. {s.title}
                    </AppText>
                    <AppText variant="body" tone="muted">{s.body}</AppText>
                </View>
            ))}

            {footerNote ? (
                <View style={styles.footer}>
                    <AppText variant="body-sm" tone="muted" style={styles.footerText}>{footerNote}</AppText>
                    <Button label="לעזרה ויצירת קשר" variant="ghost" size="sm" onPress={() => router.push('/help')} />
                </View>
            ) : null}
        </Screen>
    );
}

const styles = StyleSheet.create({
    updated: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    intro: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.line,
        borderStartWidth: 3,
        borderStartColor: colors.rose,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    section: {
        gap: spacing.xs,
        marginBottom: spacing.xl,
    },
    footer: {
        backgroundColor: colors.blush,
        borderRadius: radius.md,
        padding: spacing.lg,
        gap: spacing.md,
        alignItems: 'flex-start',
    },
    footerText: {
        color: colors.ink,
    },
});

export default LegalDocument;
