import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, TrendingUp, Users, DollarSign, Award, Target, CheckCircle2, Newspaper } from 'lucide-react';
import NewsSection from '@/components/NewsSection';

export default async function Home() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as 'EN' | 'LA') || 'EN';
  // Mock Featured Startups
  const featuredStartups = [
    {
      id: 'st-01',
      name: 'LaoFresh',
      category: 'AgriTech',
      description: 'Revolutionizing farm-to-table logistics in Vientiane through supply chain automation.',
      stats: '2.4x YoY Growth',
      funding: '$250K Seed',
      logoGradient: 'from-emerald-400 to-teal-500',
    },
    {
      id: 'st-02',
      name: 'PDR Pay',
      category: 'FinTech',
      description: 'Modern digital wallet and micro-lending API tailored for Lao merchants and SMEs.',
      stats: '150K+ Monthly Active Users',
      funding: '$1.2M Pre-Series A',
      logoGradient: 'from-blue-400 to-indigo-500',
    },
    {
      id: 'st-03',
      name: 'Sokxay Express',
      category: 'Logistics',
      description: 'On-demand parcel delivery network covering all 17 provinces with real-time tracking.',
      stats: '1M+ Parcels Delivered',
      funding: '$800K Venture Debt',
      logoGradient: 'from-orange-400 to-rose-500',
    },
  ];

  const stats = [
    { label: lang === 'EN' ? 'Registered Startups' : 'ສະຕາດອັບທີ່ລົງທະບຽນ', value: '75+', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: lang === 'EN' ? 'Ecosystem Funding Raised' : 'ທຶນລະດົມໃນລະບົບນິເວດ', value: '$18.5M+', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: lang === 'EN' ? 'Active VC Partners' : 'ຄູ່ຮ່ວມງານນັກລົງທຶນ (VC)', value: '18', icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: lang === 'EN' ? 'Lao Tech Jobs Created' : 'ຕຳແໜ່ງງານໄອທີທີ່ສ້າງຂຶ້ນ', value: '450+', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/news`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.success && data.data && data.data.length > 0) {
      newsItems = data.data.slice(0, 3).map((item: any) => {
        const titleFallback = item.title || (item.content ? item.content.slice(0, 60) + (item.content.length > 60 ? '...' : '') : 'Untitled News');
        const summaryFallback = item.summary || (item.content ? item.content.slice(0, 150) + (item.content.length > 150 ? '...' : '') : '');
        return {
          id: item._id,
          title: titleFallback,
          category: item.category || 'News',
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
        title: 'Lao Tech Hub Announces Digital Incubation Cohort for 2026',
        category: 'Program',
        date: 'Jun 15, 2026',
        summary: 'The Ministry of Technology and Communications launches its annual acceleration initiative targeting 15 selected tech startups.',
        readTime: '3 min read',
        badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20',
        images: [],
        content: 'The Ministry of Technology and Communications launches its annual acceleration initiative targeting 15 selected tech startups. This cohort focuses on digital wallets, smart logistics, and AI. Learn more at https://laostartup.gov.la or contact the incubation support center.',
      },
      {
        id: 'news-2',
        title: 'Regional VC Syndicate Announces $5M Co-Investment for Lao FinTechs',
        category: 'Investment',
        date: 'Jun 08, 2026',
        summary: 'A consortium of Southeast Asian angel investors and venture funds partners with local banks to bolster digital payment startups.',
        readTime: '4 min read',
        badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
        images: [],
        content: 'A consortium of Southeast Asian angel investors and venture funds partners with local banks to bolster digital payment startups. The group expects to back at least 5 early-stage ventures this year. Apply online via https://invest.laostartup.com and submit your pitch deck.',
      },
      {
        id: 'news-3',
        title: 'Lao Tech Expo 2026 Welcomes Global Venture Capitalist Delegates',
        category: 'Ecosystem',
        date: 'May 28, 2026',
        summary: 'This year\'s flagship tech gathering connects 50+ local startup founders directly with international investors and ecosystem leaders.',
        readTime: '5 min read',
        badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-500/20',
        images: [],
        content: 'This year\'s flagship tech gathering connects 50+ local startup founders directly with international investors and ecosystem leaders. For registrations, agenda timelines, and venue maps, visit the official timeline page at https://laostartup.com/events or check local media updates.',
      },
    ];
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
              src="/video/background-video.mp4"
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
            <span>{lang === 'EN' ? 'Lao Startup Ecosystem Official Portal' : 'ພອດທໍທາງການຂອງລະບົບນິເວດສະຕາດອັບລາວ'}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent">
            {lang === 'EN' ? 'Empowering the Next Generation' : 'ສົ່ງເສີມ ແລະ ພັດທະນາຄົນຮຸ່ນໃໝ່'} <br className="hidden md:inline" />
            {lang === 'EN' ? 'of' : 'ແຫ່ງ'} <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{lang === 'EN' ? 'Lao Innovation' : 'ນະວັດຕະກໍາລາວ'}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            {lang === 'EN' 
              ? 'Connecting local founders, tech startups, and digital builders with international venture capitals, strategic angels, and government acceleration programs.'
              : 'ເຊື່ອມຕໍ່ຜູ້ກໍ່ຕັ້ງທ້ອງຖິ່ນ, ສະຕາດອັບດ້ານເຕັກໂນໂລຊີ, ແລະ ຜູ້ພັດທະນາດີຈີຕອນ ກັບກອງທຶນຮ່ວມລົງທຶນສາກົນ, ນັກລົງທຶນທຸລະກິດ, ແລະ ໂຄງການເລັ່ງລັດການເຕີບໂຕຂອງພາກລັດ.'}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/directory"
              className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/35 hover:-translate-y-0.5"
            >
              <span>{lang === 'EN' ? 'Explore Startup Directory' : 'ຄົ້ນຫາລາຍຊື່ສະຕາດອັບ'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/portal/startup"
              className="rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all hover:-translate-y-0.5"
            >
              {lang === 'EN' ? 'Apply for Funding' : 'ສະໝັກຂໍທຶນສະໜັບສະໜູນ'}
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

      {/* Featured Startups Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{lang === 'EN' ? 'Featured Startups' : 'ສະຕາດອັບທີ່ໂດດເດັ່ນ'}</h2>
            <p className="mt-2 text-slate-400">
              {lang === 'EN' 
                ? 'High-growth ventures on our platform validated by our ecosystem advisors.'
                : 'ທຸລະກິດເຕີບໂຕສູງໃນແພລດຟອມຂອງພວກເຮົາ ທີ່ໄດ້ຮັບການຢັ້ງຢືນຈາກທີ່ປຶກສາລະບົບນິເວດ.'}
            </p>
          </div>
          <Link href="/directory" className="mt-4 md:mt-0 flex items-center space-x-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            <span>{lang === 'EN' ? 'View all startups' : 'ເບິ່ງສະຕາດອັບທັງໝົດ'}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredStartups.map((startup) => (
            <div
              key={startup.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 p-6 hover:border-slate-800 hover:bg-slate-900/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${startup.logoGradient} shadow-md`}>
                    <span className="text-xl font-bold text-white">{startup.name.charAt(0)}</span>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-cyan-400">
                    {startup.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {startup.name}
                </h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{startup.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-900 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{lang === 'EN' ? 'Traction Metrics' : 'ດັດຊະນີການເຕີບໂຕ'}</span>
                  <span className="font-semibold text-emerald-400">{startup.stats}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{lang === 'EN' ? 'Capital Goal' : 'ເປົ້າໝາຍລະດົມທຶນ'}</span>
                  <span className="font-semibold text-white">{startup.funding}</span>
                </div>
                <Link
                  href={`/directory/${startup.id}`}
                  className="block w-full text-center mt-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  {lang === 'EN' ? 'View Profile' : 'ເບິ່ງຂໍ້ມູນທຸລະກິດ'}
                </Link>
              </div>
            </div>
          ))}
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
                ? 'Get access to verified pitch decks, download financial reports, and schedule virtual matchmaking sessions directly with startup founders.'
                : 'ເຂົ້າເຖິງ pitch deck ທີ່ໄດ້ຮັບການຢັ້ງຢືນ, ດາວໂຫຼດບົດລາຍງານການເງິນ, ແລະ ນັດໝາຍປະຊຸມຈັບຄູ່ທຸລະກິດກັບຜູ້ກໍ່ຕັ້ງສະຕາດອັບໂດຍກົງ.'}
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
              {lang === 'EN' ? 'Browse Startups' : 'ຄົ້ນຫາສະຕາດອັບ'}
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
