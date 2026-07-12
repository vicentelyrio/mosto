/** The Mosto brand mark — kept custom (source: design handoff `brew-nav.jsx`)
 *  rather than a Phosphor icon, since it's the app's own logo. */
export function BrewLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width={32} height={32} rx={8} fill="var(--mantine-color-amber-5)" />
      <path
        d="M9 6h14l-2.32 19.3a.8.8 0 0 1-.8.7h-7.76a.8.8 0 0 1-.8-.7L9 6Z"
        fill="#201504"
        fillOpacity={0.15}
        stroke="#201504"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1={9.5}
        y1={11}
        x2={22.5}
        y2={11}
        stroke="#201504"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}
