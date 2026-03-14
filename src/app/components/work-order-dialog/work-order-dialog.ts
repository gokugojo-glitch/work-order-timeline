import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkOrderDocument, WorkOrderStatus, STATUS_OPTIONS } from '../../models/work-order.model';
import { WorkCenterService } from '../../services/work-center.service';

@Component({
  selector: 'app-work-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-order-dialog.html',
  styleUrls: ['./work-order-dialog.scss'],
})
export class WorkOrderDialogComponent implements OnInit {
  private readonly workCenterService = inject(WorkCenterService);

  // null = create mode, non-null = edit mode
  readonly workOrder = input<WorkOrderDocument | null>(null);
  readonly preselectedWorkCenterId = input<string>('');

  readonly save = output<WorkOrderDocument>();
  readonly cancel = output<void>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly workCenters = this.workCenterService.allWorkCenters;

  // Form fields
  name = '';
  workCenterId = '';
  status: WorkOrderStatus = 'open';
  startDate = '';
  endDate = '';

  get isEditMode(): boolean {
    return this.workOrder() !== null;
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Edit Work Order' : 'Create Work Order';
  }

  get isValid(): boolean {
    return !!(
      this.name.trim() &&
      this.workCenterId &&
      this.startDate &&
      this.endDate &&
      this.startDate <= this.endDate
    );
  }

  get dateError(): boolean {
    return !!(this.startDate && this.endDate && this.startDate > this.endDate);
  }

  ngOnInit(): void {
    const wo = this.workOrder();
    if (wo) {
      // Edit mode — populate from existing order
      this.name = wo.data.name;
      this.workCenterId = wo.data.workCenterId;
      this.status = wo.data.status;
      this.startDate = wo.data.startDate;
      this.endDate = wo.data.endDate;
    } else {
      // Create mode — set defaults
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.startDate = today.toISOString().split('T')[0];

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      this.endDate = nextWeek.toISOString().split('T')[0];

      // Use preselected work center or first available
      const preselected = this.preselectedWorkCenterId();
      if (preselected) {
        this.workCenterId = preselected;
      } else if (this.workCenters().length > 0) {
        this.workCenterId = this.workCenters()[0].docId;
      }
    }
  }

  onSave(): void {
    if (!this.isValid) return;

    const existing = this.workOrder();
    const order: WorkOrderDocument = {
      docId: existing ? existing.docId : `wo-${Date.now()}`,
      docType: 'workOrder',
      data: {
        name: this.name.trim(),
        workCenterId: this.workCenterId,
        status: this.status,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    };

    this.save.emit(order);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    // Close only if clicking the overlay itself
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
