'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ClipboardList, Edit3, MapPin, Plus, Save, Trash2, X } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';

interface AgendaItem {
  time: string;
  topic: string;
  speaker: string;
}

interface EventItem {
  _id: string;
  title: string;
  year: number;
  description: string;
  date: string;
  location: string;
  agenda: AgendaItem[];
  registeredUsers?: Array<{ _id: string; name?: string; email?: string }>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const emptyForm = {
  title: '',
  year: 2026,
  description: '',
  date: '',
  location: '',
  agenda: [] as AgendaItem[],
};

const toDateTimeInputValue = (dateValue: string) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const normalizeAgenda = (agenda: AgendaItem[] = []) =>
  agenda
    .map((item) => ({
      time: String(item.time || '').trim(),
      topic: String(item.topic || '').trim(),
      speaker: String(item.speaker || '').trim(),
    }))
    .filter((item) => item.time && item.topic);

export default function AdminEvents() {
  const [adminToken, setAdminToken] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newSpeaker, setNewSpeaker] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);

  const selectedEventTitle = useMemo(
    () => events.find((event) => event._id === editingId)?.title || '',
    [editingId, events]
  );

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/events`, { cache: 'no-store' });
      const data = (await res.json()) as ApiResponse<EventItem[]>;
      if (data.success) {
        setEvents(data.data || []);
      } else {
        setError(data.message || data.error || 'Failed to load events.');
      }
    } catch (fetchError) {
      console.error('Error fetching events', fetchError);
      setError('Connection failure while loading events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      setAdminToken(token);
      await fetchEvents();
    }

    loadInitialData();
  }, [fetchEvents]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setNewTime('');
    setNewTopic('');
    setNewSpeaker('');
  };

  const addAgendaItem = () => {
    if (!newTime.trim() || !newTopic.trim()) return;
    setForm((prev) => ({
      ...prev,
      agenda: [...prev.agenda, { time: newTime.trim(), topic: newTopic.trim(), speaker: newSpeaker.trim() }],
    }));
    setNewTime('');
    setNewTopic('');
    setNewSpeaker('');
  };

  const removeAgendaItem = (index: number) => {
    setForm((prev) => ({ ...prev, agenda: prev.agenda.filter((_, idx) => idx !== index) }));
  };

  const startEdit = (event: EventItem) => {
    setEditingId(event._id);
    setSuccess('');
    setError('');
    setForm({
      title: event.title,
      year: event.year,
      description: event.description,
      date: toDateTimeInputValue(event.date),
      location: event.location,
      agenda: normalizeAgenda(event.agenda),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminToken) {
      setError('Admin authentication is required.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingId ? `${API_BASE}/events/${editingId}` : `${API_BASE}/events`;
      const draftAgendaItem =
        newTime.trim() || newTopic.trim() || newSpeaker.trim()
          ? [{ time: newTime.trim(), topic: newTopic.trim(), speaker: newSpeaker.trim() }]
          : [];
      const agendaToSave = normalizeAgenda([...form.agenda, ...draftAgendaItem]);

      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          agenda: agendaToSave,
        }),
      });

      const data = (await res.json()) as ApiResponse<EventItem>;
      if (data.success) {
        setSuccess(editingId ? 'Event updated successfully.' : 'Event created successfully.');
        resetForm();
        await fetchEvents();
      } else {
        setError(data.message || data.error || 'Failed to save event.');
      }
    } catch (saveError) {
      console.error('Error saving event', saveError);
      setError('Connection failure while saving event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!adminToken) {
      setError('Admin authentication is required.');
      return;
    }

    const confirmed = window.confirm(`Delete "${event.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/events/${event._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = (await res.json()) as ApiResponse<EventItem>;
      if (data.success) {
        setSuccess('Event deleted successfully.');
        if (editingId === event._id) resetForm();
        await fetchEvents();
      } else {
        setError(data.message || data.error || 'Failed to delete event.');
      }
    } catch (deleteError) {
      console.error('Error deleting event', deleteError);
      setError('Connection failure while deleting event.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link href="/admin/dashboard" className="inline-flex items-center space-x-2 text-sm text-slate-400 transition-colors hover:text-cyan-400">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div className="border-b border-slate-900 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Manage Platform Events</h1>
          <p className="mt-1 text-sm text-slate-400">Create, edit, publish, and remove MSIC events shown on the public events page.</p>
        </div>

        {!adminToken ? (
          <div className="mx-auto max-w-md rounded-3xl border border-slate-900 bg-slate-900/40 p-6 shadow-2xl backdrop-blur sm:p-8">
            <h2 className="mb-2 text-lg font-bold text-white">Admin Authentication Required</h2>
            <p className="text-sm text-slate-500">Redirecting to admin login...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div className="h-fit space-y-6 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
                  <p className="text-xs text-slate-500">
                    {isEditing ? `Editing: ${selectedEventTitle}` : 'Configure event metadata and schedules.'}
                  </p>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel edit
                  </button>
                )}
              </div>

              {success && <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-400">{success}</div>}
              {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Event Title</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. MSIC Innovation Forum"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Calendar Year</label>
                    <input
                      type="number"
                      required
                      value={form.year}
                      onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Location</label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. Vientiane Convention Hall"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description highlighting panels and targets..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-4 border-t border-slate-900 pt-4">
                  <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase text-slate-400">
                    <ClipboardList className="h-4 w-4 text-cyan-400" />
                    <span>Build Event Agenda</span>
                  </span>

                  {form.agenda.length > 0 && (
                    <div className="space-y-2 rounded-xl border border-slate-900 bg-slate-950 p-3">
                      {form.agenda.map((item, idx) => (
                        <div key={`${item.time}-${idx}`} className="flex items-center justify-between gap-3 border-b border-slate-900/50 pb-2 text-xs last:border-0 last:pb-0">
                          <div className="min-w-0">
                            <span className="mr-2 font-bold text-cyan-400">{item.time}</span>
                            <span className="font-medium text-white">{item.topic}</span>
                            {item.speaker && <span className="ml-2 text-slate-500">({item.speaker})</span>}
                          </div>
                          <button type="button" onClick={() => removeAgendaItem(idx)} className="shrink-0 text-red-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-900 bg-slate-950/40 p-3 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Time (09:00 - 10:00)"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Topic title"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:outline-none"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Speaker name"
                        value={newSpeaker}
                        onChange={(e) => setNewSpeaker(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-300 focus:outline-none"
                      />
                      <button type="button" onClick={addAgendaItem} className="rounded-lg border border-cyan-500/20 bg-cyan-950 px-2.5 text-cyan-400 hover:bg-cyan-900">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </form>
            </div>

            <div className="h-fit space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 p-6">
              <div>
                <h2 className="text-lg font-bold text-white">Current Events</h2>
                <p className="text-xs text-slate-500">Read, edit, and delete public events.</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-6">
                  <Calendar className="h-5 w-5 animate-spin text-cyan-400" />
                </div>
              ) : events.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-600">No events created yet.</div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event._id} className={`space-y-3 rounded-2xl border p-4 ${editingId === event._id ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-900 bg-slate-950/60'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-bold text-white">{event.title}</span>
                          <span className="mt-1 inline-flex rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400">{event.year}</span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button type="button" onClick={() => startEdit(event)} className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white">
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => handleDelete(event)} className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 hover:text-red-200">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-500">
                        <p className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.date).toLocaleString()}</span>
                        </p>
                        <p className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </p>
                        <p>{event.agenda?.length || 0} agenda items</p>
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
