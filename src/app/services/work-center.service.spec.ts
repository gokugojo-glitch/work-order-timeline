import { TestBed } from '@angular/core/testing';
import { WorkCenterService } from './work-center.service';
import { SupabaseService } from './supabase.service';
import { SAMPLE_WORK_CENTERS } from '../data/sample-data';

describe('WorkCenterService', () => {
  let service: WorkCenterService;
  let supabaseServiceMock: any;

  beforeEach(() => {
    supabaseServiceMock = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(false),
      client: {
        from: jasmine.createSpy('from').and.returnValue({
          select: jasmine.createSpy('select').and.returnValue({
            order: jasmine.createSpy('order').and.resolveTo({ data: [], error: null }),
          }),
          upsert: jasmine.createSpy('upsert').and.resolveTo({ error: null }),
          insert: jasmine.createSpy('insert').and.resolveTo({ error: null }),
        }),
        channel: jasmine.createSpy('channel').and.returnValue({
          on: jasmine.createSpy('on').and.returnValue({
            subscribe: jasmine.createSpy('subscribe'),
          }),
        }),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        WorkCenterService,
        { provide: SupabaseService, useValue: supabaseServiceMock },
      ],
    });
    service = TestBed.inject(WorkCenterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with sample data if Supabase is not configured', () => {
    expect(service.allWorkCenters().length).toBe(SAMPLE_WORK_CENTERS.length);
  });

  it('should get work center name by ID', () => {
    const wc = SAMPLE_WORK_CENTERS[0];
    expect(service.getWorkCenterName(wc.docId)).toBe(wc.data.name);
  });

  it('should return "Unknown" for non-existent ID', () => {
    expect(service.getWorkCenterName('non-existent')).toBe('Unknown');
  });

  it('should add a work center', () => {
    const initialCount = service.allWorkCenters().length;
    service.addWorkCenter('New Lab');
    expect(service.allWorkCenters().length).toBe(initialCount + 1);
    expect(service.allWorkCenters().some(wc => wc.data.name === 'New Lab')).toBeTrue();
  });
});
