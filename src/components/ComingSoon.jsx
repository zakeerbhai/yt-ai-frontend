/**
 * Used for nav destinations whose backend isn't built yet (Analytics,
 * AI Assistant, Content Calendar). Says so plainly instead of faking
 * data — a dashboard full of invented numbers would be actively
 * misleading for a tool that's making real publishing decisions.
 */
export default function ComingSoon({ title, body, plannedRoutes = [] }) {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}>
        {title}
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-stone)" }}>
        {body}
      </p>
      <div
        className="rounded-xl border px-5 py-4"
        style={{ borderColor: "var(--color-ink-line)", background: "var(--color-ink-soft)" }}
      >
        <p className="text-xs font-mono uppercase tracking-wide mb-2" style={{ color: "var(--color-stone)" }}>
          Not built yet
        </p>
        <p className="text-sm" style={{ color: "var(--color-paper-dim)" }}>
          This page isn't wired to real data. The backend doesn't have these endpoints yet.
        </p>
        {plannedRoutes.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {plannedRoutes.map((r) => (
              <li key={r} className="text-xs font-mono" style={{ color: "var(--color-stone)" }}>
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
