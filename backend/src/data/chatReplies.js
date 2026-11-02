// What MindMate says when no AI key is configured. Edit freely: add intents, phrases and replies here.
//
// How it works: the first intent (top to bottom) whose pattern matches the message is used, so more specific or
// more serious feelings are listed before general ones. {name} is replaced with the person's name.
// Each intent has several replies and a different one is picked each time, so it doesn't repeat itself.

export const INTENTS = [
  {
    id: "breathing",
    match: [/\bbreath(e|ing)\b/i, /\bcalm (me|myself)? ?down\b/i, /\bhelp me calm\b/i, /\bgrounding\b/i],
    replies: [
      "Let's do it together. Breathe in through your nose for 4, hold for 4, breathe out slowly for 4, hold for 4. Repeat that four times. For a guided version with a timer, open Coping Space and pick Box Breathing. How do you feel afterwards?",
      "Of course. Sit back and drop your shoulders. In for 4, hold for 4, out for 4, hold for 4. The Coping Space has a guided Box Breathing session if you'd like a circle to follow. Tell me how it goes.",
      "Okay, {name}, let's slow things down. Put one hand on your belly and breathe in gently for 4 so your hand rises, then out for 6 as if blowing through a straw. Do that five times, then tell me what changed.",
    ],
  },
  {
    id: "insult",
    match: [
      /\byou('?re| are)? (so |really |very )?(dumb|stupid|useless|annoying|boring|terrible|an? idiot|pathetic)\b/i,
      /\b(stupid|dumb|useless|bad) bot\b/i,
      /\byou suck\b/i,
    ],
    replies: [
      "Fair enough, I don't always get it right and I'm sorry that missed the mark. Tell me what you actually wanted to say and I'll try again.",
      "I hear you. I'm still learning, and I'd rather listen properly than give you a canned answer. What's going on for you right now?",
      "That's okay, you're allowed to be frustrated with me. If something else is behind it, I'm listening to that too. What's up, {name}?",
    ],
  },
  {
    id: "panic-anxiety",
    match: [/\b(panic|panicking|anxious|anxiety|nervous|scared|afraid|terrified|on edge|worried|worrying|racing thoughts|heart (is )?racing)\b/i],
    replies: [
      "That sounds really uncomfortable, {name}. Anxiety is your body sounding an alarm, even when nothing is wrong right now. Would you like to try a quick 1-minute box breathing round together?",
      "I'm here with you. When everything feels too fast, it can help to slow down your breathing first. Want me to walk you through a calming breath, or would you rather tell me what's worrying you?",
      "Thank you for telling me. Try this: look around and name 5 things you can see. It pulls your attention back to the room. Would you like to do the full 5-4-3-2-1 grounding exercise in the Coping Space?",
      "Worry has a way of making the future feel certain when it isn't. What's the thought that keeps coming back the loudest?",
      "You're not alone in this, {name}. Anxiety feels huge in the moment and it does come down. Is it a specific worry, or more of a general buzzing feeling?",
    ],
  },
  {
    id: "overthinking",
    match: [/\b(overthink(ing)?|can'?t stop thinking|keep thinking|thoughts won'?t stop|mind won'?t (stop|shut)|ruminat\w*)\b/i],
    replies: [
      "An overactive mind is exhausting. One thing that helps is getting the thoughts out of your head, onto paper or into the Journal. What's the thought that keeps looping?",
      "That sounds tiring, {name}. When we overthink, we're usually trying to solve something that can't be solved at 2 a.m. Is there one thing in the loop you could actually do something about today?",
      "Your mind is trying to protect you by going over things again and again. Let's try to give it a job: what's the main question it won't let go of?",
    ],
  },
  {
    id: "self-esteem",
    match: [
      /\bi hate myself\b/i,
      /\bi'?m (so |such |a |an )*(stupid|useless|failure|worthless|ugly|loser|burden|idiot)\b/i,
      /\bnot good enough\b/i,
      /\bi (always )?(fail|mess up|ruin) (at )?(everything|things)\b/i,
      /\bno ?one (likes|loves|cares about) me\b/i,
    ],
    replies: [
      "I'm sorry you're being so hard on yourself, {name}. That voice can sound very convincing, but it's not the full truth about you. What happened that made it so loud today?",
      "That sounds really painful to carry. Would you say that to a friend in your position? Tell me what led to this feeling and we can look at it together. And if it ever turns into thoughts of hurting yourself, please tell me straight away.",
      "You matter, even on days when your mind says otherwise. Can you tell me one thing you did recently, however small, that took effort?",
    ],
  },
  {
    id: "sad-low",
    match: [/\b(sad|down|depress(ed|ing)?|hopeless|empty|crying|cry|miserable|numb|unhappy|heartbroken|worthless|low)\b/i],
    replies: [
      "I'm sorry you're feeling this way, {name}. Feeling low doesn't mean something is wrong with you. Do you want to tell me what's been happening, or would you rather I just keep you company for a bit?",
      "Thank you for trusting me with that. Heavy days are real and they do pass, even when it doesn't feel like it. Is there something specific behind it, or does it feel more like a cloud with no reason?",
      "That sounds painful. You don't have to fix it right now. If you'd like, a short walk in daylight or writing a few lines in your journal can take a little weight off. Which feels more doable?",
      "I'm glad you said it out loud instead of carrying it alone. How long has it been feeling like this?",
      "It's okay to not be okay, {name}. You don't need a good reason for it. What would feel even a little bit comforting right now, a chat, some quiet, or something to distract you?",
      "That sounds really heavy. I'm here and I'm not going anywhere. Is today harder than usual, or has it been building for a while?",
    ],
  },
  {
    id: "lonely",
    match: [/\b(lonely|alone|no one|nobody|isolated|left out|no friends|friendless)\b/i],
    replies: [
      "Feeling alone can really hurt, and I'm glad you said it out loud. I'm here with you right now. Is there one person, even someone you haven't spoken to in a while, you could send a small message to?",
      "That sounds lonely, {name}. Connection doesn't have to be big. Even a short chat, a walk where other people are around, or a hobby group can help. What used to make you feel connected?",
      "Being surrounded by people can still feel lonely, and so can being on your own. Which one is it for you right now?",
      "Thank you for telling me. Loneliness is a signal that you need connection, not a sign that something's wrong with you. Who's someone you felt at ease with, even a long time ago?",
    ],
  },
  {
    id: "angry",
    match: [/\b(angry|furious|annoyed|irritated|frustrat(ed|ing)|pissed|mad at|so mad|hate|resent(ful|ment)?)\b/i],
    replies: [
      "That sounds really frustrating, and it's okay to be angry. Do you want to vent it out? I'm listening and I won't judge.",
      "Anger often shows up when something matters to us. What happened, {name}? Sometimes a few slow breaths first can take the edge off before we talk it through.",
      "I'd be upset too if that happened. Tell me the whole thing, from the start, and don't hold back.",
      "That's a lot of heat. Do you want to let it all out first, or figure out what to do about it?",
    ],
  },
  {
    id: "tired-sleep",
    match: [/\b(tired|exhaust(ed|ing)?|can'?t sleep|cannot sleep|insomnia|sleepless|drained|fatigue(d)?|no energy|worn out|sleep)\b/i],
    replies: [
      "Being this tired is draining in every way. How have you been sleeping lately? Even small things, like a steady bedtime and no screens for the last half hour, can help.",
      "That sounds exhausting, {name}. Is it more that your body is tired, or that your mind won't switch off? They need different kinds of rest.",
      "Rest isn't a reward, it's a need. What's been getting in the way of it, late nights, worries, or just too much to do?",
      "I'm sorry you're so worn out. If your mind races at bedtime, try writing tomorrow's worries in your journal first so they don't have to stay in your head. Does that happen to you?",
    ],
  },
  {
    id: "motivation",
    match: [/\b(no motivation|unmotivated|motivate me|need motivation|can'?t focus|can'?t concentrate|procrastinat\w*|lazy|can'?t get (started|myself))\b/i],
    replies: [
      "Motivation usually follows action, not the other way round. What's one task you could start for just five minutes? Five minutes is allowed to be messy.",
      "That stuck feeling is really common, {name}, and it isn't laziness. When your mind is carrying a lot, starting gets harder. What are you trying to get going on?",
      "Let's shrink it. Pick the smallest possible first step, like opening the document or putting on your shoes, and do only that. What would yours be?",
    ],
  },
  {
    id: "exam",
    match: [/\b(exams?|results?|marks|grades|failed|fail(ing)?|backlogs?|placements?|rejected|rejection|interview)\b/i],
    replies: [
      "Exams, results and interviews put a lot of pressure on you. How are you holding up, {name}? Is it the preparation, the waiting, or the fear of what comes after?",
      "That's a tough place to be, and it's normal to feel shaky about it. A result or a rejection says something about one day, not about your worth. What's weighing on you most?",
      "I hear you. When the stakes feel high, short breaks and sleep actually help more than studying through the night. What does your plan look like for the next few days?",
    ],
  },
  {
    id: "overwhelm-stress",
    match: [/\b(overwhelm(ed|ing)?|stress(ed|ful)?|too much|pressure|burn(ed|t)? ?out|burnout|deadline|workload|can'?t cope|cannot cope|swamped)\b/i],
    replies: [
      "That's a lot to carry, and it makes sense that you feel stretched. What feels heaviest right now? Sometimes naming just one thing makes the pile feel smaller.",
      "I hear you, {name}. When everything lands at once, it helps to pick one tiny next step and ignore the rest for ten minutes. What could that one step be?",
      "It sounds like you've been running on a lot. Would a short pause help? We could do a one-minute breathing reset, or you could write it all out in your journal and sort it afterwards.",
      "Feeling overwhelmed usually means too many things are fighting for attention. If you listed everything on your plate, what's the one thing that truly has to happen today?",
      "That sounds like real pressure, {name}. You don't have to solve all of it tonight. What can wait, and what can't?",
    ],
  },
  {
    id: "grief",
    match: [/\b(passed away|died|death of|funeral|grief|grieving|lost (my|a|someone)|i miss (him|her|them|you))\b/i],
    replies: [
      "I'm so sorry for your loss, {name}. There's no right way to feel after losing someone. Would you like to tell me about them?",
      "Grief can come in waves, and that's normal. You don't have to be okay right now. I'm here, and I'm happy to just listen.",
      "Missing someone this much shows how much they meant to you. What's a memory of them that makes you smile, even a little?",
    ],
  },
  {
    id: "family",
    match: [/\b(mom|mum|mother|dad|father|parents?|family|in-?laws?|brother|sister|siblings?|relatives|marriage pressure)\b/i],
    replies: [
      "Family can be the people we love most and the ones who stress us out most, all at once. What's been going on at home, {name}?",
      "That sounds hard. Feeling pulled between what your family expects and what you want is really draining. Which part feels most difficult?",
      "I'm listening. When family things are tense, it can follow you everywhere. Do you feel heard at home, or does it feel like a lot of pressure?",
    ],
  },
  {
    id: "relationships",
    match: [/\b(break ?up|broke up|boyfriend|girlfriend|partner|husband|wife|crush|dating|relationship|argument|argued|fight with|fought with|friend(s)?)\b/i],
    replies: [
      "Relationships can stir up a lot. What's been going on? I'm happy to listen to the whole story.",
      "That sounds like it's weighing on you, {name}. How are you feeling about it right now: hurt, confused, angry, or a mix?",
      "It's hard when someone we care about is part of the stress. What did you need from them that you didn't get?",
      "Thank you for sharing that. Do you want to talk through what happened, or figure out what to say to them?",
    ],
  },
  {
    id: "work-study",
    match: [/\b(work|job|boss|office|colleague(s)?|college|school|study(ing)?|assignment|project|career)\b/i],
    replies: [
      "Work and study take up so much of our energy. What's going on there? Is it the workload, the people, or something else?",
      "I'm listening, {name}. How is this affecting you outside of work or college, like your sleep, mood or free time?",
      "That sounds draining. What would make it even slightly more manageable this week?",
      "Thanks for telling me. Is this a one-off rough patch, or has it felt like this for a while?",
    ],
  },
  {
    id: "physical",
    match: [/\b(headache|migraine|fever|stomach ?ache|body ?ache|nausea|chest pain|dizzy|unwell)\b/i],
    replies: [
      "I'm sorry you're feeling physically off, {name}. I'm not a doctor, so if it's strong, sudden or lasts more than a couple of days, please see one. In the meantime, water, rest and a quiet space can help. Do you think stress might be adding to it?",
      "Body and mind are closely linked, so stress can make you feel ill. If something feels seriously wrong, please check with a doctor. How are you feeling emotionally alongside it?",
    ],
  },
  {
    id: "bored",
    match: [/\b(bored|boring|nothing to do|nothing interesting)\b/i],
    replies: [
      "Boredom can be a sign you need a little spark. Want a few ideas, like a walk, a new playlist, a quick doodle or a call with a friend? Or I'm happy to just chat.",
      "Let's find something small and fun. What's something you used to enjoy but haven't done in a while?",
      "Ha, we can fix that. Do you feel like something lively, like music or a walk, or something calm, like a puzzle or a show?",
    ],
  },
  {
    id: "hug",
    match: [/\b(need a hug|hug me|give me a hug|virtual hug|cuddle)\b/i],
    replies: [
      "Sending you a big, warm virtual hug, {name}. You're not alone right now. Want to tell me what's behind it?",
      "Consider yourself hugged. I'm here for you. What's been making you need one today?",
    ],
  },
  {
    id: "jokes",
    match: [/\b(joke|make me laugh|something funny|cheer me up)\b/i],
    replies: [
      "Okay, here's one. Why did the scarecrow win an award? Because he was outstanding in his field. Did that help even a little?",
      "Why don't scientists trust atoms? Because they make up everything. Now tell me, how are you really doing, {name}?",
      "What do you call a sleeping bull? A bulldozer. I'm hoping that got at least half a smile. Want another, or shall we chat?",
    ],
  },
  {
    id: "compliment",
    match: [
      /\bi (really )?(love|like|appreciate) (you|talking to you|this app|this chat)\b/i,
      /\byou('?re| are) (so |really |very )?(nice|sweet|great|amazing|helpful|kind|the best|wonderful|good)\b/i,
      /\bgood bot\b/i,
    ],
    replies: [
      "That's so kind of you, {name}, thank you. I'm really glad you're here. How are you feeling today?",
      "Thank you, that means a lot. I'll keep listening for as long as you need. What's on your mind?",
      "Aw, thank you. You deserve to feel supported. Is there anything you'd like to talk about?",
    ],
  },
  {
    id: "not-good",
    match: [/\b(not (feeling )?(so |very |too )?(good|great|well|okay|ok|fine)|bad day|rough day|terrible|awful|horrible|worst|meh|not great)\b/i],
    replies: [
      "I'm sorry it's been a rough one, {name}. Do you want to tell me what made it hard?",
      "That doesn't sound easy. What's been the toughest part of today?",
      "Some days just feel off, and that's allowed. Was it one thing that went wrong, or lots of small things piling up?",
      "Thanks for being honest with me. What would make the rest of today a little easier?",
    ],
  },
  {
    id: "fine-mask",
    match: [/^\s*(i'?m |i am )?(fine|okay|ok|alright|all right)\W*$/i],
    replies: [
      "Fine can cover a lot of ground, {name}. If you had to give today a weather report, sunny, cloudy or stormy, what would it be?",
      "I'm glad if that's true. If there's a little more underneath, I'm happy to listen. How is your energy today, really?",
      "Okay. Sometimes fine means good, and sometimes it means I'd rather not get into it. Either is fine with me. What's one thing that's been on your mind?",
    ],
  },
  {
    id: "positive",
    // "good morning" is a greeting and "ok bye" is a goodbye, so those don't count as feeling good.
    match: [
      /\b(happy|great|good(?! (morning|afternoon|evening|night))|amazing|awesome|excited|proud|wonderful|fantastic|better|relieved|grateful|thankful|joyful)\b/i,
      /\b(i'?m|i am|feeling|feel|doing) (fine|okay|ok|alright)\b/i,
    ],
    replies: [
      "I'm really glad to hear that, {name}! What made today feel good? Holding onto it for a moment helps it stick.",
      "That's lovely. Would you like to log it in your journal so you can look back on this feeling on harder days?",
      "Wonderful! What's been going right lately? I'd love to hear more.",
      "That makes me smile. Who or what helped you get to this feeling?",
      "Love that for you, {name}. What's one thing you want to remember about today?",
    ],
  },
  {
    id: "how-are-you",
    match: [/\bhow are (you|u)\b/i, /\bhow'?s it going\b/i, /\bhow do you feel\b/i, /\bhow('?s| is) your day\b/i],
    replies: [
      "I'm doing well, thank you for asking, {name}. I'm here to listen, so let's talk about you. How are you feeling today?",
      "I'm good, and happy you're here. How has your day been so far?",
      "Calm and glad to be chatting with you. What about you, how's your mind and body today?",
    ],
  },
  {
    id: "doing",
    match: [/\bwhat are you (doing|up to)\b/i, /\bwyd\b/i, /\bwhat'?s new\b/i],
    replies: [
      "Right now I'm waiting for you to tell me about your day, so my favourite thing. How is it going, {name}?",
      "Just here keeping you company. What have you been up to today?",
    ],
  },
  {
    id: "who-are-you",
    match: [/\bwho are you\b/i, /\bwhat are you\b/i, /\bwhat can you do\b/i, /\bare you (a |an )?(bot|ai|real|human|robot|person)\b/i, /\byour name\b/i],
    replies: [
      "I'm MindMate, an AI companion. I'm not a therapist or a doctor, but I can listen, help you untangle your thoughts, and guide you through breathing and grounding exercises. What's on your mind?",
      "I'm MindMate, a wellbeing companion made to listen without judgment. I'm an AI, so I can't replace a real person, but I can be here whenever you need to talk. What would you like to talk about?",
    ],
  },
  {
    id: "greeting",
    match: [/^\s*(hi+|hello+|hey+|hiya|yo|sup|hola|namaste|howdy)\b/i, /\bwh?at'?s ?up\b/i, /\bwass?up\b/i, /\bgood (morning|afternoon|evening)\b/i],
    replies: [
      "Hey {name}! I'm glad you stopped by. How are you feeling right now?",
      "Hi {name}. It's good to see you here. What's on your mind today?",
      "Hello! Not much on my end, I'm just here for you. How has your day been?",
      "Hey you. How's your heart today, calm, busy, or somewhere in between?",
      "Hi {name}! Ready when you are. Do you want to chat, vent, or try something calming?",
      "Hello {name}, welcome back. What's been on your mind lately?",
    ],
  },
  {
    id: "thanks",
    match: [/\b(thanks|thank you|thankyou|thx|appreciate it)\b/i],
    replies: [
      "You're very welcome, {name}. That's what I'm here for.",
      "Anytime. I'm glad it helped. Is there anything else on your mind?",
      "Of course. I'm happy I could be here for you. How are you feeling now?",
    ],
  },
  {
    id: "goodbye",
    match: [/\b(bye|goodbye|see you|see ya|gotta go|good night|talk later|ttyl)\b/i],
    replies: [
      "Take care of yourself, {name}. I'm here whenever you want to talk.",
      "Goodbye for now. Be gentle with yourself today, and come back anytime.",
      "Rest well, {name}. Drink some water, and remember that I'm here whenever you need me.",
    ],
  },
  {
    id: "wants-to-talk",
    match: [
      /\b(just )?want to (talk|vent|chat)\b/i,
      /\b(can|could) we (talk|chat)\b/i,
      /\btalk to me\b/i,
      /\bneed (someone|somebody) to (talk|listen)\b/i,
      /\bjust (talk|chat|vent)\b/i,
    ],
    replies: [
      "I'm all ears, {name}. Take your time and say whatever's on your mind. There's no wrong way to start.",
      "Of course. This is your space. Start anywhere, and I'll listen without judging.",
      "I'm here. Tell me what's going on, as messy or as short as you like.",
    ],
  },
  {
    id: "laugh",
    match: [/^\s*(lol|lmao|rofl|haha+|hehe+|😂|😄|🤣)\W*$/i],
    replies: [
      "Glad that got a laugh out of you, {name}. How are you feeling now?",
      "Ha, it's nice to hear some lightness. What's made you smile today?",
    ],
  },
  {
    id: "idk",
    match: [/^\s*(idk|i don'?t know|dunno|not sure|nothing|nothing much|hmm+|um+|nvm|never ?mind)\W*$/i],
    replies: [
      "That's okay, you don't have to know. Sometimes feelings are hard to put into words. Would it help if I asked a few simple questions, like how your body feels right now?",
      "No pressure at all, {name}. We can sit with it for a minute. If you had to pick one word for how today has been, what would it be?",
      "It's fine not to have the words yet. Is it more of a heavy feeling, a restless one, or just numb?",
    ],
  },
  {
    id: "needs-advice",
    match: [/\b(what should i do|any advice|give me advice|what do i do|can you help|help me|suggest|suggestion|ideas)\b/i],
    replies: [
      "I'd love to help. Tell me a bit more about what's going on, and we can work out one small step together. I can also guide you through a breathing or grounding exercise in the Coping Space.",
      "Let's figure it out together, {name}. What's the situation, and what would a good outcome look like for you?",
      "Happy to help you think it through. What have you already tried, and what felt like it helped even a little?",
    ],
  },
];

// Short answers like "yes" or "no" make sense only in context, so they're matched against what MindMate said last.
export const FOLLOW_UPS = [
  {
    afterBotSaid: /box breathing|breathing (round|cycle|reset)|calming breath/i,
    yes: [
      "Great. Sit comfortably and let your shoulders drop. In through your nose for 4, hold for 4, out slowly for 4, hold for 4. Do four rounds. For a guided version, open Coping Space and choose Box Breathing. How do you feel afterwards?",
    ],
    no: [
      "That's completely okay. We can just talk. What's on your mind right now?",
    ],
  },
  {
    afterBotSaid: /journal/i,
    yes: [
      "Lovely. Open the Journal tab, tap + Entry, and write whatever comes out. It doesn't have to be tidy, and you can even skip the writing and just pick a mood. I'll be here when you're done.",
    ],
    no: [
      "No problem. We can talk it through here instead. What's been going on?",
    ],
  },
  {
    afterBotSaid: /grounding|5-4-3-2-1/i,
    yes: [
      "Okay. Look around and name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell and 1 you can taste. The Coping Space has a guided version with timing. How do you feel after?",
    ],
    no: ["That's fine. Tell me what's going on and we'll take it from there."],
  },
  {
    afterBotSaid: /another one|want another/i,
    yes: [
      "Okay, one more. What do you call a fake noodle? An impasta. Want to tell me what's actually going on with you today?",
    ],
    no: ["Fair enough. Let's chat instead. How are you really feeling?"],
  },
  {
    afterBotSaid: /\?\s*$/,
    yes: ["I'm glad. Tell me more, I'm listening.", "Okay. Say as much or as little as you like.", "Good. Where would you like to start?"],
    no: ["That's okay. We can take it slowly. What would you like to talk about instead?", "No worries. I'm here whenever you're ready.", "Understood. There's no rush, {name}."],
  },
];

export const YES = /^\s*(yes|yeah|yep|yup|sure|ok(ay)?|please|go ahead|let'?s (do it|try)|i would|i'd like that|sounds good|definitely)\b/i;
export const NO = /^\s*(no|nope|nah|not (really|now|today)|maybe later|i don'?t think so|no thanks)\b/i;

// A bare "yes" or "no" with nothing to attach it to.
export const ACK_REPLIES = [
  "Okay. Tell me a little more so I can understand properly.",
  "I'm listening, {name}. What would you like to share?",
];

// "I feel ..." messages nothing else matched. {feeling} is what the person said, echoed back so it doesn't feel scripted.
export const REFLECT_REPLIES = [
  "It sounds like you feel {feeling}. That's a real thing to carry. What do you think is behind it?",
  "Thank you for telling me you feel {feeling}, {name}. When did you first notice it today?",
  "You feel {feeling}. I'm glad you said that out loud. Is it something new, or has it been around for a while?",
];

// A long message that matched nothing: the person has shared a lot, so say so before asking anything.
export const LONG_REPLIES = [
  "Thank you for sharing all of that with me, {name}. It sounds like there's a lot going on. Which part feels the heaviest right now?",
  "I read every word. That's a lot to hold at once. If you could change just one thing about it, what would it be?",
  "I'm really glad you let it all out. Take a breath. What do you need most right now, to be heard, to find a next step, or to calm down?",
];

// Used when nothing above matches. Open-ended questions keep the conversation going without sounding like a script.
export const DEFAULT_REPLIES = [
  "I hear you, {name}. What part of that is weighing on you most?",
  "Thank you for telling me. How long has it felt this way?",
  "That sounds like a lot to carry. What would feel like a small relief right now?",
  "I'm listening. Can you say a bit more about what happened?",
  "It makes sense that you'd feel that way. What do you need most right now?",
  "I'm with you. How is this showing up for you, in your mood, your body or your day?",
  "Tell me more about that, {name}. What was going through your mind when it happened?",
  "I want to understand. What's the hardest part of it for you?",
];
