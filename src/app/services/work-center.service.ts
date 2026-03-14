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
      await this.loadFromSupabase(true);
      this.subscribeToChanges();
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
    this.persist(newWc);
  }

  // ─── Supabase Methods ───

  private async loadFromSupabase(isInitial = false): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('work_centers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        this.workCenters.set(data);
      } else if (isInitial) {
        // No data in Supabase AND it's the initial load, use sample data
        this.workCenters.set(SAMPLE_WORK_CENTERS);
        await this.seedSupabase();
      } else {
        // Real-time update and table is empty, just update UI
        this.workCenters.set([]);
      }
    } catch (error) {
      console.error('Failed to load work centers from Supabase:', error);
      if (isInitial) {
        this.workCenters.set(SAMPLE_WORK_CENTERS);
      }
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

  private subscribeToChanges(): void {
    this.supabaseService.client
      .channel('work_centers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_centers' },
        async (payload) => {
          console.log('Work center change detected:', payload);
          await this.loadFromSupabase();
        }
      )
      .subscribe();
  }

  private async persist(centerToSave?: WorkCenterDocument, docIdToDelete?: string): Promise<void> {
    if (this.useSupabase) {
      if (docIdToDelete) {
        await this.removeFromSupabase(docIdToDelete);
      } else if (centerToSave) {
        await this.saveCenterToSupabase(centerToSave);
      } else {
        await this.saveToSupabase();
      }
    }
  }

  private async saveCenterToSupabase(center: WorkCenterDocument): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('work_centers')
        .upsert(center, { onConflict: 'docId' });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save work center to Supabase:', error);
    }
  }

  private async removeFromSupabase(docId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('work_centers')
        .delete()
        .eq('docId', docId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete work center from Supabase:', error);
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
