import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import ChannelSwitcher from "./ChannelSwitcher";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/upload", label: "Upload" },
  { to: "/scheduled", label: "Scheduled" },
  { to: "/analytics", label: "Analytics" },
  { to: "/assistant", label: "AI Assistant" },
  { to: "/calendar", label: "Content Calendar" },
  { to: "/settings", label: "Settings" },
];

export default function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-ink)" }}>
      <aside
        className="w-64 shrink-0 flex flex-col justify-between border-r"
        style={{ borderColor: "var(--color-ink-line)" }}
      >
        <div>
          <div className="px-6 py-6 border-b" style={{ borderColor: "var(--color-ink-line)" }}>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--color-signal)" }}
                aria-hidden="true"
              />
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "var(--color-stone)" }}>
                Pipeline
              </span>
            </div>
            <h1
              className="mt-1 text-xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-paper)" }}
            >
              YT Automation
            </h1>
          </div>

          <nav className="px-3 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "" : "hover:bg-white/5"
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? "var(--color-ink)" : "var(--color-paper-dim)",
                  background: isActive ? "var(--color-paper)" : "transparent",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--color-ink-line)" }}>
          <div className="flex items-center gap-3 px-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                style={{ background: "var(--color-ink-soft)", color: "var(--color-paper)" }}
              >
                {(user?.displayName || user?.email || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate" style={{ color: "var(--color-paper)" }}>
                {user?.displayName || "Creator"}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--color-stone)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-white/5 transition-colors"
            style={{ color: "var(--color-stone)" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 shrink-0 flex items-center justify-between px-8 border-b"
          style={{ borderColor: "var(--color-ink-line)" }}
        >
          <ChannelSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
