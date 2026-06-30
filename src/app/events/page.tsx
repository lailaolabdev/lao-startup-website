'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Award, Plus, Sparkles, Send, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Agenda {
  time: string;
  topic: string;
  speaker?: string;
}

interface Sponsor {
  id: string;
  name: string;
  tier: 'Diamond' | 'Gold' | 'Silver';
  logoUrl: string;
}

interface EventItem {
  _id?: string;
  id: string;
  title: string;
  year: number;
  description: string;
  date: string;
  location: string;
  agenda: Agenda[];
  sponsors: Sponsor[];
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'ev-01',
    title: 'Lao Tech Startup Summit 2026',
    year: 2026,
    description: 'The largest annual gathering of tech founders, investors, and policymakers in Vientiane. Discussing artificial intelligence, digital wallets, cross-border logistics, and capital access in landlinked Laos.',
    date: '2026-11-14T09:00:00Z',
    location: 'Lao National Convention Center, Vientiane',
    agenda: [
      { time: '09:00 - 09:30', topic: 'Opening Keynote: Laos Digital Economy Blueprint', speaker: 'Minister of Technology and Communications' },
      { time: '09:30 - 10:30', topic: 'Panel: Venture Capital Landscape in Southeast Asia', speaker: 'VCs from Singapore, Thailand, and Laos' },
      { time: '10:45 - 12:00', topic: 'Lao Startup Pitch Showcase (Top 10 Finalists)', speaker: 'Selected Founders' },
    ],
    sponsors: [
      { id: 'sp-1', name: 'Unitel', tier: 'Diamond', logoUrl: '/sponsors/unitel.png' },
      { id: 'sp-2', name: 'Lao Development Bank', tier: 'Gold', logoUrl: '/sponsors/ldb.png' },
      { id: 'sp-3', name: 'SBC Group', tier: 'Silver', logoUrl: '/sponsors/sbc.png' },
    ],
  },
  {
    id: 'ev-02',
    title: 'AgriTech Innovation Forum 2026',
    year: 2026,
    description: 'Showcasing the latest organic farming automation, smart irrigation systems, and digital farm-to-table platforms helping local Lao farmers export to regional markets.',
    date: '2026-08-22T08:30:00Z',
    location: 'Champasak Grand Hotel, Pakse',
    agenda: [
      { time: '08:30 - 09:00', topic: 'Registrations & Morning Organic Coffee Network', speaker: '' },
      { time: '09:00 - 10:15', topic: 'Case Study: Exporting Lao Organic Coffee with Blockchain Traceability', speaker: 'CEO of LaoFresh' },
      { time: '10:30 - 11:30', topic: 'Workshop: IoT Sensors for Soil Quality and Irrigation', speaker: 'AgriTech experts' },
    ],
    sponsors: [
      { id: 'sp-4', name: 'JICA Lao PDR', tier: 'Diamond', logoUrl: '/sponsors/jica.png' },
      { id: 'sp-5', name: 'Dao Coffee', tier: 'Gold', logoUrl: '/sponsors/dao.png' },
    ],
  },
  {
    id: 'ev-03',
    title: 'Vientiane FinTech Day 2025',
    year: 2025,
    description: 'Exploring legal frameworks, e-payment regulations, API integrations, and sandbox opportunities with the Bank of Lao PDR.',
    date: '2025-10-05T09:00:00Z',
    location: 'Crowne Plaza Hotel, Vientiane',
    agenda: [
      { time: '09:00 - 10:00', topic: 'Keynote: National Payment Gateway & QR Standard', speaker: 'Central Bank Representatives' },
      { time: '10:15 - 11:45', topic: 'Panel: Sandbox Regulations for Digital Asset Exchanges', speaker: 'Legal experts and operators' },
    ],
    sponsors: [
      { id: 'sp-6', name: 'BCEL Bank', tier: 'Diamond', logoUrl: '/sponsors/bcel.png' },
      { id: 'sp-7', name: 'Krungsri Lao', tier: 'Gold', logoUrl: '/sponsors/krungsri.png' },
    ],
  },
];

export default function EventsHub() {
  const { language: lang } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // Registration states
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [userToken, setUserToken] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch events
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/events?year=${selectedYear}`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        // Fetch sponsors and append them
        const eventsData: EventItem[] = [];
        for (const ev of data.data) {
          let sponsors: Sponsor[] = [];
          try {
            const spRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/sponsors?eventId=${ev._id}`);
            const spData = await spRes.json();
            if (spData.success) {
              sponsors = spData.data.map((sp: any) => ({
                id: sp._id,
                name: sp.name,
                tier: sp.tier,
                logoUrl: sp.logoUrl,
              }));
            }
          } catch (e) {
            console.error('Error loading sponsors', e);
          }
          eventsData.push({
            id: ev._id,
            title: ev.title,
            year: ev.year,
            description: ev.description,
            date: ev.date,
            location: ev.location,
            agenda: ev.agenda || [],
            sponsors,
          });
        }
        setEvents(eventsData);
        setUsingMock(false);
      } else {
        throw new Error('Empty database or offline');
      }
    } catch (err) {
      // Fallback to mock data matching year
      const filtered = MOCK_EVENTS.filter((e) => e.year === selectedYear);
      setEvents(filtered);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedYear]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (!userToken) {
      setRegError('User Authorization Token is required to complete registration.');
      return;
    }

    setRegistering(true);
    setRegError('');
    setRegSuccess('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/events/${selectedEvent.id}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setRegSuccess(`Congratulations! You have successfully registered for ${selectedEvent.title}. An entry ticket has been added to your profile.`);
      } else {
        setRegError(data.message || 'Registration failed. Check if you are already registered.');
      }
    } catch (err) {
      setRegError('Server connection failed. Make sure the backend API is running.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center border-b border-slate-900 pb-10 mb-12">
          <div className="inline-flex items-center space-x-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{lang === 'EN' ? 'Platform Timeline & Calendar' : 'ແຜນງານ ແລະ ຕາຕະລາງກິດຈະກຳ'}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {lang === 'EN' ? 'Ecosystem Events Hub' : 'ສູນລວມກິດຈະກຳລະບົບນິເວດ'}
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            {lang === 'EN' 
              ? 'Attend matchmaking forums, accelerator demo days, and policy dialogues hosted by the Lao Startup ecosystem.'
              : 'ເຂົ້າຮ່ວມກອງປະຊຸມຈັບຄູ່ທຸລະກິດ, ວັນນຳສະເໜີຜົນງານຂອງສະຕາດອັບ, ແລະ ເວທີສົນທະນານະໂຍບາຍຕ່າງໆ.'}
          </p>

          {/* Year selector buttons */}
          <div className="mt-8 flex justify-center space-x-2">
            {[2026, 2025].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang === 'EN' ? `Year ${year}` : `ປີ ${year}`}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center text-slate-500">
            <Calendar className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-400">{lang === 'EN' ? 'No Events Scheduled' : 'ບໍ່ມີຕາຕະລາງກິດຈະກຳ'}</p>
            <p className="text-sm mt-1">{lang === 'EN' ? `There are no upcoming events listed for calendar year ${selectedYear}.` : `ບໍ່ມີລາຍການກິດຈະກຳຈັດຂຶ້ນສຳລັບປີ ${selectedYear}.`}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {events.map((event, idx) => (
              <div
                key={event.id}
                className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Event Meta & Info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-cyan-400 font-semibold">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(event.date).toLocaleDateString(lang === 'EN' ? 'en-US' : 'lo-LA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </span>
                      <span className="text-slate-700">|</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors">
                      {event.title}
                    </h2>
                    <p className="text-sm text-slate-400 leading-relaxed">{event.description}</p>

                    {/* Agenda nested list */}
                    {event.agenda && event.agenda.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{lang === 'EN' ? 'Event Agenda' : 'ກຳນົດການກິດຈະກຳ'}</span>
                        </h3>
                        <div className="space-y-3 rounded-2xl bg-slate-950/80 border border-slate-900 p-4">
                          {event.agenda.map((ag, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-start text-xs border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                              <span className="font-semibold text-cyan-400 w-32 shrink-0">{ag.time}</span>
                              <div className="mt-1 sm:mt-0">
                                <span className="block font-medium text-white">{ag.topic}</span>
                                {ag.speaker && <span className="text-slate-500">{lang === 'EN' ? 'Speaker: ' : 'ຜູ້ບັນຍາຍ: '}{ag.speaker}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Sponsors & Register action */}
                  <div className="flex flex-col justify-between rounded-2xl bg-slate-950/60 border border-slate-900 p-6">
                    {/* Tiered Sponsors list */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span>{lang === 'EN' ? 'Event Sponsors' : 'ຜູ້ສະໜັບສະໜູນກິດຈະກຳ'}</span>
                      </h3>

                      {event.sponsors && event.sponsors.length > 0 ? (
                        <div className="space-y-3">
                          {['Diamond', 'Gold', 'Silver'].map((tier) => {
                            const tierSponsors = event.sponsors.filter((s) => s.tier === tier);
                            if (tierSponsors.length === 0) return null;
                            return (
                              <div key={tier} className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                  {tier} {lang === 'EN' ? 'Sponsor' : 'ຜູ້ສະໜັບສະໜູນ'}
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {tierSponsors.map((sp) => (
                                    <div
                                      key={sp.id}
                                      className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white font-bold"
                                    >
                                      {sp.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-600">
                          {lang === 'EN' ? 'Sponsorship tier applications open. Contact ecosystem committee.' : 'ເປີດຮັບສະໝັກຜູ້ສະໜັບສະໜູນແລ້ວ. ຕິດຕໍ່ຄະນະກຳມະການ.'}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setRegSuccess('');
                        setRegError('');
                      }}
                      className="mt-8 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500"
                    >
                      <span>{lang === 'EN' ? 'Register to Attend' : 'ລົງທະບຽນເຂົ້າຮ່ວມງານ'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
            <h2 className="text-xl font-bold mb-1">{lang === 'EN' ? 'Event Registration' : 'ລົງທະບຽນກິດຈະກຳ'}</h2>
            <p className="text-xs text-slate-400 mb-6">{lang === 'EN' ? 'Confirm your seat for the:' : 'ຢືນຢັນບ່ອນນັ່ງຂອງທ່ານສຳລັບງານ:'} <span className="text-cyan-400 font-medium">{selectedEvent.title}</span></p>

            <form onSubmit={handleRegister} className="space-y-4">
              {regSuccess ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
                  {regSuccess}
                </div>
              ) : (
                <>
                  {regError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400 flex items-start space-x-2">
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      {lang === 'EN' ? 'User Authentication JWT (Bearer Token)' : 'ລະຫັດຢືນຢັນຕົວຕົນ (JWT Token)'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'EN' ? 'Paste your logged-in JWT token here...' : 'ວາງລະຫັດ JWT ຂອງທ່ານໃສ່ນີ້...'}
                      value={userToken}
                      onChange={(e) => setUserToken(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-350 placeholder-slate-650 focus:border-cyan-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {lang === 'EN' ? 'Note: You must possess a registered user account to register for events.' : 'ໝາຍເຫດ: ທ່ານຕ້ອງມີບັນຊີທີ່ລົງທະບຽນແລ້ວເພື່ອເຂົ້າຮ່ວມກິດຈະກຳ.'}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  {lang === 'EN' ? 'Close' : 'ປິດ'}
                </button>

                {!regSuccess && (
                  <button
                    type="submit"
                    disabled={registering}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                  >
                    {registering ? (lang === 'EN' ? 'Processing...' : 'ກຳລັງປະມວນຜົນ...') : (lang === 'EN' ? 'Confirm Registration' : 'ຢືນຢັນການລົງທະບຽນ')}
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
