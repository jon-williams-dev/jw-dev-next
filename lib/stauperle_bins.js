// Bin collection days for the Stauperle 13 kiosk, from Kiebingen's printed "Termine der
// Ortschaft" plan. A new plan comes each year: add a year to PLANS with its dates as "MM-DD".

export const BIN_TYPES = {
  black: { name: 'Restmüll', color: '#5b6573' },
  green: { name: 'Bio', color: '#2e9e5b' },
  yellow: { name: 'Gelber Sack', color: '#ffd23f' },
  blue: { name: 'Papier', color: '#3a8bea' },
  bundles: { name: 'Altpapiersammlung', color: '#c8a46e' }, // paper bundles out by the road
}

// Only from November 2026, when this was set up; earlier dates had passed.
const PLANS = {
  2026: {
    black: ['11-10', '11-24', '12-08', '12-21'],
    green: ['11-03', '11-17', '12-01', '12-15', '12-29'],
    yellow: ['11-05', '11-19', '12-03', '12-17', '12-31'],
    blue: ['11-12', '12-10'],
    bundles: ['11-07', '12-12'],
  },
}

// Bin types collected on a "YYYY-MM-DD" date, as keys of BIN_TYPES.
export function binsOn(date) {
  const plan = PLANS[date.slice(0, 4)] || {}
  return Object.keys(BIN_TYPES).filter(type => plan[type]?.includes(date.slice(5)))
}

// The last date any plan covers, so the kiosk can ask for next year's.
export const planEnds = () => {
  const year = Math.max(...Object.keys(PLANS).map(Number))
  const last = Object.values(PLANS[year]).flat().sort().pop()
  return `${year}-${last}`
}
