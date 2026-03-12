import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderPanelComponent } from './work-order-panel';
import { WorkOrderDocument } from '../../models/work-order.model';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkCenterService } from '../../services/work-center.service';

describe('WorkOrderPanelComponent', () => {
  let component: WorkOrderPanelComponent;
  let fixture: ComponentFixture<WorkOrderPanelComponent>;
  let workOrderService: WorkOrderService;
  let workCenterService: WorkCenterService;

  const mockWorkOrder: WorkOrderDocument = {
    docId: 'wo-test-1',
    docType: 'workOrder',
    data: {
      name: 'Test Order',
      workCenterId: 'wc-1',
      status: 'in-progress',
      startDate: '2025-06-20',
      endDate: '2025-06-25',
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderPanelComponent],
    }).compileComponents();

    workOrderService = TestBed.inject(WorkOrderService);
    workCenterService = TestBed.inject(WorkCenterService);

    fixture = TestBed.createComponent(WorkOrderPanelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workOrder', mockWorkOrder);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve work center name', () => {
    expect(component.workCenterName()).toBe('Extrusion Line A');
  });

  it('should return Unknown for invalid work center', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, workCenterId: 'invalid' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.workCenterName()).toBe('Unknown');
  });

  it('should return In Progress label', () => {
    expect(component.statusLabel()).toBe('In Progress');
  });

  it('should return Open label', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'open' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.statusLabel()).toBe('Open');
  });

  it('should return Complete label', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'complete' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.statusLabel()).toBe('Complete');
  });

  it('should return Blocked label', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'blocked' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.statusLabel()).toBe('Blocked');
  });

  it('should return correct status colors', () => {
    const colors = component.statusColors();
    expect(colors.color).toBe('#7B61FF');
    expect(colors.bgColor).toBe('#EAE4FF');
  });

  it('should format start date', () => {
    expect(component.formattedStart()).toBe('Jun 20, 2025');
  });

  it('should format end date', () => {
    expect(component.formattedEnd()).toBe('Jun 25, 2025');
  });
  // ─── CLOSE PANEL ───

  it('should emit closePanel on close', () => {
    spyOn(component.closePanel, 'emit');
    component.close();
    expect(component.closePanel.emit).toHaveBeenCalled();
  });

  it('should emit closePanel on overlay click', () => {
    spyOn(component.closePanel, 'emit');
    const el = fixture.nativeElement;
    const overlay = el.querySelector('.panel-overlay');
    overlay.click();
    expect(component.closePanel.emit).toHaveBeenCalled();
  });

  it('should emit closePanel on close button click', () => {
    spyOn(component.closePanel, 'emit');
    const el = fixture.nativeElement;
    const closeBtn = el.querySelector('.close-btn');
    closeBtn.click();
    expect(component.closePanel.emit).toHaveBeenCalled();
  });

  // ─── DURATION ───

  it('should calculate duration inclusive', () => {
    // June 20 to June 25 = 5 + 1 = 6 days
    expect(component.duration()).toBe(6);
  });

  it('should return 1 for same-day order', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: {
        ...mockWorkOrder.data,
        startDate: '2025-06-20',
        endDate: '2025-06-20',
      },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.duration()).toBe(1);
  });

  // ─── DOM RENDERING ───

  it('should render work order name', () => {
    const el = fixture.nativeElement;
    const title = el.querySelector('.panel-title');
    expect(title.textContent.trim()).toBe('Test Order');
  });

  it('should render docId', () => {
    const el = fixture.nativeElement;
    const id = el.querySelector('.panel-id');
    expect(id.textContent.trim()).toBe('wo-test-1');
  });

  it('should render status chips', () => {
    const el = fixture.nativeElement;
    const chips = el.querySelectorAll('.status-chip');
    expect(chips.length).toBe(4);
  });

  it('should mark active status chip', () => {
    const el = fixture.nativeElement;
    const active = el.querySelector('.status-chip.active');
    expect(active).toBeTruthy();
    expect(active.textContent.trim()).toContain('In Progress');
  });

  it('should render work center name', () => {
    const el = fixture.nativeElement;
    const fields = el.querySelectorAll('.field-value');
    const wcField = fields[0];
    expect(wcField.textContent.trim()).toBe('Extrusion Line A');
  });

  it('should render start date', () => {
    const el = fixture.nativeElement;
    const body = el.querySelector('.panel-body');
    expect(body.textContent).toContain('Jun 20, 2025');
  });

  it('should render end date', () => {
    const el = fixture.nativeElement;
    const body = el.querySelector('.panel-body');
    expect(body.textContent).toContain('Jun 25, 2025');
  });

  it('should render duration text', () => {
    const el = fixture.nativeElement;
    const body = el.querySelector('.panel-body');
    expect(body.textContent).toContain('6 days');
  });

  it('should render delete button', () => {
    const el = fixture.nativeElement;
    const deleteBtn = el.querySelector('.delete-btn');
    expect(deleteBtn).toBeTruthy();
    expect(deleteBtn.textContent).toContain('Delete');
  });

  // ─── STATUS CHIP CLICK ───

  it('should change status on chip click', () => {
    spyOn(workOrderService, 'updateWorkOrderStatus');
    const el = fixture.nativeElement;
    const chips = el.querySelectorAll('.status-chip');

    // Click "Blocked" chip (4th one)
    chips[3].click();
    fixture.detectChanges();

    expect(workOrderService.updateWorkOrderStatus)
      .toHaveBeenCalledWith('wo-test-1', 'blocked');
  });

  it('should change status to open on chip click', () => {
    spyOn(workOrderService, 'updateWorkOrderStatus');
    const el = fixture.nativeElement;
    const chips = el.querySelectorAll('.status-chip');

    // Click "Open" chip (1st one)
    chips[0].click();
    fixture.detectChanges();

    expect(workOrderService.updateWorkOrderStatus)
      .toHaveBeenCalledWith('wo-test-1', 'open');
  });

  // ─── DELETE VIA DOM ───

  it('should delete on button click with confirm', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(workOrderService, 'deleteWorkOrder');
    spyOn(component.closePanel, 'emit');

    const el = fixture.nativeElement;
    const deleteBtn = el.querySelector('.delete-btn');
    deleteBtn.click();

    expect(workOrderService.deleteWorkOrder)
      .toHaveBeenCalledWith('wo-test-1');
    expect(component.closePanel.emit).toHaveBeenCalled();
  });

  it('should not delete on button click with cancel', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    spyOn(workOrderService, 'deleteWorkOrder');

    const el = fixture.nativeElement;
    const deleteBtn = el.querySelector('.delete-btn');
    deleteBtn.click();

    expect(workOrderService.deleteWorkOrder)
      .not.toHaveBeenCalled();
  });
});
