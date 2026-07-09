'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

type StartupStatus = 'Pending' | 'Approved' | 'Rejected';

interface Startup {
  _id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  pitchDeckUrl?: string;
  videoUrl?: string;
  approvedStatus: StartupStatus;
  tractionMetrics?: {
    revenue?: number;
    teamSize?: number;
    fundingRaised?: number;
    customers?: number;
  };
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
}

interface StartupForm {
  name: string;
  ownerName: string;
  ownerEmail: string;
  category: string;
  description: string;
  logoUrl: string;
  pitchDeckUrl: string;
  videoUrl: string;
  approvedStatus: StartupStatus;
  revenue: string;
  teamSize: string;
  fundingRaised: string;
  customers: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api';
const API_ORIGIN = API_BASE.replace('/api', '');
const CATEGORIES = ['AgriTech', 'FinTech', 'Logistics', 'EdTech', 'E-Commerce', 'SaaS', 'Manufacturing', 'Services', 'Other'];
const STATUSES: StartupStatus[] = ['Pending', 'Approved', 'Rejected'];

const emptyForm: StartupForm = {
  name: '',
  ownerName: '',
  ownerEmail: '',
  category: 'Services',
  description: '',
  logoUrl: '',
  pitchDeckUrl: '',
  videoUrl: '',
  approvedStatus: 'Approved',
  revenue: '0',
  teamSize: '1',
  fundingRaised: '0',
  customers: '0',
};

const money = (value?: number) => `$${Number(value || 0).toLocaleString()}`;
const resolveAssetUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('/') ? `${API_ORIGIN}${url}` : url;
};

export default function AdminStartupsPage() {
  const [adminToken, setAdminToken] = useState('');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [form, setForm] = useState<StartupForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StartupStatus>('All');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      const matchesStatus = statusFilter === 'All' || startup.approvedStatus === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        startup.name.toLowerCase().includes(query) ||
        startup.category.toLowerCase().includes(query) ||
        startup.userId?.email?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [search, startups, statusFilter]);

  const loadStartups = async (tokenValue = adminToken) => {
    if (!tokenValue) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/startups?limit=200`, {
        headers: { Authorization: `Bearer ${tokenValue}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to load startup companies');
      }
      setStartups(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load startup companies');
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
    loadStartups(token);
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setLogoFile(null);
    setEditingId(null);
    setError('');
    setMessage('');
    const fileInput = document.getElementById('startup-logo-file-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const editStartup = (startup: Startup) => {
    setEditingId(startup._id);
    setMessage('');
    setError('');
    setForm({
      name: startup.name || '',
      ownerName: startup.userId?.name || '',
      ownerEmail: startup.userId?.email || '',
      category: startup.category || 'Services',
      description: startup.description || '',
      logoUrl: startup.logoUrl || '',
      pitchDeckUrl: startup.pitchDeckUrl || '',
      videoUrl: startup.videoUrl || '',
      approvedStatus: startup.approvedStatus || 'Pending',
      revenue: String(startup.tractionMetrics?.revenue || 0),
      teamSize: String(startup.tractionMetrics?.teamSize || 1),
      fundingRaised: String(startup.tractionMetrics?.fundingRaised || 0),
      customers: String(startup.tractionMetrics?.customers || 0),
    });
    setLogoFile(null);
    const fileInput = document.getElementById('startup-logo-file-input') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const endpoint = editingId ? `${API_BASE}/startups/${editingId}` : `${API_BASE}/startups`;
      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to save startup company');
      }

      setMessage(editingId ? 'Startup company updated.' : 'Startup company created.');
      resetForm();
      loadStartups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save startup company');
    } finally {
      setSaving(false);
    }
  };

  const deleteStartup = async (startup: Startup) => {
    if (!confirm(`Delete ${startup.name}? This action cannot be undone.`)) return;
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/startups/${startup._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || data.error || 'Failed to delete startup company');
      }
      setMessage('Startup company deleted.');
      if (editingId === startup._id) resetForm();
      loadStartups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete startup company');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 border-b border-slate-900 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
              <Building2 className="h-3.5 w-3.5" />
              Directory CRUD
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Startup Companies</h1>
            <p className="mt-1 text-sm text-slate-400">
              Create, edit, approve, and remove company profiles shown on the public directory.
            </p>
          </div>
          <button
            onClick={() => loadStartups()}
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
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-3xl border border-slate-900 bg-slate-900/10 p-5">
            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by company, category, or owner email..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition-colors focus:border-cyan-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'All' | StartupStatus)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-500"
              >
                <option value="All">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-sm text-slate-500">
                No startup companies found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-900">
                <div className="divide-y divide-slate-900">
                  {filteredStartups.map((startup) => (
                    <div key={startup._id} className="grid gap-4 bg-slate-950/60 p-4 transition-colors hover:bg-slate-900/40 lg:grid-cols-[64px_minmax(0,1fr)_260px_130px]">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        {startup.logoUrl ? (
                          <img src={resolveAssetUrl(startup.logoUrl)} alt={`${startup.name} logo`} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-cyan-300">{startup.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-bold text-white">{startup.name}</h3>
                          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                            {startup.category}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              startup.approvedStatus === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : startup.approvedStatus === 'Rejected'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {startup.approvedStatus}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{startup.description}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {startup.userId?.email || 'No owner email'}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                          {startup.logoUrl && <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-400">Logo</span>}
                          {startup.pitchDeckUrl && <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-400">Pitch deck</span>}
                          {startup.videoUrl && <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-400">Video</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-slate-900/70 p-3">
                          <span className="block text-slate-500">Revenue</span>
                          <span className="font-bold text-white">{money(startup.tractionMetrics?.revenue)}</span>
                        </div>
                        <div className="rounded-xl bg-slate-900/70 p-3">
                          <span className="block text-slate-500">Funding</span>
                          <span className="font-bold text-white">{money(startup.tractionMetrics?.fundingRaised)}</span>
                        </div>
                        <div className="rounded-xl bg-slate-900/70 p-3">
                          <span className="block text-slate-500">Team</span>
                          <span className="font-bold text-white">{startup.tractionMetrics?.teamSize || 1}</span>
                        </div>
                        <div className="rounded-xl bg-slate-900/70 p-3">
                          <span className="block text-slate-500">Customers</span>
                          <span className="font-bold text-white">{Number(startup.tractionMetrics?.customers || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 lg:justify-end">
                        <button
                          onClick={() => editStartup(startup)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStartup(startup)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-900/70 hover:text-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-900 bg-slate-900/20 p-5 xl:sticky xl:top-24 xl:self-start">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Company' : 'Create Company'}</h2>
                <p className="text-xs text-slate-500">Fields align with public directory cards and detail pages.</p>
              </div>
              {editingId ? (
                <button onClick={resetForm} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Plus className="h-5 w-5 text-cyan-400" />
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Company Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Owner Name</label>
                  <input
                    value={form.ownerName}
                    onChange={(event) => setForm((prev) => ({ ...prev, ownerName: event.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Owner Email</label>
                  <input
                    type="email"
                    required={!editingId}
                    value={form.ownerEmail}
                    onChange={(event) => setForm((prev) => ({ ...prev, ownerEmail: event.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={form.approvedStatus}
                    onChange={(event) => setForm((prev) => ({ ...prev, approvedStatus: event.target.value as StartupStatus }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm leading-6 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-3">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Company Logo</label>
                <label
                  htmlFor="startup-logo-file-input"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-5 text-center transition-colors hover:border-cyan-500 hover:bg-slate-900/80"
                >
                  <span className="text-sm font-bold text-slate-200">
                    {logoFile ? logoFile.name : 'Upload logo image'}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, GIF. Stored by the backend like news images.</span>
                  <input
                    id="startup-logo-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setLogoFile(file);
                    }}
                  />
                </label>

                {(logoFile || form.logoUrl) && (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-900 bg-slate-950/80 p-3">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                      <img
                        src={logoFile ? URL.createObjectURL(logoFile) : resolveAssetUrl(form.logoUrl)}
                        alt="logo preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-300">
                        {logoFile ? 'New logo selected' : 'Existing uploaded logo'}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-slate-500">
                        {logoFile ? logoFile.name : form.logoUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setForm((prev) => ({ ...prev, logoUrl: '' }));
                        const fileInput = document.getElementById('startup-logo-file-input') as HTMLInputElement | null;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="rounded-lg border border-red-500/20 bg-red-950/50 p-2 text-red-300 transition-colors hover:bg-red-900 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Pitch Deck URL</label>
                  <input
                    value={form.pitchDeckUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, pitchDeckUrl: event.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Video URL</label>
                  <input
                    value={form.videoUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ['revenue', 'Revenue'],
                  ['teamSize', 'Team Size'],
                  ['fundingRaised', 'Funding Raised'],
                  ['customers', 'Customers'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
                    <input
                      type="number"
                      min="0"
                      value={form[key as keyof StartupForm]}
                      onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : editingId ? 'Update Company' : 'Create Company'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
