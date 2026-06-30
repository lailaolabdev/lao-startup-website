'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Calendar, Clock, Tag, Newspaper } from 'lucide-react';
import Link from 'next/link';

interface NewsItem {
  _id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
  date: string;
  images?: string[];
}

export default function AdminNews() {
  const [adminToken, setAdminToken] = useState('');
  
  // Form fields
  const [content, setContent] = useState('');
  
  // Image states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/news`);
      const data = await res.json();
      if (data.success) {
        setNews(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching news', e);
      setError('Failed to connect to backend for fetching news.');
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
    fetchNews();
  }, []);

  const handleEditClick = (item: NewsItem) => {
    setEditingId(item._id);
    setContent(item.content);
    setExistingImages(item.images || []);
    setImageFiles([]); // Reset new selections
    setSuccess('');
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setContent('');
    setExistingImages([]);
    setImageFiles([]);
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!adminToken) {
      setError('Admin Authentication Token is required.');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append('content', content);
    formData.append('existingImages', JSON.stringify(existingImages));
    
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/news/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/news`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(
          editingId
            ? 'News article updated successfully!'
            : 'New platform news article created successfully!'
        );
        handleCancelEdit();
        fetchNews();
        // Clear file input manually
        const fileInput = document.getElementById('images-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.message || 'Action failed.');
      }
    } catch (err) {
      setError('Connection failure to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    setError('');
    setSuccess('');

    if (!adminToken) {
      setError('Admin Authentication Token is required to delete items.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('News article deleted successfully!');
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchNews();
      } else {
        setError(data.message || 'Failed to delete news article.');
      }
    } catch (err) {
      setError('Connection failure to backend.');
    }
  };

  const getBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Program':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20';
      case 'Investment':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20';
      case 'Ecosystem':
        return 'text-purple-400 bg-purple-400/10 border-purple-500/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-500/20';
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
            <span>Manage News & Topics</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Publish, edit, and moderate news articles and topics displayed on the homepage.
          </p>
        </div>

        {/* Token Authentication gate */}
        {!adminToken && (
          <div className="max-w-md mx-auto rounded-3xl border border-slate-900 bg-slate-900/40 p-6 sm:p-8 backdrop-blur shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Admin Authentication Required</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchNews();
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
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs focus:border-cyan-500 focus:outline-none"
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
            {/* Form Column */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 sm:p-8 space-y-6 h-fit">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Edit News Article' : 'Publish New Article'}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingId ? 'Modify details of the selected news article.' : 'Write articles to highlight programs and tech updates.'}
                </p>
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Modern Image Upload Zone */}
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Upload Article Images (Max 30)
                  </label>
                  
                  {/* Dotted Upload Card */}
                  <div
                    onClick={() => {
                      const fileInput = document.getElementById('images-file-input');
                      if (fileInput) fileInput.click();
                    }}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/10 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="h-12 w-12 rounded-xl bg-cyan-950/40 border border-cyan-500/15 flex items-center justify-center group-hover:bg-cyan-950/60 group-hover:border-cyan-500/35 transition-all">
                      <Plus className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        Click to upload images
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Supports PNG, JPG, JPEG (Maximum 30 images)
                      </p>
                    </div>
                    <input
                      id="images-file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          const newFiles = Array.from(e.target.files);
                          setImageFiles((prev) => {
                            const combined = [...prev, ...newFiles];
                            return combined.slice(0, 30);
                          });
                          e.target.value = ''; // Reset file input value so onChange will fire on next click even if same file is chosen
                        }
                      }}
                      className="hidden"
                    />
                  </div>

                  {/* Previews of newly selected images */}
                  {imageFiles.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider">New files to upload ({imageFiles.length}):</span>
                      <div className="grid grid-cols-5 gap-3">
                        {imageFiles.map((file, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square bg-slate-950/40 group/thumb">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFiles(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute inset-0 bg-red-950/70 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all duration-200"
                            >
                              <Trash2 className="h-4.5 w-4.5 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previews of existing uploaded images */}
                  {existingImages.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Existing images ({existingImages.length}):</span>
                      <div className="grid grid-cols-5 gap-3">
                        {existingImages.map((url, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square bg-slate-950/40 group/thumb">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url.startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api').replace('/api', '')}${url}` : url}
                              alt="existing"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExistingImages(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute inset-0 bg-red-950/70 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all duration-200"
                            >
                              <Trash2 className="h-4.5 w-4.5 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Article Content</label>
                  <textarea
                    rows={8}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your ecosystem update, news details, or announcement here..."
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{editingId ? 'Updating...' : 'Publishing...'}</span>
                      </>
                    ) : (
                      <span>{editingId ? 'Update Article' : 'Publish Article'}</span>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-xl border border-slate-850 bg-slate-950 px-6 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="rounded-3xl border border-slate-900 bg-slate-900/10 p-6 space-y-4 h-fit">
              <div>
                <h2 className="text-lg font-bold text-white">Current News</h2>
                <p className="text-xs text-slate-500">Live published articles feed.</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-6">
                  <Newspaper className="h-5 w-5 animate-spin text-cyan-400" />
                </div>
              ) : news.length === 0 ? (
                <div className="text-center text-slate-600 text-xs py-6">
                  No news articles published yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {news.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-2xl border border-slate-900 bg-slate-950/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${getBadgeColor(item.category)}`}>
                          {item.category}
                        </span>
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-cyan-400 hover:text-cyan-300 hover:border-slate-700"
                            title="Edit"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 hover:border-slate-700"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-start">
                        {item.images && item.images.length > 0 && (
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.images[0].startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api').replace('/api', '')}${item.images[0]}` : item.images[0]}
                              alt="thumbnail"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold text-white text-xs line-clamp-2">{item.title || (item.content ? item.content.slice(0, 60) + (item.content.length > 60 ? '...' : '') : 'Untitled Update')}</h4>
                          <div className="text-[9px] text-slate-500 flex items-center space-x-2">
                            <span className="flex items-center space-x-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              <span>{item.readTime}</span>
                            </span>
                          </div>
                        </div>
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
