// Restarts the Stauperle 13 hallway Pi from the kiosk's Restart button.
//
// Only where KIOSK_REBOOT=1 is set (the Pi's .env.local), so the public site never tries.
// The app runs as a normal user, so the Pi needs a one-time sudo rule allowing just reboot:
//
//   echo "$USER ALL=(root) NOPASSWD: /sbin/reboot" | sudo tee /etc/sudoers.d/kiosk-reboot
//   sudo chmod 440 /etc/sudoers.d/kiosk-reboot
//
// Needs the kiosk key (x-kiosk-key header), like the calendar.
import { execFile } from 'child_process'
import { kioskPaired } from '../../lib/kiosk_auth'

// Long enough for the response to reach the kiosk before the network goes down.
const DELAY_MS = 1000

// `sudo -l <command>` succeeds only if the sudo rule allows it; -n fails instead of asking for a password.
const allowed = () => new Promise((resolve) => execFile('sudo', ['-n', '-l', '/sbin/reboot'], (err) => resolve(!err)))

export default async function handler(req, res) {
  if (!kioskPaired(req)) {
    return res.status(401).json({ error: 'Not paired', code: 'unpaired' })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (process.env.KIOSK_REBOOT !== '1') {
    return res.status(403).json({ error: 'Restart is not enabled on this machine' })
  }

  if (!(await allowed())) {
    return res.status(403).json({ error: 'Restart not allowed: add the sudo rule (see pages/api/reboot.js)' })
  }

  setTimeout(() => {
    execFile('sudo', ['-n', '/sbin/reboot'], (err) => {
      if (err) console.error('Kiosk reboot failed:', err.message)
    })
  }, DELAY_MS)
  res.status(202).json({ ok: true })
}
