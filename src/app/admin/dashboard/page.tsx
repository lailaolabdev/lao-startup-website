'use client';

import { useEffect } from 'react';
import {
  Users,
  Eye,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data for graphs
const TRAFFIC_DATA = [
  { name: 'Mon', visitors: 1200, signups: 4 },
  { name: 'Tue', visitors: 1900, signups: 8 },
  { name: 'Wed', visitors: 1500, signups: 3 },
  { name: 'Thu', visitors: 2200, signups: 12 },
  { name: 'Fri', visitors: 3000, signups: 19 },
  { name: 'Sat', visitors: 1800, signups: 5 },
  { name: 'Sun', visitors: 1600, signups: 2 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'AgriTech', value: 24 },
  { name: 'FinTech', value: 18 },
  { name: 'Logistics', value: 15 },
  { name: 'E-Commerce', value: 22 },
  { name: 'EdTech', value: 12 },
  { name: 'SaaS', value: 9 },
];

const COLORS = ['#10b981', '#3b82f6', '#f97316', '#ef4444', '#a855f7', '#06b6d4'];

export default function AdminDashboard() {
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
    }
  }, []);

  const statCards = [
    { label: 'Weekly MSIC Views', value: '14,700', change: '+24%', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Active MSME Founders', value: '75', change: '+8%', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Verified Partners', value: '18', change: '+12%', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Business Matching Sessions', value: '42', change: '+18%', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Admin Backoffice
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Overviewing MSIC traffic, applicant sign-ups, and incubation program indicators.
            </p>
          </div>
          {/* Sub Navigation */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-cyan-400">
              Dashboard
            </span>
            <a
              href="/admin/startups"
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Startup CRUD
            </a>
            <a
              href="/admin/verifications"
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Verifications
            </a>
            <a
              href="/admin/events"
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Events Setup
            </a>
            <a
              href="/admin/sponsors"
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              Sponsors Setup
            </a>
            <a
              href="/admin/news"
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              News Setup
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-900 bg-slate-900/10 p-6 hover:border-slate-800 transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div className={`rounded-xl ${card.bg} p-2.5`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold tracking-tight text-white">{card.value}</span>
                  <span className="flex items-center text-xs font-bold text-emerald-400">
                    {card.change}
                    <ArrowUpRight className="ml-0.5 h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Area Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Weekly MSIC Activity</h2>
              <p className="text-xs text-slate-500">Visualizing unique visitors and visitor actions over the last 7 days.</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAFFIC_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVis)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Participant Categories Distribution Chart */}
          <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Participant Verticals</h2>
              <p className="text-xs text-slate-500">Breakdown of registered business entities by sector.</p>
            </div>
            <div className="h-60 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
              {CATEGORY_DISTRIBUTION.map((cat, idx) => (
                <div key={cat.name} className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate">{cat.name} ({cat.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/10 bg-cyan-950/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Building2 className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Startup Company CRUD</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Manage company profiles used by the public MSIC directory.
                </p>
              </div>
            </div>
            <a
              href="/admin/startups"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20"
            >
              Manage Startups
            </a>
          </div>
        </div>

        {/* Audit Log / Platform Highlights */}
        <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">System Logs</h2>
            <p className="text-xs text-slate-500">Security audits and MSIC registration log feed.</p>
          </div>
          <div className="space-y-3">
            {[
              { time: '10 mins ago', desc: 'New partner registration request received from Singapore Angel Fund.', icon: ShieldCheck, color: 'text-purple-400' },
              { time: '1 hour ago', desc: 'MSIC participant pitch deck upload successful for "LaoFresh".', icon: FileText, color: 'text-cyan-400' },
              { time: '4 hours ago', desc: 'Business matching session approved between SBC Group and PDR Pay.', icon: CheckCircle, color: 'text-emerald-400' },
            ].map((log, idx) => {
              const Icon = log.icon;
              return (
                <div key={idx} className="flex items-start space-x-3 text-xs bg-slate-950/60 rounded-xl p-3 border border-slate-900">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${log.color}`} />
                  <div className="flex-1">
                    <span className="text-slate-300">{log.desc}</span>
                    <span className="block text-[10px] text-slate-500 mt-1">{log.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
