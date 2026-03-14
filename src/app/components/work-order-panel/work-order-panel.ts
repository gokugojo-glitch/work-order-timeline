import {
  Component,
  inject,
  input,
  output,
  computed,
  signal,
  OnInit,
  effect,
  untracked,
} from '@angular/core';
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
  formName = signal('');
  formWorkCenterId = signal('');
  formStatus = signal<WorkOrderStatus>('open');
  formStartDate = signal('');
  formEndDate = signal('');

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
    const s = this.mode() === 'view' ? this.currentWorkOrder().data.startDate : this.formStartDate();
    const e = this.mode() === 'view' ? this.currentWorkOrder().data.endDate : this.formEndDate();
    if (!s || !e) return 0;
    const start = new Date(s + 'T00:00:00');
    const end = new Date(e + 'T00:00:00');
    const diff = end.getTime() - start.getTime();
    return Math.max(Math.round(diff / 86400000) + 1, 0);
  });

  readonly dateError = computed(
    () => !!(this.formStartDate() && this.formEndDate() && this.formStartDate() > this.formEndDate()),
  );

  readonly isFormValid = computed(
    () =>
      !!(
        this.formName().trim() &&
        this.formWorkCenterId() &&
        this.formStartDate() &&
        this.formEndDate() &&
        !this.dateError()
      ),
  );

  // ─── Lifecycle ───

  constructor() {
    // Re-populate form when workOrder changes or panelMode input changes
    effect(() => {
      const inputMode = this.panelMode();
      // Track workOrder() to re-run when it changes
      this.workOrder();

      // We use untracked to allow writing to the internal 'mode' signal
      // and other form properties without triggering infinite loops
      untracked(() => {
        this.mode.set(inputMode);
        if (inputMode === 'edit') {
          this.populateForm();
        } else if (inputMode === 'create') {
          this.initCreateForm();
        }
      });
    });
  }

  ngOnInit(): void {
    // Initial population is handled by effects
  }

  // ─── Form Helpers ───

  private populateForm(): void {
    const d = this.currentWorkOrder().data;
    this.formName.set(d.name);
    this.formWorkCenterId.set(d.workCenterId);
    this.formStatus.set(d.status);
    this.formStartDate.set(d.startDate);
    this.formEndDate.set(d.endDate);
  }

  private initCreateForm(): void {
    const initial = this.workOrder();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.formName.set(initial.data.name || '');
    this.formStatus.set(initial.data.status || 'open');
    this.formStartDate.set(initial.data.startDate || today.toISOString().split('T')[0]);

    if (initial.data.endDate) {
      this.formEndDate.set(initial.data.endDate);
    } else {
      const next = new Date(this.formStartDate() + 'T00:00:00');
      next.setDate(next.getDate() + 7);
      this.formEndDate.set(next.toISOString().split('T')[0]);
    }

    this.formWorkCenterId.set(
      initial.data.workCenterId ||
      (this.workCenters().length > 0 ? this.workCenters()[0].docId : ''),
    );
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
        name: this.formName().trim(),
        workCenterId: this.formWorkCenterId(),
        status: this.formStatus(),
        startDate: this.formStartDate(),
        endDate: this.formEndDate(),
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
      this.formStatus.set(status);
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
