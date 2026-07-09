import { cookies } from 'next/headers';
import NewsSection, { HomeNewsItem } from '@/components/NewsSection';

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

export default async function NewsPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get('lang')?.value as 'EN' | 'LA') || 'EN';

  let newsItems: HomeNewsItem[] = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api'}/news`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.success && data.data && data.data.length > 0) {
      newsItems = data.data.map((item: any) => {
        const titleFallback = item.title || (item.content ? item.content.slice(0, 60) + (item.content.length > 60 ? '...' : '') : 'Untitled News');
        const summaryFallback = item.summary || (item.content ? item.content.slice(0, 150) + (item.content.length > 150 ? '...' : '') : '');
        return {
          id: item._id,
          title: titleFallback,
          category: item.category || 'News',
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          summary: summaryFallback,
          readTime: item.readTime || '3 min read',
          badgeColor: getBadgeColor(item.category || 'News'),
          images: item.images || [],
          content: item.content || '',
        };
      });
    }
  } catch (e) {
    console.error('Failed to fetch news items:', e);
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <NewsSection 
        newsItems={newsItems} 
        showAllButton={false} 
        title={lang === 'EN' ? 'All News & Topics' : 'ຂ່າວສານ & ຫົວຂໍ້ທັງໝົດ'} 
        subtitle={lang === 'EN' ? 'MSIC updates, incubation program details, event news, and partner announcements.' : 'ຂ່າວສານຂອງ MSIC, ລາຍລະອຽດໂຄງການບົ່ມເພາະ, ກິດຈະກຳ ແລະ ຂ່າວຄູ່ຮ່ວມງານ.'} 
      />
    </div>
  );
}
