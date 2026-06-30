import Link from 'next/link';
import { cookies } from 'next/headers';
import { Rocket, Mail, Globe, MapPin } from 'lucide-react';

export default async function Footer() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as 'EN' | 'LA') || 'EN';

  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600">
                <Rocket className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-md font-bold text-white tracking-tight">
                Lao<span className="text-cyan-400">Startup</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              {lang === 'EN' 
                ? 'The premier portal connecting visionary Lao startups with international opportunities and global investors.' 
                : 'ແພລດຟອມຊັ້ນນໍາໃນການເຊື່ອມຕໍ່ສະຕາດອັບລາວທີ່ມີວິໄສທັດ ກັບໂອກາດສາກົນ ແລະ ນັກລົງທຶນທົ່ວໂລກ.'}
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
                  {lang === 'EN' ? 'Startup Directory' : 'ລາຍຊື່ສະຕາດອັບ'}
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-cyan-400 transition-colors">
                  {lang === 'EN' ? 'Platform Events' : 'ກິດຈະກຳແພລດຟອມ'}
                </Link>
              </li>
              <li>
                <Link href="/portal/startup" className="hover:text-cyan-400 transition-colors">
                  {lang === 'EN' ? 'Startup Portal' : 'ພອດທໍສະຕາດອັບ'}
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
              <span>info@laostartup.org</span>
            </p>
            <p className="flex items-center space-x-2 text-slate-500">
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>www.laostartup.org</span>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600">
          <p>
            &copy; {new Date().getFullYear()} {lang === 'EN' ? 'Lao Startup Portal. All rights reserved.' : 'ພອດທໍສະຕາດອັບລາວ. ສະຫງວນລິຂະສິດ.'}
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
