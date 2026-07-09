'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowRight, Newspaper, X, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface HomeNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  readTime: string;
  badgeColor: string;
  images?: string[];
  content?: string; // full content text
}

interface NewsSectionProps {
  newsItems: HomeNewsItem[];
  showAllButton?: boolean;
  title?: string;
  subtitle?: string;
}

export default function NewsSection({ newsItems, showAllButton, title, subtitle }: NewsSectionProps) {
  const { language: lang } = useLanguage();
  const [selectedNews, setSelectedNews] = useState<HomeNewsItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Auto-slide images in detail view every 2.5 seconds (2500ms)
  useEffect(() => {
    if (!selectedNews || !selectedNews.images || selectedNews.images.length <= 1 || lightboxIndex !== null) {
      return;
    }

    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % selectedNews.images!.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [selectedNews, lightboxIndex]);

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    if (lightboxIndex === null || !selectedNews || !selectedNews.images) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => 
          prev !== null ? (prev - 1 + selectedNews.images!.length) % selectedNews.images!.length : null
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => 
          prev !== null ? (prev + 1) % selectedNews.images!.length : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, selectedNews]);

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

  const handleOpenModal = (item: HomeNewsItem) => {
    setSelectedNews(item);
    setActiveImageIndex(0);
    setLightboxIndex(null);
  };

  const handleCloseModal = () => {
    setSelectedNews(null);
    setLightboxIndex(null);
  };

  const nextImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % max);
  };

  const prevImage = (e: React.MouseEvent, max: number) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + max) % max);
  };

  // Helper function to render text with HTML links
  const renderContentWithLinks = (text: string) => {
    if (!text) return null;

    // Regex to match URLs starting with http or https
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 hover:underline break-all transition-colors font-semibold"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* News & Topics Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-b border-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {title || 'News & Topics'}
            </h2>
            <p className="mt-2 text-slate-400">
              {subtitle || 'ຂ່າວສານ ແລະ ຄວາມເຄື່ອນໄຫວຫຼ້າສຸດໃນວົງການຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ.'}
            </p>
          </div>
          {showAllButton !== false && (
            <Link 
              href="/news"
              className="mt-4 md:mt-0 flex items-center space-x-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>{lang === 'EN' ? 'View all news' : 'ເບິ່ງຂ່າວທັງໝົດ'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <article
              key={item.id}
              onClick={() => handleOpenModal(item)}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all group cursor-pointer"
            >
              <div>
                {/* News Card Image Header */}
                {item.images && item.images.length > 0 ? (
                  <div className="h-48 w-full overflow-hidden border-b border-slate-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.images[0].startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api').replace('/api', '')}${item.images[0]}` : item.images[0]}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  // Fallback beautiful subtle abstract gradient header if no image exists
                  <div className="h-48 w-full bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 border-b border-slate-900 relative flex items-center justify-center">
                    <Newspaper className="h-8 w-8 text-slate-800/80" />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.badgeColor}`}>
                      {item.category}
                    </span>
                    <div className="flex items-center text-xs text-slate-500 space-x-2">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.readTime.replace('min read', lang === 'EN' ? 'min read' : 'ນາທີອ່ານ')}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <div className="border-t border-slate-900/60 pt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(item);
                    }}
                    className="inline-flex items-center space-x-2 text-xs font-bold text-slate-300 group-hover:text-cyan-400 transition-colors"
                  >
                    <span>{lang === 'EN' ? 'Read Article' : 'ອ່ານຂ່າວ'}</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Dynamic News Detail Modal Popup */}
      {selectedNews && mounted && createPortal(
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-900 bg-slate-950 text-white shadow-2xl flex flex-col"
          >
            {/* Close Modal Overlay Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-30 h-9 w-9 rounded-full bg-slate-950/70 border border-slate-800/80 flex items-center justify-center hover:bg-slate-900 hover:text-cyan-400 hover:border-slate-700 transition-all text-slate-400 shadow-md"
              title="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Slider Image Area */}
            {selectedNews.images && selectedNews.images.length > 0 ? (
              <div className="h-56 sm:h-80 w-full relative overflow-hidden bg-slate-950 border-b border-slate-900/80 group/slider">
                {selectedNews.images.map((imgUrl, idx) => {
                  const isCurrent = idx === activeImageIndex;
                  return (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={idx}
                      src={imgUrl.startsWith('/') ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api').replace('/api', '')}${imgUrl}` : imgUrl}
                      alt={`news gallery image ${idx}`}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                        isCurrent ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                      }`}
                    />
                  );
                })}

                {/* Glassmorphic hover clickable zoom overlay */}
                <div 
                  onClick={() => setLightboxIndex(activeImageIndex)}
                  className="absolute inset-0 z-20 cursor-zoom-in bg-black/0 hover:bg-black/30 transition-all duration-300 flex items-center justify-center group/zoom"
                >
                  <span className="opacity-0 group-hover/zoom:opacity-100 bg-slate-950/75 border border-slate-800/80 backdrop-blur text-xs font-semibold text-cyan-400 px-3.5 py-1.5 rounded-full transition-all duration-300 transform translate-y-2 group-hover/zoom:translate-y-0 shadow-lg">
                    {lang === 'EN' ? 'Click to view full screen' : 'ຄລິກເພື່ອເບິ່ງຮູບເຕັມ'}
                  </span>
                </div>

                {/* Navigation Arrows if more than 1 image exists */}
                {selectedNews.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => prevImage(e, selectedNews.images!.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-slate-950/60 border border-slate-800/50 flex items-center justify-center hover:bg-slate-900/80 hover:border-slate-700 transition-all text-white shadow"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => nextImage(e, selectedNews.images!.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-30 h-8 w-8 rounded-full bg-slate-950/60 border border-slate-800/50 flex items-center justify-center hover:bg-slate-900/80 hover:border-slate-700 transition-all text-white shadow"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-3 inset-x-0 flex justify-center space-x-1.5 z-30">
                      {selectedNews.images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            idx === activeImageIndex ? 'bg-cyan-400 w-3' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Fallback clean abstract header if no images are attached
              <div className="h-28 w-full bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20 border-b border-slate-900 relative flex items-center justify-center">
                <Newspaper className="h-8 w-8 text-slate-800/80" />
              </div>
            )}

            {/* Content Body Container */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
              {/* Meta information row */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs">
                <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${getBadgeColor(selectedNews.category)}`}>
                  {selectedNews.category}
                </span>
                <span className="flex items-center text-slate-500 space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{selectedNews.date}</span>
                </span>
                <span className="text-slate-800">|</span>
                <span className="flex items-center text-slate-500 space-x-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{selectedNews.readTime.replace('min read', lang === 'EN' ? 'min read' : 'ນາທີອ່ານ')}</span>
                </span>
              </div>

              {/* Text content with preserved newlines and parsed URLs */}
              <div className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap font-normal">
                {renderContentWithLinks(selectedNews.content || '')}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen Lightbox Portal */}
      {lightboxIndex !== null && selectedNews && selectedNews.images && selectedNews.images.length > 0 && mounted && createPortal(
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-fade-in text-white p-4"
        >
          {/* Lightbox Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 z-50 h-10 w-10 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center hover:bg-slate-800 hover:text-cyan-400 transition-all text-slate-400 shadow-xl"
            title="Close Fullscreen"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Fullscreen Image Container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedNews.images[lightboxIndex].startsWith('/') 
                ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api').replace('/api', '')}${selectedNews.images[lightboxIndex]}` 
                : selectedNews.images[lightboxIndex]}
              alt={`Full screen view ${lightboxIndex}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-slate-900/50"
            />

            {/* Navigation Arrows if more than 1 image exists */}
            {selectedNews.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => 
                      prev !== null ? (prev - 1 + selectedNews.images!.length) % selectedNews.images!.length : null
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center hover:bg-slate-800 hover:border-slate-700 transition-all text-white shadow-2xl"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => 
                      prev !== null ? (prev + 1) % selectedNews.images!.length : null
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center hover:bg-slate-800 hover:border-slate-700 transition-all text-white shadow-2xl"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Status / Title Indicator */}
          {selectedNews.images.length > 1 && (
            <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/50 border border-slate-800/60 backdrop-blur text-xs text-slate-400 font-semibold tracking-wider">
              {lightboxIndex + 1} / {selectedNews.images.length}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
