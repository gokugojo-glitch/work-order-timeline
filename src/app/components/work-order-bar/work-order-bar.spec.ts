import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderBarComponent } from './work-order-bar';
import { WorkOrderDocument } from '../../models/work-order.model';
import { TimelineService } from '../../services/timeline.service';

describe('WorkOrderBarComponent', () => {
  let component: WorkOrderBarComponent;
  let fixture: ComponentFixture<WorkOrderBarComponent>;
  let timelineService: TimelineService;

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
      imports: [WorkOrderBarComponent],
    }).compileComponents();

    timelineService = TestBed.inject(TimelineService);
    fixture = TestBed.createComponent(WorkOrderBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workOrder', mockWorkOrder);
    fixture.detectChanges();
  });

  // ─── CREATION ───

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── BAR STYLE ───

  it('should compute barStyle with left', () => {
    const style = component.barStyle();
    expect(style.left).toContain('px');
  });

  it('should compute barStyle with width', () => {
    const style = component.barStyle();
    expect(style.width).toContain('px');
  });

  it('should compute barStyle with backgroundColor', () => {
    const style = component.barStyle();
    expect(style.backgroundColor).toBe('#EAE4FF');
  });

  it('should compute barStyle with borderLeft', () => {
    const style = component.barStyle();
    expect(style.borderLeft).toBe('3px solid #7B61FF');
  });

  // ─── STATUS COLOR ───

  it('should return purple for in-progress', () => {
    expect(component.statusColor()).toBe('#7B61FF');
  });

  it('should return blue for open', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'open' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.statusColor()).toBe('#4A90D9');
  });

  it('should return green for complete', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'complete' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.statusColor()).toBe('#2EA44F');
  });

  it('should return amber for blocked', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'blocked' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.statusColor()).toBe('#E5A000');
  });

  // ─── STATUS LABEL ───

  /*it('should return In Progress label', () => {
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
  });*/

  // ─── SHOW LABEL ───

  it('should show label for wide bars', () => {
    // 6 days × 40px = 240px > 60
    expect(component.showLabel()).toBeTrue();
  });

  it('should hide label for narrow bars at month zoom', () => {
    const narrowOrder: WorkOrderDocument = {
      ...mockWorkOrder,
      data: {
        ...mockWorkOrder.data,
        startDate: '2025-06-20',
        endDate: '2025-06-20',
      },
    };
    fixture.componentRef.setInput('workOrder', narrowOrder);
    timelineService.setZoomLevel('month');
    fixture.detectChanges();
    // 1 day × 12px = 12px < 60
    expect(component.showLabel()).toBeFalse();
  });

  // ─── WIDTH AT DIFFERENT ZOOM LEVELS ───

  it('should have wider bar at day zoom', () => {
    timelineService.setZoomLevel('day');
    fixture.detectChanges();
    const style = component.barStyle();
    const width = parseInt(style.width, 10);
    // 6 days × 80px = 480
    expect(width).toBe(480);
  });

  it('should have medium bar at week zoom', () => {
    timelineService.setZoomLevel('week');
    fixture.detectChanges();
    const style = component.barStyle();
    const width = parseInt(style.width, 10);
    // 6 days × 40px = 240
    expect(width).toBe(240);
  });

  it('should have narrow bar at month zoom', () => {
    timelineService.setZoomLevel('month');
    fixture.detectChanges();
    const style = component.barStyle();
    const width = parseInt(style.width, 10);
    // 6 days × 12px = 72
    expect(width).toBe(72);
  });

  // ─── BACKGROUND COLORS PER STATUS ───

  it('should apply open background color', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'open' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.barStyle().backgroundColor)
      .toBe('#DCE9F7');
  });

  it('should apply complete background color', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'complete' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.barStyle().backgroundColor)
      .toBe('#D6F5E0');
  });

  it('should apply blocked background color', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'blocked' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.barStyle().backgroundColor)
      .toBe('#FFF3CC');
  });

  // ─── CLICK ───

  it('should emit barClicked on click', () => {
    spyOn(component.barClicked, 'emit');
    component.onClick();
    expect(component.barClicked.emit)
      .toHaveBeenCalledWith(mockWorkOrder);
  });

  it('should emit on DOM click', () => {
    spyOn(component.barClicked, 'emit');
    const el = fixture.nativeElement;
    const bar = el.querySelector('.work-order-bar');
    bar.click();
    expect(component.barClicked.emit)
      .toHaveBeenCalledWith(mockWorkOrder);
  });

  // ─── DOM RENDERING ───

  it('should render bar element', () => {
    const el = fixture.nativeElement;
    const bar = el.querySelector('.work-order-bar');
    expect(bar).toBeTruthy();
  });

  it('should render bar label', () => {
    const el = fixture.nativeElement;
    const label = el.querySelector('.bar-label');
    expect(label).toBeTruthy();
    expect(label.textContent.trim()).toBe('Test Order');
  });

  it('should render status dot', () => {
    const el = fixture.nativeElement;
    const dot = el.querySelector('.bar-status-dot');
    expect(dot).toBeTruthy();
  });

  it('should apply correct background to status dot', () => {
    const el = fixture.nativeElement;
    const dot = el.querySelector('.bar-status-dot');
    expect(dot.style.backgroundColor)
      .toBe('rgb(123, 97, 255)');
  });

  it('should set title attribute', () => {
    const el = fixture.nativeElement;
    const bar = el.querySelector('.work-order-bar');
    expect(bar.title).toContain('Test Order');
    expect(bar.title).toContain('In Progress');
  });

  // ─── HIDE LABEL WHEN NARROW ───

  it('should hide label at month zoom for short order', () => {
    const narrowOrder: WorkOrderDocument = {
      ...mockWorkOrder,
      data: {
        ...mockWorkOrder.data,
        startDate: '2025-06-20',
        endDate: '2025-06-20',
      },
    };
    fixture.componentRef.setInput('workOrder', narrowOrder);
    timelineService.setZoomLevel('month');
    fixture.detectChanges();

    const el = fixture.nativeElement;
    const label = el.querySelector('.bar-label');
    expect(label).toBeFalsy();
  });

  it('should show label at day zoom for short order', () => {
    const narrowOrder: WorkOrderDocument = {
      ...mockWorkOrder,
      data: {
        ...mockWorkOrder.data,
        startDate: '2025-06-20',
        endDate: '2025-06-20',
      },
    };
    fixture.componentRef.setInput('workOrder', narrowOrder);
    timelineService.setZoomLevel('day');
    fixture.detectChanges();

    const el = fixture.nativeElement;
    const label = el.querySelector('.bar-label');
    expect(label).toBeTruthy();
  });

  // ─── BORDER LEFT PER STATUS ───

  it('should apply open border color', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'open' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.barStyle().borderLeft)
      .toBe('3px solid #4A90D9');
  });

  it('should apply complete border color', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'complete' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.barStyle().borderLeft)
      .toBe('3px solid #2EA44F');
  });

  it('should apply blocked border color', () => {
    const order: WorkOrderDocument = {
      ...mockWorkOrder,
      data: { ...mockWorkOrder.data, status: 'blocked' },
    };
    fixture.componentRef.setInput('workOrder', order);
    fixture.detectChanges();
    expect(component.barStyle().borderLeft)
      .toBe('3px solid #E5A000');
  });
});
