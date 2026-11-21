// What a kWh is worth at Stauperle 13, for the euros on /stauperle13/sunbank and /varta. Update when the tariffs change.

// Bought from E-Werk Stengle, SparGeNial 2026 (household, single rate): ct/kWh incl. levies and VAT.
// The standing charge is left out: it's the same whether or not the sun shines.
export const BUY_CT = 28.57

// Paid by Stadt Rottenburg for what we feed in: the EEG rate for panels commissioned 22.07.2021,
// fixed until 2041. The VAT they add on top goes straight on to the tax office.
export const SELL_CT = 7.47

// 2.1 → "2.10 €", 0.45 → "45 ct".
export const fmtEuro = (euro) => euro < 1 ? `${Math.round(euro * 100)} ct` : `${euro.toFixed(2)} €`
