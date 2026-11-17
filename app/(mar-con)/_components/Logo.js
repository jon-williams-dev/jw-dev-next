/**
 * Logo přepsané do vektorové podoby podle původního mar-con_logo.jpg.
 * Pokud firma má originální vektorové logo (SVG/AI/EPS), nahraďte tuto komponentu obrázkem.
 */
export function Logo({ className = "", compact = false }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label="mar~con – laboratorní technika">
      <span
        className="flex items-center font-logo font-black text-brand tracking-tight"
        style={{ fontSize: compact ? "1.75rem" : "2.25rem" }}
      >
        mar
        <svg viewBox="0 0 60 24" className="mx-1 h-[0.6em] w-[1.4em]" aria-hidden>
          <path
            d="M3 19 C 12 4, 22 4, 30 12 S 48 22, 57 5"
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </svg>
        con
      </span>
      {!compact && (
        <span className="mt-1 pl-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-slate">
          Laboratorní technika
        </span>
      )}
    </span>
  );
}
