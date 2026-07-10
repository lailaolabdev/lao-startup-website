'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, DollarSign, Users, TrendingUp, X } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const API_ORIGIN = API_BASE.replace('/api', '');

const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
};

const money = (value?: number) => `$${Number(value || 0).toLocaleString()}`;

export interface FeaturedStartup {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  logoGradient: string;
  tractionMetrics?: {
    revenue?: number;
    teamSize?: number;
    fundingRaised?: number;
    customers?: number;
  };
}

interface FeaturedStartupsProps {
  startups: FeaturedStartup[];
  lang: 'EN' | 'LA';
}

export default function FeaturedStartups({ startups, lang }: FeaturedStartupsProps) {
  const [selectedStartup, setSelectedStartup] = useState<FeaturedStartup | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {startups.map((startup, index) => (
          <motion.div
            key={startup.id}
            className="group flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-5 transition-colors hover:border-slate-800 hover:bg-slate-900/40"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.08 }}
            whileHover={{ y: -6 }}
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${startup.logoUrl ? 'bg-white' : `bg-gradient-to-tr ${startup.logoGradient}`} shadow-lg`}>
                {startup.logoUrl ? (
                  <img
                    src={resolveAssetUrl(startup.logoUrl)}
                    alt={`${startup.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-white">{startup.name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-cyan-500/15 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
                  {startup.category}
                </span>
                <h3 className="mt-3 truncate text-xl font-extrabold text-white transition-colors group-hover:text-cyan-300">
                  {startup.name}
                </h3>
              </div>
            </div>

            <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-400">{startup.description}</p>

            <div className="mt-auto space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <span className="block text-slate-500">{lang === 'EN' ? 'Revenue' : 'ລາຍຮັບ'}</span>
                  <span className="mt-1 block font-bold text-white">{money(startup.tractionMetrics?.revenue)}</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <span className="block text-slate-500">{lang === 'EN' ? 'Funding' : 'ທຶນລະດົມ'}</span>
                  <span className="mt-1 block font-bold text-emerald-300">{money(startup.tractionMetrics?.fundingRaised)}</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <span className="block text-slate-500">{lang === 'EN' ? 'Team' : 'ທີມ'}</span>
                  <span className="mt-1 block font-bold text-white">{startup.tractionMetrics?.teamSize || 1}</span>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <span className="block text-slate-500">{lang === 'EN' ? 'Customers' : 'ລູກຄ້າ'}</span>
                  <span className="mt-1 block font-bold text-white">{Number(startup.tractionMetrics?.customers || 0).toLocaleString()}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStartup(startup)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {lang === 'EN' ? 'View Details' : 'ເບິ່ງລາຍລະອຽດ'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStartup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              aria-label={lang === 'EN' ? 'Close details' : 'ປິດລາຍລະອຽດ'}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setSelectedStartup(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="startup-detail-title"
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/40"
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
            <button
              type="button"
              onClick={() => setSelectedStartup(null)}
              aria-label={lang === 'EN' ? 'Close details' : 'ປິດລາຍລະອຽດ'}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 pr-10">
              <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${selectedStartup.logoUrl ? 'bg-white' : `bg-gradient-to-tr ${selectedStartup.logoGradient}`} shadow-lg`}>
                {selectedStartup.logoUrl ? (
                  <img
                    src={resolveAssetUrl(selectedStartup.logoUrl)}
                    alt={`${selectedStartup.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-white">{selectedStartup.name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-cyan-500/15 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
                  {selectedStartup.category}
                </span>
                <h3 id="startup-detail-title" className="mt-3 text-2xl font-black text-white">
                  {selectedStartup.name}
                </h3>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-300">{selectedStartup.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <DollarSign className="h-4 w-4 text-cyan-300" />
                <span className="mt-3 block text-xs text-slate-500">{lang === 'EN' ? 'Revenue' : 'ລາຍຮັບ'}</span>
                <span className="mt-1 block text-sm font-black text-white">{money(selectedStartup.tractionMetrics?.revenue)}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                <span className="mt-3 block text-xs text-slate-500">{lang === 'EN' ? 'Funding' : 'ທຶນລະດົມ'}</span>
                <span className="mt-1 block text-sm font-black text-emerald-300">{money(selectedStartup.tractionMetrics?.fundingRaised)}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <Users className="h-4 w-4 text-slate-300" />
                <span className="mt-3 block text-xs text-slate-500">{lang === 'EN' ? 'Team' : 'ທີມ'}</span>
                <span className="mt-1 block text-sm font-black text-white">{selectedStartup.tractionMetrics?.teamSize || 1}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <Users className="h-4 w-4 text-amber-300" />
                <span className="mt-3 block text-xs text-slate-500">{lang === 'EN' ? 'Customers' : 'ລູກຄ້າ'}</span>
                <span className="mt-1 block text-sm font-black text-white">{Number(selectedStartup.tractionMetrics?.customers || 0).toLocaleString()}</span>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
