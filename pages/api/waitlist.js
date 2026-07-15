import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// In-memory rate limit: max 5 submissions per IP per hour
const rateLimit = new Map()
const MAX_PER_HOUR = 5
const ONE_HOUR = 60 * 60 * 1000

// Deduplicate: don't email the same address twice
const seen = new Set()

function getIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  const normalised = email.toLowerCase().trim()

  // Deduplicate
  if (seen.has(normalised)) {
    return res.status(200).json({ ok: true })
  }

  // Rate limit by IP
  const ip = getIp(req)
  const now = Date.now()
  const record = rateLimit.get(ip) || { count: 0, resetAt: now + ONE_HOUR }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + ONE_HOUR
  }

  if (record.count >= MAX_PER_HOUR) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  record.count++
  rateLimit.set(ip, record)

  try {
    await transporter.sendMail({
      from: `"Beacon Waitlist" <${process.env.EMAIL_USER}>`,
      to: process.env.BEACON_NOTIFY_EMAIL,
      subject: '🔦 New Beacon waitlist signup',
      text: `New signup: ${normalised}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#04090F;color:#fff;border-radius:12px">
          <h2 style="color:#14B8A6;margin:0 0 16px">New Beacon waitlist signup</h2>
          <p style="margin:0;font-size:18px">${normalised}</p>
        </div>
      `,
    })
    seen.add(normalised)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Waitlist email error:', err)
    res.status(500).json({ error: 'Failed to send' })
  }
}
