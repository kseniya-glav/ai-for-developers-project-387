import { Link, Outlet, useLocation } from "react-router-dom";
import { Calendar, Clock, ListChecks, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Типы событий", icon: Clock },
  { to: "/bookings", label: "Бронирования", icon: ListChecks },
  { to: "/owner", label: "Владелец", icon: User },
];

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Calendar className="h-5 w-5" />
            Booking
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname === to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
