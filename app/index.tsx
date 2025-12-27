import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { routines } from "@/lib/routines";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

export default function Index() {
    const router = useRouter();
    return (
        <View className="flex-1 p-4 flex flex-col gap-4">
            {Object.values(routines).map((routine) => (
                <Pressable
                    onPress={() => router.navigate(`/routines/${routine.id}`)}
                    key={routine.id}
                >
                    <Card>
                        <CardHeader>
                            <View className="flex flex-row gap-2">
                                <Text className="text-4xl">{routine.icon}</Text>
                                <View className="flex flex-col gap-1">
                                    <CardTitle>{routine.title}</CardTitle>
                                    <CardDescription>
                                        {routine.description}
                                    </CardDescription>
                                </View>
                            </View>
                        </CardHeader>
                    </Card>
                </Pressable>
            ))}
        </View>
    );
}
