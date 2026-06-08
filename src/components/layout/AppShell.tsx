import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Receipt,
  ClipboardList, BarChart3, Settings, Search, Bell, LogOut, Menu, X, ChevronLeft, School,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/classes", label: "Classes", icon: GraduationCap },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/fees", label: "Fees", icon: Receipt },
  { to: "/exams", label: "Exams & Results", icon: ClipboardList },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/login" });
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const schoolName = user.school?.name || user.schoolName || "Your School";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -320, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0.6 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-sidebar text-sidebar-foreground lg:hidden shadow-lift"
            >
              <SidebarInner pathname={pathname} schoolName={schoolName} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-gradient-sidebar text-sidebar-foreground transition-[width] duration-500 ease-out sticky top-0 h-screen border-r border-sidebar-border/60",
          collapsed ? "w-[76px]" : "w-[252px]"
        )}
      >
        <SidebarInner pathname={pathname} schoolName={schoolName} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "m-3 mt-auto flex items-center justify-center gap-2 rounded-xl py-2 text-xs text-sidebar-foreground/60",
            "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground transition-all duration-200"
          )}
        >
          <ChevronLeft className={cn("size-4 transition-transform duration-300", collapsed && "rotate-180")} />
          {!collapsed && <span className="font-medium tracking-wide">Collapse</span>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/75 backdrop-blur-xl border-b border-border/70">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 h-16">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden size-9 grid place-items-center rounded-lg hover:bg-muted transition"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>

            <div className="hidden sm:flex lg:hidden items-center gap-2 min-w-0">
              <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
                <School className="size-4 text-primary-foreground" />
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold leading-tight truncate">{schoolName}</div>
                <div className="text-[11px] text-muted-foreground">School ERP</div>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  placeholder="Search students, classes, invoices…"
                  className="w-full h-10 pl-10 pr-12 rounded-xl bg-muted/70 border border-transparent focus:bg-card focus:border-border focus:outline-none focus:ring-4 focus:ring-ring/15 text-sm transition-all placeholder:text-muted-foreground/70"
                />
                <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 py-0.5 rounded-md border bg-card text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            <button className="size-9 grid place-items-center rounded-xl hover:bg-muted transition relative" aria-label="Notifications">
              <Bell className="size-[18px]" />
              <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full ring-2 ring-background animate-pulse" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-border/80">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold leading-tight">{user.name || user.email}</div>
                <div className="text-[10px] uppercase tracking-wider mt-0.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                    {user.role || "User"}
                  </span>
                </div>
              </div>
              <div className="size-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-bold shadow-glow ring-2 ring-background">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="size-9 grid place-items-center rounded-xl hover:bg-destructive/10 hover:text-destructive transition"
              >
                <LogOut className="size-[18px]" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  pathname, schoolName, collapsed, onClose,
}: { pathname: string; schoolName: string; collapsed?: boolean; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border/60">
        <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shrink-0 shadow-glow">
          <School className="size-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold leading-tight truncate text-[15px]">School ERP</div>
            <div className="text-[11px] text-sidebar-foreground/55 truncate">{schoolName}</div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto size-8 grid place-items-center rounded-lg hover:bg-sidebar-accent/70 transition" aria-label="Close">
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
        {!collapsed && (
          <div className="px-3 pt-2 pb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-sidebar-foreground/40">
            Workspace
          </div>
        )}
        {nav.map((item, i) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  active
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/40"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-xl nav-active-glow"
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="sidebar-active-rail"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-primary-glow shadow-[0_0_12px_oklch(0.72_0.16_285)]"
                  />
                )}
                <Icon className={cn(
                  "size-[18px] shrink-0 relative z-10 transition-transform duration-300",
                  "group-hover:scale-110",
                  active && "text-primary-glow"
                )} />
                {!collapsed && (
                  <span className="truncate relative z-10">{item.label}</span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border/60">
          <div className="text-[11px] font-semibold text-sidebar-foreground/80">Need help?</div>
          <div className="text-[10px] text-sidebar-foreground/55 mt-0.5">Check the docs or contact support.</div>
        </div>
      )}
    </div>
  );
}
