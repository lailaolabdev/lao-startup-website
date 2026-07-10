'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Building2,
  CheckCircle2,
  Home,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Shield,
  Sparkles,
} from 'lucide-react';

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/startups', label: 'Startups', icon: Building2 },
  { href: '/admin/verifications', label: 'Verifications', icon: CheckCircle2 },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/news', label: 'News', icon: Newspaper },
  { href: '/admin/sponsors', label: 'Sponsors', icon: Sparkles },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  };

  if (isLogin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="fixed inset-x-0 top-0 z-50 border-b border-cyan-500/10 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="relative h-9 w-9 overflow-hidden rounded-lg bg-white ring-1 ring-white/15">
                <Image src="/msic-logo.jpg" alt="MSIC logo" fill sizes="36px" className="object-contain p-1" />
              </span>
              <span>
                <span className="block text-sm font-bold text-white">MSIC Admin</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Backoffice Login</span>
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Home className="h-4 w-4" />
              Public Site
            </Link>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-900 bg-slate-950/95 px-4 py-5 lg:block">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
          <span className="relative h-10 w-10 overflow-hidden rounded-lg bg-white ring-1 ring-white/15">
            <Image src="/msic-logo.jpg" alt="MSIC logo" fill sizes="40px" className="object-contain p-1" />
          </span>
          <span>
            <span className="block text-sm font-bold text-white">MSIC Admin</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Backoffice</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/15'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-5 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-left text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Public Site
          </Link>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 border-b border-slate-900 bg-slate-950/90 backdrop-blur lg:left-72">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-cyan-400" />
            <div>
              <p className="text-sm font-bold text-white">MSIC Administration</p>
              <p className="text-xs text-slate-500">Separate backoffice workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200"
            >
              Logout
            </button>
            <Link href="/" className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300">
              Site
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
