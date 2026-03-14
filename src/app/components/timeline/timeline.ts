import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderStatus, STATUS_OPTIONS } from '../../models/work-order.model';
import {TimescaleSelectorComponent} from '../timescale-selector/timescale-selector';
import {TimelineGridComponent} from '../timeline-grid/timeline-grid';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, TimescaleSelectorComponent, TimelineGridComponent],
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.scss'],
})
/*
 * This is the top-level container that assembles everything.
 * */
export class TimelineComponent {
  readonly workOrderService = inject(WorkOrderService);
  readonly statusOptions = STATUS_OPTIONS;

  searchQuery = '';
  // search box
  onSearchChange(query: string): void {
    this.workOrderService.setSearchQuery(query);
  }
  // status filters
  onStatusFilter(status: WorkOrderStatus | 'all'): void {
    this.workOrderService.setStatusFilter(status);
  }
}
