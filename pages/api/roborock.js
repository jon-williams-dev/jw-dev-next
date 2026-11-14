// Starts the Roborock vacuum from the Stauperle 13 kiosk.
//
// Runs scripts/roborock_start.py (python-roborock), so it only works where that's set up: the Pi.
// See the top of the script for the one-time setup. ROBOROCK_PYTHON points at the Python that
// has python-roborock installed (defaults to the project's .venv-roborock).
//
// Needs the kiosk key (x-kiosk-key header), like the calendar.
import { execFile } from 'child_process'
import path from 'path'
import { kioskPaired } from '../../lib/kiosk_auth'

const TIMEOUT_MS = 60 * 1000

const python = () => process.env.ROBOROCK_PYTHON || path.join(process.cwd(), '.venv-roborock', 'bin', 'python')

function run() {
  return new Promise((resolve) => {
    execFile(python(), ['-I', path.join(process.cwd(), 'scripts', 'roborock_start.py'), 'start'], { timeout: TIMEOUT_MS }, (err, stdout) => {
      try {
        resolve(JSON.parse(stdout.trim().split('\n').pop()))
      } catch {
        resolve({ ok: false, error: err?.code === 'ENOENT' ? 'Roborock is not set up on this machine' : err?.killed ? 'Timed out' : 'Could not start the vacuum' })
      }
    })
  })
}

export default async function handler(req, res) {
  if (!kioskPaired(req)) {
    return res.status(401).json({ error: 'Not paired', code: 'unpaired' })
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const result = await run()
  res.setHeader('Cache-Control', 'private, no-store')
  res.status(result.ok ? 200 : 502).json(result.ok ? { name: result.name } : { error: result.error })
}
