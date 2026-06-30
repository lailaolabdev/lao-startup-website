'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, RefreshCw, ArrowLeft, ArrowRight, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Startup {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description: string;
  pitchDeckUrl?: string;
  videoUrl?: string;
  tractionMetrics?: {
    revenue?: number;
    teamSize?: number;
    fundingRaised?: number;
    customers?: number;
  };
  approvedStatus?: string;
  logoGradient?: string;
}

const CATEGORIES = ['All', 'AgriTech', 'FinTech', 'Logistics', 'EdTech', 'E-Commerce', 'SaaS'];

const MOCK_STARTUPS: Startup[] = [
  { id: 'st-01', name: 'LaoFresh', category: 'AgriTech', description: 'Revolutionizing farm-to-table logistics in Vientiane through supply chain automation.', tractionMetrics: { revenue: 45000, teamSize: 12, fundingRaised: 250000, customers: 1400 }, logoGradient: 'from-emerald-400 to-teal-500' },
  { id: 'st-02', name: 'PDR Pay', category: 'FinTech', description: 'Modern digital wallet and micro-lending API tailored for Lao merchants and SMEs.', tractionMetrics: { revenue: 180000, teamSize: 22, fundingRaised: 1200000, customers: 85000 }, logoGradient: 'from-blue-400 to-indigo-500' },
  { id: 'st-03', name: 'Sokxay Express', category: 'Logistics', description: 'On-demand parcel delivery network covering all 17 provinces with real-time tracking.', tractionMetrics: { revenue: 95000, teamSize: 48, fundingRaised: 800000, customers: 12000 }, logoGradient: 'from-orange-400 to-rose-500' },
  { id: 'st-04', name: 'LearnLao', category: 'EdTech', description: 'Interactive gamified language-learning app for tourists and corporate partners.', tractionMetrics: { revenue: 12000, teamSize: 5, fundingRaised: 50000, customers: 8500 }, logoGradient: 'from-purple-400 to-pink-500' },
  { id: 'st-05', name: 'Vientiane Cart', category: 'E-Commerce', description: 'Hyper-local grocery delivery platform delivering within 30 minutes in city center.', tractionMetrics: { revenue: 64000, teamSize: 15, fundingRaised: 150000, customers: 4300 }, logoGradient: 'from-red-400 to-amber-500' },
  { id: 'st-06', name: 'HalalBox', category: 'AgriTech', description: 'Direct export logistics for premium Lao organic certified sticky rice and coffee beans.', tractionMetrics: { revenue: 110000, teamSize: 10, fundingRaised: 300000, customers: 120 }, logoGradient: 'from-green-400 to-emerald-600' },
  { id: 'st-07', name: 'BookSabai', category: 'SaaS', description: 'Cloud booking systems and POS SaaS for Lao hotels, guesthouses, and homestays.', tractionMetrics: { revenue: 28000, teamSize: 8, fundingRaised: 120000, customers: 450 }, logoGradient: 'from-cyan-400 to-sky-600' },
];

const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-orange-400 to-rose-500',
  'from-purple-400 to-pink-500',
  'from-red-400 to-amber-500',
  'from-cyan-400 to-sky-600',
  'from-green-400 to-emerald-600',
];

export default function Directory() {
  const { language: lang } = useLanguage();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usingMock, setUsingMock] = useState(false);

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/startups?page=${page}&limit=6&category=${selectedCategory === 'All' ? '' : selectedCategory}&search=${search}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Map backend mongo ids to standard format
        const formatted: Startup[] = data.data.map((item: any, index: number) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          description: item.description,
          pitchDeckUrl: item.pitchDeckUrl,
          videoUrl: item.videoUrl,
          tractionMetrics: item.tractionMetrics,
          approvedStatus: item.approvedStatus,
          logoGradient: GRADIENTS[index % GRADIENTS.length],
        }));
        setStartups(formatted);
        setTotalPages(data.pagination?.pages || 1);
        setUsingMock(false);
      } else {
        throw new Error('No data or API offline');
      }
    } catch (err) {
      // Fallback to client-side filtering on mock data
      let filtered = MOCK_STARTUPS;
      if (selectedCategory !== 'All') {
        filtered = filtered.filter((s) => s.category === selectedCategory);
      }
      if (search) {
        filtered = filtered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
      }
      
      const itemsPerPage = 6;
      const pagesCount = Math.ceil(filtered.length / itemsPerPage) || 1;
      setTotalPages(pagesCount);

      // Paginated items
      const startIndex = (page - 1) * itemsPerPage;
      const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

      setStartups(paginated);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [page, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStartups();
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center md:text-left md:flex md:items-end md:justify-between border-b border-slate-900 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              {lang === 'EN' ? 'Startup Directory' : 'ລາຍຊື່ສະຕາດອັບ'}
            </h1>
            <p className="mt-2 text-slate-400">
              {lang === 'EN' 
                ? 'Discover active tech products, dynamic startups, and early stage founders in Laos.'
                : 'ຄົ້ນຫາ ແລະ ຕິດຕາມຜະລິດຕະພັນເຕັກໂນໂລຊີ, ສະຕາດອັບ, ແລະ ຜູ້ກໍ່ຕັ້ງໃນປະເທດລາວ.'}
            </p>
          </div>
          {usingMock && (
            <span className="mt-3 md:mt-0 inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-amber-400 border border-amber-500/10">
              {lang === 'EN' ? 'Viewing Offline Sandbox Profile' : 'ກຳລັງເບິ່ງຂໍ້ມູນທົດລອງແບບອອບລາຍ'}
            </span>
          )}
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-center mb-8">
          <form onSubmit={handleSearchSubmit} className="lg:col-span-2 relative">
            <input
              type="text"
              placeholder={lang === 'EN' ? 'Search startups by name...' : 'ຄົ້ນຫາສະຕາດອັບດ້ວຍຊື່...'}
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

          <div className="lg:col-span-2 flex flex-wrap gap-2 justify-start lg:justify-end">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat === 'All' ? (lang === 'EN' ? 'All' : 'ທັງໝົດ') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Startups Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : startups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center text-slate-500">
            <Filter className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-400">{lang === 'EN' ? 'No Startups Found' : 'ບໍ່ພົບລາຍຊື່ສະຕາດອັບ'}</p>
            <p className="text-sm mt-1">{lang === 'EN' ? 'Try adjusting your category filter or search keywords.' : 'ກະລຸນາລອງປັບປ່ຽນປະເພດ ຫຼື ຄຳຄົ້ນຫາໃໝ່.'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              {startups.map((startup) => (
                <div
                  key={startup.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-6 hover:border-slate-800 hover:bg-slate-900/40 transition-all duration-300 shadow-lg group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${startup.logoGradient} shadow-md`}>
                        <span className="text-xl font-bold text-white">{startup.name.charAt(0)}</span>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-cyan-400 border border-slate-800">
                        {startup.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {startup.name}
                    </h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {startup.description}
                    </p>
                  </div>

                  {startup.tractionMetrics && (
                    <div className="mt-6 pt-6 border-t border-slate-900 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-slate-500">{lang === 'EN' ? 'Total Funding' : 'ທຶນລະດົມທັງໝົດ'}</span>
                        <span className="font-semibold text-white">
                          {startup.tractionMetrics.fundingRaised 
                            ? `$${(startup.tractionMetrics.fundingRaised / 1000).toFixed(0)}K` 
                            : (lang === 'EN' ? 'Bootstrapped' : 'ທຶນຕົນເອງ')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500">{lang === 'EN' ? 'Team Size' : 'ຂະໜາດທີມ'}</span>
                        <span className="font-semibold text-white">
                          {startup.tractionMetrics.teamSize || 1} {lang === 'EN' ? 'members' : 'ຄົນ'}
                        </span>
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/directory/${startup.id}`}
                    className="block w-full text-center mt-6 rounded-lg bg-gradient-to-r from-cyan-950 to-slate-900 hover:from-cyan-900 border border-cyan-500/10 py-2.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all"
                  >
                    {lang === 'EN' ? 'View Details' : 'ເບິ່ງລາຍລະອຽດ'}
                  </Link>
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
    </div>
  );
}
