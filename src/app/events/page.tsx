'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

interface Agenda {
  time: string;
  topic: string;
  speaker?: string;
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
}

interface ApiEvent {
  _id: string;
  title: string;
  year: number;
  description: string;
  date: string;
  location: string;
  agenda?: Partial<Agenda>[];
  agendaItems?: Partial<Agenda>[];
  schedule?: Partial<Agenda>[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const MOCK_EVENTS: EventItem[] = [
  {
    id: 'ev-01',
    title: 'MSIC Innovation Forum 2026',
    year: 2026,
    description: 'MSIC annual gathering for MSMEs, startups, investors, and policymakers in Vientiane. Discussing business incubation, digital tools, market access, and capital readiness in Lao PDR.',
    date: '2026-11-14T09:00:00Z',
    location: 'Lao National Convention Center, Vientiane',
    agenda: [
      { time: '09:00 - 09:30', topic: 'Opening Keynote: MSME and Startup Innovation in Lao PDR', speaker: 'Ministry of Industry and Commerce' },
      { time: '09:30 - 10:30', topic: 'Panel: Venture Capital Landscape in Southeast Asia', speaker: 'VCs from Singapore, Thailand, and Laos' },
      { time: '10:45 - 12:00', topic: 'MSIC Pitch Showcase (Top 10 Finalists)', speaker: 'Selected Founders' },
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
  },
];

const normalizeAgenda = (event: ApiEvent): Agenda[] => {
  const source = event.agenda || event.agendaItems || event.schedule || [];
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => ({
      time: String(item.time || '').trim(),
      topic: String(item.topic || '').trim(),
      speaker: String(item.speaker || '').trim(),
    }))
    .filter((item) => item.time || item.topic || item.speaker);
};

export default function EventsHub() {
  const { language: lang } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setLoadError('');
      try {
        const res = await fetch(`${API_BASE}/events`, { cache: 'no-store' });
        const data = (await res.json()) as ApiResponse<ApiEvent[]>;

        if (!data.success) {
          throw new Error(data.message || data.error || 'Failed to load events');
        }

        const eventsData = (data.data || []).map((ev) => ({
            id: ev._id,
            title: ev.title,
            year: ev.year,
            description: ev.description,
            date: ev.date,
            location: ev.location,
            agenda: normalizeAgenda(ev),
        }));

        if (!cancelled) {
          setEvents(eventsData);
          const currentYear = new Date().getFullYear();
          setSelectedYear((activeYear) => {
            if (eventsData.length === 0 || eventsData.some((event) => event.year === activeYear)) return activeYear;
            return eventsData.some((event) => event.year === currentYear) ? currentYear : eventsData[0].year;
          });
        }
      } catch (err) {
        console.error('Error loading events', err);
        if (!cancelled) {
          setEvents(MOCK_EVENTS);
          setSelectedYear(2026);
          setLoadError('Showing sample events because the backend events API is unavailable.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableYears = Array.from(new Set(events.map((event) => event.year))).sort((a, b) => b - a);
  const filteredEvents = events.filter((event) => event.year === selectedYear);

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
            {lang === 'EN' ? 'MSIC Events Hub' : 'ສູນລວມກິດຈະກຳ MSIC'}
          </h1>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
            {lang === 'EN' 
              ? 'Attend MSIC incubation events, Lao Startup activities, business matching forums, demo days, and policy dialogues.'
              : 'ເຂົ້າຮ່ວມກິດຈະກຳບົ່ມເພາະຂອງ MSIC, ກິດຈະກຳ Lao Startup, ການຈັບຄູ່ທຸລະກິດ, ວັນນຳສະເໜີຜົນງານ ແລະ ເວທີສົນທະນານະໂຍບາຍ.'}
          </p>

          {/* Year selector buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {(availableYears.length > 0 ? availableYears : [selectedYear]).map((year) => (
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
          {loadError && (
            <p className="mx-auto mt-4 max-w-xl rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              {loadError}
            </p>
          )}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-16 text-center text-slate-500">
            <Calendar className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <p className="text-lg font-semibold text-slate-400">{lang === 'EN' ? 'No Events Scheduled' : 'ບໍ່ມີຕາຕະລາງກິດຈະກຳ'}</p>
            <p className="text-sm mt-1">{lang === 'EN' ? `There are no upcoming events listed for calendar year ${selectedYear}.` : `ບໍ່ມີລາຍການກິດຈະກຳຈັດຂຶ້ນສຳລັບປີ ${selectedYear}.`}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 hover:border-slate-800 hover:bg-slate-900/20 transition-all duration-300"
              >
                <div className="space-y-6">
                  {/* Event Meta & Info */}
                  <div className="space-y-4">
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

                    <div className="mt-6">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{lang === 'EN' ? 'Event Agenda' : 'ກຳນົດການກິດຈະກຳ'}</span>
                      </h3>
                      <div className="space-y-3 rounded-2xl bg-slate-950/80 border border-slate-900 p-4">
                        {event.agenda.length > 0 ? (
                          event.agenda.map((ag, index) => (
                            <div key={`${ag.time}-${ag.topic}-${index}`} className="flex flex-col sm:flex-row sm:items-start text-xs border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                              <span className="font-semibold text-cyan-400 w-32 shrink-0">{ag.time || '-'}</span>
                              <div className="mt-1 sm:mt-0">
                                <span className="block font-medium text-white">{ag.topic || '-'}</span>
                                {ag.speaker && <span className="text-slate-500">{lang === 'EN' ? 'Speaker: ' : 'ຜູ້ບັນຍາຍ: '}{ag.speaker}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">
                            {lang === 'EN' ? 'Agenda details will be announced soon.' : 'ກຳນົດການລະອຽດຈະປະກາດໃນໄວໆນີ້.'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
