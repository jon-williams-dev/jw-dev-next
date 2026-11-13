// /should/<topic> questions. Each one gets a page with a Yes button and a No button that runs away.
// `subject` is "I" when there is no ?name=, otherwise the name.
export const QUESTIONS = {
    motorbike: {
        emoji: '🏍️',
        question: (subject) => `Should ${subject} buy a new motorbike?`,
        yes: (subject) => subject === 'I' ? 'Obviously. Go and buy it!' : `Obviously. Go and buy it, ${subject}!`,
        taunts: ['Nope', 'Too slow', 'Not today', 'Try again', 'Nice try', 'Vroom!', 'Missed me', 'Just say yes'],
        confetti: ['🏍️', '🔥', '🏁', '💨', '🎉'],
    },
}

const MAX_NAME = 30

export function subjectFor(name) {
    const clean = String(name || '').trim().slice(0, MAX_NAME)
    return clean ? clean[0].toUpperCase() + clean.slice(1) : 'I'
}
