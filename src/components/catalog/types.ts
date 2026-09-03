/**
 * Shared types cho CatalogTreeManager và các sub-component.
 */

import type { ApartmentUnit, Project } from '../../types';

/** Loại node trong cây thư mục catalog */
export type SelectedNodeType =
  | { type: 'root' }
  | { type: 'project'; projectId: string }
  | { type: 'tower'; projectId: string; towerName: string }
  | { type: 'axis'; projectId: string; towerName: string; axisNumber: string }
  | { type: 'unit'; apartmentId: string };

/** Loại Quick Action dialog */
export type QuickActionType =
  | 'add_tower'
  | 'rename_tower'
  | 'batch_rename_axis'
  | 'move_units'
  | 'add_axis';

/** State của dialog */
export interface QuickActionModalState {
  isOpen: boolean;
  type: QuickActionType;
  data?: any;
}

/** Mode hiển thị: cây thư mục hoặc bảng ma trận */
export type ViewMode = 'tree' | 'matrix';

/** Sort options cho matrix */
export type MatrixSortBy = 'unitCode' | 'netArea' | 'axisNumber';
export type MatrixSortOrder = 'asc' | 'desc';

/** Filter options cho matrix */
export type MatrixUnitTypeFilter = import('../../types').ApartmentUnitType | 'all';

/** Props chung cho các tab trong catalog */
export interface CatalogContextProps {
  projects: Project[];
  apartments: ApartmentUnit[];
  onSaveProjects: (projects: Project[]) => void;
  onSaveApartments: (apartments: ApartmentUnit[]) => void;
  onOpenApartmentEditor: (apt: ApartmentUnit) => void;
  onOpenProjectEditor: (project: Project) => void;
  onAddNewApartmentWithDefaults?: (defaults: Partial<ApartmentUnit>) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}
