import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  WorkOrderDocument,
  WorkOrderStatus,
  STATUS_OPTIONS,
  STATUS_COLOR_MAP,
} from '../../models/work-order.model';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkOrderService } from '../../services/work-order.service';

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-order-panel.html',
  styleUrls: ['./work-order-panel.scss'],
})
export class WorkOrderPanelComponent {
  private readonly workCenterService = inject(WorkCenterService);
  private readonly workOrderService = inject(WorkOrderService);

  readonly workOrder = input.required<WorkOrderDocument>();
  readonly closePanel = output<void>();

  readonly statusOptions = STATUS_OPTIONS;

  readonly workCenterName = computed(() => {
    return this.workCenterService.getWorkCenterName(
      this.workOrder().data.workCenterId
    );
  });

  readonly statusColors = computed(() => {
    return STATUS_COLOR_MAP[this.workOrder().data.status];
  });

  readonly statusLabel = computed(() => {
    const found = STATUS_OPTIONS.find(
      (s) => s.value === this.workOrder().data.status
    );
    return found ? found.label : this.workOrder().data.status;
  });

  readonly formattedStart = computed(() => {
    return this.formatDate(this.workOrder().data.startDate);
  });

  readonly formattedEnd = computed(() => {
    return this.formatDate(this.workOrder().data.endDate);
  });

  readonly duration = computed(() => {
    const start = new Date(this.workOrder().data.startDate + 'T00:00:00');
    const end = new Date(this.workOrder().data.endDate + 'T00:00:00');
    const diffMs = end.getTime() - start.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return days;
  });

  onStatusChange(newStatus: WorkOrderStatus): void {
    this.workOrderService.updateWorkOrderStatus(
      this.workOrder().docId,
      newStatus
    );
  }

  onDelete(): void {
    if (confirm(`Delete work order "${this.workOrder().data.name}"?`)) {
      this.workOrderService.deleteWorkOrder(this.workOrder().docId);
      this.closePanel.emit();
    }
  }

  close(): void {
    this.closePanel.emit();
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}
