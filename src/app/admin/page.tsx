import Link from 'next/link';
import { ArrowRight, LayoutDashboard, LockKeyhole, Shield } from 'lucide-react';

export default function AdminIndex() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-cyan-500/10 bg-slate-900/20 p-8 shadow-2xl shadow-cyan-950/10 sm:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Shield className="h-3.5 w-3.5" />
                MSIC Backoffice
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Administration Workspace
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
                Manage MSIC events, news, sponsors, verification workflows, and participant data from a separate admin area.
              </p>
            </div>
            <div className="grid min-w-64 gap-3">
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-transform active:scale-95"
              >
                <LockKeyhole className="h-4 w-4" />
                Admin Login
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
