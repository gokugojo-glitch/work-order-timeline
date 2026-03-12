import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimescaleSelectorComponent } from './timescale-selector';
import { TimelineService } from '../../services/timeline.service';

describe('TimescaleSelectorComponent', () => {
  let component: TimescaleSelectorComponent;
  let fixture: ComponentFixture<TimescaleSelectorComponent>;
  let timelineService: TimelineService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimescaleSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimescaleSelectorComponent);
    component = fixture.componentInstance;
    timelineService = TestBed.inject(TimelineService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 3 zoom options', () => {
    expect(component.zoomOptions.length).toBe(3);
    expect(component.zoomOptions.map(o => o.value))
      .toEqual(['day', 'week', 'month']);
  });

  it('should call setZoomLevel on service when setZoom is called', () => {
    spyOn(timelineService, 'setZoomLevel');
    component.setZoom('day');
    expect(timelineService.setZoomLevel)
      .toHaveBeenCalledWith('day');
  });

  it('should call navigate on service when navigate is called', () => {
    spyOn(timelineService, 'navigate');
    component.navigate('left');
    expect(timelineService.navigate)
      .toHaveBeenCalledWith('left');
  });

  it('should call navigate right on service', () => {
    spyOn(timelineService, 'navigate');
    component.navigate('right');
    expect(timelineService.navigate)
      .toHaveBeenCalledWith('right');
  });

  it('should call goToToday on service', () => {
    spyOn(timelineService, 'goToToday');
    component.goToToday();
    expect(timelineService.goToToday)
      .toHaveBeenCalled();
  });

  it('should render navigation buttons', () => {
    const el = fixture.nativeElement;
    const navBtns = el.querySelectorAll('.nav-btn');
    expect(navBtns.length).toBe(2);
  });

  it('should render today button', () => {
    const el = fixture.nativeElement;
    const todayBtn = el.querySelector('.today-btn');
    expect(todayBtn).toBeTruthy();
    expect(todayBtn.textContent.trim()).toBe('Today');
  });

  it('should render zoom buttons', () => {
    const el = fixture.nativeElement;
    const zoomBtns = el.querySelectorAll('.zoom-btn');
    expect(zoomBtns.length).toBe(3);
  });

  it('should mark active zoom button', () => {
    // Default zoom is "week"
    const el = fixture.nativeElement;
    const zoomBtns = el.querySelectorAll('.zoom-btn');
    const activeBtn = el.querySelector('.zoom-btn.active');
    expect(activeBtn.textContent.trim()).toBe('Week');
  });

  it('should update active zoom when clicked', () => {
    const el = fixture.nativeElement;
    const zoomBtns = el.querySelectorAll('.zoom-btn');

    // Click "Day" button (first one)
    zoomBtns[0].click();
    fixture.detectChanges();

    const activeBtn = el.querySelector('.zoom-btn.active');
    expect(activeBtn.textContent.trim()).toBe('Day');
    expect(timelineService.zoomLevel()).toBe('day');
  });

  it('should change pxPerDay when zoom changes', () => {
    component.setZoom('day');
    expect(timelineService.pxPerDay()).toBe(80);

    component.setZoom('week');
    expect(timelineService.pxPerDay()).toBe(40);

    component.setZoom('month');
    expect(timelineService.pxPerDay()).toBe(12);
  });

  it('should shift range when navigating left', () => {
    const startBefore = new Date(timelineService.rangeStart());
    component.navigate('left');
    const startAfter = new Date(timelineService.rangeStart());

    const diffDays = Math.round(
      (startBefore.getTime() - startAfter.getTime())
      / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBe(7);
  });

  it('should shift range when navigating right', () => {
    const startBefore = new Date(timelineService.rangeStart());
    component.navigate('right');
    const startAfter = new Date(timelineService.rangeStart());

    const diffDays = Math.round(
      (startAfter.getTime() - startBefore.getTime())
      / (1000 * 60 * 60 * 24)
    );
    expect(diffDays).toBe(7);
  });

  it('should reset range on goToToday', () => {
    // Navigate away first
    component.navigate('right');
    component.navigate('right');
    const shiftedStart = new Date(timelineService.rangeStart());

    // Reset
    component.goToToday();
    const resetStart = new Date(timelineService.rangeStart());

    expect(resetStart.getTime())
      .not.toBe(shiftedStart.getTime());
  });
});
