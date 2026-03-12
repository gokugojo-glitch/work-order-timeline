import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimelineGridComponent } from './timeline-grid';
import { TimelineService } from '../../services/timeline.service';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkOrderService } from '../../services/work-order.service';

describe('TimelineGridComponent', () => {
  let component: TimelineGridComponent;
  let fixture: ComponentFixture<TimelineGridComponent>;
  let timelineService: TimelineService;
  let workCenterService: WorkCenterService;
  let workOrderService: WorkOrderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineGridComponent],
    }).compileComponents();

    timelineService = TestBed.inject(TimelineService);
    workCenterService = TestBed.inject(WorkCenterService);
    workOrderService = TestBed.inject(WorkOrderService);

    fixture = TestBed.createComponent(TimelineGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── CREATION ───

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── ROW HEIGHT ───

  it('should have ROW_HEIGHT of 44', () => {
    expect(component.ROW_HEIGHT).toBe(44);
  });

  // ─── WORK CENTER ROWS ───

  it('should compute workCenterRows', () => {
    const rows = component.workCenterRows();
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should have workCenter and orders in each row', () => {
    const rows = component.workCenterRows();
    rows.forEach((row) => {
      expect(row.workCenter).toBeTruthy();
      expect(row.workCenter.docId).toBeTruthy();
      expect(row.orders).toBeTruthy();
      expect(row.orders.length).toBeGreaterThan(0);
    });
  });

  it('should filter out empty rows', () => {
    const rows = component.workCenterRows();
    rows.forEach((row) => {
      expect(row.orders.length).toBeGreaterThan(0);
    });
  });

  it('should update rows when status filter changes', () => {
    const allRows = component.workCenterRows();
    workOrderService.setStatusFilter('blocked');
    fixture.detectChanges();
    const filteredRows = component.workCenterRows();
    expect(filteredRows.length).toBeLessThanOrEqual(allRows.length);
  });

  it('should update rows when search query changes', () => {
    workOrderService.setSearchQuery('Extrusion');
    fixture.detectChanges();
    const rows = component.workCenterRows();
    rows.forEach((row) => {
      row.orders.forEach((order) => {
        expect(order.data.name.toLowerCase())
          .toContain('extrusion');
      });
    });
  });

  // ─── VISIBLE DATES ───

  it('should compute visibleDates', () => {
    const dates = component.visibleDates();
    expect(dates.length).toBeGreaterThan(0);
  });

  it('should have ~36 visible dates by default', () => {
    const dates = component.visibleDates();
    expect(dates.length).toBeGreaterThanOrEqual(34);
    expect(dates.length).toBeLessThanOrEqual(37);
  });

  // ─── MONTH GROUPS ───

  it('should compute monthGroups', () => {
    const groups = component.monthGroups();
    expect(groups.length).toBeGreaterThan(0);
  });

  it('should have label and span in each month group', () => {
    const groups = component.monthGroups();
    groups.forEach((g) => {
      expect(g.label).toBeTruthy();
      expect(g.span).toBeGreaterThan(0);
    });
  });

  it('should have spans that sum to visible dates count', () => {
    const groups = component.monthGroups();
    const totalSpan = groups.reduce((sum, g) => sum + g.span, 0);
    expect(totalSpan).toBe(component.visibleDates().length);
  });

  // ─── TODAY ───

  it('should compute todayOffset', () => {
    const offset = component.todayOffset();
    expect(typeof offset).toBe('number');
  });

  it('should have today visible in default range', () => {
    expect(component.isTodayVisible()).toBeTrue();
  });

  it('should hide today when navigated far away', () => {
    for (let i = 0; i < 10; i++) {
      timelineService.navigate('right');
    }
    fixture.detectChanges();
    expect(component.isTodayVisible()).toBeFalse();
  });

  // ─── isToday ───

  it('should return true for today', () => {
    const today = new Date();
    expect(component.isToday(today)).toBeTrue();
  });

  it('should return false for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(component.isToday(yesterday)).toBeFalse();
  });

  // ─── isWeekend ───

  it('should return true for Saturday', () => {
    const d = new Date();
    d.setDate(d.getDate() + (6 - d.getDay()));
    expect(component.isWeekend(d)).toBeTrue();
  });

  it('should return true for Sunday', () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()));
    expect(component.isWeekend(d)).toBeTrue();
  });

  it('should return false for Monday', () => {
    const d = new Date();
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
    expect(component.isWeekend(d)).toBeFalse();
  });

  // ─── formatDate ───

  it('should format date as string', () => {
    const d = new Date(2025, 5, 25);
    const result = component.formatDate(d);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should show day number in week zoom', () => {
    timelineService.setZoomLevel('week');
    const d = new Date(2025, 5, 25);
    const result = component.formatDate(d);
    expect(result).toBe('25');
  });

  it('should show day name in day zoom', () => {
    timelineService.setZoomLevel('day');
    const d = new Date(2025, 5, 25);
    const result = component.formatDate(d);
    expect(result).toContain('Wed');
  });

  // ─── getDayName ───

  it('should return single letter day name', () => {
    const d = new Date(2025, 5, 23);
    expect(component.getDayName(d)).toBe('M');
  });

  it('should return S for Sunday', () => {
    const d = new Date(2025, 5, 22);
    expect(component.getDayName(d)).toBe('S');
  });

  it('should return S for Saturday', () => {
    const d = new Date(2025, 5, 28);
    expect(component.getDayName(d)).toBe('S');
  });

  // ─── SELECTED WORK ORDER ───

  it('should have no selected work order initially', () => {
    expect(component.selectedWorkOrder).toBeNull();
  });

  it('should set selected work order on bar click', () => {
    const rows = component.workCenterRows();
    const order = rows[0].orders[0];
    component.onBarClicked(order);
    expect(component.selectedWorkOrder).toBe(order);
  });

  it('should clear selected work order on close', () => {
    const rows = component.workCenterRows();
    component.onBarClicked(rows[0].orders[0]);
    expect(component.selectedWorkOrder).toBeTruthy();

    component.closePanel();
    expect(component.selectedWorkOrder).toBeNull();
  });

  // ─── DOM RENDERING ───

  it('should render sidebar', () => {
    const el = fixture.nativeElement;
    const sidebar = el.querySelector('.sidebar');
    expect(sidebar).toBeTruthy();
  });

  it('should render sidebar rows', () => {
    const el = fixture.nativeElement;
    const rows = el.querySelectorAll('.sidebar-row');
    expect(rows.length).toBe(component.workCenterRows().length);
  });

  it('should render work center names', () => {
    const el = fixture.nativeElement;
    const names = el.querySelectorAll('.wc-name');
    expect(names.length).toBeGreaterThan(0);
    expect(names[0].textContent.trim()).toBeTruthy();
  });

  it('should render order counts', () => {
    const el = fixture.nativeElement;
    const counts = el.querySelectorAll('.wc-count');
    expect(counts.length).toBeGreaterThan(0);
    const firstCount = parseInt(counts[0].textContent.trim(), 10);
    expect(firstCount).toBeGreaterThan(0);
  });

  it('should render grid header', () => {
    const el = fixture.nativeElement;
    const header = el.querySelector('.grid-header');
    expect(header).toBeTruthy();
  });

  it('should render month cells', () => {
    const el = fixture.nativeElement;
    const monthCells = el.querySelectorAll('.month-cell');
    expect(monthCells.length).toBe(component.monthGroups().length);
  });

  it('should render day cells', () => {
    const el = fixture.nativeElement;
    const dayCells = el.querySelectorAll('.day-cell');
    expect(dayCells.length).toBe(component.visibleDates().length);
  });

  it('should render grid rows', () => {
    const el = fixture.nativeElement;
    const gridRows = el.querySelectorAll('.grid-row');
    expect(gridRows.length).toBe(component.workCenterRows().length);
  });

  it('should render today marker', () => {
    const el = fixture.nativeElement;
    const marker = el.querySelector('.today-marker');
    expect(marker).toBeTruthy();
  });

  it('should render column lines', () => {
    const el = fixture.nativeElement;
    const colLines = el.querySelectorAll('.col-line');
    expect(colLines.length).toBe(component.visibleDates().length);
  });

  // ─── ROW HEIGHT ───

  it('should apply ROW_HEIGHT to sidebar rows', () => {
    const el = fixture.nativeElement;
    const row = el.querySelector('.sidebar-row');
    expect(row.style.height).toBe('44px');
  });

  it('should apply ROW_HEIGHT to grid rows', () => {
    const el = fixture.nativeElement;
    const row = el.querySelector('.grid-row');
    expect(row.style.height).toBe('44px');
  });

  // ─── TOTAL WIDTH ───

  it('should set grid inner width', () => {
    const el = fixture.nativeElement;
    const inner = el.querySelector('.grid-inner');
    const expectedWidth = component.visibleDates().length
      * timelineService.pxPerDay();
    expect(inner.style.width).toBe(`${expectedWidth}px`);
  });

  // ─── ZOOM CHANGES ───

  it('should update grid when zoom changes', () => {
    const el = fixture.nativeElement;

    timelineService.setZoomLevel('day');
    fixture.detectChanges();
    const inner = el.querySelector('.grid-inner');
    const dayWidth = parseInt(inner.style.width, 10);

    timelineService.setZoomLevel('month');
    fixture.detectChanges();
    const monthWidth = parseInt(inner.style.width, 10);

    expect(dayWidth).toBeGreaterThan(monthWidth);
  });

  it('should update day cell widths on zoom change', () => {
    const el = fixture.nativeElement;

    timelineService.setZoomLevel('day');
    fixture.detectChanges();
    const dayCell = el.querySelector('.day-cell');
    expect(dayCell.style.width).toBe('80px');

    timelineService.setZoomLevel('week');
    fixture.detectChanges();
    expect(dayCell.style.width).toBe('40px');

    timelineService.setZoomLevel('month');
    fixture.detectChanges();
    expect(dayCell.style.width).toBe('12px');
  });

  // ─── NAVIGATION ───

  it('should update dates when navigating', () => {
    const datesBefore = component.visibleDates().map(
      (d) => d.getTime()
    );

    timelineService.navigate('right');
    fixture.detectChanges();

    const datesAfter = component.visibleDates().map(
      (d) => d.getTime()
    );
    expect(datesAfter[0]).toBeGreaterThan(datesBefore[0]);
  });

  it('should reset dates on goToToday', () => {
    timelineService.navigate('right');
    timelineService.navigate('right');
    fixture.detectChanges();

    timelineService.goToToday();
    fixture.detectChanges();

    expect(component.isTodayVisible()).toBeTrue();
  });

  // ─── WEEKEND COLUMNS ───

  it('should mark weekend day cells', () => {
    const el = fixture.nativeElement;
    const weekendCells = el.querySelectorAll('.day-cell.weekend');
    expect(weekendCells.length).toBeGreaterThan(0);
  });

  it('should mark weekend column lines', () => {
    const el = fixture.nativeElement;
    const weekendLines = el.querySelectorAll('.col-line.weekend');
    expect(weekendLines.length).toBeGreaterThan(0);
  });

  // ─── TODAY COLUMN ───

  it('should mark today day cell', () => {
    const el = fixture.nativeElement;
    const todayCell = el.querySelector('.day-cell.today');
    expect(todayCell).toBeTruthy();
  });
});
