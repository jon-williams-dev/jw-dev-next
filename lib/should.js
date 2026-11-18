// /should/<topic> questions. Each one gets a page with a Yes button and a No button that runs away,
// or, with `nags`, a No that stays put and a Yes that has to get through every nag first.
// `subject` is "I" when there is no ?name=, otherwise the name.
export const QUESTIONS = {
    motorbike: {
        emoji: '🏍️',
        question: (subject) => `Should ${subject} buy a new motorbike?`,
        yes: (subject) => subject === 'I' ? 'Obviously. Go and buy it!' : `Obviously. Go and buy it, ${subject}!`,
        taunts: ['Nope', 'Too slow', 'Not today', 'Try again', 'Nice try', 'Vroom!', 'Missed me', 'Just say yes'],
        confetti: ['🏍️', '🔥', '🏁', '💨', '🎉'],
    },
    crisps: {
        emoji: '🥔',
        question: (subject) => `Should ${subject} eat some crisps?`,
        nags: [
            { ask: 'Are you sure? Those jeans are already working overtime.', yes: 'Yes, crisps', no: 'Fine, no' },
            { ask: 'One bag is 550 calories. That’s an hour of jogging. You don’t jog.', yes: 'Still yes', no: 'OK, no' },
            { ask: 'Nobody in history has eaten just one crisp. It’ll be the whole bag.', yes: 'I know', no: 'Good point' },
            { ask: 'Your belt is already on its last hole. One more bag and it’s braces.', yes: 'Don’t care', no: 'For the belt' },
            { ask: 'Last chance. The sofa is already making a you-shaped dent.', yes: 'CRISPS', no: 'Fine, an apple' },
        ],
        yes: (subject) => subject === 'I' ? 'Fine. Enjoy your crisps, fatty.' : `Fine. Enjoy your crisps, ${subject}, you fatty.`,
        no: (subject) => subject === 'I' ? 'Good choice. The belt thanks you.' : `Good choice, ${subject}. The belt thanks you.`,
        confetti: ['🧂', '🍟', '🛋️', '😋', '🎉'],
        noConfetti: ['🥦', '🥕', '🍎', '🥗', '💪'],
    },
}

const MAX_NAME = 30

export function subjectFor(name) {
    const clean = String(name || '').trim().slice(0, MAX_NAME)
    return clean ? clean[0].toUpperCase() + clean.slice(1) : 'I'
}
