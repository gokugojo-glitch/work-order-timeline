/*
* work orders — types, interfaces, and color constants.
*/
/*
* A union type that restricts status to exactly 4 or 3 values. TypeScript will throw errors if you try to assign 'pending' / 'hours' or any other string.
* */
export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
export type ZoomLevel = 'day' | 'week' | 'month';
/*
* docType literal: It enables discriminated unions — if you ever combine WorkCenterDocument | WorkOrderDocument in an array,
* TypeScript can narrow the type by checking docType.
We use ISO strings coz they ('2025-06-25') are easier to store/compare than Date objects. Parsing happens only when needed.
*/
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
/*
* Used by filter buttons and status chips in the panel.
* */
export interface StatusOption {
  value: WorkOrderStatus;
  label: string;
  color: string;
  bgColor: string;
}
/*
* Used in templates with @for to render filter buttons and status chips dynamically.
* */
export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'open', label: 'Open', color: '#4A90D9', bgColor: '#E8F2FC' },
  { value: 'in-progress', label: 'In Progress', color: '#7B61FF', bgColor: '#F0ECFF' },
  { value: 'complete', label: 'Complete', color: '#2EA44F', bgColor: '#E6F9ED' },
  { value: 'blocked', label: 'Blocked', color: '#E5A000', bgColor: '#FFF8E1' },
];
/*
* STATUS_OPTIONS and STATUS_COLOR_MAP?
USE CASE	                                WHICH CONSTANT
Iterating in templates (filters, chips)	  STATUS_OPTIONS (array)
Quick lookup by status key	              STATUS_COLOR_MAP (record)
The bar component (work-order-bar.component.ts) uses STATUS_COLOR_MAP for O(1) lookup
*/
export const STATUS_COLOR_MAP: Record<
  WorkOrderStatus,
  { color: string; bgColor: string }
> = {
  open: { color: '#4A90D9', bgColor: '#DCE9F7' },
  'in-progress': { color: '#7B61FF', bgColor: '#EAE4FF' },
  complete: { color: '#2EA44F', bgColor: '#D6F5E0' },
  blocked: { color: '#E5A000', bgColor: '#FFF3CC' },
};
