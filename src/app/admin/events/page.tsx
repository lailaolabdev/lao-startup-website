'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Calendar, MapPin, ClipboardList, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AgendaItem {
  time: string;
  topic: string;
  speaker: string;
}

interface EventItem {
  _id: string;
  title: string;
  year: number;
  date: string;
  location: string;
}

export default function AdminEvents() {
  const [adminToken, setAdminToken] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [year, setYear] = useState(2026);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  
  // Agenda temp items
  const [newTime, setNewTime] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newSpeaker, setNewSpeaker] = useState('');

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/events`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    setAdminToken(token);
    fetchEvents();
  }, []);

  const addAgendaItem = () => {
    if (!newTime || !newTopic) return;
    setAgenda((prev) => [...prev, { time: newTime, topic: newTopic, speaker: newSpeaker }]);
    setNewTime('');
    setNewTopic('');
    setNewSpeaker('');
  };

  const removeAgendaItem = (index: number) => {
    setAgenda((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminToken) {
      setError('Admin Authentication Token is required.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title,
          year,
          description,
          date,
          location,
          agenda,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('New platform event created successfully!');
        // Clear forms
        setTitle('');
        setYear(2026);
        setDescription('');
        setDate('');
        setLocation('');
        setAgenda([]);
        fetchEvents();
      } else {
        setError(data.message || 'Failed to create event.');
      }
    } catch (err) {
      setError('Connection failure to backend.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Navigation Breadcrumb */}
        <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin Dashboard</span>
        </Link>

        {/* Header */}
        <div className="border-b border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
            <span>Manage Platform Events</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure summits, forum agendas, and timeline calendars.
          </p>
        </div>

        {/* Token Authentication gate */}
        {!adminToken && (
          <div className="max-w-md mx-auto rounded-3xl border border-slate-900 bg-slate-900/40 p-6 sm:p-8 backdrop-blur shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Admin Authentication Required</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchEvents();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Admin Bearer Token
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paste your admin JWT authorization token..."
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  className="w-full rounded-xl border border-slate-855 bg-slate-950 p-3 text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setAdminToken('sandbox_token')}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg"
              >
                Enter Sandbox Mode
              </button>
            </form>
          </div>
        )}

        {adminToken && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Form */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 space-y-6 h-fit">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Event</h2>
                <p className="text-xs text-slate-500">Configure event metadata and schedules.</p>
              </div>

              {success && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
                  {success}
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. MSIC Innovation Forum"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Calendar Year</label>
                    <input
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none text-slate-350"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Vientiane Convention Hall"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description highlighting panels and targets..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {/* Agenda Builder */}
                <div className="border-t border-slate-900 pt-4 space-y-4">
                  <span className="block text-xs font-semibold text-slate-400 uppercase flex items-center space-x-1.5">
                    <ClipboardList className="h-4 w-4 text-cyan-400" />
                    <span>Build Event Agenda</span>
                  </span>

                  {agenda.length > 0 && (
                    <div className="space-y-2 rounded-xl bg-slate-950 border border-slate-900 p-3">
                      {agenda.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-900/50 pb-2 last:border-0 last:pb-0">
                          <div>
                            <span className="font-bold text-cyan-400 mr-2">{item.time}</span>
                            <span className="text-white font-medium">{item.topic}</span>
                            {item.speaker && <span className="text-slate-500 ml-2">({item.speaker})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAgendaItem(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                    <input
                      type="text"
                      placeholder="Time (09:00 - 10:00)"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs focus:outline-none text-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Topic title"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs focus:outline-none text-slate-300"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Speaker name"
                        value={newSpeaker}
                        onChange={(e) => setNewSpeaker(e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs focus:outline-none text-slate-350 w-full"
                      />
                      <button
                        type="button"
                        onClick={addAgendaItem}
                        className="rounded-lg bg-cyan-950 border border-cyan-500/20 px-2.5 hover:bg-cyan-900 text-cyan-400"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg"
                >
                  Create Event
                </button>
              </form>
            </div>

            {/* Current Events list */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-4 h-fit">
              <div>
                <h2 className="text-lg font-bold text-white">Current Events</h2>
                <p className="text-xs text-slate-500">Live platforms events calendar.</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-6">
                  <Calendar className="h-5 w-5 animate-spin text-cyan-400" />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center text-slate-600 text-xs py-6">
                  No events created yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((ev) => (
                    <div
                      key={ev._id}
                      className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{ev.title}</span>
                        <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-slate-850">
                          {ev.year}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-1">
                        <p className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(ev.date).toLocaleDateString()}</span>
                        </p>
                        <p className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{ev.location}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
