// Tab layout – floating island tab bar, auth-gated
import { Redirect, Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';
import { FloatingTabBar } from '../../components/FloatingTabBar';

export default function TabLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    // Splash stays visible while the session loads
    if (isLoading) return <View style={styles.loading} />;

    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

    return (
        <Tabs
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                sceneStyle: { backgroundColor: colors.bg },
            }}
        >
            {/* Visual order is defined in FloatingTabBar: account · book · [home] · courses · gallery */}
            <Tabs.Screen name="index" />
            <Tabs.Screen name="book" />
            <Tabs.Screen name="account" />
            <Tabs.Screen name="courses" />
            <Tabs.Screen name="gallery" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: colors.bg,
    },
});
