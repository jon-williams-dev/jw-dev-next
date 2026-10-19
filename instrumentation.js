// Runs once when the Next.js server starts.
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.VARTA_HOST) {
        const { startCollector } = await import('./lib/varta_history')
        startCollector()
    }
}
