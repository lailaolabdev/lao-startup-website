'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  Edit3,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

type SponsorTier = 'Diamond' | 'Gold' | 'Silver';

interface EventItem {
  _id: string;
  title: string;
  year: number;
}

interface SponsorItem {
  _id: string;
  name: string;
  tier: SponsorTier;
  logoUrl: string;
  showOnHome?: boolean;
  eventId?: {
    _id?: string;
    title: string;
    year: number;
  };
}

interface SponsorForm {
  name: string;
  tier: SponsorTier;
  eventId: string;
  logoUrl: string;
  showOnHome: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const API_ORIGIN = API_BASE.replace('/api', '');
const TIERS: SponsorTier[] = ['Diamond', 'Gold', 'Silver'];

const emptyForm: SponsorForm = {
  name: '',
  tier: 'Diamond',
  eventId: '',
  logoUrl: '',
  showOnHome: true,
};

const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
};

const tierStyle = (tier: SponsorTier) => {
  if (tier === 'Diamond') return 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300';
  if (tier === 'Gold') return 'border-amber-500/25 bg-amber-500/10 text-amber-300';
  return 'border-slate-700 bg-slate-800 text-slate-300';
};

export default function AdminSponsors() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [form, setForm] = useState<SponsorForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sortedSponsors = useMemo(() => {
    const rank: Record<SponsorTier, number> = { Diamond: 0, Gold: 1, Silver: 2 };
    return [...sponsors].sort((a, b) => rank[a.tier] - rank[b.tier] || a.name.localeCompare(b.name));
  }, [sponsors]);

  const loadData = useCallback(async (tokenValue = localStorage.getItem('admin_token') || '') => {
    setLoading(true);
    setError('');
    try {
      const [eventsRes, sponsorsRes] = await Promise.all([
        fetch(`${API_BASE}/events`),
        fetch(`${API_BASE}/sponsors`, tokenValue ? { headers: { Authorization: `Bearer ${tokenValue}` } } : undefined),
      ]);

      const eventsData = await eventsRes.json();
      if (eventsData.success) {
        const nextEvents = eventsData.data || [];
        setEvents(nextEvents);
        setForm((prev) => ({
          ...prev,
          eventId: prev.eventId || nextEvents[0]?._id || '',
        }));
      }

      const sponsorsData = await sponsorsRes.json();
      if (!sponsorsData.success) {
        throw new Error(sponsorsData.message || sponsorsData.error || 'Failed to load sponsors');
      }
      setSponsors(sponsorsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sponsor data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/admin/login';
      return;
    }
    const timeoutId = window.setTimeout(() => {
      loadData(token);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const resetForm = () => {
    setForm((prev) => ({ ...emptyForm, eventId: events[0]?._id || prev.eventId || '' }));
    setEditingId(null);
    setLogoFile(null);
    setMessage('');
    setError('');
    const fileInput = document.getElementById('sponsor-logo-file-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const editSponsor = (sponsor: SponsorItem) => {
    setEditingId(sponsor._id);
    setMessage('');
    setError('');
    setLogoFile(null);
    setForm({
      name: sponsor.name || '',
      tier: sponsor.tier || 'Diamond',
      eventId: sponsor.eventId?._id || '',
      logoUrl: sponsor.logoUrl || '',
      showOnHome: sponsor.showOnHome ?? true,
    });
    const fileInput = document.getElementById('sponsor-logo-file-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    if (!logoFile && !form.logoUrl) {
      setSaving(false);
      setError('Please upload a sponsor logo or provide a logo URL.');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token') || '';
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('tier', form.tier);
      formData.append('eventId', form.eventId);
      formData.append('logoUrl', form.logoUrl);
      formData.append('showOnHome', String(form.showOnHome));
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const endpoint = editingId ? `${API_BASE}/sponsors/${editingId}` : `${API_BASE}/sponsors`;
      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to save sponsor');
      }

      setMessage(editingId ? 'Sponsor updated.' : 'Sponsor created.');
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save sponsor');
    } finally {
      setSaving(false);
    }
  };

  const deleteSponsor = async (sponsor: SponsorItem) => {
    if (!confirm(`Delete ${sponsor.name}? This action cannot be undone.`)) return;
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('admin_token') || '';
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const res = await fetch(`${API_BASE}/sponsors/${sponsor._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to delete sponsor');
      }
      setMessage('Sponsor deleted.');
      if (editingId === sponsor._id) resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sponsor');
    }
  };

  const previewLogo = logoFile ? URL.createObjectURL(logoFile) : resolveAssetUrl(form.logoUrl);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Sponsor CRUD
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Sponsors</h1>
            <p className="mt-1 text-sm text-slate-400">
              Create, edit, upload logos, and remove sponsor partners shown on Home and Events.
            </p>
          </div>
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {message && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_440px]">
          <section className="overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/10">
            <div className="flex items-center justify-between border-b border-slate-900 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Active Sponsors</h2>
                <p className="text-xs text-slate-500">Sorted by sponsorship tier.</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-400">
                {sortedSponsors.length} total
              </span>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-7 w-7 animate-spin text-cyan-400" />
              </div>
            ) : sortedSponsors.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">No sponsors registered.</div>
            ) : (
              <div className="divide-y divide-slate-900">
                {sortedSponsors.map((sponsor) => (
                  <div key={sponsor._id} className="grid gap-4 bg-slate-950/50 p-4 transition-colors hover:bg-slate-900/40 md:grid-cols-[72px_minmax(0,1fr)_150px]">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                      <img
                        src={resolveAssetUrl(sponsor.logoUrl)}
                        alt={`${sponsor.name} logo`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-bold text-white">{sponsor.name}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tierStyle(sponsor.tier)}`}>
                          {sponsor.tier}
                        </span>
                      </div>
                      {sponsor.eventId && (
                        <p className="mt-2 text-xs text-slate-500">
                          Linked to {sponsor.eventId.title} ({sponsor.eventId.year})
                        </p>
                      )}
                      {!sponsor.eventId && (
                        <p className="mt-2 text-xs text-slate-500">Home page sponsor</p>
                      )}
                      {!sponsor.showOnHome && (
                        <p className="mt-1 text-xs text-slate-500">Hidden from Home</p>
                      )}
                      <p className="mt-2 truncate text-[11px] text-slate-600">{sponsor.logoUrl}</p>
                    </div>

                    <div className="flex items-center gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => editSponsor(sponsor)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSponsor(sponsor)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-900 bg-slate-900/10 p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Sponsor' : 'Create Sponsor'}</h2>
                <p className="text-xs text-slate-500">Logo uploads follow the same server upload flow as News.</p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Sponsor Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g. Unitel Telecom"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none transition-colors focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Tier</label>
                  <select
                    value={form.tier}
                    onChange={(event) => setForm((prev) => ({ ...prev, tier: event.target.value as SponsorTier }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-500"
                  >
                    {TIERS.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Event</label>
                  <select
                    value={form.eventId}
                    onChange={(event) => setForm((prev) => ({ ...prev, eventId: event.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-500"
                  >
                    <option value="">Home page only</option>
                    {events.length === 0 ? (
                      <option value="" disabled>No events available</option>
                    ) : (
                      events.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} ({event.year})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-slate-900 bg-slate-950/60 p-4 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.showOnHome}
                  onChange={(event) => setForm((prev) => ({ ...prev, showOnHome: event.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500"
                />
                <span>
                  <span className="block font-bold text-white">Show on Home page</span>
                  <span className="mt-1 block text-xs text-slate-500">Turn this off when the sponsor should appear only on a linked event page.</span>
                </span>
              </label>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-400">
                  <ImageIcon className="h-4 w-4 text-cyan-400" />
                  Logo Upload
                </label>
                <input
                  id="sponsor-logo-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-slate-400 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-cyan-300"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Logo URL</label>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
                  placeholder="/uploads/logo.png or https://..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white outline-none transition-colors focus:border-cyan-500"
                />
              </div>

              <div className="rounded-xl border border-slate-900 bg-slate-950/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Award className="h-4 w-4 text-amber-300" />
                  Logo Preview
                </div>
                {previewLogo ? (
                  <div className="flex h-24 items-center justify-center rounded-xl bg-white p-4">
                    <img src={previewLogo} alt="Sponsor preview" className="max-h-16 max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-600">
                    No logo selected
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/15 transition-all hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60"
              >
                {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Saving...' : editingId ? 'Update Sponsor' : 'Create Sponsor'}
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-slate-900 bg-slate-950/50 p-4 text-xs leading-6 text-slate-500">
              <div className="mb-1 flex items-center gap-2 font-bold text-slate-400">
                <Building2 className="h-4 w-4" />
                Display rules
              </div>
              Home page sponsors are controlled by the checkbox above. Diamond logos appear first, then Gold, then Silver. Event pages still group linked sponsors by tier.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
