// The Stauperle family key (STAUPERLE_KEY), sent by paired devices as x-kiosk-key.
// Without a key configured, only development is open.
export function kioskPaired(req) {
  const key = process.env.STAUPERLE_KEY
  return key ? req.headers['x-kiosk-key'] === key : process.env.NODE_ENV !== 'production'
}
