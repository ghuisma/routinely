type DistributiveOmit<T, K extends keyof any> = T extends any
    ? Omit<T, K>
    : never;

/**
 * The specific behavior of the UI card.
 * 'simple'   = Checkbox / Done button
 * 'timer'    = Countdown ring
 * 'textarea' = Keyboard input
 */
export type StepType = "simple" | "timer" | "textarea";

/**
 * Properties shared by every single step, regardless of type.
 */
interface BaseStep {
    id: string;
    title: string;
    icon: string; // Emoji character (e.g., "🚿")
    description: string; // The subtitle text (e.g., "2 minutes. Breathe.")

    /**
     * If true, this step is CRITICAL and appears in "Emergency Mode".
     * If false, it is hidden when Emergency Mode is active, unless `emergencyAlternative` is given.
     */
    isEmergencySafe: boolean;
    emergencyAlternative?: DistributiveOmit<
        RoutineStep,
        "id" | "isEmergencySafe" | "emergencyAlternative"
    >;
}

export interface SimpleStep extends BaseStep {
    type: "simple";
}

export interface TimerStep extends BaseStep {
    type: "timer";
    durationSeconds: number; // e.g., 120 for 2 minutes
    autoStart?: boolean; // If true, timer starts as soon as card slides in
}

export interface TextAreaStep extends BaseStep {
    type: "textarea";
    placeholder: string; // e.g., "What's on your mind?"
    storageKey: string; // Logic to save to specific bucket (e.g., 'daily_journal', 'ram_clear')
}

export type RoutineStep = SimpleStep | TimerStep | TextAreaStep;

export interface Routine {
    id: string;
    icon: string; // e.g., "🌅"
    title: string; // e.g., "Morning Protocol"
    description: string; // e.g., "5:00 AM - 6:30 AM"
    steps: RoutineStep[];
}

const deepWorkRoutine: Routine = {
    id: "deep_work",
    icon: "🧠",
    title: "Deep Work Protocol",
    description: "Use before focused work sessions",
    steps: [
        // --- Phase 1: The Airlock (Sensory Control) ---
        {
            id: "step_quarantine",
            type: "simple",
            title: "Digital Quarantine",
            icon: "📵",
            description:
                "Phone and E-Reader go in the drawer/another room. Visual privacy is required.",
            isEmergencySafe: true, // CRITICAL: You cannot work with the phone visible.
        },
        {
            id: "step_sound_wall",
            type: "simple",
            title: "The Sound Wall",
            icon: "🎧",
            description:
                "Noise-canceling headphones ON. Play Brown Noise or 40Hz Binaural Beats.",
            isEmergencySafe: true, // CRITICAL: Isolates you from the environment.
        },
        {
            id: "step_light",
            type: "simple",
            title: "Light the Stage",
            icon: "💡",
            description:
                "Turn on the brightest task lamp or overhead light available. Signal alertness.",
            isEmergencySafe: true, // CRITICAL: Triggers cortisol/waking state.
        },

        // --- Phase 2: The Flight Plan (Cognitive Priming) ---
        {
            id: "step_ram_clear",
            type: "textarea",
            title: "Ram Clear",
            icon: "🧠",
            description:
                "Quickly dump every distracting thought, chore, or worry currently bouncing in your head.",
            placeholder: "Call mom, buy soy milk, email Dave...",
            storageKey: "ram_dump",
            isEmergencySafe: false, // OPTIONAL: Skip if rushing/emergency.
        },
        {
            id: "step_define_done",
            type: "textarea",
            title: 'Define "Done"',
            icon: "🎯",
            description:
                'What does "Winning" look like for this specific session? Be granular.',
            placeholder: "Draft the intro and first 3 bullet points...",
            storageKey: "session_goal",
            isEmergencySafe: false, // OPTIONAL: Skip if you already know exactly what to do.
        },

        // --- Phase 3: The Neural Ignition (Physiological) ---
        {
            id: "step_gaze",
            type: "timer",
            title: "The Gaze",
            icon: "👁️",
            description:
                "Stare at a specific spot on the wall or monitor. Do not move your eyes. Blink if needed.",
            durationSeconds: 30,
            isEmergencySafe: false, // OPTIONAL: Bio-hack for focus, can skip in emergency.
        },
        {
            id: "step_sigh",
            type: "simple", // Kept simple so you can pace yourself
            title: "Physiological Sigh",
            icon: "😮‍💨",
            description:
                "3 Rounds: Double inhale through nose (fill lungs + pop air sacs), long exhale through mouth.",
            isEmergencySafe: false, // OPTIONAL: Can skip if in "Panic/Late" mode.
        },

        // --- Phase 4: The Plunge (Low-Friction Entry) ---
        {
            id: "step_micro_definition",
            type: "textarea",
            title: "Define the Micro-Step",
            icon: "🧱",
            description:
                'What is the "Stupid Small" mechanical action to start? Do not write "Work". Write "Open File".',
            placeholder: "Open IDE and type the function name...",
            storageKey: "micro_step_commitment",
            isEmergencySafe: true, // CRITICAL: Overcomes the initial wall of friction.
        },
        {
            id: "step_execute",
            type: "simple",
            title: "Execute",
            icon: "🚀",
            description: "Do the micro-step you just wrote down. Immediately.",
            isEmergencySafe: true, // CRITICAL: The point of the whole routine.
        },
    ],
};

const morningRoutine: Routine = {
    id: "morning_launch",
    icon: "🌅",
    title: "Morning Launch",
    description: "05:00 AM - The Low Friction Entry",
    steps: [
        {
            id: "step_feet_floor",
            type: "simple",
            title: "Feet on Floor",
            icon: "👣",
            description: "Do not think. Just stand up. The bed is lava.",
            isEmergencySafe: true, // CRITICAL: You must wake up.
        },
        {
            id: "step_uniform",
            type: "simple",
            title: "The Uniform",
            icon: "👕",
            description:
                'Put on "Pile A" (Joggers & Sweater) immediately. Do not look for other clothes.',
            isEmergencySafe: true, // Emergency: Skip if late/hot, but usually critical for 5 AM comfort.
        },
        {
            id: "step_hydrate",
            type: "simple",
            title: "Hydrate",
            icon: "💧",
            description: "Drink a few sips of water. Rehydrate the brain.",
            isEmergencySafe: true, // CRITICAL: Biological necessity.
        },
    ],
};

const bioHackRoutine: Routine = {
    id: "bio_hack",
    icon: "🧬",
    title: "The Bio-Hack",
    description: "06:30 AM - Reset the Nervous System",
    steps: [
        {
            id: "step_wim_hof_prep",
            type: "simple",
            title: "Breathwork Setup",
            icon: "🧘",
            description: "Lie down on the floor/couch. Empty stomach required.",
            isEmergencySafe: true, // Emergency: Skip full breathwork.
        },
        {
            id: "step_wim_hof_active",
            type: "timer",
            title: "Wim Hof Method",
            icon: "🌬️",
            description: "3 Rounds. Deep In, Let Go. Retention phases.",
            durationSeconds: 600, // Approx 10 mins for 3 rounds
            autoStart: true,
            isEmergencySafe: false, // Emergency: Skip.
            emergencyAlternative: {
                type: "simple",
                title: "Emergency Reset",
                icon: "😤",
                description:
                    "Take ONE massive inhale. Hold. Long exhale. (Only if skipping full breathwork).",
            },
        },
        {
            id: "step_stretch",
            type: "timer",
            title: "Light Stretching",
            icon: "🙆",
            description:
                "Focus on neck, shoulders, and hips. Whatever feels good.",
            durationSeconds: 300, // 5 minutes
            isEmergencySafe: false, // Emergency: Replace with a quick stretch.
            emergencyAlternative: {
                type: "timer",
                title: "Light Stretching",
                icon: "🙆",
                description:
                    "Focus on neck, shoulders, and hips. Whatever feels good.",
                durationSeconds: 60, // 1 minute
            },
        },
        {
            id: "step_cold_shower",
            type: "timer",
            title: "The Shock",
            icon: "🚿",
            description:
                "Cold Shower. Control the panic response. Breathe through it.",
            durationSeconds: 120, // 2 minutes
            isEmergencySafe: false, // Emergency: Replace with face splash.
            emergencyAlternative: {
                type: "timer",
                title: "The Face Splash",
                icon: "💦",
                description:
                    "Splash ice-cold water on face for 15 seconds. (Mammalian Dive Reflex).",
                durationSeconds: 15,
            },
        },
        {
            id: "step_horse_stance",
            type: "timer",
            title: "The Reheat",
            icon: "🐎",
            description:
                "Horse stance + arm movements. Generate internal heat.",
            durationSeconds: 120, // 2 minutes
            isEmergencySafe: false, // Emergency: Skip.
        },
        {
            id: "step_dress_up",
            type: "simple",
            title: "Human Mode",
            icon: "👔",
            description: 'Change into "Pile B" (Real Clothes).',
            isEmergencySafe: true, // CRITICAL: Must get dressed.
        },
        {
            id: "step_teeth_morning",
            type: "simple",
            title: "Brush Teeth",
            icon: "🪥",
            description: "Brush now while in the bathroom context.",
            isEmergencySafe: true, // CRITICAL: Hygiene.
        },
        {
            id: "step_groom",
            type: "simple",
            title: "Grooming",
            icon: "💈",
            description: "Deodorant, Face Wash, Hair, Beard.",
            isEmergencySafe: true, // CRITICAL: Basic hygiene.
        },
    ],
};

const breakfastRoutine: Routine = {
    id: "breakfast",
    icon: "🍳",
    title: "Breakfast",
    description: "07:00 AM - Refuel and Prepare",
    steps: [
        {
            id: "step_asthma",
            type: "timer",
            title: "Asthma Meds",
            icon: "💨",
            description: "Take inhaler and hold breath.",
            durationSeconds: 10,
            isEmergencySafe: true, // CRITICAL: Health first.
        },
        {
            id: "step_vitamins",
            type: "simple",
            title: "Vitamins",
            icon: "💊",
            description: "Take daily vitamins.",
            isEmergencySafe: true, // CRITICAL: Long term health.
        },
        {
            id: "step_creatine",
            type: "simple",
            title: "Creatine",
            icon: "🥤",
            description: "Mix and drink creatine.",
            isEmergencySafe: false, // Emergency: Skip the mixing/drinking time.
        },
        {
            id: "step_fuel",
            type: "simple",
            title: "Refuel",
            icon: "🥑",
            description: "Eat Breakfast. High protein focus.",
            isEmergencySafe: true, // CRITICAL: Need energy.
        },
        {
            id: "step_caffeine",
            type: "simple",
            title: "Caffeinate",
            icon: "☕",
            description: "Enjoy coffee. (90+ mins after waking = no crash).",
            isEmergencySafe: true, // CRITICAL: Joy + Energy.
        },
        {
            id: "step_food_prep",
            type: "simple",
            title: "Food Prep",
            icon: "🥪",
            description: "Prepare sandwiches/lunch for later.",
            isEmergencySafe: false, // Emergency: Buy/prep food later.
        },
        {
            id: "step_dishes",
            type: "timer",
            title: "Dishes Sprint",
            icon: "🍽️",
            description: "Unpack dishwasher or wash breakfast plates.",
            durationSeconds: 300, // 5 mins max
            isEmergencySafe: false, // Emergency: Leave it.
        },
    ],
};

const eveningRoutine: Routine = {
    id: "evening_shutdown",
    icon: "🌙",
    title: "Evening Shutdown",
    description: "20:30 - Set up the 5:00 AM Success",
    steps: [
        {
            id: "step_melatonin",
            type: "simple",
            title: "Chemical Assist",
            icon: "💊",
            description: "Take Melatonin spray.",
            isEmergencySafe: true, // CRITICAL: Sleep aid.
        },
        {
            id: "step_asthma",
            type: "timer",
            title: "Asthma Meds",
            icon: "💨",
            description: "Take inhaler and hold breath.",
            durationSeconds: 10,
            isEmergencySafe: true, // CRITICAL: Health first.
        },
        {
            id: "step_brush",
            type: "simple",
            title: "Brush Teeth",
            icon: "🪥",
            description: "Brush teeth thoroughly.",
            isEmergencySafe: true, // CRITICAL: Basic hygiene is non-negotiable.
        },
        {
            id: "step_floss",
            type: "simple",
            title: "Floss",
            icon: "🦷",
            description: "Floss between all teeth.",
            isEmergencySafe: false, // Emergency: Skip if too tired/late.
        },
        {
            id: "step_fill_water",
            type: "simple",
            title: "Fill Tank",
            icon: "🚰",
            description: "Fill water bottle and place on desk.",
            isEmergencySafe: true, // CRITICAL: Reduces morning friction.
        },
        {
            id: "step_clear_digital",
            type: "simple",
            title: "Digital Reset",
            icon: "💻",
            description:
                "Close all tabs. Open ONLY the one doc needed for 5 AM.",
            isEmergencySafe: false, // Emergency: Skip.
        },
        {
            id: "step_clear_physical",
            type: "simple",
            title: "Physical Reset",
            icon: "🧹",
            description: "Clear desk surface. Headphones on table.",
            isEmergencySafe: false, // Emergency: Skip.
        },
        {
            id: "step_wardrobe_a",
            type: "simple",
            title: "Pile A (5 AM)",
            icon: "👟",
            description: "Lay out Joggers, Sweater, Socks next to bed/chair.",
            isEmergencySafe: false, // Emergency: Throw on floor.
        },
        {
            id: "step_wardrobe_b",
            type: "simple",
            title: "Pile B (Day)",
            icon: "👔",
            description: 'Hang up tomorrow\'s "Real Clothes" (Jeans/Shirt).',
            isEmergencySafe: false, // Emergency: Decide tomorrow.
        },
        {
            id: "step_alarm",
            type: "simple",
            title: "The Lock",
            icon: "⏰",
            description: "Set alarm for 05:00.",
            isEmergencySafe: true, // CRITICAL: Must wake up.
        },
        {
            id: "step_charge",
            type: "simple",
            title: "Charge Devices",
            icon: "🔌",
            description: "Plug in phone and other devices.",
            isEmergencySafe: true, // CRITICAL: Must charge.
        },
    ],
};

export const routines = {
    [morningRoutine.id]: morningRoutine,
    [deepWorkRoutine.id]: deepWorkRoutine,
    [bioHackRoutine.id]: bioHackRoutine,
    [breakfastRoutine.id]: breakfastRoutine,
    [eveningRoutine.id]: eveningRoutine,
};
