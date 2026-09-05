import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import {
  ApartmentUnit,
  ApartmentUnitType,
  AppSettings,
  LeadRecord,
  Project,
} from './types';
import {
  getStoredProjects,
  getStoredApartments,
  getStoredLeads,
  getStoredSettings,
  saveStoredProjects,
  saveStoredApartments,
  saveStoredLeads,
  saveStoredSettings,
} from './services/supabaseStorage';
import { getCurrentSession, signOut, onAuthStateChange } from './lib/auth';
import { INITIAL_SETTINGS as INITIAL_SETTINGS_FALLBACK } from './data/initialData';

import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { ApartmentCard } from './components/ApartmentCard';
import { ApartmentDetailModal } from './components/ApartmentDetailModal';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { ConsultationSection } from './components/ConsultationSection';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { Analytics } from './components/Analytics';

import { RouteGuard } from './components/RouteGuard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage, AdminDashboardPageWithDialog } from './pages/AdminDashboardPage';
import { AdminCatalogPage } from './pages/AdminCatalogPage';
import { AdminLeadsPage } from './pages/AdminLeadsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

import { ArrowUpDown, SearchX } from 'lucide-react';

/**
 * Root component - quản lý toàn bộ state + auth + data
 *
 * Render thành 2 phần:
 *   1. <BrowserRouter> + <Routes>:
 *      - "/"            → <HomePage> (công khai)
 *      - "/admin/login" → <AdminLoginPage>
 *      - "/admin/*"     → <RouteGuard> + <AdminDashboardPage> (nested)
 */
export default function App() {
  // ===== Data states =====
  const [projects, setProjects] = useState<Project[]>([]);
  const [apartments, setApartments] = useState<ApartmentUnit[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS_FALLBACK);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // ===== Search/Filter states =====
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTower, setSelectedTower] = useState<string>('all');
  const [selectedAxis, setSelectedAxis] = useState<string>('all');
  const [selectedUnitType, setSelectedUnitType] = useState<ApartmentUnitType | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'area_asc' | 'area_desc'>('default');

  // ===== Modal states =====
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApartmentForDetail, setSelectedApartmentForDetail] =
    useState<ApartmentUnit | null>(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<string>('dimensions');

  const [isLeadCaptureOpen, setIsLeadCaptureOpen] = useState(false);
  const [leadCaptureAction, setLeadCaptureAction] = useState<
    'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult'
  >('download_blueprint');
  const [targetApartmentForLead, setTargetApartmentForLead] = useState<ApartmentUnit | null>(null);

  // ===== Refs =====
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // ===== Load data =====
  const refreshAllDataFromStorage = async () => {
    try {
      const [p, a, l, s] = await Promise.all([
        getStoredProjects(),
        getStoredApartments(),
        getStoredLeads(),
        getStoredSettings(),
      ]);
      setProjects(p);
      setApartments(a);
      setLeads(l);
      if (s) setSettings(s);
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    refreshAllDataFromStorage();
  }, []);

  // ===== Save handlers =====
  const handleSaveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    saveStoredProjects(newProjects).catch((e) => console.error('saveStoredProjects failed:', e));
  };
  const handleSaveApartments = (newApartments: ApartmentUnit[]) => {
    setApartments(newApartments);
    saveStoredApartments(newApartments).catch((e) => console.error('saveStoredApartments failed:', e));
  };
  const handleSaveLeads = (newLeads: LeadRecord[]) => {
    setLeads(newLeads);
    saveStoredLeads(newLeads).catch((e) => console.error('saveStoredLeads failed:', e));
  };
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings).catch((e) => console.error('saveStoredSettings failed:', e));
  };
  const handleRefreshLeadsFromStorage = () => {
    getStoredLeads().then((l) => setLeads(l)).catch((e) => console.error('refresh leads failed:', e));
  };

  // ===== Available towers/axes =====
  const availableTowers = useMemo<string[]>(() => {
    if (selectedProjectId === 'all') {
      const list: string[] = [];
      projects.forEach((p) => {
        if (p.towers && Array.isArray(p.towers)) {
          p.towers.forEach((t) => {
            if (t && t.trim()) list.push(t.trim());
          });
        }
      });
      apartments.forEach((a) => {
        if (a.tower && a.tower.trim()) list.push(a.tower.trim());
      });
      const unique = Array.from(new Set(list));
      return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }
    const targetProject = projects.find((p) => p.id === selectedProjectId);
    const list: string[] = [];
    if (targetProject?.towers && Array.isArray(targetProject.towers)) {
      targetProject.towers.forEach((t) => {
        if (t && t.trim()) list.push(t.trim());
      });
    }
    apartments
      .filter((a) => a.projectId === selectedProjectId)
      .forEach((a) => {
        if (a.tower && a.tower.trim()) list.push(a.tower.trim());
      });
    const unique = Array.from(new Set(list));
    return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [apartments, projects, selectedProjectId]);

  const availableAxes = useMemo<string[]>(() => {
    let pool = apartments;
    if (selectedProjectId !== 'all') pool = pool.filter((a) => a.projectId === selectedProjectId);
    if (selectedTower !== 'all') pool = pool.filter((a) => a.tower === selectedTower);
    const rawList: string[] = pool
      .map((a) => a.axisNumber)
      .filter((ax): ax is string => typeof ax === 'string' && ax.trim().length > 0);
    const unique = Array.from(new Set(rawList));
    return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [apartments, selectedProjectId, selectedTower]);

  // ===== Filter + Sort =====
  const filteredApartments = apartments.filter((apt) => {
    const matchProject = selectedProjectId === 'all' || apt.projectId === selectedProjectId;
    const matchTower = selectedTower === 'all' || apt.tower === selectedTower;
    const matchAxis =
      selectedAxis === 'all' ||
      (apt.axisNumber && apt.axisNumber.trim().toLowerCase() === selectedAxis.trim().toLowerCase());
    const matchUnitType = selectedUnitType === 'all' || apt.unitType === selectedUnitType;
    const kw = searchKeyword.trim().toLowerCase();
    const matchKeyword =
      !kw ||
      apt.unitCode.toLowerCase().includes(kw) ||
      apt.tower.toLowerCase().includes(kw) ||
      (apt.axisNumber && apt.axisNumber.toLowerCase().includes(kw)) ||
      apt.projectName.toLowerCase().includes(kw) ||
      apt.unitTypeName.toLowerCase().includes(kw) ||
      (apt.direction && apt.direction.toLowerCase().includes(kw)) ||
      (apt.highlights && apt.highlights.some((h) => h.toLowerCase().includes(kw)));
    return matchProject && matchTower && matchAxis && matchUnitType && matchKeyword;
  });

  const sortedApartments = [...filteredApartments].sort((a, b) => {
    if (sortBy === 'area_asc') return a.netArea - b.netArea;
    if (sortBy === 'area_desc') return b.netArea - a.netArea;
    return 0;
  });

  // ===== Action handlers =====
  const handleScrollToSearch = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleSearchSubmit = () => {
    if (resultsSectionRef.current) {
      resultsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleResetFilter = () => {
    setSelectedProjectId('all');
    setSelectedTower('all');
    setSelectedAxis('all');
    setSelectedUnitType('all');
    setSearchKeyword('');
  };
  const handleOpenDetailModal = (apartment: ApartmentUnit, defaultTab = 'dimensions') => {
    setSelectedApartmentForDetail(apartment);
    setDetailModalInitialTab(defaultTab);
    setIsDetailModalOpen(true);
  };
  const handleOpenDownloadModal = (
    apartment: ApartmentUnit,
    actionType: 'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult'
  ) => {
    setTargetApartmentForLead(apartment);
    setLeadCaptureAction(actionType);
    setIsLeadCaptureOpen(true);
  };
  const handleOpenConsultDirect = () => {
    setTargetApartmentForLead(null);
    setLeadCaptureAction('book_consult');
    setIsLeadCaptureOpen(true);
  };

  // ===== Loading screen =====
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ công khai */}
        <Route
          path="/"
          element={
            <HomePage
              projects={projects}
              apartments={apartments}
              leads={leads}
              settings={settings}
              sortedApartments={sortedApartments}
              selectedProjectId={selectedProjectId}
              selectedTower={selectedTower}
              selectedAxis={selectedAxis}
              selectedUnitType={selectedUnitType}
              searchKeyword={searchKeyword}
              sortBy={sortBy}
              availableTowers={availableTowers}
              availableAxes={availableAxes}
              searchSectionRef={searchSectionRef}
              resultsSectionRef={resultsSectionRef}
              isDetailModalOpen={isDetailModalOpen}
              selectedApartmentForDetail={selectedApartmentForDetail}
              detailModalInitialTab={detailModalInitialTab}
              isLeadCaptureOpen={isLeadCaptureOpen}
              leadCaptureAction={leadCaptureAction}
              targetApartmentForLead={targetApartmentForLead}
              onProjectChange={(projId) => {
                setSelectedProjectId(projId);
                setSelectedTower('all');
                setSelectedAxis('all');
              }}
              onTowerChange={(tower) => {
                setSelectedTower(tower);
                setSelectedAxis('all');
              }}
              onAxisChange={setSelectedAxis}
              onUnitTypeChange={setSelectedUnitType}
              onKeywordChange={setSearchKeyword}
              onSortChange={setSortBy}
              onSearchSubmit={handleSearchSubmit}
              onResetFilter={handleResetFilter}
              onScrollToSearch={handleScrollToSearch}
              onOpenDetailModal={handleOpenDetailModal}
              onOpenDownloadModal={handleOpenDownloadModal}
              onOpenConsultDirect={handleOpenConsultDirect}
              onCloseDetailModal={() => {
                setIsDetailModalOpen(false);
                setSelectedApartmentForDetail(null);
              }}
              onCloseLeadCapture={() => {
                setIsLeadCaptureOpen(false);
                setTargetApartmentForLead(null);
              }}
              onLeadSubmitted={handleRefreshLeadsFromStorage}
            />
          }
        />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin dashboard (nested routes) - protected */}
        <Route
          path="/admin"
          element={
            <RouteGuard>
              <AdminDashboardPageWithDialog
                projects={projects}
                apartments={apartments}
                leads={leads}
                settings={settings}
                onSaveProjects={handleSaveProjects}
                onSaveApartments={handleSaveApartments}
                onSaveLeads={handleSaveLeads}
                onSaveSettings={handleSaveSettings}
                onRefreshAllData={refreshAllDataFromStorage}
              />
            </RouteGuard>
          }
        >
          <Route index element={<AdminCatalogPage />} />
          <Route path="catalog" element={<AdminCatalogPage />} />
          <Route path="leads" element={<AdminLeadsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 fallback → về trang chủ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// =================== HomePage ===================
interface HomePageProps {
  projects: Project[];
  apartments: ApartmentUnit[];
  leads: LeadRecord[];
  settings: AppSettings;
  sortedApartments: ApartmentUnit[];
  selectedProjectId: string;
  selectedTower: string;
  selectedAxis: string;
  selectedUnitType: ApartmentUnitType | 'all';
  searchKeyword: string;
  sortBy: 'default' | 'area_asc' | 'area_desc';
  availableTowers: string[];
  availableAxes: string[];
  searchSectionRef: React.RefObject<HTMLDivElement | null>;
  resultsSectionRef: React.RefObject<HTMLDivElement | null>;
  isDetailModalOpen: boolean;
  selectedApartmentForDetail: ApartmentUnit | null;
  detailModalInitialTab: string;
  isLeadCaptureOpen: boolean;
  leadCaptureAction: 'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult';
  targetApartmentForLead: ApartmentUnit | null;
  onProjectChange: (id: string) => void;
  onTowerChange: (tower: string) => void;
  onAxisChange: (axis: string) => void;
  onUnitTypeChange: (type: ApartmentUnitType | 'all') => void;
  onKeywordChange: (kw: string) => void;
  onSortChange: (s: 'default' | 'area_asc' | 'area_desc') => void;
  onSearchSubmit: () => void;
  onResetFilter: () => void;
  onScrollToSearch: () => void;
  onOpenDetailModal: (apt: ApartmentUnit, tab?: string) => void;
  onOpenDownloadModal: (
    apt: ApartmentUnit,
    type: 'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult'
  ) => void;
  onOpenConsultDirect: () => void;
  onCloseDetailModal: () => void;
  onCloseLeadCapture: () => void;
  onLeadSubmitted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  settings,
  projects,
  selectedProjectId,
  selectedTower,
  selectedAxis,
  selectedUnitType,
  searchKeyword,
  sortBy,
  availableTowers,
  availableAxes,
  searchSectionRef,
  resultsSectionRef,
  selectedApartmentForDetail,
  detailModalInitialTab,
  isDetailModalOpen,
  isLeadCaptureOpen,
  leadCaptureAction,
  targetApartmentForLead,
  sortedApartments,
  leads,
  onProjectChange,
  onTowerChange,
  onAxisChange,
  onUnitTypeChange,
  onKeywordChange,
  onSortChange,
  onSearchSubmit,
  onResetFilter,
  onScrollToSearch,
  onOpenDetailModal,
  onOpenDownloadModal,
  onOpenConsultDirect,
  onCloseDetailModal,
  onCloseLeadCapture,
  onLeadSubmitted,
}) => {
  const navigate = useNavigate();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Check Supabase session on mount + subscribe to changes
  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentSession();
      setIsAdminAuthenticated(!!session);
    };
    checkSession();

    // Subscribe to auth state changes (login/logout)
    const unsubscribe = onAuthStateChange((_event, session) => {
      setIsAdminAuthenticated(!!session);
    });

    return () => { unsubscribe(); };
  }, [navigate]);

  // Keyboard shortcut: Ctrl+Shift+A → admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (isAdminAuthenticated) {
          navigate('/admin');
        } else {
          navigate('/admin/login');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isAdminAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Analytics />

      <Navbar
        settings={settings}
        isAdminAuthenticated={isAdminAuthenticated}
        isAdminOpen={false}
        onToggleAdmin={async () => {
          const session = await getCurrentSession();
          if (session) {
            setIsAdminAuthenticated(true);
            navigate('/admin');
          } else {
            navigate('/admin/login');
          }
        }}
        onOpenConsultModal={onOpenConsultDirect}
      />

      <div ref={searchSectionRef}>
        <HeroSearch
          settings={settings}
          projects={projects}
          selectedProjectId={selectedProjectId}
          selectedTower={selectedTower}
          selectedAxis={selectedAxis}
          selectedUnitType={selectedUnitType}
          searchKeyword={searchKeyword}
          availableTowers={availableTowers}
          availableAxes={availableAxes}
          onProjectChange={onProjectChange}
          onTowerChange={onTowerChange}
          onAxisChange={onAxisChange}
          onUnitTypeChange={onUnitTypeChange}
          onKeywordChange={onKeywordChange}
          onSearchSubmit={onSearchSubmit}
          onResetFilter={onResetFilter}
          totalResultsCount={sortedApartments.length}
        />
      </div>

      <main ref={resultsSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Danh Sách Căn Hộ Tra Cứu
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-2xs">
                {sortedApartments.length} Căn
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {selectedProjectId !== 'all' || selectedTower !== 'all' || selectedAxis !== 'all'
                ? `Đang lọc: ${selectedProjectId !== 'all' ? projects.find((p) => p.id === selectedProjectId)?.name : 'Tất cả dự án'}${
                    selectedTower !== 'all' ? ` • ${selectedTower}` : ''
                  }${selectedAxis !== 'all' ? ` • Trục ${selectedAxis}` : ''}`
                : 'Hiển thị tất cả các căn hộ và sơ đồ mặt bằng kỹ thuật'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sắp xếp theo:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-200 cursor-pointer"
            >
              <option value="default">Mặc định</option>
              <option value="area_asc">Diện tích: Nhỏ đến Lớn</option>
              <option value="area_desc">Diện tích: Lớn đến Nhỏ</option>
            </select>
          </div>
        </div>

        {sortedApartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedApartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                onViewDetail={onOpenDetailModal}
                onDownloadBlueprint={(apt) => onOpenDownloadModal(apt, 'download_blueprint')}
                onRequestQuote={(apt) => onOpenDownloadModal(apt, 'request_quotation')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Không tìm thấy căn hộ khớp với từ khóa "{searchKeyword}"
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Bạn có thể thử xóa bộ lọc tìm kiếm hoặc gửi yêu cầu để KTS hỗ trợ cung cấp mặt bằng và đo đạc trực tiếp tại căn hộ của bạn.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onResetFilter}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Xóa Tất Cả Bộ Lọc
              </button>
              <button
                onClick={onOpenConsultDirect}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Gửi Yêu Cầu Tìm Mã Căn Riêng
              </button>
            </div>
          </div>
        )}
      </main>

      <ConsultationSection settings={settings} onLeadSubmitted={onLeadSubmitted} />

      <Footer
        settings={settings}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdmin={async () => {
          const session = await getCurrentSession();
          if (session) {
            setIsAdminAuthenticated(true);
            navigate('/admin');
          } else {
            navigate('/admin/login');
          }
        }}
      />

      <StickyMobileCTA
        settings={settings}
        onScrollToSearch={onScrollToSearch}
        onOpenQuickConsult={onOpenConsultDirect}
      />

      {isDetailModalOpen && selectedApartmentForDetail && (
        <ApartmentDetailModal
          apartment={selectedApartmentForDetail}
          isOpen={isDetailModalOpen}
          initialTab={detailModalInitialTab}
          settings={settings}
          onClose={onCloseDetailModal}
          onOpenDownloadModal={onOpenDownloadModal}
        />
      )}

      {isLeadCaptureOpen && (
        <LeadCaptureModal
          isOpen={isLeadCaptureOpen}
          onClose={onCloseLeadCapture}
          apartment={targetApartmentForLead}
          actionType={leadCaptureAction}
          settings={settings}
          onLeadSubmitted={onLeadSubmitted}
        />
      )}
    </div>
  );
};

// =================== 404 ===================
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl font-extrabold text-slate-300 mb-2">404</div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy trang</h1>
        <p className="text-sm text-slate-500 mb-6">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl"
        >
          Về Trang Chủ
        </button>
      </div>
    </div>
  );
};
