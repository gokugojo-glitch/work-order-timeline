import { Injectable, signal, computed } from '@angular/core';
import { WorkCenterDocument } from '../models/work-center.model';
import { SAMPLE_WORK_CENTERS } from '../data/sample-data';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
/*
 * Stores work centers and provides lookups.
 * */
/*
* WorkCenterService
       │
       ├──► TimelineGridComponent
       │      uses allWorkCenters()
       │      to build sidebar rows
       │
       └──► WorkOrderPanelComponent
              uses getWorkCenterName('wc-2')
              to show "CNC Machine 1" in panel
* */
export class WorkCenterService {
  private readonly workCenters = signal<WorkCenterDocument[]>([]);
  private readonly useSupabase: boolean;

  constructor(private supabaseService: SupabaseService) {
    this.useSupabase = this.supabaseService.isConfigured();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.useSupabase) {
      await this.loadFromSupabase();
    } else {
      this.workCenters.set(SAMPLE_WORK_CENTERS);
    }
  }

  readonly allWorkCenters = computed(() => this.workCenters());

  getWorkCenterById(id: string): WorkCenterDocument | undefined {
    return this.workCenters().find((wc) => wc.docId === id);
  }

  getWorkCenterName(id: string): string {
    const wc = this.getWorkCenterById(id);
    return wc ? wc.data.name : 'Unknown';
  }

  /*
  * Can add work center CRUD without
   touching work order logic - the only reason why this is a separate service!
  * */
  addWorkCenter(name: string): void {
    const newId = `wc-${Date.now()}`;
    const newWc: WorkCenterDocument = {
      docId: newId,
      docType: 'workCenter',
      data: { name },
    };
    this.workCenters.update((centers) => [...centers, newWc]);
    this.persist();
  }

  // ─── Supabase Methods ───

  private async loadFromSupabase(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('work_centers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        this.workCenters.set(data);
      } else {
        // No data in Supabase, use sample data
        this.workCenters.set(SAMPLE_WORK_CENTERS);
        // Seed the database
        await this.seedSupabase();
      }
    } catch (error) {
      console.error('Failed to load work centers from Supabase:', error);
      this.workCenters.set(SAMPLE_WORK_CENTERS);
    }
  }

  private async seedSupabase(): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('work_centers')
        .insert(SAMPLE_WORK_CENTERS);

      if (error) throw error;
      console.log('Seeded Supabase with sample work centers');
    } catch (error) {
      console.error('Failed to seed Supabase:', error);
    }
  }

  private async persist(): Promise<void> {
    if (this.useSupabase) {
      await this.saveToSupabase();
    }
  }

  private async saveToSupabase(): Promise<void> {
    try {
      const centers = this.workCenters();
      const { error } = await this.supabaseService.client
        .from('work_centers')
        .upsert(centers, { onConflict: 'docId' });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save work centers to Supabase:', error);
    }
  }
}
