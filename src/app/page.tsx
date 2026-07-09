import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, TrendingUp, Users, DollarSign, Award, Target, CheckCircle2, Handshake, Sparkles } from 'lucide-react';
import NewsSection from '@/components/NewsSection';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const API_ORIGIN = API_BASE.replace('/api', '');

const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
};

const money = (value?: number) => `$${Number(value || 0).toLocaleString()}`;

const GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-orange-400 to-rose-500',
  'from-purple-400 to-pink-500',
  'from-cyan-400 to-sky-600',
];

interface HomeStartup {
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

interface HomeSponsor {
  id: string;
  name: string;
  tier: 'Diamond' | 'Gold' | 'Silver';
  logoUrl: string;
  eventTitle?: string;
  eventYear?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T[];
}

interface ApiNewsItem {
  _id: string;
  title?: string;
  category?: string;
  date?: string;
  summary?: string;
  readTime?: string;
  images?: string[];
  content?: string;
}

interface ApiStartupItem {
  _id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  tractionMetrics?: HomeStartup['tractionMetrics'];
}

interface ApiSponsorItem {
  _id: string;
  name: string;
  tier: HomeSponsor['tier'];
  logoUrl: string;
  eventId?: {
    title?: string;
    year?: number;
  };
}

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as 'EN' | 'LA') || 'EN';

  const stats = [
    { label: lang === 'EN' ? 'Incubated MSMEs & Startups' : 'ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບທີ່ບົ່ມເພາະ', value: '75+', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: lang === 'EN' ? 'Supported Investment Pipeline' : 'ມູນຄ່າໂອກາດການລົງທຶນ', value: '$18.5M+', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: lang === 'EN' ? 'Public & Private Partners' : 'ຄູ່ຮ່ວມງານພາກລັດ ແລະ ເອກະຊົນ', value: '18', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: lang === 'EN' ? 'Innovation Jobs Supported' : 'ຕຳແໜ່ງງານນະວັດຕະກຳທີ່ສະໜັບສະໜູນ', value: '450+', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Program':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20';
      case 'Investment':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
      case 'Ecosystem':
        return 'text-purple-400 bg-purple-400/10 border-purple-500/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-500/20';
    }
  };

  interface HomeNewsItem {
    id: string;
    title: string;
    category: string;
    date: string;
    summary: string;
    readTime: string;
    badgeColor: string;
    images?: string[];
    content?: string;
  }

  // Fetch live news with mock fallback
  let newsItems: HomeNewsItem[] = [];
  try {
    const res = await fetch(`${API_BASE}/news`, {
      cache: 'no-store',
    });
    const data = (await res.json()) as ApiResponse<ApiNewsItem>;
    if (data.success && data.data && data.data.length > 0) {
      newsItems = data.data.slice(0, 3).map((item) => {
        const titleFallback = item.title || (item.content ? item.content.slice(0, 60) + (item.content.length > 60 ? '...' : '') : 'Untitled News');
        const summaryFallback = item.summary || (item.content ? item.content.slice(0, 150) + (item.content.length > 150 ? '...' : '') : '');
        return {
          id: item._id,
          title: titleFallback,
          category: item.category || 'News',
          date: item.date
            ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Latest',
          summary: summaryFallback,
          readTime: item.readTime || '3 min read',
          badgeColor: getBadgeColor(item.category || 'News'),
          images: item.images || [],
          content: item.content || '',
        };
      });
    }
  } catch (error) {
    console.error('Failed to fetch news, using fallback:', error);
  }

  if (newsItems.length === 0) {
    newsItems = [
      {
        id: 'news-1',
        title: 'MSIC Announces Digital Incubation Cohort for 2026',
        category: 'Program',
        date: 'Jun 15, 2026',
        summary: 'MSIC opens a government-backed incubation cohort for selected MSMEs and startups building digital products in Lao PDR.',
        readTime: '3 min read',
        badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20',
        images: [],
        content: 'MSIC opens a government-backed incubation cohort for selected MSMEs and startups building digital products in Lao PDR. The cohort focuses on business readiness, market access, digital tools, and investment preparation.',
      },
      {
        id: 'news-2',
        title: 'MSIC Connects MSMEs with Regional Investment Partners',
        category: 'Investment',
        date: 'Jun 08, 2026',
        summary: 'Public and private partners are working with MSIC to improve access to finance for high-potential Lao businesses.',
        readTime: '4 min read',
        badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
        images: [],
        content: 'Public and private partners are working with MSIC to improve access to finance for high-potential Lao businesses. The program helps founders prepare financial reports, pitch decks, and investor meetings.',
      },
      {
        id: 'news-3',
        title: 'Lao Startup Event Returns as an MSIC Flagship Program',
        category: 'Ecosystem',
        date: 'May 28, 2026',
        summary: 'The Lao Startup event is now presented as one of MSIC\'s flagship activities for founders, MSMEs, and ecosystem partners.',
        readTime: '5 min read',
        badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-500/20',
        images: [],
        content: 'The Lao Startup event is now presented as one of MSIC\'s flagship activities for founders, MSMEs, and ecosystem partners. The event includes showcases, mentoring, business matching, and policy dialogue.',
      },
    ];
  }

  let featuredStartups: HomeStartup[] = [];
  try {
    const res = await fetch(`${API_BASE}/startups?limit=3`, { cache: 'no-store' });
    const data = (await res.json()) as ApiResponse<ApiStartupItem>;
    if (data.success) {
      featuredStartups = (data.data || []).slice(0, 3).map((item, index) => ({
        id: item._id,
        name: item.name,
        category: item.category,
        description: item.description,
        logoUrl: item.logoUrl,
        tractionMetrics: item.tractionMetrics,
        logoGradient: GRADIENTS[index % GRADIENTS.length],
      }));
    }
  } catch (error) {
    console.error('Failed to fetch featured startups:', error);
  }

  let sponsors: HomeSponsor[] = [];
  try {
    const res = await fetch(`${API_BASE}/sponsors?placement=home`, { cache: 'no-store' });
    const data = (await res.json()) as ApiResponse<ApiSponsorItem>;
    if (data.success) {
      const tierRank: Record<HomeSponsor['tier'], number> = { Diamond: 0, Gold: 1, Silver: 2 };
      sponsors = (data.data || [])
        .map((item) => ({
          id: item._id,
          name: item.name,
          tier: item.tier,
          logoUrl: item.logoUrl,
          eventTitle: item.eventId?.title,
          eventYear: item.eventId?.year,
        }))
        .sort((a: HomeSponsor, b: HomeSponsor) => tierRank[a.tier] - tierRank[b.tier]);
    }
  } catch (error) {
    console.error('Failed to fetch sponsors:', error);
  }

  return (
    <div className="relative isolate overflow-hidden bg-slate-950 text-white">
      {/* Unified Hero & Stats container wrapped for background video coverage */}
      <div className="relative w-full overflow-hidden">
        {/* Cinematic Looping Video Background (Clearer and extends over Stats) */}
        <div className="absolute inset-0 -z-20 overflow-hidden w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60 filter brightness-90 contrast-100"
          >
            <source
              src="/video/background-video2.mp4#t=7"
              type="video/mp4"
            />
          </video>
          {/* Subtle gradient overlay to merge into the dark footer sections */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/50 to-slate-950" />
        </div>

        {/* Background radial gradients for premium depth */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-400 to-blue-600 opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 pt-32 pb-24 sm:px-6 lg:px-8 text-center relative z-10">

          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur mb-6 hover:bg-cyan-950/70 transition-all">
            <Award className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'MSME and Startup Innovation Center' : 'ສູນນະວັດຕະກຳສຳລັບ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ'}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent">
            {lang === 'EN' ? 'MSIC' : 'MSIC'} <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {lang === 'EN' ? 'Business Incubation Center' : 'ສູນບົ່ມເພາະທຸລະກິດ'}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            {lang === 'EN' 
              ? 'MSIC is a government business incubation center for MSMEs and startups under the Ministry of Industry and Commerce, supporting founders with innovation programs, events, mentoring, and market access.'
              : 'MSIC ຫຼື ສູນນະວັດຕະກຳສຳລັບ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ ແມ່ນສູນບົ່ມເພາະທຸລະກິດຂອງລັດຖະບານ ພາຍໃຕ້ກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ.'}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/directory"
              className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/35 hover:-translate-y-0.5"
            >
              <span>{lang === 'EN' ? 'Explore MSME & Startup Directory' : 'ຄົ້ນຫາລາຍຊື່ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/portal/startup"
              className="rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all hover:-translate-y-0.5"
            >
              {lang === 'EN' ? 'login' : 'ເຂົ້າສູ່ລະບົບ'}
            </Link>
          </div>
        </section>

        {/* Stats Section (Cards float directly over video background for continuous flow) */}
        <section className="py-16 relative z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => {
                const IconComp = stat.icon;
                return (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 transition-all hover:border-slate-700 hover:bg-slate-900/75 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-400">{stat.label}</span>
                      <div className={`rounded-lg ${stat.bg} p-2`}>
                        <IconComp className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-bold tracking-tight text-white">{stat.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* News & Topics Section */}
      <NewsSection 
        newsItems={newsItems} 
        title={lang === 'EN' ? 'News & Topics' : 'ຂ່າວສານ & ຫົວຂໍ້'}
        subtitle={lang === 'EN' ? 'Ecosystem updates, accelerator details, and investment news.' : 'ຂ່າວສານ, ລາຍລະອຽດໂຄງການເລັ່ງລັດ, ແລະ ຂ່າວການລົງທຶນຫຼ້າສຸດ.'}
      />

      {/* Featured Incubation Participants Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{lang === 'EN' ? 'Featured MSIC Participants' : 'ຜູ້ເຂົ້າຮ່ວມ MSIC ທີ່ໂດດເດັ່ນ'}</h2>
            <p className="mt-2 text-slate-400">
              {lang === 'EN' 
                ? 'MSMEs and startups supported through MSIC programs, mentoring, events, and partner networks.'
                : 'ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບທີ່ໄດ້ຮັບການສະໜັບສະໜູນຜ່ານໂຄງການ, ການໃຫ້ຄຳປຶກສາ, ກິດຈະກຳ ແລະ ເຄືອຂ່າຍຄູ່ຮ່ວມງານຂອງ MSIC.'}
            </p>
          </div>
          <Link href="/directory" className="mt-4 md:mt-0 flex items-center space-x-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            <span>{lang === 'EN' ? 'View all participants' : 'ເບິ່ງຜູ້ເຂົ້າຮ່ວມທັງໝົດ'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredStartups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-10 text-center text-sm text-slate-500">
            {lang === 'EN' ? 'Startup companies will appear here after they are added and approved.' : 'ຂໍ້ມູນບໍລິສັດຈະສະແດງຢູ່ນີ້ຫຼັງຈາກເພີ່ມ ແລະ ອະນຸມັດແລ້ວ.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredStartups.map((startup) => (
              <div
                key={startup.id}
                className="group flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-5 transition-colors hover:border-slate-800 hover:bg-slate-900/40"
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
                  <Link
                    href="/directory"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    {lang === 'EN' ? 'View in Directory' : 'ເບິ່ງໃນລາຍຊື່'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sponsors Section */}
      <section className="border-y border-slate-900 bg-slate-900/15">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Handshake className="h-3.5 w-3.5" />
                {lang === 'EN' ? 'Partners' : 'ຄູ່ຮ່ວມງານ'}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {lang === 'EN' ? 'Sponsors & Ecosystem Partners' : 'ຜູ້ສະໜັບສະໜູນ ແລະ ຄູ່ຮ່ວມງານ'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                {lang === 'EN'
                  ? 'Organizations supporting MSIC programs, founder showcases, investor readiness, and startup ecosystem events.'
                  : 'ອົງກອນທີ່ສະໜັບສະໜູນໂຄງການ MSIC, ການນຳສະເໜີຜົນງານ, ການກຽມພ້ອມນັກລົງທຶນ ແລະ ກິດຈະກຳ ecosystem.'}
              </p>
            </div>
            <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300">
              {lang === 'EN' ? 'See events' : 'ເບິ່ງກິດຈະກຳ'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {sponsors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-10 text-center text-sm text-slate-500">
              {lang === 'EN' ? 'Sponsor logos will appear here after they are added in the admin panel.' : 'ໂລໂກ້ຜູ້ສະໜັບສະໜູນຈະສະແດງຢູ່ນີ້ຫຼັງຈາກເພີ່ມໃນໜ້າ admin.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={`group flex min-h-[190px] flex-col rounded-2xl border bg-slate-950/55 p-4 transition-colors hover:bg-slate-900/70 ${
                    sponsor.tier === 'Diamond'
                      ? 'border-cyan-500/25'
                      : sponsor.tier === 'Gold'
                      ? 'border-amber-500/25'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex aspect-[5/3] w-full items-center justify-center rounded-xl bg-white p-5 shadow-inner shadow-slate-200/70">
                    <img
                      src={resolveAssetUrl(sponsor.logoUrl)}
                      alt={`${sponsor.name} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="mt-4 flex min-w-0 flex-1 flex-col">
                    <div className="min-w-0 text-sm font-extrabold leading-5 text-white">{sponsor.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        sponsor.tier === 'Diamond'
                          ? 'bg-cyan-500/10 text-cyan-300'
                          : sponsor.tier === 'Gold'
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Sparkles className="h-3 w-3" />
                        {sponsor.tier}
                      </div>
                      {sponsor.eventTitle && (
                        <div className="min-w-0 flex-1 truncate text-xs text-slate-500">
                          {sponsor.eventTitle}{sponsor.eventYear ? ` ${sponsor.eventYear}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950 border border-cyan-500/10 px-8 py-12 sm:px-16 sm:py-16 md:flex md:items-center md:justify-between shadow-2xl">
          <div className="absolute top-0 right-0 -z-10 aspect-[500/500] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{lang === 'EN' ? 'Are you an Investor?' : 'ທ່ານແມ່ນນັກລົງທຶນແມ່ນບໍ່?'}</h2>
            <p className="mt-4 text-slate-400">
              {lang === 'EN' 
                ? 'Connect with MSIC-supported MSMEs and startups through business matching, investor readiness activities, and program events.'
                : 'ເຊື່ອມຕໍ່ກັບ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບທີ່ MSIC ສະໜັບສະໜູນ ຜ່ານການຈັບຄູ່ທຸລະກິດ, ກິດຈະກຳກຽມພ້ອມດ້ານການລົງທຶນ ແລະ ກິດຈະກຳໂຄງການ.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
              <span className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'EN' ? 'Verified Founders' : 'ຜູ້ກໍ່ຕັ້ງທີ່ຜ່ານການຢັ້ງຢືນ'}</span>
              </span>
              <span className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'EN' ? 'Encrypted Deck Storage' : 'ລະບົບເກັບຂໍ້ມູນປອດໄພ'}</span>
              </span>
              <span className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>{lang === 'EN' ? 'Meeting Scheduler' : 'ລະບົບນັດໝາຍປະຊຸມ'}</span>
              </span>
            </div>
          </div>
          <div className="mt-10 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/portal/startup"
              className="flex items-center justify-center space-x-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-slate-100 transition-colors"
            >
              {lang === 'EN' ? 'Register as Investor' : 'ລົງທະບຽນເປັນນັກລົງທຶນ'}
            </Link>
            <Link
              href="/directory"
              className="flex items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            >
              {lang === 'EN' ? 'Browse Participants' : 'ຄົ້ນຫາຜູ້ເຂົ້າຮ່ວມ'}
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative background bottom radial */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}
