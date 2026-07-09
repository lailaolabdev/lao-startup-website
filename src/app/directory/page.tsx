'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, ArrowLeft, ArrowRight, PlayCircle, FileText, X, Mail, Users, DollarSign, TrendingUp, UserRound } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Startup {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  pitchDeckUrl?: string;
  videoUrl?: string;
  userId?: {
    name?: string;
    email?: string;
  };
  tractionMetrics?: {
    revenue?: number;
    teamSize?: number;
    fundingRaised?: number;
    customers?: number;
  };
  approvedStatus?: string;
  logoGradient?: string;
}

const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-orange-400 to-rose-500',
  'from-purple-400 to-pink-500',
  'from-red-400 to-amber-500',
  'from-cyan-400 to-sky-600',
  'from-green-400 to-emerald-600',
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const API_ORIGIN = API_BASE.replace('/api', '');
const formatMoney = (value?: number) => `$${Number(value || 0).toLocaleString()}`;
const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
};

export default function Directory() {
  const { language: lang } = useLanguage();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const fetchStartups = async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_BASE}/startups?page=${page}&limit=6&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        // Map backend mongo ids to standard format
        const formatted: Startup[] = (data.data || []).map((item: any, index: number) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          description: item.description,
          logoUrl: item.logoUrl,
          pitchDeckUrl: item.pitchDeckUrl,
          videoUrl: item.videoUrl,
          userId: item.userId,
          tractionMetrics: item.tractionMetrics,
          approvedStatus: item.approvedStatus,
          logoGradient: GRADIENTS[index % GRADIENTS.length],
        }));
        setStartups(formatted);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        throw new Error(data.message || data.error || 'Unable to load directory');
      }
    } catch (err) {
      setStartups([]);
      setTotalPages(1);
      setError(err instanceof Error ? err.message : 'Unable to load directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStartups();
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center md:text-left border-b border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {lang === 'EN' ? 'MSME & Startup Directory' : 'ລາຍຊື່ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ'}
            </h1>
            <p className="mt-2 text-slate-400">
              {lang === 'EN' 
                ? 'Discover MSMEs, startups, and founders participating in MSIC incubation programs and events.'
                : 'ຄົ້ນຫາ ແລະ ຕິດຕາມ ຈຸນລະວິສາຫະກິດ, ສະຕາດອັບ ແລະ ຜູ້ກໍ່ຕັ້ງທີ່ເຂົ້າຮ່ວມໂຄງການ ແລະ ກິດຈະກຳຂອງ MSIC.'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <input
              type="text"
              placeholder={lang === 'EN' ? 'Search MSMEs or startups by name...' : 'ຄົ້ນຫາ ຈຸນລະວິສາຫະກິດ ຫຼື ສະຕາດອັບດ້ວຍຊື່...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-4.5 w-4.5 text-slate-500" />
            </div>
            <button
              type="submit"
              className="absolute right-2 top-2 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors"
            >
              {lang === 'EN' ? 'Search' : 'ຄົ້ນຫາ'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Startups Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : startups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center text-slate-500">
            <Search className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-400">{lang === 'EN' ? 'No Participants Found' : 'ບໍ່ພົບລາຍຊື່ຜູ້ເຂົ້າຮ່ວມ'}</p>
            <p className="text-sm mt-1">{lang === 'EN' ? 'Try another search keyword or add companies from the admin panel.' : 'ກະລຸນາລອງຄຳຄົ້ນຫາໃໝ່ ຫຼື ເພີ່ມຂໍ້ມູນຈາກໜ້າຈັດການ.'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              {startups.map((startup) => (
                <div
                  key={startup.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-900 bg-slate-900/20 p-4 transition-colors duration-200 hover:border-slate-800 hover:bg-slate-900/35 group"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg ${startup.logoUrl ? 'bg-white' : `bg-gradient-to-tr ${startup.logoGradient}`} shadow-sm`}>
                        {startup.logoUrl ? (
                          <img src={resolveAssetUrl(startup.logoUrl)} alt={`${startup.name} logo`} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-base font-bold text-white">{startup.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 truncate text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {startup.name}
                          </h3>
                        </div>
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-cyan-400 border border-slate-800">
                          {startup.category}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-400 leading-6 line-clamp-2">
                      {startup.description}
                    </p>
                  </div>

                  <div className="mt-4 space-y-4 border-t border-slate-900 pt-4">
                    {startup.tractionMetrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-950/70 p-2.5">
                        <span className="block text-slate-500">{lang === 'EN' ? 'Revenue' : 'ລາຍຮັບ'}</span>
                        <span className="font-semibold text-white">{formatMoney(startup.tractionMetrics.revenue)}</span>
                      </div>
                      <div className="rounded-lg bg-slate-950/70 p-2.5">
                        <span className="block text-slate-500">{lang === 'EN' ? 'Total Funding' : 'ທຶນລະດົມທັງໝົດ'}</span>
                        <span className="font-semibold text-white">{formatMoney(startup.tractionMetrics.fundingRaised)}</span>
                      </div>
                      <div className="rounded-lg bg-slate-950/70 p-2.5">
                        <span className="block text-slate-500">{lang === 'EN' ? 'Team Size' : 'ຂະໜາດທີມ'}</span>
                        <span className="font-semibold text-white">
                          {startup.tractionMetrics.teamSize || 1} {lang === 'EN' ? 'members' : 'ຄົນ'}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-950/70 p-2.5">
                        <span className="block text-slate-500">{lang === 'EN' ? 'Customers' : 'ລູກຄ້າ'}</span>
                        <span className="font-semibold text-white">{Number(startup.tractionMetrics.customers || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {startup.pitchDeckUrl && (
                        <a
                          href={resolveAssetUrl(startup.pitchDeckUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Pitch Deck
                        </a>
                      )}
                      {startup.videoUrl && (
                        <a
                          href={startup.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs font-bold text-slate-300 hover:text-white"
                        >
                          <PlayCircle className="h-3.5 w-3.5" />
                          Video
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedStartup(startup)}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/10 py-2.5 text-xs font-bold text-cyan-300 transition-colors"
                  >
                    {lang === 'EN' ? 'View Details' : 'ເບິ່ງລາຍລະອຽດ'}
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-900 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{lang === 'EN' ? 'Previous' : 'ກ່ອນໜ້າ'}</span>
                </button>
                <span className="text-sm font-medium text-slate-400">
                  {lang === 'EN' ? `Page ${page} of ${totalPages}` : `ໜ້າ ${page} ຈາກ ${totalPages}`}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <span>{lang === 'EN' ? 'Next' : 'ຖັດໄປ'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedStartup && (
        <div
          onClick={() => setSelectedStartup(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 text-white backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedStartup(null)}
              className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/80 bg-slate-950/70 text-slate-400 shadow-md transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-cyan-400"
              title="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="border-b border-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${selectedStartup.logoUrl ? 'bg-white' : `bg-gradient-to-tr ${selectedStartup.logoGradient}`} shadow-lg`}>
                  {selectedStartup.logoUrl ? (
                    <img
                      src={resolveAssetUrl(selectedStartup.logoUrl)}
                      alt={`${selectedStartup.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">{selectedStartup.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 pr-10">
                  <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                    {selectedStartup.category}
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    {selectedStartup.name}
                  </h2>
                  {(selectedStartup.userId?.name || selectedStartup.userId?.email) && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                      {selectedStartup.userId?.name && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5 text-slate-500" />
                          {selectedStartup.userId.name}
                        </span>
                      )}
                      {selectedStartup.userId?.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          {selectedStartup.userId.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  {lang === 'EN' ? 'Company Overview' : 'ພາບລວມບໍລິສັດ'}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {selectedStartup.description}
                </p>
              </div>

              {selectedStartup.tractionMetrics && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <span className="block text-xs text-slate-500">{lang === 'EN' ? 'Revenue' : 'ລາຍຮັບ'}</span>
                    <strong className="mt-1 block text-sm text-white">{formatMoney(selectedStartup.tractionMetrics.revenue)}</strong>
                  </div>
                  <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="block text-xs text-slate-500">{lang === 'EN' ? 'Total Funding' : 'ທຶນລະດົມທັງໝົດ'}</span>
                    <strong className="mt-1 block text-sm text-white">{formatMoney(selectedStartup.tractionMetrics.fundingRaised)}</strong>
                  </div>
                  <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="block text-xs text-slate-500">{lang === 'EN' ? 'Team Size' : 'ຂະໜາດທີມ'}</span>
                    <strong className="mt-1 block text-sm text-white">
                      {selectedStartup.tractionMetrics.teamSize || 1} {lang === 'EN' ? 'members' : 'ຄົນ'}
                    </strong>
                  </div>
                  <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-300">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <span className="block text-xs text-slate-500">{lang === 'EN' ? 'Customers' : 'ລູກຄ້າ'}</span>
                    <strong className="mt-1 block text-sm text-white">{Number(selectedStartup.tractionMetrics.customers || 0).toLocaleString()}</strong>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-t border-slate-900 pt-5">
                {selectedStartup.pitchDeckUrl && (
                  <a
                    href={resolveAssetUrl(selectedStartup.pitchDeckUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Pitch Deck
                  </a>
                )}
                {selectedStartup.videoUrl && (
                  <a
                    href={selectedStartup.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Video
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
