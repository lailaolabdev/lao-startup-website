'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Key,
  ShieldCheck,
  Building,
  Upload,
  Inbox,
  Calendar,
  CheckCircle,
  XCircle,
  Briefcase,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react';

interface MatchmakingRequest {
  _id: string;
  investorId: {
    _id: string;
    name: string;
    email: string;
  };
  startupId: {
    name: string;
  };
  status: 'Pending' | 'Approved' | 'Declined';
  scheduledTime?: string;
  requestNotes?: string;
  createdAt: string;
}

export default function StartupPortal() {
  // Authentication states
  const [token, setToken] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Startup' | 'Investor'>('Startup');
  const [authError, setAuthError] = useState('');

  // Dashboard states
  const [activeTab, setActiveTab] = useState<'profile' | 'inbox'>('profile');
  const [profileName, setProfileName] = useState('');
  const [category, setCategory] = useState('FinTech');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [revenue, setRevenue] = useState(0);
  const [teamSize, setTeamSize] = useState(1);
  const [fundingRaised, setFundingRaised] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);

  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  // Matchmaking Inbox states
  const [inbox, setInbox] = useState<MatchmakingRequest[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [schedDates, setSchedDates] = useState<Record<string, string>>({});

  // Fetch Startup Profile once logged in
  const loadProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/startups/profile/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        setProfileName(p.name || '');
        setCategory(p.category || 'FinTech');
        setDescription(p.description || '');
        setVideoUrl(p.videoUrl || '');
        if (p.tractionMetrics) {
          setRevenue(p.tractionMetrics.revenue || 0);
          setTeamSize(p.tractionMetrics.teamSize || 1);
          setFundingRaised(p.tractionMetrics.fundingRaised || 0);
          setCustomers(p.tractionMetrics.customers || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  };

  // Fetch incoming matchmaking meetings
  const loadInbox = async (authToken: string) => {
    setLoadingInbox(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/matchmaking/inbox`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setInbox(data.data || []);
      }
    } catch (err) {
      console.error('Error loading inbox', err);
    } finally {
      setLoadingInbox(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/auth/${authMode}`;
    const payload = authMode === 'login' ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        setToken(u.token);
        setUserRole(u.role);
        setUserName(u.name);
        
        // Save to state & trigger profile loading
        if (u.role === 'Startup') {
          loadProfile(u.token);
          loadInbox(u.token);
        } else if (u.role === 'Investor') {
          loadInbox(u.token);
        }
      } else {
        setAuthError(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthError('Connection failure. Make sure your backend API is online.');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      // Use FormData to support file upload
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('videoUrl', videoUrl);
      formData.append('revenue', revenue.toString());
      formData.append('teamSize', teamSize.toString());
      formData.append('fundingRaised', fundingRaised.toString());
      formData.append('customers', customers.toString());
      if (pitchDeckFile) {
        formData.append('pitchDeck', pitchDeckFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/startups/profile/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // FormData header is automatically sets
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess('Your startup profile and pitch decks have been saved successfully!');
        if (pitchDeckFile) {
          setPitchDeckFile(null); // Clear selected file
        }
        loadProfile(token);
      } else {
        setSaveError(data.message || 'Error occurred while saving profile settings.');
      }
    } catch (err) {
      setSaveError('Request failed. Check backend connections.');
    } finally {
      setSaving(false);
    }
  };

  const handleInboxAction = async (requestId: string, status: 'Approved' | 'Declined') => {
    setActionError('');
    setActionSuccess('');

    const scheduledTime = schedDates[requestId];
    if (status === 'Approved' && !scheduledTime) {
      setActionError('Please select a proposed Meeting Date and Time before approving.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/matchmaking/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          scheduledTime: scheduledTime || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Meeting successfully ${status.toLowerCase()}!`);
        loadInbox(token);
      } else {
        setActionError(data.message || 'Failed to update meeting status.');
      }
    } catch (err) {
      setActionError('API offline or failed network call.');
    }
  };

  // Logout clean states
  const handleLogout = () => {
    setToken('');
    setUserRole('');
    setUserName('');
    setEmail('');
    setPassword('');
    setName('');
    setInbox([]);
  };

  // If not logged in, render authentication gate
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Portal Access Gate
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              Sign in as an ecosystem Startup or Investor to manage pitch profiles and virtual matchmaking.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl space-y-6">
              {authError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Name / Org Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. LaoFresh Corporation"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                      />
                      <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@laostartup.org"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                    />
                    <Key className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Ecosystem Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'Startup' | 'Investor')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Startup">Startup Owner (Register pitch & upload decks)</option>
                      <option value="Investor">Venture Investor (Book virtual founder meetings)</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
                >
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="text-center pt-4 border-t border-slate-900/50">
                <button
                  type="button"
                  onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Dashboard
  return (
    <div className="min-h-screen bg-slate-950 px-4 pt-28 pb-12 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* User Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <span>Ecosystem Dashboard</span>
              <span className="text-xs bg-slate-900 border border-slate-800 text-cyan-400 px-2 py-0.5 rounded-full uppercase">
                {userRole}
              </span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Welcome back, <span className="text-white font-semibold">{userName}</span>. Manage your platform profiles.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Startup role dashboard views */}
        {userRole === 'Startup' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-2.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-l-4 border-cyan-500 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Building className="h-4.5 w-4.5" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('inbox');
                  loadInbox(token);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-gradient-to-r from-cyan-950 to-slate-900 border-l-4 border-cyan-500 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Inbox className="h-4.5 w-4.5" />
                  <span>Matchmaking Inbox</span>
                </div>
                {inbox.filter((r) => r.status === 'Pending').length > 0 && (
                  <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                    {inbox.filter((r) => r.status === 'Pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* Main Content Pane */}
            <div className="md:col-span-3 space-y-6">
              {activeTab === 'profile' && (
                <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Edit Startup Profile</h2>
                  {saveSuccess && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 mb-6">
                      {saveSuccess}
                    </div>
                  )}
                  {saveError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 mb-6">
                      {saveError}
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Startup Name</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Business Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none"
                        >
                          {['FinTech', 'AgriTech', 'Logistics', 'EdTech', 'E-Commerce', 'SaaS'].map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Company Pitch / Tagline</label>
                      <textarea
                        rows={4}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail your product value proposition, business model, and problem solved..."
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-450 uppercase mb-1">Video Demo URL</label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-455 uppercase mb-1 flex items-center space-x-1.5">
                          <Upload className="h-4 w-4 text-cyan-400" />
                          <span>Pitch Deck PDF (S3 Upload)</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setPitchDeckFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs focus:border-cyan-500 focus:outline-none text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Traction Metrics block */}
                    <div className="border-t border-slate-900 pt-6 space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
                        <span>Traction Metrics</span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Annual Revenue ($)</label>
                          <input
                            type="number"
                            value={revenue}
                            onChange={(e) => setRevenue(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none text-emerald-400 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Team Size</label>
                          <input
                            type="number"
                            value={teamSize}
                            onChange={(e) => setTeamSize(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Funding Raised ($)</label>
                          <input
                            type="number"
                            value={fundingRaised}
                            onChange={(e) => setFundingRaised(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none text-cyan-400 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Customers</label>
                          <input
                            type="number"
                            value={customers}
                            onChange={(e) => setCustomers(Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm focus:border-cyan-500 focus:outline-none text-purple-400"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'inbox' && (
                <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Matchmaking Inbox</h2>
                    <p className="text-xs text-slate-400 mt-1">Review virtual meeting requests received from interested Venture Capitalists.</p>
                  </div>

                  {actionSuccess && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
                      {actionSuccess}
                    </div>
                  )}
                  {actionError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
                      {actionError}
                    </div>
                  )}

                  {loadingInbox ? (
                    <div className="flex h-32 items-center justify-center">
                      <Clock className="h-6 w-6 animate-spin text-cyan-400" />
                    </div>
                  ) : inbox.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-sm">
                      No meeting requests in your inbox yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inbox.map((req) => (
                        <div
                          key={req._id}
                          className="rounded-2xl border border-slate-900 bg-slate-950/80 p-5 space-y-4 flex flex-col justify-between"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white text-sm">{req.investorId?.name}</span>
                                <span className="text-[10px] text-slate-500">({req.investorId?.email})</span>
                              </div>
                              <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-slate-900 rounded-xl p-3 border border-slate-850">
                                <span className="block font-bold text-[10px] uppercase text-slate-550 mb-1">Investor Note:</span>
                                {req.requestNotes || 'No notes included.'}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center space-x-2.5">
                              {req.status === 'Pending' && (
                                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                                  Pending Review
                                </span>
                              )}
                              {req.status === 'Approved' && (
                                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Approved</span>
                                </span>
                              )}
                              {req.status === 'Declined' && (
                                <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 flex items-center space-x-1">
                                  <XCircle className="h-3 w-3" />
                                  <span>Declined</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {req.status === 'Pending' && (
                            <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                              <div className="w-full sm:max-w-xs">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                  Propose Meeting Time
                                </label>
                                <input
                                  type="datetime-local"
                                  value={schedDates[req._id] || ''}
                                  onChange={(e) =>
                                    setSchedDates((prev) => ({ ...prev, [req._id]: e.target.value }))
                                  }
                                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                                <button
                                  onClick={() => handleInboxAction(req._id, 'Declined')}
                                  className="rounded-lg bg-red-950/60 border border-red-550/20 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-900"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => handleInboxAction(req._id, 'Approved')}
                                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                                >
                                  Approve & Schedule
                                </button>
                              </div>
                            </div>
                          )}

                          {req.status === 'Approved' && req.scheduledTime && (
                            <div className="pt-3 border-t border-slate-900 text-xs text-slate-400 flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-cyan-400" />
                              <span>
                                Scheduled: <span className="font-semibold text-white">{new Date(req.scheduledTime).toLocaleString()}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Investor mailbox view */
          <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Your Meeting Requests (Sent Box)</h2>
              <p className="text-xs text-slate-400 mt-1">Check response status of meeting bookings sent to startup founders.</p>
            </div>

            {loadingInbox ? (
              <div className="flex h-32 items-center justify-center">
                <Clock className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : inbox.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-sm">
                You have not requested any meetings yet. Browse the Startup Directory to book.
              </div>
            ) : (
              <div className="space-y-4">
                {inbox.map((req) => (
                  <div
                    key={req._id}
                    className="rounded-2xl border border-slate-900 bg-slate-950/80 p-5 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-550 uppercase font-bold">Meeting target:</span>
                        <h3 className="text-base font-bold text-white mt-0.5">{req.startupId?.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        {req.status === 'Pending' && (
                          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                            Awaiting Response
                          </span>
                        )}
                        {req.status === 'Approved' && (
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Meeting Accepted</span>
                          </span>
                        )}
                        {req.status === 'Declined' && (
                          <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 flex items-center space-x-1">
                            <XCircle className="h-3 w-3" />
                            <span>Declined</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-400">
                      <span className="block font-bold text-[10px] text-slate-550 uppercase mb-1">Your message:</span>
                      {req.requestNotes || 'No notes included.'}
                    </div>

                    {req.status === 'Approved' && req.scheduledTime && (
                      <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-cyan-400" />
                        <span>
                          Meeting Scheduled for:{' '}
                          <span className="font-semibold text-white">{new Date(req.scheduledTime).toLocaleString()}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
