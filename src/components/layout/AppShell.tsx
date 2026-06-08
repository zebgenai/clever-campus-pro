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
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground lg:hidden"
            >
              <SidebarInner pathname={pathname} schoolName={schoolName} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out sticky top-0 h-screen",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <SidebarInner pathname={pathname} schoolName={schoolName} collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="m-3 mt-auto flex items-center justify-center gap-2 rounded-lg py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
        >
          <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden size-9 grid place-items-center rounded-lg hover:bg-muted"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <div className="size-8 rounded-lg bg-gradient-primary grid place-items-center">
                <School className="size-4 text-primary-foreground" />
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold leading-tight truncate">{schoolName}</div>
                <div className="text-xs text-muted-foreground">School ERP</div>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  placeholder="Search students, classes, invoices…"
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted/60 border border-transparent focus:bg-card focus:border-border focus:outline-none focus:ring-2 focus:ring-ring/30 text-sm transition"
                />
              </div>
            </div>

            <button className="size-9 grid place-items-center rounded-lg hover:bg-muted relative">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full" />
            </button>

            <div className="hidden sm:flex items-center gap-3 pl-3 border-l">
              <div className="text-right">
                <div className="text-sm font-medium leading-tight">{user.name || user.email}</div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                    {user.role || "User"}
                  </span>
                </div>
              </div>
              <div className="size-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-semibold">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="size-9 grid place-items-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
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
      <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
          <School className="size-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold leading-tight truncate">School ERP</div>
            <div className="text-[11px] text-sidebar-foreground/60 truncate">{schoolName}</div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto size-8 grid place-items-center rounded-lg hover:bg-sidebar-accent">
            <X className="size-4" />
          </button>
        )}
      </div>
      <nav className="p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary-glow"
                />
              )}
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
