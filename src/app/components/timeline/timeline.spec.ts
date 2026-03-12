import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineComponent } from './timeline';
import { WorkOrderService } from '../../services/work-order.service';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;
  let workOrderService: WorkOrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineComponent],
    }).compileComponents();

    workOrderService = TestBed.inject(WorkOrderService);
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── CREATION ───

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── STATUS OPTIONS ───

  it('should have 4 status options', () => {
    expect(component.statusOptions.length).toBe(4);
  });

  it('should have correct status values', () => {
    const values = component.statusOptions.map(
      (o) => o.value
    );
    expect(values).toEqual([
      'open',
      'in-progress',
      'complete',
      'blocked',
    ]);
  });

  it('should have correct status labels', () => {
    const labels = component.statusOptions.map(
      (o) => o.label
    );
    expect(labels).toEqual([
      'Open',
      'In Progress',
      'Complete',
      'Blocked',
    ]);
  });

  // ─── SEARCH ───

  it('should have empty search query initially', () => {
    expect(component.searchQuery).toBe('');
  });

  it('should update service on search change', () => {
    spyOn(workOrderService, 'setSearchQuery');
    component.onSearchChange('CNC');
    expect(workOrderService.setSearchQuery)
      .toHaveBeenCalledWith('CNC');
  });

  it('should update service with empty search', () => {
    spyOn(workOrderService, 'setSearchQuery');
    component.onSearchChange('');
    expect(workOrderService.setSearchQuery)
      .toHaveBeenCalledWith('');
  });

  it('should handle special characters in search', () => {
    spyOn(workOrderService, 'setSearchQuery');
    component.onSearchChange('#1001');
    expect(workOrderService.setSearchQuery)
      .toHaveBeenCalledWith('#1001');
  });

  // ─── STATUS FILTER ───

  it('should update service on status filter', () => {
    spyOn(workOrderService, 'setStatusFilter');
    component.onStatusFilter('blocked');
    expect(workOrderService.setStatusFilter)
      .toHaveBeenCalledWith('blocked');
  });

  it('should update service with all filter', () => {
    spyOn(workOrderService, 'setStatusFilter');
    component.onStatusFilter('all');
    expect(workOrderService.setStatusFilter)
      .toHaveBeenCalledWith('all');
  });

  it('should filter by open status', () => {
    spyOn(workOrderService, 'setStatusFilter');
    component.onStatusFilter('open');
    expect(workOrderService.setStatusFilter)
      .toHaveBeenCalledWith('open');
  });

  it('should filter by in-progress status', () => {
    spyOn(workOrderService, 'setStatusFilter');
    component.onStatusFilter('in-progress');
    expect(workOrderService.setStatusFilter)
      .toHaveBeenCalledWith('in-progress');
  });

  it('should filter by complete status', () => {
    spyOn(workOrderService, 'setStatusFilter');
    component.onStatusFilter('complete');
    expect(workOrderService.setStatusFilter)
      .toHaveBeenCalledWith('complete');
  });

  // ─── DOM: SEARCH INTERACTION ───

  it('should trigger search on input', () => {
    spyOn(workOrderService, 'setSearchQuery');
    const el = fixture.nativeElement;
    const input = el.querySelector('.search-input');

    input.value = 'Extrusion';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(workOrderService.setSearchQuery)
      .toHaveBeenCalled();
  });

  it('should clear search on empty input', () => {
    spyOn(workOrderService, 'setSearchQuery');
    const el = fixture.nativeElement;
    const input = el.querySelector('.search-input');

    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(workOrderService.setSearchQuery)
      .toHaveBeenCalledWith('');
  });

  // ─── DOM: FILTER BUTTONS ───

  it('should render 5 filter buttons', () => {
    const el = fixture.nativeElement;
    const buttons = el.querySelectorAll('.filter-btn');
    expect(buttons.length).toBe(5);
  });

  it('should have All button active by default', () => {
    const el = fixture.nativeElement;
    const activeBtn = el.querySelector('.filter-btn.active');
    expect(activeBtn).toBeTruthy();
    expect(activeBtn.textContent.trim()).toContain('All');
  });

  it('should change active filter on click', () => {
    spyOn(workOrderService, 'setStatusFilter');
    const el = fixture.nativeElement;
    const buttons = el.querySelectorAll('.filter-btn');

    buttons[4].click();
    fixture.detectChanges();

    expect(workOrderService.setStatusFilter)
      .toHaveBeenCalledWith('blocked');
  });

  it('should render filter dots for status buttons', () => {
    const el = fixture.nativeElement;
    const dots = el.querySelectorAll('.filter-dot');
    expect(dots.length).toBe(4);
  });

  // ─── DOM: TOOLBAR ───

  it('should render toolbar', () => {
    const el = fixture.nativeElement;
    const toolbar = el.querySelector('.toolbar');
    expect(toolbar).toBeTruthy();
  });

  it('should render title', () => {
    const el = fixture.nativeElement;
    const title = el.querySelector('.toolbar-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Work Order Schedule');
  });

  it('should render search input', () => {
    const el = fixture.nativeElement;
    const input = el.querySelector('.search-input');
    expect(input).toBeTruthy();
  });

  it('should render search icon', () => {
    const el = fixture.nativeElement;
    const icon = el.querySelector('.search-icon');
    expect(icon).toBeTruthy();
  });

  // ─── DOM: CHILD COMPONENTS ───

  it('should render timescale selector', () => {
    const el = fixture.nativeElement;
    const selector = el.querySelector('app-timescale-selector');
    expect(selector).toBeTruthy();
  });

  it('should render timeline grid', () => {
    const el = fixture.nativeElement;
    const grid = el.querySelector('app-timeline-grid');
    expect(grid).toBeTruthy();
  });

  // ─── INTEGRATION: SEARCH → FILTER ───

  it('should filter grid when searching', () => {
    component.onSearchChange('Extrusion');
    fixture.detectChanges();

    const filtered = workOrderService.filteredWorkOrders();
    filtered.forEach((order) => {
      expect(order.data.name.toLowerCase())
        .toContain('extrusion');
    });
  });

  it('should show all when search cleared', () => {
    component.onSearchChange('Extrusion');
    fixture.detectChanges();
    const filteredCount =
      workOrderService.filteredWorkOrders().length;

    component.onSearchChange('');
    fixture.detectChanges();
    const allCount =
      workOrderService.filteredWorkOrders().length;

    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });

  it('should return no results for gibberish search', () => {
    component.onSearchChange('zzzzzzzzz');
    fixture.detectChanges();

    const filtered = workOrderService.filteredWorkOrders();
    expect(filtered.length).toBe(0);
  });

  // ─── INTEGRATION: STATUS → FILTER ───

  it('should filter grid when status selected', () => {
    component.onStatusFilter('blocked');
    fixture.detectChanges();

    const filtered = workOrderService.filteredWorkOrders();
    filtered.forEach((order) => {
      expect(order.data.status).toBe('blocked');
    });
  });

  it('should show all when All selected', () => {
    component.onStatusFilter('blocked');
    fixture.detectChanges();
    const blockedCount =
      workOrderService.filteredWorkOrders().length;

    component.onStatusFilter('all');
    fixture.detectChanges();
    const allCount =
      workOrderService.filteredWorkOrders().length;

    expect(allCount).toBeGreaterThanOrEqual(blockedCount);
  });

  // ─── INTEGRATION: SEARCH + STATUS COMBINED ───

  it('should combine search and status filters', () => {
    component.onStatusFilter('in-progress');
    component.onSearchChange('CNC');
    fixture.detectChanges();

    const filtered = workOrderService.filteredWorkOrders();
    filtered.forEach((order) => {
      expect(order.data.status).toBe('in-progress');
      expect(order.data.name.toLowerCase())
        .toContain('cnc');
    });
  });

  it('should reset status filter independently', () => {
    component.onStatusFilter('blocked');
    component.onSearchChange('CNC');
    fixture.detectChanges();

    component.onStatusFilter('all');
    fixture.detectChanges();

    const filtered = workOrderService.filteredWorkOrders();
    filtered.forEach((order) => {
      expect(order.data.name.toLowerCase())
        .toContain('cnc');
    });
  });
});
