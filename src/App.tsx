import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ApartmentUnit,
  ApartmentUnitType,
  AppSettings,
  LeadRecord,
  Project,
} from './types';
import {
  getStoredApartments,
  getStoredLeads,
  getStoredProjects,
  getStoredSettings,
  saveStoredApartments,
  saveStoredLeads,
  saveStoredProjects,
  saveStoredSettings,
} from './services/storageService';
import {
  isAdminSessionValid,
  clearAdminSession,
} from './services/authService';
import { INITIAL_SETTINGS as INITIAL_SETTINGS_FALLBACK } from './data/initialData';

import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { ApartmentCard } from './components/ApartmentCard';
import { ApartmentDetailModal } from './components/ApartmentDetailModal';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ConsultationSection } from './components/ConsultationSection';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import {
  Building2,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  SearchX,
  FileCheck,
} from 'lucide-react';

export default function App() {
  // Global App States
  const [projects, setProjects] = useState<Project[]>([]);
  const [apartments, setApartments] = useState<ApartmentUnit[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  // Start with INITIAL_SETTINGS so the app renders immediately, then refresh from storage
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS_FALLBACK);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Admin Auth States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  // Search & Filter States
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedTower, setSelectedTower] = useState<string>('all');
  const [selectedAxis, setSelectedAxis] = useState<string>('all');
  const [selectedUnitType, setSelectedUnitType] = useState<ApartmentUnitType | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'area_asc' | 'area_desc'>('default');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedApartmentForDetail, setSelectedApartmentForDetail] = useState<ApartmentUnit | null>(null);
  const [detailModalInitialTab, setDetailModalInitialTab] = useState<string>('dimensions');

  const [isLeadCaptureOpen, setIsLeadCaptureOpen] = useState(false);
  const [leadCaptureAction, setLeadCaptureAction] = useState<
    'download_blueprint' | 'download_catalogue' | 'request_quotation' | 'book_consult'
  >('download_blueprint');
  const [targetApartmentForLead, setTargetApartmentForLead] = useState<ApartmentUnit | null>(null);

  // Ref for scrolling
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Load Initial Data & Check Auth Session
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
      setSettings(s);
    } catch (err) {
      console.error('Failed to load data from storage:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    refreshAllDataFromStorage();
    setIsAdminAuthenticated(isAdminSessionValid());

    // Listen for #admin URL hash or keyboard shortcut Ctrl+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleTriggerAdminAccess();
      }
    };

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        handleTriggerAdminAccess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash === '#admin') {
      handleTriggerAdminAccess();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleTriggerAdminAccess = () => {
    if (isAdminSessionValid()) {
      setIsAdminAuthenticated(true);
      setIsAdminPortalOpen(true);
    } else {
      setIsAdminAuthenticated(false);
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginModalOpen(false);
    setIsAdminPortalOpen(true);
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
    setIsAdminPortalOpen(false);
  };

  // Dynamically compute available towers (Tòa tháp) based on selected project
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

  // Dynamically compute available axes (Trục căn) based on selected project and tower
  const availableAxes = useMemo<string[]>(() => {
    let pool = apartments;
    if (selectedProjectId !== 'all') {
      pool = pool.filter((a) => a.projectId === selectedProjectId);
    }
    if (selectedTower !== 'all') {
      pool = pool.filter((a) => a.tower === selectedTower);
    }
    const rawList: string[] = pool
      .map((a) => a.axisNumber)
      .filter((ax): ax is string => typeof ax === 'string' && ax.trim().length > 0);
    const unique = Array.from(new Set(rawList));
    return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [apartments, selectedProjectId, selectedTower]);

  // Filter Logic
  const filteredApartments = apartments.filter((apt) => {
    // 1. Project filter
    const matchProject =
      selectedProjectId === 'all' || apt.projectId === selectedProjectId;

    // 2. Tower filter (Tòa tháp)
    const matchTower =
      selectedTower === 'all' || apt.tower === selectedTower;

    // 3. Axis filter (Trục Căn Chung Cư)
    const matchAxis =
      selectedAxis === 'all' ||
      (apt.axisNumber && apt.axisNumber.trim().toLowerCase() === selectedAxis.trim().toLowerCase());

    // 4. Unit type filter (Dạng Căn Điển Hình)
    const matchUnitType =
      selectedUnitType === 'all' || apt.unitType === selectedUnitType;

    // 5. Keyword search (unitCode, tower, axisNumber, unitTypeName, projectName, etc.)
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

  // Sort Logic
  const sortedApartments = [...filteredApartments].sort((a, b) => {
    if (sortBy === 'area_asc') return a.netArea - b.netArea;
    if (sortBy === 'area_desc') return b.netArea - a.netArea;
    return 0;
  });

  // Action handlers
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

  // State Persistence syncs
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header / Navbar */}
      <Navbar
        settings={settings}
        leads={leads}
        isAdminAuthenticated={isAdminAuthenticated}
        isAdminOpen={isAdminPortalOpen}
        onToggleAdmin={handleTriggerAdminAccess}
        onScrollToSearch={handleScrollToSearch}
        onOpenConsultModal={handleOpenConsultDirect}
      />

      {/* 2. Hero Section with Search Engine */}
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
          onProjectChange={(projId) => {
            setSelectedProjectId(projId);
            setSelectedTower('all'); // Reset tower when switching project
            setSelectedAxis('all'); // Reset axis when switching project
          }}
          onTowerChange={(tower) => {
            setSelectedTower(tower);
            setSelectedAxis('all'); // Reset axis when switching tower
          }}
          onAxisChange={setSelectedAxis}
          onUnitTypeChange={setSelectedUnitType}
          onKeywordChange={setSearchKeyword}
          onSearchSubmit={handleSearchSubmit}
          onResetFilter={handleResetFilter}
          totalResultsCount={sortedApartments.length}
        />
      </div>

      {/* 3. Main Results Grid */}
      <main ref={resultsSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-6">
        {/* Results Bar */}
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

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sắp xếp theo:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-200 cursor-pointer"
            >
              <option value="default">Mặc định</option>
              <option value="area_asc">Diện tích: Nhỏ đến Lớn</option>
              <option value="area_desc">Diện tích: Lớn đến Nhỏ</option>
            </select>
          </div>
        </div>

        {/* Apartments Cards Grid */}
        {sortedApartments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedApartments.map((apartment) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                onViewDetail={handleOpenDetailModal}
                onDownloadBlueprint={(apt) => handleOpenDownloadModal(apt, 'download_blueprint')}
                onRequestQuote={(apt) => handleOpenDownloadModal(apt, 'request_quotation')}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
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
                onClick={handleResetFilter}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Xóa Tất Cả Bộ Lọc
              </button>
              <button
                onClick={handleOpenConsultDirect}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Gửi Yêu Cầu Tìm Mã Căn Riêng
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. Consultation Process & Custom Form Section */}
      <ConsultationSection
        settings={settings}
        onLeadSubmitted={handleRefreshLeadsFromStorage}
      />

      {/* 5. Footer */}
      <Footer
        settings={settings}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdmin={handleTriggerAdminAccess}
      />

      {/* 6. Sticky Mobile CTA Bar */}
      <StickyMobileCTA
        settings={settings}
        onScrollToSearch={handleScrollToSearch}
        onOpenQuickConsult={handleOpenConsultDirect}
      />

      {/* 7. Apartment Detail Modal */}
      {isDetailModalOpen && selectedApartmentForDetail && (
        <ApartmentDetailModal
          apartment={selectedApartmentForDetail}
          isOpen={isDetailModalOpen}
          initialTab={detailModalInitialTab}
          settings={settings}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedApartmentForDetail(null);
          }}
          onOpenDownloadModal={handleOpenDownloadModal}
        />
      )}

      {/* 8. Lead Capture Modal (Gated Download Gate) */}
      {isLeadCaptureOpen && (
        <LeadCaptureModal
          isOpen={isLeadCaptureOpen}
          onClose={() => {
            setIsLeadCaptureOpen(false);
            setTargetApartmentForLead(null);
          }}
          apartment={targetApartmentForLead}
          actionType={leadCaptureAction}
          settings={settings}
          onLeadSubmitted={handleRefreshLeadsFromStorage}
        />
      )}

      {/* 9. Admin Login Modal (Secure SHA-256 Gate) */}
      {isAdminLoginModalOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          settings={settings}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* 10. Admin Portal Drawer / Modal */}
      {isAdminPortalOpen && (
        <AdminPortal
          isOpen={isAdminPortalOpen}
          onClose={() => setIsAdminPortalOpen(false)}
          onLogout={handleAdminLogout}
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
      )}
    </div>
  );
}
