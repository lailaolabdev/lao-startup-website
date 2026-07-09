'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Globe, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const pathname = usePathname();
  const { language: lang } = useLanguage();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white ring-1 ring-white/15">
                <Image
                  src="/msic-logo.jpg"
                  alt="MSIC logo"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </div>
              <span className="text-md font-bold text-white tracking-tight">MSIC</span>
            </Link>
            <p className="text-sm text-slate-500">
              {lang === 'EN' 
                ? 'Government business incubation center for MSMEs and startups under the Ministry of Industry and Commerce.' 
                : 'ສູນບົ່ມເພາະທຸລະກິດຂອງລັດຖະບານ ສຳລັບ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ ພາຍໃຕ້ກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {lang === 'EN' ? 'Ecosystem' : 'ລະບົບນິເວດ'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/directory" className="hover:text-cyan-400 transition-colors">
                  {lang === 'EN' ? 'MSME & Startup Directory' : 'ລາຍຊື່ ຈຸນລະວິສາຫະກິດ ແລະ ສະຕາດອັບ'}
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-cyan-400 transition-colors">
                  {lang === 'EN' ? 'MSIC Events' : 'ກິດຈະກຳ MSIC'}
                </Link>
              </li>
              <li>
                <Link href="/portal/startup" className="hover:text-cyan-400 transition-colors">
                  {lang === 'EN' ? 'Applicant Portal' : 'ພອດທໍຜູ້ສະໝັກ'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {lang === 'EN' ? 'Resources' : 'ແຫຼ່ງຂໍ້ມູນ'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate-500">
                  {lang === 'EN' ? 'Investor Guide (Coming Soon)' : 'ຄູ່ມືນັກລົງທຶນ (ໄວໆນີ້)'}
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  {lang === 'EN' ? 'Pitching Toolkit' : 'ຄູ່ມືການສະເໜີຜົນງານ'}
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  {lang === 'EN' ? 'Success Stories' : 'ເລື່ອງລາວຄວາມສຳເລັດ'}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {lang === 'EN' ? 'Contact' : 'ຕິດຕໍ່'}
            </h3>
            <p className="flex items-center space-x-2 text-slate-500">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>{lang === 'EN' ? 'Vientiane, Lao PDR' : 'ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ'}</span>
            </p>
            <p className="flex items-center space-x-2 text-slate-500">
              <Mail className="h-4 w-4 text-cyan-400" />
              <span>info@msic.gov.la</span>
            </p>
            <p className="flex items-center space-x-2 text-slate-500">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>www.msic.gov.la</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600">
          <p>
            &copy; {new Date().getFullYear()} {lang === 'EN' ? 'MSIC. All rights reserved.' : 'MSIC. ສະຫງວນລິຂະສິດ.'}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">
              {lang === 'EN' ? 'Privacy Policy' : 'ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ'}
            </span>
            <span className="hover:text-slate-400 cursor-pointer">
              {lang === 'EN' ? 'Terms of Service' : 'ເງື່ອນໄຂການບໍລິການ'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
