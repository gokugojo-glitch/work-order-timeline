import { Injectable, signal, computed } from '@angular/core';
import { WorkCenterDocument } from '../models/work-center.model';
import { SAMPLE_WORK_CENTERS } from '../data/sample-data';

@Injectable({
  providedIn: 'root',
})
export class WorkCenterService {
  private readonly workCenters = signal<WorkCenterDocument[]>(SAMPLE_WORK_CENTERS);

  readonly allWorkCenters = computed(() => this.workCenters());

  getWorkCenterById(id: string): WorkCenterDocument | undefined {
    return this.workCenters().find((wc) => wc.docId === id);
  }

  getWorkCenterName(id: string): string {
    const wc = this.getWorkCenterById(id);
    return wc ? wc.data.name : 'Unknown';
  }

  addWorkCenter(name: string): void {
    const newId = `wc-${Date.now()}`;
    const newWc: WorkCenterDocument = {
      docId: newId,
      docType: 'workCenter',
      data: { name },
    };
    this.workCenters.update((centers) => [...centers, newWc]);
  }
}
