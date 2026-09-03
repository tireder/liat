// Gallery – editorial two-column grid, data-driven categories, gesture lightbox
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/ui/Screen';
import { Header } from '../../components/ui/Header';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { ImageTile } from '../../components/ui/ImageTile';
import { PressableScale } from '../../components/ui/PressableScale';
import { AppText } from '../../components/AppText';
import { GallerySkeleton } from '../../components/SkeletonLoader';
import { Lightbox } from '../../components/gallery/Lightbox';
import { useAppData } from '../../lib/appData';
import type { GalleryImage } from '../../lib/api';
import { colors, layout, radius, spacing } from '../../lib/theme';

const KNOWN_LABELS: Record<string, string> = {
    all: 'הכל',
    general: 'כללי',
    gel: "ג'ל",
    acrylic: 'אקריליק',
    art: 'נייל ארט',
    natural: 'טבעי',
    pedicure: 'פדיקור',
    manicure: 'מניקור',
};

export default function GalleryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { gallery: images, isGalleryLoading, refreshGallery } = useAppData();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [category, setCategory] = useState('all');
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    useEffect(() => {
        refreshGallery();
    }, [refreshGallery]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refreshGallery(true);
        setIsRefreshing(false);
    }, [refreshGallery]);

    // Categories come from the data itself
    const categories = useMemo(() => {
        const set = new Set<string>();
        images.forEach((img) => img.category && set.add(img.category));
        const list = Array.from(set);
        return list.length > 1 ? ['all', ...list] : [];
    }, [images]);

    const filtered = useMemo(
        () => (category === 'all' ? images : images.filter((img) => img.category === category)),
        [images, category]
    );

    const loading = isGalleryLoading && images.length === 0;

    const renderItem = useCallback(
        ({ item, index }: { item: GalleryImage; index: number }) => {
            const tall = index % 4 === 0 || index % 4 === 3;
            return (
                <PressableScale
                    onPress={() => setViewerIndex(index)}
                    haptic="selection"
                    accessibilityRole="imagebutton"
                    accessibilityLabel={item.title || 'עבודת ציפורניים, פתיחה בתצוגה מלאה'}
                    style={[styles.tile, { aspectRatio: tall ? 4 / 5 : 1 }]}
                >
                    <ImageTile uri={item.image_url} decorative borderRadius={radius.md} style={StyleSheet.absoluteFill} recyclingKey={item.id} />
                </PressableScale>
            );
        },
        []
    );

    return (
        <Screen
            scroll={false}
            padded={false}
            header={
                <View>
                    <Header title="גלריה" showBack={false} large eyebrow="העבודות שלי" />
                    {categories.length > 0 ? (
                        <FlatList
                            horizontal
                            data={categories}
                            keyExtractor={(c) => c}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chips}
                            renderItem={({ item }) => (
                                <Chip label={KNOWN_LABELS[item] || item} size="sm" selected={category === item} onPress={() => setCategory(item)} />
                            )}
                        />
                    ) : null}
                </View>
            }
        >
            {loading ? (
                <GallerySkeleton />
            ) : images.length === 0 ? (
                <EmptyState
                    icon="images-outline"
                    title="הגלריה מתמלאת בקרוב"
                    body="עבודות חדשות מהסטודיו יופיעו כאן. בינתיים אפשר לקבוע תור."
                    action={{ label: 'לקביעת תור', onPress: () => router.push('/(tabs)/book'), icon: 'calendar-outline' }}
                />
            ) : filtered.length === 0 ? (
                <EmptyState icon="color-filter-outline" title="אין עבודות בקטגוריה הזו" body="נסי קטגוריה אחרת או צפי בכל העבודות." action={{ label: 'הצגת הכל', onPress: () => setCategory('all') }} compact />
            ) : (
                <FlatList
                    data={filtered}
                    key={category}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={styles.column}
                    contentContainerStyle={[styles.grid, { paddingBottom: layout.tabBarSpace + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.roseDeep} />}
                    ListFooterComponent={
                        <View style={styles.footer}>
                            <AppText variant="caption" tone="soft" align="center">
                                {filtered.length} עבודות · לחצי לתצוגה מלאה
                            </AppText>
                        </View>
                    }
                />
            )}

            <Lightbox images={filtered} index={viewerIndex} onClose={() => setViewerIndex(null)} onIndexChange={setViewerIndex} />
        </Screen>
    );
}

const styles = StyleSheet.create({
    chips: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    grid: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        gap: spacing.sm,
    },
    column: {
        gap: spacing.sm,
    },
    tile: {
        flex: 1,
        borderRadius: radius.md,
        overflow: 'hidden',
        backgroundColor: colors.cream,
    },
    footer: {
        paddingVertical: spacing.lg,
    },
});
