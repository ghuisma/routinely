import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import {
    Routine,
    routines,
    SimpleStep,
    TextAreaStep,
    TimerStep,
} from "@/lib/routines";
import { useKeepAwake } from "expo-keep-awake";
import * as Notifications from "expo-notifications";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowRightIcon,
    CheckIcon,
    PauseIcon,
    PlayIcon,
    RefreshCcwIcon,
} from "lucide-react-native";
import {
    ComponentType,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Keyboard,
    Platform,
    Pressable,
    TouchableWithoutFeedback,
    Vibration,
    View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "tailwindcss/colors";

type BaseRoutineStepProps = {
    index: number;
    totalSteps: number;
};

type SimpleRoutineStepProps = SimpleStep & BaseRoutineStepProps;
type TimerRoutineStepProps = TimerStep & BaseRoutineStepProps;
type TextAreaRoutineStepProps = TextAreaStep & BaseRoutineStepProps;

type RoutineStepProps =
    | SimpleRoutineStepProps
    | TimerRoutineStepProps
    | TextAreaRoutineStepProps;

const SimpleRoutineStepView = ({
    icon,
    title,
    description,
    index,
    totalSteps,
    children,
}: Omit<SimpleRoutineStepProps, "type"> & { children?: ReactNode }) => {
    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                paddingTop: 32,
                paddingBottom: 16,
                gap: 16,
            }}
            enableOnAndroid
            enableAutomaticScroll
            // Adds extra padding above the keyboard so the input isn't flush against it
            extraScrollHeight={138}
            // Ensures taps on buttons (like the Timer) work instantly
            keyboardShouldPersistTaps="handled"
        >
            <Text className="text-lg font-medium tracking-widest text-muted-foreground uppercase">
                Step {index + 1} of {totalSteps}
            </Text>
            <Text className="text-9xl p-2">{icon}</Text>
            <Text className="text-center text-5xl font-black leading-tight text-foreground">
                {title}
            </Text>
            <Text className="text-center text-2xl font-medium leading-relaxed text-muted-foreground/80 px-4">
                {description}
            </Text>
            {children}
        </KeyboardAwareScrollView>
    );
};

const TimerRoutineStepView = ({
    durationSeconds,
    autoStart,
    ...props
}: TimerRoutineStepProps) => {
    const [timeLeft, setTimeLeft] = useState(durationSeconds);
    const [isActive, setIsActive] = useState(!!autoStart);

    const endTimeRef = useRef<number | null>(null);
    const intervalRef = useRef<number | null>(null);
    const notificationId = useRef<string | null>(null);

    // Request Permissions on mount
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== "granted") {
                await Notifications.requestPermissionsAsync();
            }
        })();
    }, []);

    // Helper to kill any pending notification
    const cancelNotification = async () => {
        if (notificationId.current) {
            await Notifications.cancelScheduledNotificationAsync(
                notificationId.current
            );
            notificationId.current = null;
        }
    };

    // Helper to schedule a new notification
    const scheduleNotification = async (seconds: number) => {
        // Cancel any existing one first to be safe
        await cancelNotification();

        // Schedule for exactly when the timer hits 0
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "Time's up! ⏰",
                body: "Your routine step is complete.",
                sound: true, // This ensures sound plays on iOS/Android
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: seconds,
            },
        });
        notificationId.current = id;
    };

    // The main Tick Logic
    useEffect(() => {
        if (isActive && endTimeRef.current === null) {
            // Initial start or Auto-start
            endTimeRef.current = Date.now() + timeLeft * 1000;
            // Schedule notification for the future
            scheduleNotification(timeLeft);
        }

        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (!endTimeRef.current) return;

                const now = Date.now();
                const remaining = Math.ceil((endTimeRef.current - now) / 1000);

                if (remaining <= 0) {
                    // --- TIMER FINISHED ---
                    setTimeLeft(0);
                    setIsActive(false);
                    endTimeRef.current = null;
                    if (intervalRef.current) clearInterval(intervalRef.current);

                    // We don't need to manually vibrate here if the notification
                    // fired while backgrounded. But if we are in the foreground,
                    // the notification is suppressed (by our config), so we vibrate manually.
                    if (Platform.OS === "android") {
                        Vibration.vibrate([0, 500, 500, 500]);
                    } else {
                        Vibration.vibrate();
                    }
                } else {
                    setTimeLeft(remaining);
                }
            }, 200);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    // Format seconds into MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const toggleTimer = async () => {
        if (timeLeft === 0) {
            resetTimer();
            return;
        }

        if (isActive) {
            // PAUSE
            setIsActive(false);
            endTimeRef.current = null;
            await cancelNotification(); // Stop the OS from alerting us
        } else {
            // RESUME
            setIsActive(true);
            endTimeRef.current = Date.now() + timeLeft * 1000;
            await scheduleNotification(timeLeft); // Tell OS to alert us in remaining seconds
        }
    };

    const resetTimer = async () => {
        setIsActive(false);
        endTimeRef.current = null;
        setTimeLeft(durationSeconds);
        await cancelNotification();
    };

    return (
        <SimpleRoutineStepView {...props}>
            <Pressable onPress={toggleTimer} onLongPress={resetTimer}>
                <View className="flex-row items-center gap-4 mt-2">
                    <Text
                        className={`text-8xl font-black font-mono ${
                            timeLeft === 0
                                ? "text-muted-foreground"
                                : isActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
                        }`}
                    >
                        {formatTime(timeLeft)}
                    </Text>
                    <Button
                        variant={
                            isActive || timeLeft === 0 ? "secondary" : "default"
                        }
                        size="icon"
                        className="size-16 rounded-full"
                        onPress={toggleTimer}
                        onLongPress={resetTimer}
                    >
                        {isActive ? (
                            <PauseIcon size={32} color="#fafafa" /> // #fafafa is `text-secondary-foreground`, somehow the className prop doesn't work here
                        ) : timeLeft > 0 ? (
                            <PlayIcon size={32} />
                        ) : (
                            <RefreshCcwIcon size={32} color="#fafafa" />
                        )}
                    </Button>
                </View>
            </Pressable>
        </SimpleRoutineStepView>
    );
};

const TextAreaRoutineStepView = ({
    placeholder,
    storageKey,
    ...props
}: TextAreaRoutineStepProps) => {
    const [text, setText] = useState("");

    // TODO: In a real app, load initial value from AsyncStorage using storageKey
    // useEffect(() => { loadFromStorage(storageKey).then(setText) }, [])

    const handleChangeText = (value: string) => {
        setText(value);
        // TODO: Save to AsyncStorage/State Management
        // saveToStorage(storageKey, value);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SimpleRoutineStepView {...props}>
                <Textarea
                    className="text-foreground text-xl leading-8 min-h-[150px] mt-2"
                    placeholder={placeholder}
                    placeholderTextColor={colors.zinc[500]}
                    value={text}
                    onChangeText={handleChangeText}
                />
            </SimpleRoutineStepView>
        </TouchableWithoutFeedback>
    );
};

const RoutineStepView = (props: RoutineStepProps) => {
    switch (props.type) {
        case "simple":
            return <SimpleRoutineStepView {...props} />;
        case "timer":
            return <TimerRoutineStepView {...props} />;
        case "textarea":
            return <TextAreaRoutineStepView {...props} />;
        default:
            return null;
    }
};

const COMPLETE_TEXT = [
    "Great job!",
    "Well done!",
    "You did it!",
    "Fantastic!",
    "Awesome work!",
    "Way to go!",
    "You nailed it!",
    "Superb!",
    "Brilliant!",
    "Excellent!",
    "Magnificent!",
    "Keep it up!",
    "You're amazing!",
    "Impressive!",
];

const RoutineCompleteView = () => {
    const completeText =
        COMPLETE_TEXT[Math.floor(Math.random() * COMPLETE_TEXT.length)];
    return (
        <View className="flex-1 flex-col items-center justify-center gap-4 p-4">
            <Text className="text-9xl p-2">✅</Text>
            <Text className="text-center text-5xl font-black leading-tight text-foreground">
                {completeText}
            </Text>
            <Text className="text-center text-2xl font-medium leading-relaxed text-muted-foreground/80 px-4">
                You've completed all the steps in this routine.
            </Text>
        </View>
    );
};

const RoutineScreen = ({ title, steps: _steps }: Routine) => {
    useKeepAwake();
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isEmergency, setIsEmergency] = useState(false);

    const steps = useMemo(() => {
        if (!isEmergency) return _steps;
        return _steps
            .map((_step) => {
                const { isEmergencySafe, emergencyAlternative, ...step } =
                    _step;
                if (isEmergencySafe || !emergencyAlternative) return _step;
                return {
                    ...step,
                    ...emergencyAlternative,
                    isEmergencySafe: true,
                };
            })
            .filter((step) => step.isEmergencySafe);
    }, [_steps, isEmergency]);

    const step = useMemo(
        () => steps[currentStepIndex],
        [currentStepIndex, steps]
    );

    const isCompleted =
        currentStepIndex >= steps.length || currentStepIndex < 0;

    useEffect(() => {
        setCurrentStepIndex(0);
    }, [isEmergency]);

    const handleNext = () => {
        if (isCompleted) return;
        setCurrentStepIndex(currentStepIndex + 1);
    };

    const handleBack = () => {
        if (currentStepIndex === 0) return;
        setCurrentStepIndex(currentStepIndex - 1);
    };

    const handleComplete = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    };

    return (
        <SafeAreaView edges={["bottom"]} className="flex-1">
            <Stack.Screen
                options={{
                    title,
                    headerTitle: () => (
                        <View className="flex flex-row items-center gap-2 justify-between">
                            <Text className="text-xl font-medium">{title}</Text>
                            <Pressable
                                onPress={() => setIsEmergency(!isEmergency)}
                            >
                                <View className="flex flex-row items-center gap-2">
                                    <Text>{isEmergency ? "🚨" : "🧘"}</Text>
                                    <Switch
                                        checked={isEmergency}
                                        onCheckedChange={setIsEmergency}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    ),
                    headerStyle: {
                        backgroundColor: isEmergency
                            ? colors.red[950]
                            : undefined,
                    },
                }}
            />
            <View className="flex-1 flex flex-col">
                {isCompleted ? (
                    <RoutineCompleteView />
                ) : (
                    <RoutineStepView
                        key={step.id}
                        index={currentStepIndex}
                        totalSteps={steps.length}
                        {...step}
                    />
                )}
                <View className="flex-row gap-4 p-4">
                    <Button
                        className="flex-1 h-12"
                        variant="secondary"
                        size="lg"
                        onPress={handleBack}
                        disabled={currentStepIndex === 0}
                    >
                        <Text className="text-lg">Back</Text>
                    </Button>

                    <Button
                        className="flex-1 h-12"
                        size="lg"
                        onPress={isCompleted ? handleComplete : handleNext}
                    >
                        <Text className="text-lg">
                            {isCompleted ? "Complete" : "Next"}
                        </Text>
                        {isCompleted ? (
                            <CheckIcon size={24} />
                        ) : (
                            <ArrowRightIcon size={24} />
                        )}
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
};

function withRoutine<P extends Routine>(WrappedComponent: ComponentType<P>) {
    return function WithRoutineComponent(props: Omit<P, keyof Routine>) {
        const router = useRouter();
        const { routineId } = useLocalSearchParams();

        const routine = useMemo(() => {
            if (typeof routineId !== "string") return;
            return routines[routineId];
        }, [routineId]);

        useEffect(() => {
            if (!routine) {
                if (router.canGoBack()) {
                    router.back();
                }
            }
        }, [routine, router]);

        if (!routine) return null;

        // Pass the routine (and any other original props) down to the child
        return <WrappedComponent {...(props as P)} {...routine} />;
    };
}

export default withRoutine(RoutineScreen);
