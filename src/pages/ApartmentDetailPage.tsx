import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApartmentUnit, AppSettings } from '../types';
import { getStoredApartments, getStoredSettings } from '../services/supabaseStorage';
import { INITIAL_SETTINGS as SETTINGS_FALLBACK } from '../data/initialData';
import { matchApartmentBySlug, buildApartmentSeoAbsoluteUrl } from '../lib/apartmentSlug';
import { ArrowLeft, Phone, Ruler, Compass, Building2, BedDouble } from 'lucide-react';

function upsertMeta(selector: string, create: () => HTMLElement): HTMLElement {
  const existing = document.head.querySelector(selector);
  if (existing) return existing as HTMLElement;
  const el = create();
  document.head.appendChild(el);
  return el;
}

function setSeoMeta(apt: ApartmentUnit, settings: AppSettings): void {
  const title = `${apt.unitTypeName} ${apt.unitCode} - ${apt.projectName} | ${settings.brandName}`;
  const desc = `Tra cứu ${apt.unitTypeName} ${apt.unitCode} (${apt.projectName}${apt.tower ? `, ${apt.tower}` : ''}): diện tích thông thủy ${apt.netArea}m², hướng ${apt.direction || 'liên hệ'}, sơ đồ mặt bằng kỹ thuật + ${apt.interiorImages?.length || 0} mẫu 3D thực tế từ ${settings.brandName}.`;
  const url = buildApartmentSeoAbsoluteUrl(apt);
  const img = apt.floorPlanImageUrl || apt.interiorImages?.[0]?.url || '';

  document.title = title;
  const descTag = upsertMeta('meta[name="description"]', () => {
    const m = document.createElement('meta');
    m.setAttribute('name', 'description');
    return m;
  });
  descTag.setAttribute('content', desc);

  const canonical = upsertMeta('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.setAttribute('rel', 'canonical');
    return l;
  }) as HTMLLinkElement;
  canonical.href = url;

  const og = (prop: string, content: string) => {
    const tag = upsertMeta(`meta[property="${prop}"]`, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', prop);
      return m;
    });
    tag.setAttribute('content', content);
  };
  og('og:title', title);
  og('og:description', desc);
  og('og:type', 'website');
  og('og:url', url);
  if (img) og('og:image', img);
}

export const ApartmentDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [apartments, setApartments] = useState<ApartmentUnit[]>([]);
  const [settings, setSettings] = useState<AppSettings>(SETTINGS_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStoredApartments(), getStoredSettings()])
      .then(([a, s]) => {
        setApartments(a);
        if (s) setSettings(s);
      })
      .catch((e) => console.error('DetailPage load failed:', e))
      .finally(() => setLoading(false));
  }, []);

  const apt = slug ? matchApartmentBySlug(apartments, slug) : undefined;

  useEffect(() => {
    if (apt) setSeoMeta(apt, settings);
  }, [apt, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Đang tải thông tin căn hộ...</p>
        </div>
      </div>
    );
  }

  if (!apt) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl font-extrabold text-slate-300 mb-2">404</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy căn hộ</h1>
          <p className="text-sm text-slate-500 mb-6">Mã căn “{slug}” không tồn tại hoặc đã được di chuyển.</p>
          <Link to="/" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl">
            Về Trang Tra Cứu
          </Link>
        </div>
      </div>
    );
  }

  const hotline = [settings.hotline, settings.hotline2].filter(Boolean).join(' - ');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <nav className="text-xs text-slate-500 mb-4 flex items-center space-x-1.5">
          <Link to="/" className="hover:text-blue-600 font-semibold">Trang chủ</Link>
          <span>/</span>
          <span>{apt.projectName}</span>
          <span>/</span>
          <span className="text-slate-800 font-bold">{apt.unitCode}</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {apt.unitTypeName} {apt.unitCode} — {apt.projectName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {apt.tower ? `${apt.tower} • ` : ''}{apt.axisNumber || ''}{apt.floorRange ? ` • ${apt.floorRange}` : ''}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: <Ruler className="w-4 h-4" />, label: 'Thông thủy', value: `${apt.netArea}m²` },
            { icon: <Ruler className="w-4 h-4" />, label: 'Tim tường', value: `${apt.grossArea}m²` },
            { icon: <Compass className="w-4 h-4" />, label: 'Hướng', value: apt.direction || 'Liên hệ' },
            { icon: <BedDouble className="w-4 h-4" />, label: 'Loại căn', value: apt.unitTypeName },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center space-x-1.5 text-slate-500 text-xs">{s.icon}<span>{s.label}</span></div>
              <div className="font-bold text-sm mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {apt.floorPlanImageUrl && (
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-3">Sơ đồ mặt bằng kỹ thuật</h2>
            <img src={apt.floorPlanImageUrl} alt={`Mặt bằng căn ${apt.unitCode}`} className="w-full rounded-2xl border border-slate-200 bg-white" loading="lazy" referrerPolicy="no-referrer" />
          </section>
        )}

        {(apt.interiorImages?.length > 0) && (
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-3">Mẫu nội thất 3D ({apt.interiorImages.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {apt.interiorImages.map((img) => (
                <figure key={img.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <img src={img.url} alt={img.title} className="w-full h-56 object-cover" loading="lazy" referrerPolicy="no-referrer" />
                  <figcaption className="p-3 text-xs font-semibold">{img.title}{img.roomTypeName ? ` • ${img.roomTypeName}` : ''}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {(apt.highlights?.length > 0) && (
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-3">Điểm nổi bật</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {apt.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </section>
        )}

        {(apt.roomDimensions?.length > 0) && (
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-3">Kích thước từng phòng</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-slate-100">
                  <tr><th className="text-left p-3">Phòng</th><th className="p-3">Rộng × Dài (m)</th><th className="p-3">Diện tích</th></tr>
                </thead>
                <tbody>
                  {apt.roomDimensions.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="p-3 font-semibold">{r.name}</td>
                      <td className="p-3 text-center">{r.width} × {r.length}</td>
                      <td className="p-3 text-center">{r.area}m²</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-10 bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold flex items-center space-x-2"><Building2 className="w-4 h-4" /><span>Quan tâm căn {apt.unitCode}?</span></div>
            <p className="text-xs text-slate-400 mt-1">KTS {settings.brandName} tư vấn mặt bằng & báo giá hoàn thiện miễn phí.</p>
          </div>
          <div className="flex items-center space-x-2">
            {hotline && <a href={`tel:${settings.hotline}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1.5"><Phone className="w-3.5 h-3.5" /><span>{hotline}</span></a>}
            <Link to="/" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center space-x-1.5"><ArrowLeft className="w-3.5 h-3.5" /><span>Tra cứu căn khác</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
};
