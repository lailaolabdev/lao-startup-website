'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Award, Image, Settings, RefreshCw, Sparkles, Building2 } from 'lucide-react';
import Link from 'next/link';

interface EventItem {
  _id: string;
  title: string;
  year: number;
}

interface SponsorItem {
  _id: string;
  name: string;
  tier: 'Diamond' | 'Gold' | 'Silver';
  logoUrl: string;
  eventId?: {
    title: string;
    year: number;
  };
}

export default function AdminSponsors() {
  const [adminToken, setAdminToken] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [tier, setTier] = useState<'Diamond' | 'Gold' | 'Silver'>('Diamond');
  const [eventId, setEventId] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch events for select input
      const evRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/events`);
      const evData = await evRes.json();
      if (evData.success && evData.data) {
        setEvents(evData.data);
        if (evData.data.length > 0) {
          setEventId(evData.data[0]._id);
        }
      }

      // Fetch sponsors
      const spRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/sponsors`);
      const spData = await spRes.json();
      if (spData.success) {
        setSponsors(spData.data || []);
      }
    } catch (e) {
      console.error('Error fetching data', e);
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
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminToken) {
      setError('Admin Authentication Token is required.');
      return;
    }

    if (!logoFile) {
      setError('Please select a sponsor logo image file to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('tier', tier);
      formData.append('eventId', eventId);
      formData.append('logo', logoFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/sponsors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData, // FormData handles Content-Type boundaries
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('New tiered sponsor has been added successfully!');
        setName('');
        setLogoFile(null);
        // Clear file input manually
        const fileInput = document.getElementById('logo-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        loadData();
      } else {
        setError(data.message || 'Failed to create sponsor.');
      }
    } catch (err) {
      setError('Connection failed. Make sure the Express server is online.');
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
            <span>Manage Platform Sponsors</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Link corporate partners to event timelines and tier their logo displays.
          </p>
        </div>

        {/* Token Authentication gate */}
        {!adminToken && (
          <div className="max-w-md mx-auto rounded-3xl border border-slate-900 bg-slate-900/40 p-6 sm:p-8 backdrop-blur shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Admin Authentication Required</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadData();
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
            {/* Sponsor Form */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 space-y-6 h-fit">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Sponsor</h2>
                <p className="text-xs text-slate-505">Link partner logos with configured events.</p>
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
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Sponsor Brand Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Unitel Telecom"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Sponsorship Tier</label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value as 'Diamond' | 'Gold' | 'Silver')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Diamond">Diamond (Primary Display)</option>
                      <option value="Gold">Gold (Secondary Display)</option>
                      <option value="Silver">Silver (Standard Display)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assign to Event</label>
                    <select
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none text-slate-300"
                    >
                      {events.length === 0 ? (
                        <option value="">No events found. Create an event first.</option>
                      ) : (
                        events.map((ev) => (
                          <option key={ev._id} value={ev._id}>
                            {ev.title} ({ev.year})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1 flex items-center space-x-1.5">
                      <Image className="h-4 w-4 text-cyan-400" />
                      <span>Logo File (S3 Upload)</span>
                    </label>
                    <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-450 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg"
                >
                  Register Sponsor
                </button>
              </form>
            </div>

            {/* Current Sponsors list */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-4 h-fit">
              <div>
                <h2 className="text-lg font-bold text-white">Active Partners</h2>
                <p className="text-xs text-slate-500">Tiered list of active brand sponsors.</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="h-5 w-5 animate-spin text-cyan-400" />
                </div>
              ) : sponsors.length === 0 ? (
                <div className="text-center text-slate-600 text-xs py-6">
                  No sponsors registered.
                </div>
              ) : (
                <div className="space-y-3">
                  {sponsors.map((sp) => (
                    <div
                      key={sp._id}
                      className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                          <span>{sp.name}</span>
                        </span>
                        <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold border ${
                          sp.tier === 'Diamond'
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                            : sp.tier === 'Gold'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                        }`}>
                          {sp.tier}
                        </span>
                      </div>
                      {sp.eventId && (
                        <span className="block text-[9px] text-slate-500">
                          Linked: {sp.eventId.title} ({sp.eventId.year})
                        </span>
                      )}
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
