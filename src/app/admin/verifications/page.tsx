'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, ArrowLeft, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PendingStartup {
  _id: string;
  name: string;
  category: string;
  description: string;
  approvedStatus: 'Pending' | 'Approved' | 'Rejected';
  userId?: {
    email: string;
  };
}

interface PendingInvestor {
  id: string;
  name: string;
  email: string;
  firm: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const MOCK_INVESTORS: PendingInvestor[] = [
  { id: 'inv-1', name: 'Seng Aloun', email: 'seng@mekongcapital.com', firm: 'Mekong Ventures', status: 'Pending' },
  { id: 'inv-2', name: 'Michael Tan', email: 'm.tan@singaporeangels.sg', firm: 'SG Angel Net', status: 'Pending' },
];

export default function AdminVerifications() {
  const [adminToken, setAdminToken] = useState('');
  const [startups, setStartups] = useState<PendingStartup[]>([]);
  const [investors, setInvestors] = useState<PendingInvestor[]>(MOCK_INVESTORS);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [usingMockStartups, setUsingMockStartups] = useState(false);

  const fetchPendingStartups = async (tokenValue: string) => {
    if (!tokenValue) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/startups?status=Pending`,
        {
          headers: { Authorization: `Bearer ${tokenValue}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setStartups(data.data || []);
        setUsingMockStartups(false);
      } else {
        throw new Error(data.message || 'Failed to load');
      }
    } catch (err) {
      // Offline fallback startups
      setStartups([
        {
          _id: 'st-mock-99',
          name: 'Vientiane Agri-Growers',
          category: 'AgriTech',
          description: 'Hydroponics automation kits and digital trading portals for organic Lao lettuce growers.',
          approvedStatus: 'Pending',
          userId: { email: 'contact@agrigrow.la' },
        },
      ]);
      setUsingMockStartups(true);
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
    fetchPendingStartups(token);
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminToken) {
      fetchPendingStartups(adminToken);
    }
  };

  const verifyStartup = async (startupId: string, status: 'Approved' | 'Rejected') => {
    setError('');
    setMessage('');
    
    if (usingMockStartups) {
      // Local state update
      setStartups((prev) => prev.filter((s) => s._id !== startupId));
      setMessage(`Startup verification simulation set to ${status}!`);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/startups/${startupId}/verify`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessage(`Startup profile successfully ${status.toLowerCase()}!`);
        fetchPendingStartups(adminToken);
      } else {
        setError(data.message || 'Failed to complete verification.');
      }
    } catch (err) {
      setError('Connection to server failed.');
    }
  };

  const verifyInvestor = (investorId: string, status: 'Approved' | 'Rejected') => {
    setInvestors((prev) => prev.filter((inv) => inv.id !== investorId));
    setMessage(`Investor registration verified and set to ${status}!`);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <span>Account Verifications</span>
              <span className="text-xs bg-slate-900 border border-slate-800 text-amber-400 px-2 py-0.5 rounded-full uppercase">
                Pending Approval
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Audit profiles and verify sign-ups to maintain platform security.
            </p>
          </div>
        </div>

        {/* Token Authentication gate */}
        {!adminToken && (
          <div className="max-w-md mx-auto rounded-3xl border border-slate-900 bg-slate-900/40 p-6 sm:p-8 backdrop-blur shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-cyan-400" />
              <span>Admin Authentication Required</span>
            </h2>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
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
                  className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg"
              >
                Authenticate Session
              </button>
            </form>
            <div className="mt-4 flex items-start space-x-2 text-[10px] text-slate-500 bg-slate-950/60 rounded-lg p-2.5">
              <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                To test verifications instantly without an active database, click &quot;Authenticate Session&quot; with a dummy value to trigger sandbox mode.
              </span>
            </div>
          </div>
        )}

        {adminToken && (
          <div className="space-y-8">
            {message && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Pending Startups */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-905 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
                  <span>Pending Startups ({startups.length})</span>
                </h2>
                {usingMockStartups && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Sandbox Database
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex h-20 items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              ) : startups.length === 0 ? (
                <div className="text-center text-slate-550 text-xs py-6">
                  No pending startup profiles to verify.
                </div>
              ) : (
                <div className="space-y-4">
                  {startups.map((st) => (
                    <div
                      key={st._id}
                      className="rounded-2xl border border-slate-900 bg-slate-950/80 p-5 flex flex-col md:flex-row md:items-start justify-between gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-bold text-white text-base">{st.name}</h3>
                          <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[10px] text-cyan-400">
                            {st.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{st.description}</p>
                        {st.userId?.email && (
                          <span className="block text-[10px] text-slate-500">Contact: {st.userId.email}</span>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        <button
                          onClick={() => verifyStartup(st._id, 'Rejected')}
                          className="rounded-lg bg-red-950/60 border border-red-550/20 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-900"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => verifyStartup(st._id, 'Approved')}
                          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Investors */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-6">
              <div className="border-b border-slate-905 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-purple-400" />
                  <span>Pending Investors ({investors.length})</span>
                </h2>
              </div>

              {investors.length === 0 ? (
                <div className="text-center text-slate-550 text-xs py-6">
                  No pending investor registrations.
                </div>
              ) : (
                <div className="space-y-4">
                  {investors.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-2xl border border-slate-900 bg-slate-950/80 p-5 flex flex-col md:flex-row md:items-start justify-between gap-6"
                    >
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-base">{inv.name}</h3>
                        <p className="text-xs text-slate-400">
                          Firm: <span className="text-slate-200 font-semibold">{inv.firm}</span>
                        </p>
                        <span className="block text-[10px] text-slate-500">Email: {inv.email}</span>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2">
                        <button
                          onClick={() => verifyInvestor(inv.id, 'Rejected')}
                          className="rounded-lg bg-red-950/60 border border-red-550/20 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-900"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => verifyInvestor(inv.id, 'Approved')}
                          className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                        >
                          Verify User
                        </button>
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
