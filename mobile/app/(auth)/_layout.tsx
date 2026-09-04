// Auth layout – login → otp → complete-profile
import { Redirect, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../../lib/auth';
import { colors } from '../../lib/theme';

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <View style={styles.loading} />;

    if (isAuthenticated) return <Redirect href="/(tabs)" />;

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'slide_from_left',
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="complete-profile" />
        </Stack>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: colors.bg,
    },
});
