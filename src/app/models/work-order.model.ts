export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
export type ZoomLevel = 'day' | 'week' | 'month';

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: {
    name: string;
    workCenterId: string;
    status: WorkOrderStatus;
    startDate: string;
    endDate: string;
  };
}

export interface StatusOption {
  value: WorkOrderStatus;
  label: string;
  color: string;
  bgColor: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'open', label: 'Open', color: '#4A90D9', bgColor: '#E8F2FC' },
  { value: 'in-progress', label: 'In Progress', color: '#7B61FF', bgColor: '#F0ECFF' },
  { value: 'complete', label: 'Complete', color: '#2EA44F', bgColor: '#E6F9ED' },
  { value: 'blocked', label: 'Blocked', color: '#E5A000', bgColor: '#FFF8E1' },
];

export const STATUS_COLOR_MAP: Record<
  WorkOrderStatus,
  { color: string; bgColor: string }
> = {
  open: { color: '#4A90D9', bgColor: '#DCE9F7' },
  'in-progress': { color: '#7B61FF', bgColor: '#EAE4FF' },
  complete: { color: '#2EA44F', bgColor: '#D6F5E0' },
  blocked: { color: '#E5A000', bgColor: '#FFF3CC' },
};
