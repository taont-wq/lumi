/**
 * Custom hook chứa toàn bộ state + handlers cho CatalogTreeManager.
 * Tách riêng để cả TreeView và MatrixView dùng chung, đồng thời
 * giảm kích thước component chính.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ApartmentUnit, ApartmentUnitType, Project } from '../../types';
import {
  MatrixSortBy,
  MatrixSortOrder,
  MatrixUnitTypeFilter,
  QuickActionModalState,
  SelectedNodeType,
  ViewMode,
} from './types';

export function useCatalogState(
  projects: Project[],
  apartments: ApartmentUnit[],
  onSaveProjects: (projects: Project[]) => void,
  onSaveApartments: (apartments: ApartmentUnit[]) => void,
  onOpenApartmentEditor: (apt: ApartmentUnit) => void,
  onAddNewApartmentWithDefaults?: (defaults: Partial<ApartmentUnit>) => void,
  showToast: (text: string, type?: 'success' | 'error') => void = () => {}
) {
  // View mode: tree hoặc matrix
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  // Selected node
  const [selectedNode, setSelectedNode] = useState<SelectedNodeType>({ type: 'root' });

  // Tree expand state
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>(['root']);
    projects.forEach((p) => initial.add(`proj-${p.id}`));
    return initial;
  });

  // Tree search
  const [treeSearch, setTreeSearch] = useState('');

  // Matrix filters
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixProjectFilter, setMatrixProjectFilter] = useState('all');
  const [matrixTowerFilter, setMatrixTowerFilter] = useState('all');
  const [matrixAxisFilter, setMatrixAxisFilter] = useState('all');
  const [matrixUnitTypeFilter, setMatrixUnitTypeFilter] = useState<MatrixUnitTypeFilter>('all');
  const [matrixSortBy, setMatrixSortBy] = useState<MatrixSortBy>('unitCode');
  const [matrixSortOrder, setMatrixSortOrder] = useState<MatrixSortOrder>('asc');

  // Multi-selection
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(new Set());

  // Quick action dialog
  const [quickActionModal, setQuickActionModal] = useState<QuickActionModalState>({
    isOpen: false,
    type: 'add_tower',
  });
  const [dialogInputText, setDialogInputText] = useState('');
  const [dialogTargetProject, setDialogTargetProject] = useState('');
  const [dialogTargetTower, setDialogTargetTower] = useState('');
  const [dialogTargetAxis, setDialogTargetAxis] = useState('');

  // ========== TREE BUILDING ==========
  const treeData = useMemo(() => {
    return projects.map((project) => {
      const projectApts = apartments.filter((a) => a.projectId === project.id);
      const allTowerNames = Array.from(
        new Set([...(project.towers || []), ...projectApts.map((a) => a.tower)])
      ).filter(Boolean);

      const towers = allTowerNames.map((towerName) => {
        const towerApts = projectApts.filter((a) => a.tower === towerName);
        const rawAxes: string[] = Array.from(
          new Set<string>(towerApts.map((a) => a.axisNumber?.trim() || 'Chưa gán trục'))
        );
        const axes = rawAxes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        return {
          towerName,
          axes: axes.map((axisName) => {
            const axisApts = towerApts.filter(
              (a) => (a.axisNumber?.trim() || 'Chưa gán trục') === axisName
            );
            return { axisName, apartments: axisApts, count: axisApts.length };
          }),
          apartments: towerApts,
          count: towerApts.length,
        };
      });

      return { project, towers, apartments: projectApts, count: projectApts.length };
    });
  }, [projects, apartments]);

  // ========== MATRIX FILTERS ==========
  const availableTowersForMatrix = useMemo(() => {
    if (matrixProjectFilter === 'all') {
      const allTowers = new Set<string>();
      apartments.forEach((a) => a.tower && allTowers.add(a.tower));
      return Array.from(allTowers).sort();
    }
    const proj = projects.find((p) => p.id === matrixProjectFilter);
    const projApts = apartments.filter((a) => a.projectId === matrixProjectFilter);
    const setTowers = new Set<string>([...(proj?.towers || []), ...projApts.map((a) => a.tower)]);
    return Array.from(setTowers).filter(Boolean).sort();
  }, [matrixProjectFilter, projects, apartments]);

  const availableAxesForMatrix = useMemo(() => {
    let pool = apartments;
    if (matrixProjectFilter !== 'all') pool = pool.filter((a) => a.projectId === matrixProjectFilter);
    if (matrixTowerFilter !== 'all') pool = pool.filter((a) => a.tower === matrixTowerFilter);
    const unique: string[] = Array.from(
      new Set(pool.map((a) => a.axisNumber).filter((x): x is string => Boolean(x)))
    );
    return unique.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [apartments, matrixProjectFilter, matrixTowerFilter]);

  const matrixFilteredApartments = useMemo(() => {
    return apartments
      .filter((apt) => {
        const matchSearch =
          !matrixSearch ||
          apt.unitCode.toLowerCase().includes(matrixSearch.toLowerCase()) ||
          apt.projectName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
          apt.tower.toLowerCase().includes(matrixSearch.toLowerCase()) ||
          (apt.axisNumber && apt.axisNumber.toLowerCase().includes(matrixSearch.toLowerCase())) ||
          apt.unitTypeName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
          (apt.direction && apt.direction.toLowerCase().includes(matrixSearch.toLowerCase()));
        const matchProj = matrixProjectFilter === 'all' || apt.projectId === matrixProjectFilter;
        const matchTower = matrixTowerFilter === 'all' || apt.tower === matrixTowerFilter;
        const matchAxis =
          matrixAxisFilter === 'all' ||
          (apt.axisNumber && apt.axisNumber.toLowerCase() === matrixAxisFilter.toLowerCase());
        const matchType = matrixUnitTypeFilter === 'all' || apt.unitType === matrixUnitTypeFilter;
        return matchSearch && matchProj && matchTower && matchAxis && matchType;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (matrixSortBy === 'unitCode') {
          cmp = a.unitCode.localeCompare(b.unitCode, undefined, { numeric: true });
        } else if (matrixSortBy === 'netArea') {
          cmp = a.netArea - b.netArea;
        } else if (matrixSortBy === 'axisNumber') {
          cmp = (a.axisNumber || '').localeCompare(b.axisNumber || '', undefined, { numeric: true });
        }
        return matrixSortOrder === 'asc' ? cmp : -cmp;
      });
  }, [
    apartments,
    matrixSearch,
    matrixProjectFilter,
    matrixTowerFilter,
    matrixAxisFilter,
    matrixUnitTypeFilter,
    matrixSortBy,
    matrixSortOrder,
  ]);

  // ========== TREE HANDLERS ==========
  const toggleExpand = useCallback((key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const all = new Set<string>(['root']);
    projects.forEach((p) => {
      all.add(`proj-${p.id}`);
      p.towers.forEach((t) => {
        all.add(`tower-${p.id}-${t}`);
        const towerApts = apartments.filter((a) => a.projectId === p.id && a.tower === t);
        const axes = Array.from(new Set(towerApts.map((a) => a.axisNumber || 'Chưa gán trục')));
        axes.forEach((ax) => all.add(`axis-${p.id}-${t}-${ax}`));
      });
    });
    setExpandedKeys(all);
  }, [projects, apartments]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys(new Set(['root']));
  }, []);

  // ========== ACTIVE CONTEXT (cho right column) ==========
  const activeContext = useMemo(() => {
    if (selectedNode.type === 'root') {
      return {
        title: 'Toàn Bộ Hệ Thống (Tất Cả Dự Án)',
        subtitle: `Quản lý tổng quan ${projects.length} dự án, ${apartments.length} căn hộ`,
        breadcrumbs: [{ label: 'Tất Cả Dự Án', node: { type: 'root' as const } }],
        apartments,
        canAddUnit: false,
        canAddTower: false,
        defaultNewUnit: {},
      };
    }
    if (selectedNode.type === 'project') {
      const proj = projects.find((p) => p.id === selectedNode.projectId);
      const projApts = apartments.filter((a) => a.projectId === selectedNode.projectId);
      return {
        title: `Dự Án: ${proj?.name || 'Chưa đặt tên'}`,
        subtitle: `Vị trí: ${proj?.location || 'N/A'} • ${proj?.towers?.length || 0} Tòa tháp • ${projApts.length} Căn hộ`,
        breadcrumbs: [
          { label: 'Tất Cả Dự Án', node: { type: 'root' as const } },
          { label: proj?.name || 'Dự Án', node: selectedNode },
        ],
        apartments: projApts,
        project: proj,
        canAddUnit: true,
        canAddTower: true,
        defaultNewUnit: {
          projectId: proj?.id,
          projectName: proj?.name,
          tower: proj?.towers?.[0] || 'Tòa Tháp A',
        },
      };
    }
    if (selectedNode.type === 'tower') {
      const proj = projects.find((p) => p.id === selectedNode.projectId);
      const towerApts = apartments.filter(
        (a) => a.projectId === selectedNode.projectId && a.tower === selectedNode.towerName
      );
      const uniqueAxes = Array.from(
        new Set(towerApts.map((a) => a.axisNumber).filter(Boolean))
      ) as string[];
      return {
        title: `Tòa: ${selectedNode.towerName}`,
        subtitle: `Thuộc dự án ${proj?.name} • ${uniqueAxes.length} Trục căn • ${towerApts.length} Căn hộ`,
        breadcrumbs: [
          { label: 'Tất Cả Dự Án', node: { type: 'root' as const } },
          { label: proj?.name || 'Dự Án', node: { type: 'project' as const, projectId: selectedNode.projectId } },
          { label: selectedNode.towerName, node: selectedNode },
        ],
        apartments: towerApts,
        project: proj,
        towerName: selectedNode.towerName,
        canAddUnit: true,
        canAddTower: false,
        defaultNewUnit: {
          projectId: proj?.id,
          projectName: proj?.name,
          tower: selectedNode.towerName,
          axisNumber: uniqueAxes[0] || 'Trục 08',
        },
      };
    }
    if (selectedNode.type === 'axis') {
      const proj = projects.find((p) => p.id === selectedNode.projectId);
      const axisApts = apartments.filter(
        (a) =>
          a.projectId === selectedNode.projectId &&
          a.tower === selectedNode.towerName &&
          (a.axisNumber?.trim() || 'Chưa gán trục') === selectedNode.axisNumber
      );
      return {
        title: `${selectedNode.axisNumber}`,
        subtitle: `Tòa ${selectedNode.towerName} • Dự án ${proj?.name} • ${axisApts.length} Căn hộ tra cứu`,
        breadcrumbs: [
          { label: 'Tất Cả Dự Án', node: { type: 'root' as const } },
          { label: proj?.name || 'Dự Án', node: { type: 'project' as const, projectId: selectedNode.projectId } },
          {
            label: selectedNode.towerName,
            node: { type: 'tower' as const, projectId: selectedNode.projectId, towerName: selectedNode.towerName },
          },
          { label: selectedNode.axisNumber, node: selectedNode },
        ],
        apartments: axisApts,
        project: proj,
        towerName: selectedNode.towerName,
        axisNumber: selectedNode.axisNumber,
        canAddUnit: true,
        canAddTower: false,
        defaultNewUnit: {
          projectId: proj?.id,
          projectName: proj?.name,
          tower: selectedNode.towerName,
          axisNumber: selectedNode.axisNumber === 'Chưa gán trục' ? '' : selectedNode.axisNumber,
        },
      };
    }
    // Unit
    const targetApt = apartments.find((a) => a.id === selectedNode.apartmentId);
    const proj = projects.find((p) => p.id === targetApt?.projectId);
    return {
      title: `Căn Hộ: ${targetApt?.unitCode || 'Không rõ'}`,
      subtitle: `${targetApt?.unitTypeName} • ${targetApt?.axisNumber || ''} • ${targetApt?.tower} • ${targetApt?.netArea}m²`,
      breadcrumbs: [
        { label: 'Tất Cả Dự Án', node: { type: 'root' as const } },
        { label: proj?.name || 'Dự Án', node: { type: 'project' as const, projectId: targetApt?.projectId || '' } },
        {
          label: targetApt?.tower || 'Tòa',
          node: {
            type: 'tower' as const,
            projectId: targetApt?.projectId || '',
            towerName: targetApt?.tower || '',
          },
        },
        {
          label: targetApt?.axisNumber || 'Trục căn',
          node: {
            type: 'axis' as const,
            projectId: targetApt?.projectId || '',
            towerName: targetApt?.tower || '',
            axisNumber: targetApt?.axisNumber || 'Chưa gán trục',
          },
        },
        { label: targetApt?.unitCode || 'Căn Hộ', node: selectedNode },
      ],
      apartments: targetApt ? [targetApt] : [],
      singleApartment: targetApt,
      canAddUnit: false,
      canAddTower: false,
      defaultNewUnit: {},
    };
  }, [selectedNode, projects, apartments]);

  // ========== HANDLERS: UNITS / PROJECTS / TOWERS / AXES ==========
  const handleTriggerAddUnit = useCallback(
    (defaults?: Partial<ApartmentUnit>) => {
      if (onAddNewApartmentWithDefaults) {
        onAddNewApartmentWithDefaults(defaults || activeContext.defaultNewUnit);
        return;
      }
      const projId =
        defaults?.projectId || activeContext.defaultNewUnit?.projectId || projects[0]?.id || 'proj-1';
      const proj = projects.find((p) => p.id === projId);
      const newApt: ApartmentUnit = {
        id: 'apt-' + Date.now(),
        projectId: projId,
        projectName: proj?.name || 'Dự án',
        unitCode: 'Căn ' + (apartments.length + 1),
        axisNumber: defaults?.axisNumber || activeContext.defaultNewUnit?.axisNumber || 'Trục 08',
        unitType: '2pn_2wc' as ApartmentUnitType,
        unitTypeName: '2 Phòng Ngủ + 2WC',
        tower: defaults?.tower || activeContext.defaultNewUnit?.tower || proj?.towers?.[0] || 'Tòa Tháp A',
        grossArea: 70,
        netArea: 65,
        ceilingHeight: 2.85,
        direction: 'Ban công Đông Nam',
        floorPlanImageUrl:
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        description: 'Mô tả thông số căn hộ tra cứu...',
        highlights: ['Thiết kế vuông vức', 'Tầm nhìn thoáng đãng'],
        roomDimensions: [
          { id: 'r1', name: 'Phòng Khách + Bếp', width: 3.5, length: 5.5, area: 19.2 },
          { id: 'r2', name: 'Phòng Ngủ Master', width: 3.4, length: 4.0, area: 13.6 },
          { id: 'r3', name: 'Phòng Ngủ 2', width: 3.0, length: 3.5, area: 10.5 },
          { id: 'r4', name: 'WC 1', width: 1.6, length: 2.3, area: 3.7 },
        ],
        interiorImages: [],
        videos: [],
      };
      onOpenApartmentEditor(newApt);
    },
    [activeContext, apartments.length, onAddNewApartmentWithDefaults, onOpenApartmentEditor, projects]
  );

  const handleDuplicateUnit = useCallback(
    (apt: ApartmentUnit, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const copy: ApartmentUnit = {
        ...apt,
        id: 'apt-' + Date.now(),
        unitCode: `${apt.unitCode} (Sao chép)`,
      };
      onSaveApartments([copy, ...apartments]);
      showToast(`Đã nhân bản căn hộ ${apt.unitCode} thành công!`);
    },
    [apartments, onSaveApartments, showToast]
  );

  const handleDeleteUnit = useCallback(
    (aptId: string, unitCode: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (confirm(`Bạn có chắc chắn muốn xóa căn hộ "${unitCode}" khỏi hệ thống?`)) {
        const updated = apartments.filter((a) => a.id !== aptId);
        onSaveApartments(updated);
        setSelectedUnitIds((prev) => {
          const next = new Set(prev);
          next.delete(aptId);
          return next;
        });
        if (selectedNode.type === 'unit' && selectedNode.apartmentId === aptId) {
          setSelectedNode({ type: 'root' });
        }
        showToast(`Đã xóa căn hộ "${unitCode}".`);
      }
    },
    [apartments, onSaveApartments, selectedNode, showToast]
  );

  const handleDeleteProject = useCallback(
    (proj: Project, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const count = apartments.filter((a) => a.projectId === proj.id).length;
      const confirmMsg =
        count > 0
          ? `Dự án "${proj.name}" đang có ${count} căn hộ. Bạn có chắc muốn xóa dự án và TOÀN BỘ ${count} căn hộ thuộc dự án này không?`
          : `Bạn có chắc muốn xóa dự án "${proj.name}"?`;
      if (confirm(confirmMsg)) {
        onSaveProjects(projects.filter((p) => p.id !== proj.id));
        onSaveApartments(apartments.filter((a) => a.projectId !== proj.id));
        setSelectedNode({ type: 'root' });
        showToast(`Đã xóa dự án "${proj.name}".`);
      }
    },
    [apartments, onSaveApartments, onSaveProjects, projects, showToast]
  );

  const handleDeleteTower = useCallback(
    (projectId: string, towerName: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const towerApts = apartments.filter((a) => a.projectId === projectId && a.tower === towerName);
      const proj = projects.find((p) => p.id === projectId);
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa Tòa "${towerName}"? ${
            towerApts.length > 0 ? `Toàn bộ ${towerApts.length} căn hộ thuộc tòa này cũng sẽ được xóa bỏ.` : ''
          }`
        )
      ) {
        if (proj) {
          onSaveProjects(
            projects.map((p) =>
              p.id === projectId ? { ...p, towers: p.towers.filter((t) => t !== towerName) } : p
            )
          );
        }
        onSaveApartments(
          apartments.filter((a) => !(a.projectId === projectId && a.tower === towerName))
        );
        setSelectedNode({ type: 'project', projectId });
        showToast(`Đã xóa Tòa "${towerName}".`);
      }
    },
    [apartments, onSaveApartments, onSaveProjects, projects, showToast]
  );

  const handleDeleteAxis = useCallback(
    (projectId: string, towerName: string, axisNumber: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const axisApts = apartments.filter(
        (a) => a.projectId === projectId && a.tower === towerName && a.axisNumber === axisNumber
      );
      if (
        confirm(
          `Bạn có chắc muốn xóa trục "${axisNumber}"? ${
            axisApts.length > 0 ? `Toàn bộ ${axisApts.length} căn hộ thuộc trục này cũng sẽ bị xóa.` : ''
          }`
        )
      ) {
        onSaveApartments(
          apartments.filter(
            (a) => !(a.projectId === projectId && a.tower === towerName && a.axisNumber === axisNumber)
          )
        );
        setSelectedNode({ type: 'tower', projectId, towerName });
        showToast(`Đã xóa trục "${axisNumber}".`);
      }
    },
    [apartments, onSaveApartments, showToast]
  );

  // ========== HANDLERS: QUICK ACTION DIALOG ==========
  const handleDialogSubmit = useCallback(() => {
    if (quickActionModal.type === 'add_tower') {
      const { projectId } = quickActionModal.data;
      const newTowerName = dialogInputText.trim();
      if (!newTowerName) {
        alert('Vui lòng nhập tên tòa tháp (VD: Tòa S1.08, Tháp B...)');
        return;
      }
      const proj = projects.find((p) => p.id === projectId);
      if (proj) {
        if (proj.towers.includes(newTowerName)) {
          alert('Tòa tháp này đã tồn tại trong dự án!');
          return;
        }
        onSaveProjects(
          projects.map((p) => (p.id === projectId ? { ...p, towers: [...p.towers, newTowerName] } : p))
        );
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          next.add(`proj-${projectId}`);
          next.add(`tower-${projectId}-${newTowerName}`);
          return next;
        });
        setSelectedNode({ type: 'tower', projectId, towerName: newTowerName });
        showToast(`Đã thêm Tòa "${newTowerName}" vào dự án ${proj.name}!`);
      }
    } else if (quickActionModal.type === 'rename_tower') {
      const { projectId, oldTowerName } = quickActionModal.data;
      const newTowerName = dialogInputText.trim();
      if (!newTowerName || newTowerName === oldTowerName) {
        setQuickActionModal({ isOpen: false, type: 'add_tower' });
        return;
      }
      onSaveProjects(
        projects.map((p) =>
          p.id === projectId
            ? { ...p, towers: p.towers.map((t) => (t === oldTowerName ? newTowerName : t)) }
            : p
        )
      );
      onSaveApartments(
        apartments.map((a) =>
          a.projectId === projectId && a.tower === oldTowerName ? { ...a, tower: newTowerName } : a
        )
      );
      setSelectedNode({ type: 'tower', projectId, towerName: newTowerName });
      showToast(`Đã đổi tên Tòa "${oldTowerName}" thành "${newTowerName}" (cập nhật toàn bộ căn hộ liên quan)!`);
    } else if (quickActionModal.type === 'batch_rename_axis') {
      const { projectId, towerName, oldAxisNumber } = quickActionModal.data;
      const newAxisNumber = dialogInputText.trim();
      if (!newAxisNumber || newAxisNumber === oldAxisNumber) {
        setQuickActionModal({ isOpen: false, type: 'add_tower' });
        return;
      }
      let count = 0;
      const updatedApts = apartments.map((a) => {
        const isMatch =
          a.projectId === projectId &&
          (towerName === 'all' || a.tower === towerName) &&
          (a.axisNumber?.trim() || 'Chưa gán trục') === oldAxisNumber;
        if (isMatch) {
          count++;
          return { ...a, axisNumber: newAxisNumber };
        }
        return a;
      });
      onSaveApartments(updatedApts);
      if (towerName !== 'all') {
        setSelectedNode({ type: 'axis', projectId, towerName, axisNumber: newAxisNumber });
      }
      showToast(`Đã đổi tên Trục "${oldAxisNumber}" thành "${newAxisNumber}" cho ${count} căn hộ!`);
    } else if (quickActionModal.type === 'add_axis') {
      const { projectId, towerName } = quickActionModal.data;
      const newAxis = dialogInputText.trim();
      if (!newAxis) {
        alert('Vui lòng nhập tên trục căn (VD: Trục 08, Trục 05A...)');
        return;
      }
      handleTriggerAddUnit({
        projectId,
        tower: towerName,
        axisNumber: newAxis,
        unitCode: `${towerName}-${newAxis}-01`,
      });
      setQuickActionModal({ isOpen: false, type: 'add_tower' });
      return;
    } else if (quickActionModal.type === 'move_units') {
      const targetProjId = dialogTargetProject;
      const targetTower = dialogTargetTower;
      const targetAxis = dialogTargetAxis;
      const targetProj = projects.find((p) => p.id === targetProjId);
      if (!targetProjId || !targetTower) {
        alert('Vui lòng chọn Dự án và Tòa tháp đích!');
        return;
      }
      let count = 0;
      const updatedApts = apartments.map((a) => {
        if (selectedUnitIds.has(a.id)) {
          count++;
          return {
            ...a,
            projectId: targetProjId,
            projectName: targetProj?.name || a.projectName,
            tower: targetTower,
            axisNumber: targetAxis ? targetAxis : a.axisNumber,
          };
        }
        return a;
      });
      onSaveApartments(updatedApts);
      setSelectedUnitIds(new Set());
      showToast(`Đã di chuyển thành công ${count} căn hộ sang ${targetProj?.name} - ${targetTower}!`);
    }
    setQuickActionModal({ isOpen: false, type: 'add_tower' });
    setDialogInputText('');
  }, [
    quickActionModal,
    dialogInputText,
    dialogTargetProject,
    dialogTargetTower,
    dialogTargetAxis,
    projects,
    apartments,
    selectedUnitIds,
    onSaveProjects,
    onSaveApartments,
    handleTriggerAddUnit,
    showToast,
  ]);

  const handleToggleSelectAllContextUnits = useCallback(() => {
    const contextIds = activeContext.apartments.map((a) => a.id);
    const allSelected = contextIds.every((id) => selectedUnitIds.has(id));
    if (allSelected) {
      setSelectedUnitIds((prev) => {
        const next = new Set(prev);
        contextIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedUnitIds((prev) => {
        const next = new Set(prev);
        contextIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [activeContext.apartments, selectedUnitIds]);

  const handleQuickChangeAxis = useCallback(
    (aptId: string, newAxis: string) => {
      onSaveApartments(
        apartments.map((a) => (a.id === aptId ? { ...a, axisNumber: newAxis.trim() } : a))
      );
      showToast('Đã cập nhật Trục căn hộ!');
    },
    [apartments, onSaveApartments, showToast]
  );

  return {
    // state
    viewMode,
    setViewMode,
    selectedNode,
    setSelectedNode,
    expandedKeys,
    setExpandedKeys,
    treeSearch,
    setTreeSearch,
    matrixSearch,
    setMatrixSearch,
    matrixProjectFilter,
    setMatrixProjectFilter,
    matrixTowerFilter,
    setMatrixTowerFilter,
    matrixAxisFilter,
    setMatrixAxisFilter,
    matrixUnitTypeFilter,
    setMatrixUnitTypeFilter,
    matrixSortBy,
    setMatrixSortBy,
    matrixSortOrder,
    setMatrixSortOrder,
    selectedUnitIds,
    setSelectedUnitIds,
    quickActionModal,
    setQuickActionModal,
    dialogInputText,
    setDialogInputText,
    dialogTargetProject,
    setDialogTargetProject,
    dialogTargetTower,
    setDialogTargetTower,
    dialogTargetAxis,
    setDialogTargetAxis,
    // derived
    treeData,
    activeContext,
    availableTowersForMatrix,
    availableAxesForMatrix,
    matrixFilteredApartments,
    // handlers
    toggleExpand,
    handleExpandAll,
    handleCollapseAll,
    handleTriggerAddUnit,
    handleDuplicateUnit,
    handleDeleteUnit,
    handleDeleteProject,
    handleDeleteTower,
    handleDeleteAxis,
    handleDialogSubmit,
    handleToggleSelectAllContextUnits,
    handleQuickChangeAxis,
  };
}

export type CatalogState = ReturnType<typeof useCatalogState>;
