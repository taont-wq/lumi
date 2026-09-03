/**
 * CatalogTreeManager — cây thư mục tương tác.
 * Tách riêng khỏi MatrixView để mỗi file nhỏ gọn.
 */

import React from 'react';
import {
  Building,
  Layers,
  Compass,
  Home,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  Copy,
  Search,
  CheckSquare,
  Square,
  ArrowRightLeft,
  X,
  Folder,
} from 'lucide-react';
import { ApartmentUnit, Project } from '../../types';
import type { CatalogState } from './useCatalogState';

interface TreeViewProps {
  projects: Project[];
  apartments: ApartmentUnit[];
  state: CatalogState;
  onOpenApartmentEditor: (apt: ApartmentUnit) => void;
  onOpenProjectEditor: (project: Project) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({
  projects,
  apartments,
  state,
  onOpenApartmentEditor,
  onOpenProjectEditor,
}) => {
  const s = state;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left Column: Interactive Directory Tree */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[700px]">
        <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Lọc cây: Dự án, tòa, trục, căn..."
              value={s.treeSearch}
              onChange={(e) => s.setTreeSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-blue-600"
            />
            {s.treeSearch && (
              <button
                onClick={() => s.setTreeSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={s.handleExpandAll}
                className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Mở rộng tất cả
              </button>
              <span>•</span>
              <button
                onClick={s.handleCollapseAll}
                className="px-2 py-0.5 rounded hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Thu gọn
              </button>
            </div>
            <button
              onClick={() => s.setSelectedNode({ type: 'root' })}
              className="text-blue-600 hover:underline font-bold"
            >
              Xem gốc
            </button>
          </div>
        </div>

        {/* Tree Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
          {/* ROOT NODE */}
          <div
            onClick={() => s.setSelectedNode({ type: 'root' })}
            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
              s.selectedNode.type === 'root'
                ? 'bg-blue-100 text-blue-900 font-extrabold border border-blue-300'
                : 'hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <Folder className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">TẤT CẢ DỰ ÁN ({projects.length})</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
              {apartments.length} căn
            </span>
          </div>

          {/* PROJECT NODES */}
          {s.treeData.map(({ project, towers, count: projCount }) => {
            const projKey = `proj-${project.id}`;
            const isProjExpanded = s.expandedKeys.has(projKey);
            const isProjSelected =
              s.selectedNode.type === 'project' && s.selectedNode.projectId === project.id;

            const matchSearch =
              !s.treeSearch ||
              project.name.toLowerCase().includes(s.treeSearch.toLowerCase()) ||
              towers.some(
                (t) =>
                  t.towerName.toLowerCase().includes(s.treeSearch.toLowerCase()) ||
                  t.axes.some(
                    (ax) =>
                      ax.axisName.toLowerCase().includes(s.treeSearch.toLowerCase()) ||
                      ax.apartments.some((a) =>
                        a.unitCode.toLowerCase().includes(s.treeSearch.toLowerCase())
                      )
                  )
              );
            if (!matchSearch) return null;

            return (
              <div key={projKey} className="space-y-0.5">
                <div
                  onClick={() => s.setSelectedNode({ type: 'project', projectId: project.id })}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-xl cursor-pointer transition-colors ${
                    isProjSelected
                      ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <button
                      type="button"
                      onClick={(e) => s.toggleExpand(projKey, e)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    >
                      {isProjExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate font-bold">{project.name}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold border border-indigo-100">
                      {projCount} căn
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition-opacity">
                      <button
                        type="button"
                        title="Thêm tòa tháp"
                        onClick={(e) => {
                          e.stopPropagation();
                          s.setDialogInputText('');
                          s.setQuickActionModal({
                            isOpen: true,
                            type: 'add_tower',
                            data: { projectId: project.id },
                          });
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="Chỉnh sửa dự án"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProjectEditor(project);
                        }}
                        className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="Xóa dự án"
                        onClick={(e) => s.handleDeleteProject(project, e)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {isProjExpanded && (
                  <div className="pl-4 ml-2 border-l border-slate-200 space-y-0.5">
                    {towers.map(({ towerName, axes, apartments: towerApts, count: towerCount }) => {
                      const towerKey = `tower-${project.id}-${towerName}`;
                      const isTowerExpanded = s.expandedKeys.has(towerKey);
                      const isTowerSelected =
                        s.selectedNode.type === 'tower' &&
                        s.selectedNode.projectId === project.id &&
                        s.selectedNode.towerName === towerName;
                      return (
                        <div key={towerKey} className="space-y-0.5">
                          <div
                            onClick={() =>
                              s.setSelectedNode({
                                type: 'tower',
                                projectId: project.id,
                                towerName,
                              })
                            }
                            className={`group flex items-center justify-between px-2 py-1 rounded-xl cursor-pointer transition-colors ${
                              isTowerSelected
                                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center space-x-1.5 truncate">
                              <button
                                type="button"
                                onClick={(e) => s.toggleExpand(towerKey, e)}
                                className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                              >
                                {isTowerExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate font-semibold">{towerName}</span>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-medium">
                                {towerCount} căn
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition-opacity">
                                <button
                                  type="button"
                                  title="Thêm căn / trục vào tòa này"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    s.setDialogInputText('');
                                    s.setQuickActionModal({
                                      isOpen: true,
                                      type: 'add_axis',
                                      data: { projectId: project.id, towerName },
                                    });
                                  }}
                                  className="p-1 text-amber-700 hover:bg-amber-100 rounded"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Đổi tên tòa"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    s.setDialogInputText(towerName);
                                    s.setQuickActionModal({
                                      isOpen: true,
                                      type: 'rename_tower',
                                      data: { projectId: project.id, oldTowerName: towerName },
                                    });
                                  }}
                                  className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  title="Xóa tòa"
                                  onClick={(e) => s.handleDeleteTower(project.id, towerName, e)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {isTowerExpanded && (
                            <div className="pl-4 ml-2 border-l border-amber-200 space-y-0.5">
                              {axes.map(({ axisName, apartments: axisApts, count: axisCount }) => {
                                const axisKey = `axis-${project.id}-${towerName}-${axisName}`;
                                const isAxisExpanded = s.expandedKeys.has(axisKey);
                                const isAxisSelected =
                                  s.selectedNode.type === 'axis' &&
                                  s.selectedNode.projectId === project.id &&
                                  s.selectedNode.towerName === towerName &&
                                  s.selectedNode.axisNumber === axisName;
                                return (
                                  <div key={axisKey} className="space-y-0.5">
                                    <div
                                      onClick={() =>
                                        s.setSelectedNode({
                                          type: 'axis',
                                          projectId: project.id,
                                          towerName,
                                          axisNumber: axisName,
                                        })
                                      }
                                      className={`group flex items-center justify-between px-2 py-1 rounded-xl cursor-pointer transition-colors ${
                                        isAxisSelected
                                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                          : 'hover:bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-1.5 truncate">
                                        <button
                                          type="button"
                                          onClick={(e) => s.toggleExpand(axisKey, e)}
                                          className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                                        >
                                          {isAxisExpanded ? (
                                            <ChevronDown className="w-3 h-3" />
                                          ) : (
                                            <ChevronRight className="w-3 h-3" />
                                          )}
                                        </button>
                                        <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="truncate font-semibold">{axisName}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 shrink-0">
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                                          {axisCount}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition-opacity">
                                          <button
                                            type="button"
                                            title="Thêm căn vào trục này"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              s.handleTriggerAddUnit({
                                                projectId: project.id,
                                                tower: towerName,
                                                axisNumber: axisName,
                                              });
                                            }}
                                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            title="Đổi tên trục hàng loạt"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              s.setDialogInputText(axisName);
                                              s.setQuickActionModal({
                                                isOpen: true,
                                                type: 'batch_rename_axis',
                                                data: {
                                                  projectId: project.id,
                                                  towerName,
                                                  oldAxisNumber: axisName,
                                                },
                                              });
                                            }}
                                            className="p-1 text-slate-500 hover:bg-slate-200 rounded"
                                          >
                                            <Edit className="w-3 h-3" />
                                          </button>
                                          <button
                                            type="button"
                                            title="Xóa trục"
                                            onClick={(e) =>
                                              s.handleDeleteAxis(project.id, towerName, axisName, e)
                                            }
                                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {isAxisExpanded && (
                                      <div className="pl-4 ml-2 border-l border-emerald-200 space-y-0.5">
                                        {axisApts.map((apt) => {
                                          const isUnitSelected =
                                            s.selectedNode.type === 'unit' &&
                                            s.selectedNode.apartmentId === apt.id;
                                          return (
                                            <div
                                              key={apt.id}
                                              onClick={() =>
                                                s.setSelectedNode({ type: 'unit', apartmentId: apt.id })
                                              }
                                              className={`group flex items-center justify-between px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                                isUnitSelected
                                                  ? 'bg-blue-600 text-white font-bold'
                                                  : 'hover:bg-slate-100 text-slate-600'
                                              }`}
                                            >
                                              <div className="flex items-center space-x-1.5 truncate">
                                                <Home className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{apt.unitCode}</span>
                                                <span className="text-[10px] opacity-75">
                                                  ({apt.netArea}m²)
                                                </span>
                                              </div>
                                              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 transition-opacity">
                                                <button
                                                  type="button"
                                                  title="Sửa căn hộ"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenApartmentEditor(apt);
                                                  }}
                                                  className="p-1 hover:bg-white/20 rounded"
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  title="Nhân bản"
                                                  onClick={(e) => s.handleDuplicateUnit(apt, e)}
                                                  className="p-1 hover:bg-white/20 rounded"
                                                >
                                                  <Copy className="w-3 h-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  title="Xóa"
                                                  onClick={(e) => s.handleDeleteUnit(apt.id, apt.unitCode, e)}
                                                  className="p-1 hover:bg-red-500 hover:text-white rounded"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Dynamic Context Workspace & Lookup Table */}
      <div className="lg:col-span-8 space-y-4">
        {/* Context Navigation & Breadcrumb Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            {s.activeContext.breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                <button
                  onClick={() => s.setSelectedNode(bc.node)}
                  className={`hover:text-blue-600 transition-colors font-medium ${
                    idx === s.activeContext.breadcrumbs.length - 1
                      ? 'text-blue-600 font-extrabold'
                      : 'text-slate-600'
                  }`}
                >
                  {bc.label}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                {s.activeContext.title}
              </h4>
              <p className="text-xs text-slate-500">{s.activeContext.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {s.activeContext.canAddUnit && (
                <button
                  onClick={() => s.handleTriggerAddUnit(s.activeContext.defaultNewUnit)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Căn Hộ Tại Đây</span>
                </button>
              )}

              {s.selectedNode.type === 'project' && (
                <button
                  onClick={() => {
                    s.setDialogInputText('');
                    s.setQuickActionModal({
                      isOpen: true,
                      type: 'add_tower',
                      data: { projectId: s.selectedNode.projectId },
                    });
                  }}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Thêm Tòa Tháp</span>
                </button>
              )}

              {s.selectedNode.type === 'axis' && (
                <button
                  onClick={() => {
                    s.setDialogInputText(s.selectedNode.axisNumber);
                    s.setQuickActionModal({
                      isOpen: true,
                      type: 'batch_rename_axis',
                      data: {
                        projectId: s.selectedNode.projectId,
                        towerName: s.selectedNode.towerName,
                        oldAxisNumber: s.selectedNode.axisNumber,
                      },
                    });
                  }}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Đổi Tên Trục Này</span>
                </button>
              )}
            </div>
          </div>

          {/* Batch Actions Bar */}
          {s.selectedUnitIds.size > 0 && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-blue-900">Đã chọn {s.selectedUnitIds.size} căn hộ</span>
                <button
                  onClick={() => s.setSelectedUnitIds(new Set())}
                  className="text-blue-600 hover:underline text-[11px]"
                >
                  Bỏ chọn
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    s.setDialogTargetProject(projects[0]?.id || '');
                    s.setDialogTargetTower(projects[0]?.towers?.[0] || '');
                    s.setDialogTargetAxis('');
                    s.setQuickActionModal({ isOpen: true, type: 'move_units' });
                  }}
                  className="px-2.5 py-1.5 bg-white text-blue-700 hover:bg-blue-100 rounded-lg font-bold border border-blue-300 flex items-center space-x-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Chuyển Dự Án / Tòa / Trục</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa ${s.selectedUnitIds.size} căn hộ đã chọn?`)) {
                      // handleDeleteUnit đã gọi onSaveApartments nội bộ
                      const ids = Array.from(s.selectedUnitIds);
                      ids.forEach((id) => {
                        const apt = apartments.find((a) => a.id === id);
                        if (apt) s.handleDeleteUnit(id, apt.unitCode);
                      });
                    }
                  }}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Đã Chọn</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* List of Apartments in this Node */}
        <ApartmentsContextTable
          apartments={s.activeContext.apartments}
          state={s}
          onOpenApartmentEditor={onOpenApartmentEditor}
        />
      </div>
    </div>
  );
};

// ========== Sub-component: apartment list table in tree view ==========
const ApartmentsContextTable: React.FC<{
  apartments: ApartmentUnit[];
  state: CatalogState;
  onOpenApartmentEditor: (apt: ApartmentUnit) => void;
}> = ({ apartments, state, onOpenApartmentEditor }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <button
            onClick={state.handleToggleSelectAllContextUnits}
            className="text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {apartments.length > 0 && apartments.every((a) => state.selectedUnitIds.has(a.id)) ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <span>Danh Sách Căn Hộ Tra Cứu ({apartments.length})</span>
        </div>
        <span className="text-[11px] text-slate-500">
          Nhấp vào dòng để chỉnh sửa thông tin tra cứu hoặc kích thước
        </span>
      </div>

      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-slate-700 font-bold sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3 w-8"></th>
              <th className="py-2.5 px-3">Mã Căn & Dự Án</th>
              <th className="py-2.5 px-3">Trục Căn</th>
              <th className="py-2.5 px-3">Tòa Tháp</th>
              <th className="py-2.5 px-3">Dạng Căn</th>
              <th className="py-2.5 px-3">DT Thông Thủy / Tim Tường</th>
              <th className="py-2.5 px-3">Dữ Liệu CAD & 3D</th>
              <th className="py-2.5 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apartments.length > 0 ? (
              apartments.map((apt) => {
                const isSelected = state.selectedUnitIds.has(apt.id);
                return (
                  <tr
                    key={apt.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isSelected ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          state.setSelectedUnitIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(apt.id)) next.delete(apt.id);
                            else next.add(apt.id);
                            return next;
                          });
                        }}
                        className="cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900 text-sm">{apt.unitCode}</div>
                      <div className="text-[11px] text-blue-600 font-semibold">{apt.projectName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        defaultValue={apt.axisNumber || ''}
                        onBlur={(e) => {
                          if (e.target.value !== apt.axisNumber) {
                            state.handleQuickChangeAxis(apt.id, e.target.value);
                          }
                        }}
                        placeholder="VD: Trục 08"
                        className="w-24 text-xs bg-amber-50/80 border border-amber-300 rounded-lg px-2 py-1 font-bold text-amber-950 focus:bg-white focus:outline-amber-600"
                      />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{apt.tower}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {apt.unitTypeName}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{apt.netArea} m²</div>
                      <div className="text-[11px] text-slate-500">Tim tường: {apt.grossArea} m²</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      {apt.roomDimensions?.length || 0} phòng • {apt.interiorImages?.length || 0} ảnh •{' '}
                      {apt.videos?.length || 0} video
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => state.handleDuplicateUnit(apt)}
                          title="Nhân bản"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenApartmentEditor(apt)}
                          title="Chỉnh sửa toàn diện"
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => state.handleDeleteUnit(apt.id, apt.unitCode)}
                          title="Xóa căn hộ"
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Chưa có căn hộ nào trong mục này.{' '}
                  <button
                    onClick={() => state.handleTriggerAddUnit(state.activeContext.defaultNewUnit)}
                    className="text-blue-600 font-bold hover:underline ml-1"
                  >
                    + Thêm căn hộ mới ngay
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
