import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, User as UserIcon, ShieldCheck, LogOut, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { amIAdmin } from "@/lib/admin.functions";
import logoWhite from "@/assets/carwalhos-logo-white.png.asset.json";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "Our Story" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count, openCart } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentPath = useRouterState({ select: (s) => s.location.href });
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function refresh(session: { user?: { email?: string | null } } | null) {
      const has = !!session;
      setSignedIn(has);
      setEmail(session?.user?.email ?? null);
      if (has) {
        try {
          const { isAdmin: a } = await amIAdmin();
          setIsAdmin(!!a);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }
    supabase.auth.getSession().then(({ data }) => refresh(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => refresh(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const initial = (email?.[0] ?? "").toUpperCase();
  const signInHref = "/auth" + (currentPath && currentPath !== "/auth" ? `?next=${encodeURIComponent(currentPath)}` : "");

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center" aria-label="Carwalho's Cafe - Home">
          <img
            src={logoWhite.url}
            alt="Carwalho's Cafe"
            width={200}
            height={60}
            className="h-14 w-auto sm:h-16 md:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-cream/85 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin/orders"
              aria-label="Admin orders"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary/10"
            >
              <ShieldCheck className="h-4 w-4" />
            </Link>
          )}

          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="My account"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-sm font-semibold text-cream transition-colors hover:bg-primary/20"
                >
                  {initial || <UserIcon className="h-4 w-4" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {email && (
                  <>
                    <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                      {email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/account/orders" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    My orders
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/orders" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSignOut(); }} className="flex items-center gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a
              href={signInHref}
              aria-label="Sign in"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-cream transition-colors hover:bg-primary/10"
            >
              <UserIcon className="h-4 w-4" />
            </a>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-cream transition-colors hover:bg-primary/10"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <Link
            to="/menu"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/30 transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Order Now
          </Link>
        </div>
      </div>
    </header>
  );
}

