// app/admin/layout.tsx
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutGrid, Upload, LogOut, Menu, X, Settings } from 'lucide-react';

// ── Easy to add/remove nav items ─────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/admin/images', label: 'Images', icon: LayoutGrid },
  { href: '/admin/upload', label: 'Upload', icon: Upload },
  // { href: '/admin/settings', label: 'Settings', icon: Settings }, // uncomment to add
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen]           = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) { setIsAuthenticated(false); return; }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/verify', { credentials: 'include' });
        if (res.ok) { setIsAuthenticated(true); }
        else        { setIsAuthenticated(false); router.push('/admin/login'); }
      } catch {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [isLoginPage, router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-primary" />
      </div>
    );
  }

  if (isLoginPage) return <>{children}</>;
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Brand */}
            <div className="flex items-center gap-6">
<Link href="/admin/images" className="flex items-center gap-2">              <span className="text-lg font-bold tracking-widest text-foreground">OPTIKX</span>
              </Link>
              {/* Desktop nav */}
              <div className="hidden sm:flex items-center gap-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      ].join(' ')}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>

              {/* Mobile toggle */}
              <button
                className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
}