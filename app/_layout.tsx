import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { NAV_THEME, THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";

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
