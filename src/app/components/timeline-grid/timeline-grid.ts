import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../services/timeline.service';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel';
import { WorkOrderDocument } from '../../models/work-order.model';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar';
import { ContextMenuComponent } from '../context-menu/context-menu';
import { WorkOrderDialogComponent } from '../work-order-dialog/work-order-dialog';

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [
    CommonModule,
    WorkOrderBarComponent,
    WorkOrderPanelComponent,
    ContextMenuComponent,
    WorkOrderDialogComponent,
  ],
  templateUrl: './timeline-grid.html',
  styleUrls: ['./timeline-grid.scss'],
})
export class TimelineGridComponent {
  readonly timelineService = inject(TimelineService);
  readonly workCenterService = inject(WorkCenterService);
  readonly workOrderService = inject(WorkOrderService);

  selectedWorkOrder: WorkOrderDocument | null = null;

  // ─── Context Menu State ───
  contextMenuVisible = signal(false);
  contextMenuX = signal(0);
  contextMenuY = signal(0);
  contextMenuOrder = signal<WorkOrderDocument | null>(null);

  // ─── Edit Dialog State ───
  editDialogVisible = signal(false);
  editingOrder = signal<WorkOrderDocument | null>(null);

  // ─── Create Dialog State ───
  createDialogVisible = signal(false);
  createForWorkCenterId = signal('');

  readonly ROW_HEIGHT = 44;

  readonly workCenterRows = computed(() => {
    const centers = this.workCenterService.allWorkCenters();
    const grouped = this.workOrderService.groupedByWorkCenter();

    return centers
      .map((wc) => ({
        workCenter: wc,
        orders: grouped.get(wc.docId) || [],
      }))
      .filter((row) => row.orders.length > 0);
  });

  readonly monthGroups = computed(() => this.timelineService.getMonthGroups());

  readonly visibleDates = computed(() => this.timelineService.visibleDates());

  readonly todayOffset = computed(() => this.timelineService.getTodayOffset());

  readonly isTodayVisible = computed(() => {
    const offset = this.todayOffset();
    const totalWidth = this.timelineService.totalWidth();
    return offset >= 0 && offset <= totalWidth;
  });

  isToday(date: Date): boolean {
    return this.timelineService.isToday(date);
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  formatDate(date: Date): string {
    return this.timelineService.formatHeaderDate(date, this.timelineService.zoomLevel());
  }

  getDayName(date: Date): string {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return days[date.getDay()];
  }

  // ─── Bar Click → Open Panel ───
  onBarClicked(order: WorkOrderDocument): void {
    this.selectedWorkOrder = order;
  }

  closePanel(): void {
    this.selectedWorkOrder = null;
  }

  // ─── Context Menu (Right-Click) ───
  onBarRightClick(event: MouseEvent, order: WorkOrderDocument): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuX.set(event.clientX);
    this.contextMenuY.set(event.clientY);
    this.contextMenuOrder.set(order);
    this.contextMenuVisible.set(true);
  }

  closeContextMenu(): void {
    this.contextMenuVisible.set(false);
    this.contextMenuOrder.set(null);
  }

  onContextEdit(): void {
    const order = this.contextMenuOrder();
    if (order) {
      this.editingOrder.set({ ...order });
      this.editDialogVisible.set(true);
    }
    this.closeContextMenu();
  }

  onContextDelete(): void {
    const order = this.contextMenuOrder();
    if (order) {
      if (confirm(`Delete "${order.data.name}"?`)) {
        this.workOrderService.deleteWorkOrder(order.docId);
        if (this.selectedWorkOrder?.docId === order.docId) {
          this.selectedWorkOrder = null;
        }
      }
    }
    this.closeContextMenu();
  }

  // ─── Edit Dialog ───
  onEditSave(updated: WorkOrderDocument): void {
    this.workOrderService.updateWorkOrder(updated);
    this.editDialogVisible.set(false);
    this.editingOrder.set(null);

    // Refresh panel if same order is selected
    if (this.selectedWorkOrder?.docId === updated.docId) {
      this.selectedWorkOrder = updated;
    }
  }

  onEditCancel(): void {
    this.editDialogVisible.set(false);
    this.editingOrder.set(null);
  }

  // ─── Create Dialog ───
  onCreateNew(workCenterId: string): void {
    this.createForWorkCenterId.set(workCenterId);
    this.createDialogVisible.set(true);
  }

  onCreateSave(newOrder: WorkOrderDocument): void {
    this.workOrderService.addWorkOrder(newOrder);
    this.createDialogVisible.set(false);
    this.createForWorkCenterId.set('');
  }

  onCreateCancel(): void {
    this.createDialogVisible.set(false);
    this.createForWorkCenterId.set('');
  }

  // ─── Close context menu on outside click ───
  onGridClick(): void {
    if (this.contextMenuVisible()) {
      this.closeContextMenu();
    }
  }
}
