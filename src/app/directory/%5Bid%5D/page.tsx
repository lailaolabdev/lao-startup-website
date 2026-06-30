'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Play, Users, DollarSign, BarChart2, ShieldCheck, Mail, Briefcase } from 'lucide-react';
import Link from 'next/link';

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

const MOCK_STARTUPS: Record<string, Startup> = {
  'st-01': { id: 'st-01', name: 'LaoFresh', category: 'AgriTech', description: 'Revolutionizing farm-to-table logistics in Vientiane through supply chain automation. LaoFresh connects smallholder organic farmers in Champasak and Xieng Khouang provinces directly with retail supermarkets and fine dining restaurants in Vientiane capital. Our AI-driven route optimization reduces transit spoilages by 35% and increases profit margins for local growers by 2.5x.', pitchDeckUrl: 'https://example.com/decks/laofresh.pdf', videoUrl: 'https://www.youtube.com/watch?v=mock', tractionMetrics: { revenue: 45000, teamSize: 12, fundingRaised: 250000, customers: 1400 }, logoGradient: 'from-emerald-400 to-teal-500' },
  'st-02': { id: 'st-02', name: 'PDR Pay', category: 'FinTech', description: 'Modern digital wallet and micro-lending API tailored for Lao merchants and SMEs. PDR Pay integrates QR payment processing conforming to the Bank of Lao PDR standard with alternative credit-scoring algorithms. By looking at merchant daily transaction histories, we unlock seamless micro-working capital loans for market sellers without requiring land titles as collateral.', pitchDeckUrl: 'https://example.com/decks/pdrpay.pdf', videoUrl: 'https://www.youtube.com/watch?v=mock', tractionMetrics: { revenue: 180000, teamSize: 22, fundingRaised: 1200000, customers: 85000 }, logoGradient: 'from-blue-400 to-indigo-500' },
  'st-03': { id: 'st-03', name: 'Sokxay Express', category: 'Logistics', description: 'On-demand parcel delivery network covering all 17 provinces with real-time tracking. Sokxay Express solves last-mile logistics in semi-rural Laos through our network of franchised localized hubs. Empowered by our mobile application, local drivers can self-dispatch, leading to high-speed deliveries and full supply-chain transparency for Lao e-commerce vendors.', pitchDeckUrl: 'https://example.com/decks/sokxay.pdf', videoUrl: 'https://www.youtube.com/watch?v=mock', tractionMetrics: { revenue: 95000, teamSize: 48, fundingRaised: 800000, customers: 12000 }, logoGradient: 'from-orange-400 to-rose-500' },
};

export default function StartupDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Meeting request states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investorToken, setInvestorToken] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    const fetchStartupDetails = async () => {
      setLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/startups/${id}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success && data.data) {
          setStartup({
            ...data.data,
            id: data.data._id,
            logoGradient: 'from-cyan-400 to-blue-500',
          });
        } else {
          throw new Error('Not found in database');
        }
      } catch (err) {
        // Fallback to mock profiles
        const mockItem = MOCK_STARTUPS[id];
        if (mockItem) {
          setStartup(mockItem);
        } else {
          setError('Startup profile not found.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStartupDetails();
    }
  }, [id]);

  const handleRequestMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorToken) {
      setRequestError('Authorization Token is required to authenticate your Investor role.');
      return;
    }

    setSubmittingRequest(true);
    setRequestError('');
    setRequestSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/matchmaking/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${investorToken}`,
        },
        body: JSON.stringify({
          startupId: startup?.id || startup?._id,
          requestNotes,
          scheduledTime: scheduledTime || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestSuccess('Your meeting request was successfully submitted to the founder! They will receive it in their Matchmaking Inbox.');
        setRequestNotes('');
        setScheduledTime('');
      } else {
        setRequestError(data.message || 'Failed to submit matchmaking request.');
      }
    } catch (err) {
      setRequestError('Server connection failed. Make sure the backend is active.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-cyan-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white px-4">
        <p className="text-xl font-bold text-slate-400">{error || 'Startup profile not found'}</p>
        <Link href="/directory" className="mt-4 flex items-center space-x-2 text-cyan-400 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <Link href="/directory" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Startup Directory</span>
        </Link>

        {/* Profile Header */}
        <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 backdrop-blur-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr ${startup.logoGradient || 'from-cyan-400 to-blue-500'} shadow-lg shadow-cyan-500/10`}>
              <span className="text-4xl font-extrabold text-white">{startup.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">{startup.name}</h1>
                <span className="rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs font-semibold text-cyan-400">
                  {startup.category}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Business Entity</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500"
          >
            <Calendar className="h-4 w-4" />
            <span>Request Meeting</span>
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-3xl border border-slate-900 bg-slate-900/20 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white mb-4">About Startup</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{startup.description}</p>
            </div>

            {/* Video Pitch Embed Placeholder */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/20 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-white mb-4">Video Pitch</h2>
              <div className="aspect-video relative rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-slate-900/60 transition-opacity group-hover:bg-slate-900/40" />
                <div className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-lg transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 fill-current pl-1" />
                </div>
                <span className="absolute bottom-4 text-xs font-semibold text-slate-400">Play Demo Pitch Video</span>
              </div>
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-6">
            {/* Traction metrics */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/20 p-6 space-y-6">
              <h2 className="text-md font-bold text-white border-b border-slate-900 pb-3 flex items-center space-x-2">
                <BarChart2 className="h-4 w-4 text-cyan-400" />
                <span>Traction Metrics</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
                  <Users className="h-4 w-4 text-slate-500 mb-2" />
                  <span className="block text-xs text-slate-500">Team Size</span>
                  <span className="text-lg font-bold text-white">{startup.tractionMetrics?.teamSize || 1} members</span>
                </div>
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
                  <DollarSign className="h-4 w-4 text-slate-500 mb-2" />
                  <span className="block text-xs text-slate-500">ARR Revenue</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {startup.tractionMetrics?.revenue ? `$${(startup.tractionMetrics.revenue / 1000).toFixed(0)}K` : 'Bootstrapped'}
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
                  <Briefcase className="h-4 w-4 text-slate-500 mb-2" />
                  <span className="block text-xs text-slate-500">Raised Funding</span>
                  <span className="text-lg font-bold text-cyan-400">
                    {startup.tractionMetrics?.fundingRaised ? `$${(startup.tractionMetrics.fundingRaised / 1000).toFixed(0)}K` : 'Seed Round'}
                  </span>
                </div>
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
                  <Mail className="h-4 w-4 text-slate-500 mb-2" />
                  <span className="block text-xs text-slate-500">Active Clients</span>
                  <span className="text-lg font-bold text-purple-400">{startup.tractionMetrics?.customers || '50+'}</span>
                </div>
              </div>
            </div>

            {/* Pitch Deck Documents */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/20 p-6 space-y-4">
              <h2 className="text-md font-bold text-white border-b border-slate-900 pb-3 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span>Pitch Materials</span>
              </h2>

              {startup.pitchDeckUrl ? (
                <a
                  href={startup.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-900 p-4 text-sm font-semibold hover:bg-slate-900 transition-colors"
                >
                  <span className="text-slate-300">Pitch_Deck_Full.pdf</span>
                  <span className="text-xs font-bold text-cyan-400">Download</span>
                </a>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No public pitch deck materials uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matchmaking Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Schedule Matchmaking</h2>
            <p className="text-xs text-slate-400 mb-6">Request a virtual pitch review meeting with the founders of {startup.name}.</p>

            <form onSubmit={handleRequestMeeting} className="space-y-4">
              {requestSuccess ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                  {requestSuccess}
                </div>
              ) : (
                <>
                  {requestError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
                      {requestError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Investor Authorization JWT (Bearer Token)
                    </label>
                    <input
                      type="text"
                      placeholder="Paste your logged-in Investor JWT token here..."
                      value={investorToken}
                      onChange={(e) => setInvestorToken(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Proposed Date & Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Intro Note for the Startup
                    </label>
                    <textarea
                      rows={3}
                      placeholder="We are looking at early-stage food-tech solutions in SEA. We'd love to learn more..."
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-300 placeholder-slate-650 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRequestError('');
                    setRequestSuccess('');
                  }}
                  className="rounded-lg px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>

                {!requestSuccess && (
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                  >
                    {submittingRequest ? 'Submitting...' : 'Submit Request'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
