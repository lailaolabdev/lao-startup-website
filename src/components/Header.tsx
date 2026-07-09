'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { language: lang, toggleLanguage: toggleLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { name: lang === 'EN' ? 'Home' : 'ໜ້າຫຼັກ', href: '/' },
    { name: lang === 'EN' ? 'MSME & Startups' : 'ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ', href: '/directory' },
    { name: lang === 'EN' ? 'Events' : 'ກິດຈະກຳ', href: '/events' },
    { name: lang === 'EN' ? 'News' : 'ຂ່າວສານ', href: '/news' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/15 backdrop-blur-md text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white ring-1 ring-white/15 transition-transform group-hover:scale-105">
              <Image
                src="/msic-logo.jpg"
                alt="MSIC logo"
                fill
                sizes="40px"
                className="object-contain p-1"
                priority
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">MSIC</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Language Toggle & User actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleLang}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === 'EN' ? 'English' : 'ພາສາລາວ'}</span>
            </button>

            <Link
              href="/portal/startup"
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-slate-800 hover:text-white"
            >
              {lang === 'EN' ? 'login' : 'ເຂົ້າສູ່ລະບົບ'}
            </Link>
            <Link
              href="/admin/login"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/30"
            >
              {lang === 'EN' ? 'Admin Login' : 'ເຂົ້າສູ່ລະບົບ Admin'}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleLang}
              className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-4 py-3 text-base font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 pb-2 border-t border-slate-800 px-4">
            <Link
              href="/portal/startup"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center rounded-lg border border-slate-700 bg-slate-900 py-3 text-sm font-bold text-slate-200"
            >
              {lang === 'EN' ? 'login' : 'ເຂົ້າສູ່ລະບົບ'}
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="mt-3 block w-full text-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20"
            >
              {lang === 'EN' ? 'Admin Login' : 'ເຂົ້າສູ່ລະບົບ Admin'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
