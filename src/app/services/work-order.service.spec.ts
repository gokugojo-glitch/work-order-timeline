import { TestBed } from '@angular/core/testing';
import { WorkOrderService } from './work-order.service';
import { SupabaseService } from './supabase.service';
import { WorkCenterService } from './work-center.service';
import { SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { WorkOrderDocument } from '../models/work-order.model';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let supabaseServiceMock: any;
  let workCenterServiceMock: any;

  beforeEach(() => {
    supabaseServiceMock = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(false),
      client: {
        from: jasmine.createSpy('from').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            order: jasmine.createSpy('order').and.resolveTo({ data: [], error: null }),
          }),
          upsert: jasmine.createSpy('upsert').and.resolveTo({ error: null }),
          delete: jasmine.createSpy('delete').and.returnValue({
            eq: jasmine.createSpy('eq').and.resolveTo({ error: null }),
          }),
          insert: jasmine.createSpy('insert').and.resolveTo({ error: null }),
        }),
        channel: jasmine.createSpy('channel').and.returnValue({
          on: jasmine.createSpy('on').and.returnValue({
            subscribe: jasmine.createSpy('subscribe'),
          }),
        }),
      },
    };

    workCenterServiceMock = {
      getWorkCenterName: jasmine.createSpy('getWorkCenterName').and.returnValue('Test WC'),
    };

    TestBed.configureTestingModule({
      providers: [
        WorkOrderService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
        { provide: WorkCenterService, useValue: workCenterServiceMock },
      ],
    });
    service = TestBed.inject(WorkOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with sample data if Supabase is not configured', () => {
    expect(service.allWorkOrders().length).toBe(SAMPLE_WORK_ORDERS.length);
  });

  it('should filter by status', () => {
    service.setStatusFilter('open');
    const filtered = service.filteredWorkOrders();
    expect(filtered.every(o => o.data.status === 'open')).toBeTrue();
  });

  it('should filter by search query (order name)', () => {
    service.setSearchQuery('Extrusion');
    const filtered = service.filteredWorkOrders();
    expect(filtered.every(o => o.data.name.includes('Extrusion') || o.data.workCenterId === 'wc-1')).toBeTrue();
  });

  it('should add a work order', () => {
    const initialCount = service.allWorkOrders().length;
    const newOrder: WorkOrderDocument = {
      docId: 'wo-new',
      docType: 'workOrder',
      data: {
        name: 'New Test Order',
        workCenterId: 'wc-1',
        status: 'open',
        startDate: '2025-01-01',
        endDate: '2025-01-05',
      },
    };
    service.addWorkOrder(newOrder);
    expect(service.allWorkOrders().length).toBe(initialCount + 1);
    expect(service.getWorkOrderById('wo-new')).toEqual(newOrder);
  });

  it('should delete a work order', () => {
    const orderToDelete = SAMPLE_WORK_ORDERS[0];
    const initialCount = service.allWorkOrders().length;
    service.deleteWorkOrder(orderToDelete.docId);
    expect(service.allWorkOrders().length).toBe(initialCount - 1);
    expect(service.getWorkOrderById(orderToDelete.docId)).toBeUndefined();
  });

  it('should update work order status', () => {
    const order = SAMPLE_WORK_ORDERS[0];
    service.updateWorkOrderStatus(order.docId, 'complete');
    const updated = service.getWorkOrderById(order.docId);
    expect(updated?.data.status).toBe('complete');
  });

  it('should update work order dates', () => {
    const order = SAMPLE_WORK_ORDERS[0];
    service.updateWorkOrderDates(order.docId, '2025-12-01', '2025-12-10');
    const updated = service.getWorkOrderById(order.docId);
    expect(updated?.data.startDate).toBe('2025-12-01');
    expect(updated?.data.endDate).toBe('2025-12-10');
  });
});
