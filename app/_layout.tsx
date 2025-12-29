import { useColorScheme } from "@/hooks/use-color-scheme";
import { NAV_THEME, THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

// Configure how notifications behave when the app is in the FOREGROUND
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: false, // Don't show banner if app is open
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export default function RootLayout() {
    const colorScheme = useColorScheme() ?? "light";

    useEffect(() => {
        SystemUI.setBackgroundColorAsync(THEME[colorScheme].background);
    }, []);

    return (
        <ThemeProvider value={NAV_THEME[colorScheme]}>
            <Stack>
                <Stack.Screen name="index" options={{ title: "Routinely" }} />
                <Stack.Screen
                    name="routines/[routineId]"
                    options={{ title: "Routine" }}
                />
            </Stack>
            <StatusBar style="auto" />
            <PortalHost />
        </ThemeProvider>
    );
}
