// Guided exercises for the Coping Space. Seeded into the CopingExercise collection on start.
// Each exercise is a list of timed phases that repeat for `rounds`. The app shows `steps` first (how to do it),
// then walks the person through the phases one at a time.
//   motion: "grow" = circle expands (breathing in), "shrink" = circle contracts (breathing out),
//           "hold" = stays as it is, "none" = no animation (prompts).

export const COPING_EXERCISES = [
  {
    key: "box-breathing",
    title: "Box Breathing",
    summary: "Settle your nervous system with a steady 4-4-4-4 rhythm.",
    accent: "blue",
    intro:
      "Box breathing is a simple, slow rhythm that many people use to feel calmer and more focused. It works well when your mind is racing or your chest feels tight.",
    steps: [
      "Sit comfortably with your back supported and your shoulders relaxed.",
      "Breathe out gently to empty your lungs first.",
      "Breathe in slowly through your nose while counting to 4.",
      "Hold your breath softly for 4. Keep your face and shoulders loose.",
      "Breathe out slowly through your mouth for 4.",
      "Hold with your lungs empty for 4, then start again.",
    ],
    caution: "If you feel dizzy or uncomfortable, go back to normal breathing. Never force a hold.",
    rounds: 6,
    phases: [
      { label: "Breathe in", instruction: "Slowly through your nose", seconds: 4, motion: "grow" },
      { label: "Hold", instruction: "Gently, with relaxed shoulders", seconds: 4, motion: "hold" },
      { label: "Breathe out", instruction: "Slowly through your mouth", seconds: 4, motion: "shrink" },
      { label: "Hold", instruction: "Lungs empty, stay relaxed", seconds: 4, motion: "hold" },
    ],
    closing: "Well done. Notice how your breath and shoulders feel compared with a few minutes ago.",
    order: 1,
  },
  {
    key: "calming-exhale",
    title: "Vagus Nerve Stimulation",
    summary: "Gently calm racing thoughts with a long, humming exhale.",
    accent: "purple",
    featured: true,
    tag: "CLINICAL CHOICE",
    intro:
      "Breathing out for longer than you breathe in, and humming softly as you do, is a well-known way to help your body shift from tense toward calm. This exercise combines both.",
    steps: [
      "Sit or lie down somewhere you won't be disturbed. Rest one hand on your belly.",
      "Breathe in through your nose for 4 seconds and feel your belly rise.",
      "Breathe out slowly for 8 seconds while making a soft, low \"mmm\" hum, like a gentle purr.",
      "Feel the hum vibrate in your chest, throat and face.",
      "Repeat. Let the hum be quiet. It should never strain your throat.",
    ],
    caution: "Stop if you feel lightheaded. If you have a heart or breathing condition, check with your doctor first.",
    rounds: 8,
    phases: [
      { label: "Breathe in", instruction: "Through your nose, belly rising", seconds: 4, motion: "grow" },
      { label: "Hum out", instruction: "A long, soft \"mmm\" as you breathe out", seconds: 8, motion: "shrink" },
    ],
    closing: "Lovely. Rest here for a moment and notice any softening in your body.",
    order: 2,
  },
  {
    key: "warmth-reset",
    title: "Warmth Reset",
    summary: "A multi-sensory pause using warmth and touch for tactile relief.",
    accent: "peach",
    featured: true,
    tag: "SOOTHING",
    intro:
      "When thoughts are loud, giving your senses something simple and warm to focus on can bring you back to the present moment.",
    steps: [
      "Find something warm and safe to hold, like a mug of tea, a warm water bottle, a blanket, or your own palms pressed together.",
      "Settle somewhere comfortable and let your shoulders drop.",
      "Follow each prompt and just notice. There is nothing to get right.",
    ],
    caution: "Make sure whatever you hold is warm, not hot.",
    rounds: 1,
    phases: [
      { label: "Feel the warmth", instruction: "Notice where it is warmest and how it spreads", seconds: 40, motion: "none" },
      { label: "Notice the touch", instruction: "Its weight, its texture, how your fingers rest on it", seconds: 40, motion: "none" },
      { label: "Slow breath", instruction: "Breathe in for 4, out for 6, a few times", seconds: 40, motion: "none" },
      { label: "Let go", instruction: "Let your shoulders and jaw soften", seconds: 20, motion: "none" },
    ],
    order: 3,
  },
  {
    key: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    summary: "Use your five senses to come back to the present.",
    accent: "green",
    intro:
      "This quick sensory exercise can help when you feel anxious, overwhelmed or far away from the moment. You move your attention out of your thoughts and into the room around you.",
    steps: [
      "Look around the room you're in.",
      "Name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell and 1 you can taste.",
      "Say them out loud or silently. Go at your own pace, there's time for each.",
    ],
    rounds: 1,
    phases: [
      { label: "5 things you see", instruction: "Look slowly around and name five", seconds: 35, motion: "none" },
      { label: "4 things you feel", instruction: "Your feet on the floor, your clothes, the chair", seconds: 30, motion: "none" },
      { label: "3 things you hear", instruction: "Near sounds, then far ones", seconds: 25, motion: "none" },
      { label: "2 things you smell", instruction: "Or two smells you like", seconds: 20, motion: "none" },
      { label: "1 thing you taste", instruction: "Or one taste you enjoy", seconds: 15, motion: "none" },
    ],
    closing: "Nicely done. Take one slow breath and notice the room around you.",
    order: 4,
  },
  {
    key: "gratitude-journal",
    title: "Gratitude Journal",
    summary: "A short, curated prompt to ground a positive outlook.",
    accent: "peach",
    intro:
      "Noticing small good things can gently balance a mind that's focused on what's going wrong. It doesn't ignore the hard stuff. It just makes room for both.",
    steps: [
      "Grab a pen and paper, or open your journal in the app.",
      "Follow each prompt and write a line or two. Short is fine.",
      "Be specific. \"The warm chai this morning\" works better than \"my life\".",
    ],
    rounds: 1,
    phases: [
      { label: "One good thing today", instruction: "Think of something that went okay, however small", seconds: 45, motion: "none" },
      { label: "Why did it matter?", instruction: "What did it give you? Comfort, a laugh, a break?", seconds: 35, motion: "none" },
      { label: "Someone you appreciate", instruction: "Think of one person who helped, even a little", seconds: 35, motion: "none" },
      { label: "Write it down", instruction: "Capture one line from each in your journal", seconds: 60, motion: "none" },
    ],
    order: 5,
  },
  {
    key: "guided-reflection",
    title: "Guided Reflection",
    summary: "A mindful check-in with your thoughts and feelings, no judgment.",
    accent: "green",
    intro:
      "A gentle check-in helps you understand what you're feeling and what you might need, instead of pushing it away.",
    steps: [
      "Sit comfortably. You can close your eyes or soften your gaze.",
      "Move through each prompt slowly. Whatever you notice is okay.",
      "If your mind wanders, just return to the prompt.",
    ],
    rounds: 1,
    phases: [
      { label: "Settle", instruction: "Take three slow breaths and let your body get heavy", seconds: 30, motion: "none" },
      { label: "Scan your body", instruction: "Notice tension in your jaw, shoulders, chest, stomach", seconds: 45, motion: "none" },
      { label: "Name the feeling", instruction: "What is here right now? Try one or two words", seconds: 30, motion: "none" },
      { label: "What does it need?", instruction: "Rest, movement, company, comfort, space?", seconds: 45, motion: "none" },
      { label: "Close gently", instruction: "Thank yourself for taking this time", seconds: 20, motion: "none" },
    ],
    order: 6,
  },
  {
    key: "somatic-shaking",
    title: "Somatic Shaking",
    summary: "Release built-up tension by gently shaking out your body.",
    accent: "purple",
    intro:
      "Animals shake after a stressful moment, and many people find a short, loose shake helps release tight muscles and restless energy.",
    steps: [
      "Stand with your feet hip-width apart and soften your knees.",
      "Start small by shaking your hands, then let it travel up your arms and shoulders.",
      "Add your legs and let your whole body bounce gently. Keep your jaw loose.",
      "Slow down, stop, and stand still to feel what has changed.",
    ],
    caution: "Skip this if you feel dizzy, have an injury, or find it uncomfortable. Keep the movement gentle.",
    rounds: 1,
    phases: [
      { label: "Soften and stand", instruction: "Feet hip-width apart, knees slightly bent", seconds: 20, motion: "none" },
      { label: "Shake your hands", instruction: "Loose wrists, let it be a little silly", seconds: 30, motion: "none" },
      { label: "Arms and shoulders", instruction: "Let the shake travel upward", seconds: 30, motion: "none" },
      { label: "Whole body", instruction: "Gentle bounce through legs and torso", seconds: 40, motion: "none" },
      { label: "Pause and feel", instruction: "Stand still. Notice tingling, warmth, breath", seconds: 30, motion: "none" },
    ],
    order: 7,
  },
];
