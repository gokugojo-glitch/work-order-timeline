import { Component, inject, input, output, computed, signal, OnInit } from '@angular/core';
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

export type PanelMode = 'view' | 'edit' | 'create';

@Component({
  selector: 'app-work-order-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-order-panel.html',
  styleUrls: ['./work-order-panel.scss'],
})
export class WorkOrderPanelComponent implements OnInit {
  private readonly wcService = inject(WorkCenterService);
  private readonly woService = inject(WorkOrderService);

  readonly workOrder = input.required<WorkOrderDocument>();
  readonly panelMode = input<PanelMode>('view');
  readonly closePanel = output<void>();
  readonly orderSaved = output<WorkOrderDocument>();
  readonly orderDeleted = output<string>();

  readonly statusOptions = STATUS_OPTIONS;
  readonly workCenters = this.wcService.allWorkCenters;

  mode = signal<PanelMode>('view');

  // Track the current work order reactively from the service
  readonly currentWorkOrder = computed(() => {
    const inputOrder = this.workOrder();
    // In view mode, fetch from service to get latest data
    if (this.mode() === 'view') {
      return this.woService.getWorkOrderById(inputOrder.docId) || inputOrder;
    }
    return inputOrder;
  });

  // Form fields
  formName = '';
  formWorkCenterId = '';
  formStatus: WorkOrderStatus = 'open';
  formStartDate = '';
  formEndDate = '';

  // ─── Computed (View Mode) ───

  readonly workCenterName = computed(() =>
    this.wcService.getWorkCenterName(this.currentWorkOrder().data.workCenterId),
  );

  readonly statusColors = computed(() => STATUS_COLOR_MAP[this.currentWorkOrder().data.status]);

  readonly statusLabel = computed(() => {
    const found = STATUS_OPTIONS.find((s) => s.value === this.currentWorkOrder().data.status);
    return found ? found.label : this.currentWorkOrder().data.status;
  });

  readonly formattedStart = computed(() => this.formatDate(this.currentWorkOrder().data.startDate));

  readonly formattedEnd = computed(() => this.formatDate(this.currentWorkOrder().data.endDate));

  readonly duration = computed(() => {
    const s = this.mode() === 'view' ? this.currentWorkOrder().data.startDate : this.formStartDate;
    const e = this.mode() === 'view' ? this.currentWorkOrder().data.endDate : this.formEndDate;
    if (!s || !e) return 0;
    const start = new Date(s + 'T00:00:00');
    const end = new Date(e + 'T00:00:00');
    const diff = end.getTime() - start.getTime();
    return Math.max(Math.round(diff / 86400000) + 1, 0);
  });

  readonly dateError = computed(
    () => !!(this.formStartDate && this.formEndDate && this.formStartDate > this.formEndDate),
  );

  readonly isFormValid = computed(
    () =>
      !!(
        this.formName.trim() &&
        this.formWorkCenterId &&
        this.formStartDate &&
        this.formEndDate &&
        !this.dateError()
      ),
  );

  // ─── Lifecycle ───

  ngOnInit(): void {
    this.mode.set(this.panelMode());
    if (this.mode() === 'edit') {
      this.populateForm();
    } else if (this.mode() === 'create') {
      this.initCreateForm();
    }
  }

  // ─── Form Helpers ───

  private populateForm(): void {
    const d = this.currentWorkOrder().data;
    this.formName = d.name;
    this.formWorkCenterId = d.workCenterId;
    this.formStatus = d.status;
    this.formStartDate = d.startDate;
    this.formEndDate = d.endDate;
  }

  private initCreateForm(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.formStartDate = today.toISOString().split('T')[0];
    const next = new Date(today);
    next.setDate(next.getDate() + 7);
    this.formEndDate = next.toISOString().split('T')[0];
    this.formStatus = 'open';
    this.formWorkCenterId = this.workCenters().length > 0 ? this.workCenters()[0].docId : '';
  }

  // ─── Actions ───

  onEdit(): void {
    this.populateForm();
    this.mode.set('edit');
  }

  onCancel(): void {
    if (this.panelMode() === 'create') {
      this.closePanel.emit();
    } else {
      this.mode.set('view');
    }
  }

  onSave(): void {
    if (!this.isFormValid()) return;

    const existing = this.currentWorkOrder();
    const order: WorkOrderDocument = {
      docId: this.mode() === 'create' ? `wo-${Date.now()}` : existing.docId,
      docType: 'workOrder',
      data: {
        name: this.formName.trim(),
        workCenterId: this.formWorkCenterId,
        status: this.formStatus,
        startDate: this.formStartDate,
        endDate: this.formEndDate,
      },
    };

    if (this.mode() === 'create') {
      this.woService.addWorkOrder(order);
    } else {
      this.woService.updateWorkOrder(order);
    }

    this.orderSaved.emit(order);
    this.mode.set('view');
  }

  onDelete(): void {
    const wo = this.currentWorkOrder();
    if (confirm(`Delete "${wo.data.name}"?`)) {
      this.woService.deleteWorkOrder(wo.docId);
      this.orderDeleted.emit(wo.docId);
      this.closePanel.emit();
    }
  }

  onStatusChipClick(status: WorkOrderStatus): void {
    if (this.mode() === 'view') {
      this.woService.updateWorkOrderStatus(this.currentWorkOrder().docId, status);
    } else {
      this.formStatus = status;
    }
  }

  close(): void {
    this.closePanel.emit();
  }

  // ─── Helpers ───

  private formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${m[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
}
