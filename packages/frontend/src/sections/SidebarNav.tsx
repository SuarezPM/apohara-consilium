import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  Radio,
  Shield,
  CheckSquare,
  Activity,
  FlaskConical,
  Settings2,
  BarChart2,
  ClipboardList,
  Settings,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tier: 1 | 2;
}

const NAV_ITEMS: NavItem[] = [
  // Tier-1 active
  { href: "/dashboard",    label: "Dashboard",      icon: LayoutDashboard, tier: 1 },
  { href: "/incidents",    label: "Incidents",       icon: AlertTriangle,   tier: 1 },
  { href: "/live-feed",    label: "Live Feed",       icon: Radio,           tier: 1 },
  { href: "/judge-layer",  label: "Judge Layer",     icon: Shield,          tier: 1 },
  { href: "/compliance",   label: "Compliance",      icon: CheckSquare,     tier: 1 },
  { href: "/agent-health", label: "Agent Health",    icon: Activity,        tier: 1 },
  // Tier-2 coming next
  { href: "/simulator",      label: "Simulator",       icon: FlaskConical,  tier: 2 },
  { href: "/policy-builder", label: "Policy Builder",  icon: Settings2,     tier: 2 },
  { href: "/analytics",      label: "Analytics",       icon: BarChart2,     tier: 2 },
  { href: "/review-queue",   label: "Review Queue",    icon: ClipboardList, tier: 2 },
  { href: "/settings",       label: "Settings",        icon: Settings,      tier: 2 },
];

const TIER1 = NAV_ITEMS.filter((n) => n.tier === 1);
const TIER2 = NAV_ITEMS.filter((n) => n.tier === 2);

export function SidebarNav() {
  return (
    <aside
      className="flex flex-col w-56 shrink-0 min-h-screen"
      style={{ backgroundColor: "var(--apohara-bg-mid)", borderRight: "1px solid hsl(var(--border))" }}
      aria-label="Dashboard navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-border/40">
        <img src="/logo.svg" alt="" width={28} height={28} aria-hidden="true" />
        <span className="font-pixel-sans text-[11px] tracking-wide" style={{ color: "var(--apohara-bone)" }}>
          APOHARA
        </span>
      </div>

      {/* Tier-1 nav */}
      <nav className="flex-1 px-2 pt-4 pb-2" aria-label="Primary dashboard">
        <p
          className="px-2 mb-2 font-pixel-sans text-[8px] uppercase tracking-widest"
          style={{ color: "var(--apohara-lime)" }}
        >
          Live
        </p>
        <ul className="space-y-0.5">
          {TIER1.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2.5 px-3 py-2 rounded text-xs font-mono transition-colors",
                      isActive
                        ? "border-l-2 pl-[10px]"
                        : "border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
                    ].join(" ")
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          borderLeftColor: "var(--apohara-lime)",
                          color: "var(--apohara-lime)",
                          backgroundColor: "rgba(37,177,63,0.08)",
                        }
                      : {}
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Tier-2 nav */}
        <p
          className="px-2 mt-6 mb-2 font-pixel-sans text-[8px] uppercase tracking-widest"
          style={{ color: "var(--apohara-bone)", opacity: 0.4 }}
        >
          Coming Next
        </p>
        <ul className="space-y-0.5">
          {TIER2.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-mono text-muted-foreground/50 cursor-not-allowed border-l-2 border-transparent"
                  tabIndex={-1}
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                  <span
                    className="ml-auto font-pixel-sans text-[7px] px-1 py-0.5 rounded"
                    style={{
                      backgroundColor: "var(--apohara-bg-raised)",
                      color: "var(--apohara-bone)",
                      opacity: 0.5,
                    }}
                  >
                    soon
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mythos badge placeholder (US-83 will refine) */}
      <div
        className="mx-2 mb-4 px-3 py-2 rounded border border-border/30 font-mono text-[10px]"
        style={{ backgroundColor: "var(--apohara-bg-raised)", color: "var(--apohara-bone)", opacity: 0.7 }}
        title="Mythos governance badge (US-83)"
      >
        <span className="font-pixel-sans text-[7px] block mb-0.5" style={{ color: "var(--apohara-lime)" }}>
          MYTHOS
        </span>
        INV-15 compliant
      </div>
    </aside>
  );
}
