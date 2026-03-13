import { WorkCenterDocument } from '../models/work-center.model';
import { WorkOrderDocument } from '../models/work-order.model';
/*
* mock data for the timeline.
* */
/*
* How Services Consume This
* sample-data.ts
    │
    ├──► WorkCenterService (loads SAMPLE_WORK_CENTERS)
    │
    └──► WorkOrderService (loads SAMPLE_WORK_ORDERS)
              │
              ├──► filters by status
              ├──► filters by search query
              └──► groups by workCenterId
*/
const today = new Date();
today.setHours(0, 0, 0, 0);
/*
* Creates dates relative to today.
* addDays(today, -8) = 8 days ago.
* addDays(today, 4) = 4 days from now.
* */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
/*
* Converts Date → "2025-06-25" string format
* */
function fmt(date: Date): string {
  return date.toISOString().split('T')[0];
}
/*
* wc-1 → Extrusion Line A
wc-2 → CNC Machine 1
wc-3 → Assembly Station
wc-4 → Quality Control
wc-5 → Packaging Line
wc-6 → Welding Bay
These are the rows in the sidebar.
*/
export const SAMPLE_WORK_CENTERS: WorkCenterDocument[] = [
  { docId: 'wc-1', docType: 'workCenter', data: { name: 'Extrusion Line A' } },
  { docId: 'wc-2', docType: 'workCenter', data: { name: 'CNC Machine 1' } },
  { docId: 'wc-3', docType: 'workCenter', data: { name: 'Assembly Station' } },
  { docId: 'wc-4', docType: 'workCenter', data: { name: 'Quality Control' } },
  { docId: 'wc-5', docType: 'workCenter', data: { name: 'Packaging Line' } },
  { docId: 'wc-6', docType: 'workCenter', data: { name: 'Welding Bay' } },
];

export const SAMPLE_WORK_ORDERS: WorkOrderDocument[] = [
  // Extrusion Line A
  {
    docId: 'wo-1',
    docType: 'workOrder',
    data: {
      name: 'Extrusion Batch 42',
      workCenterId: 'wc-1',
      status: 'complete',
      startDate: fmt(addDays(today, -8)),
      endDate: fmt(addDays(today, -5)),
    },
  },
  {
    docId: 'wo-2',
    docType: 'workOrder',
    data: {
      name: 'Extrusion Batch 43',
      workCenterId: 'wc-1',
      status: 'in-progress',
      startDate: fmt(addDays(today, -1)),
      endDate: fmt(addDays(today, 4)),
    },
  },
  {
    docId: 'wo-3',
    docType: 'workOrder',
    data: {
      name: 'Extrusion Batch 44',
      workCenterId: 'wc-1',
      status: 'open',
      startDate: fmt(addDays(today, 6)),
      endDate: fmt(addDays(today, 12)),
    },
  },
  // CNC Machine 1
  {
    docId: 'wo-4',
    docType: 'workOrder',
    data: {
      name: 'CNC Part A-100',
      workCenterId: 'wc-2',
      status: 'complete',
      startDate: fmt(addDays(today, -10)),
      endDate: fmt(addDays(today, -7)),
    },
  },
  {
    docId: 'wo-5',
    docType: 'workOrder',
    data: {
      name: 'CNC Part B-200',
      workCenterId: 'wc-2',
      status: 'in-progress',
      startDate: fmt(addDays(today, -2)),
      endDate: fmt(addDays(today, 2)),
    },
  },
  {
    docId: 'wo-6',
    docType: 'workOrder',
    data: {
      name: 'CNC Part C-300',
      workCenterId: 'wc-2',
      status: 'blocked',
      startDate: fmt(addDays(today, 3)),
      endDate: fmt(addDays(today, 8)),
    },
  },
  // Assembly Station
  {
    docId: 'wo-7',
    docType: 'workOrder',
    data: {
      name: 'Widget Assembly Run',
      workCenterId: 'wc-3',
      status: 'in-progress',
      startDate: fmt(addDays(today, -3)),
      endDate: fmt(addDays(today, 5)),
    },
  },
  {
    docId: 'wo-8',
    docType: 'workOrder',
    data: {
      name: 'Gadget Assembly Run',
      workCenterId: 'wc-3',
      status: 'open',
      startDate: fmt(addDays(today, 7)),
      endDate: fmt(addDays(today, 15)),
    },
  },
  // Quality Control
  {
    docId: 'wo-9',
    docType: 'workOrder',
    data: {
      name: 'QC Inspection Lot 5',
      workCenterId: 'wc-4',
      status: 'complete',
      startDate: fmt(addDays(today, -6)),
      endDate: fmt(addDays(today, -4)),
    },
  },
  {
    docId: 'wo-10',
    docType: 'workOrder',
    data: {
      name: 'QC Inspection Lot 6',
      workCenterId: 'wc-4',
      status: 'open',
      startDate: fmt(addDays(today, 1)),
      endDate: fmt(addDays(today, 3)),
    },
  },
  // Packaging Line
  {
    docId: 'wo-11',
    docType: 'workOrder',
    data: {
      name: 'Package Order #1001',
      workCenterId: 'wc-5',
      status: 'blocked',
      startDate: fmt(addDays(today, -4)),
      endDate: fmt(addDays(today, 0)),
    },
  },
  {
    docId: 'wo-12',
    docType: 'workOrder',
    data: {
      name: 'Package Order #1002',
      workCenterId: 'wc-5',
      status: 'open',
      startDate: fmt(addDays(today, 2)),
      endDate: fmt(addDays(today, 9)),
    },
  },
  // Welding Bay
  {
    docId: 'wo-13',
    docType: 'workOrder',
    data: {
      name: 'Weld Frame Set A',
      workCenterId: 'wc-6',
      status: 'in-progress',
      startDate: fmt(addDays(today, -1)),
      endDate: fmt(addDays(today, 6)),
    },
  },
  {
    docId: 'wo-14',
    docType: 'workOrder',
    data: {
      name: 'Weld Frame Set B',
      workCenterId: 'wc-6',
      status: 'open',
      startDate: fmt(addDays(today, 8)),
      endDate: fmt(addDays(today, 14)),
    },
  },
];
