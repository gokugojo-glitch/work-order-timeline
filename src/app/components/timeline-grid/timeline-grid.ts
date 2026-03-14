import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../services/timeline.service';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderBarComponent } from '../work-order-bar/work-order-bar';
import { ContextMenuComponent } from '../context-menu/context-menu';
import { WorkOrderDocument } from '../../models/work-order.model';
import { WorkOrderPanelComponent, PanelMode } from '../work-order-panel/work-order-panel';

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [
    CommonModule,
    WorkOrderBarComponent,
    WorkOrderPanelComponent,
    ContextMenuComponent,
  ],
  templateUrl: './timeline-grid.html',
  styleUrls: ['./timeline-grid.scss'],
})
export class TimelineGridComponent {
  readonly timelineService = inject(TimelineService);
  readonly workCenterService = inject(WorkCenterService);
  readonly workOrderService = inject(WorkOrderService);

  // ─── View Panel ───
  selectedWorkOrder = signal<WorkOrderDocument | null>(null);
  panelMode = signal<PanelMode>('view');

  // ─── Context Menu State ───
  contextMenuVisible = signal(false);
  contextMenuX = signal(0);
  contextMenuY = signal(0);
  contextMenuOrder = signal<WorkOrderDocument | null>(null);

  // ─── Edit Dialog State ───
  // (Removed - now uses right panel)

  // ─── Create State ───
  hoveredRowId = signal('');
  createButtonVisible = signal(false);
  createButtonX = signal(0);
  createButtonY = signal(0);
  createButtonRowId = signal('');

  readonly ROW_HEIGHT = 44;

  // ─── Computed Data ───
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

  // ─── Helper Methods ───
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
    this.selectedWorkOrder.set(order);
    this.panelMode.set('view');
  }

  closePanel(): void {
    this.selectedWorkOrder.set(null);
  }

  // ─── Menu Button Click → Context Menu ───
  onBarMenuClick(event: MouseEvent, order: WorkOrderDocument): void {
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

  // ─── Context Menu → Edit ───
  onContextEdit(): void {
    const order = this.contextMenuOrder();
    if (order) {
      this.selectedWorkOrder.set({ ...order });
      this.panelMode.set('edit');
    }
    this.closeContextMenu();
  }

  // ─── Context Menu → Delete ───
  onContextDelete(): void {
    const order = this.contextMenuOrder();
    if (order) {
      if (confirm(`Delete "${order.data.name}"?`)) {
        this.workOrderService.deleteWorkOrder(order.docId);
        if (this.selectedWorkOrder()?.docId === order.docId) {
          this.selectedWorkOrder.set(null);
        }
      }
    }
    this.closeContextMenu();
  }

  // ─── Panel Actions ───
  onOrderSaved(updated: WorkOrderDocument): void {
    // Refresh selectedWorkOrder from service to ensure UI updates
    const refreshed = this.workOrderService.getWorkOrderById(updated.docId) || updated;
    this.selectedWorkOrder.set(refreshed);
    this.panelMode.set('view');
  }

  // ─── Grid Interactions ───
  onEmptySpaceClick(workCenterId: string, event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // If clicking on work order bar or menu button, ignore
    if (target.closest('app-work-order-bar') || target.closest('.create-order-btn')) {
      return;
    }

    // Stop propagation to prevent onGridClick from hiding the button immediately
    event.stopPropagation();

    // Get click position relative to the row
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Show the create button at click position
    this.selectedWorkOrder.set(null);
    this.createButtonVisible.set(true);
    this.createButtonX.set(clickX);
    this.createButtonY.set(clickY);
    this.createButtonRowId.set(workCenterId);
  }

  // ─── Close context menu and create button on outside click ───
  onGridClick(): void {
    if (this.contextMenuVisible()) {
      this.closeContextMenu();
    }
    // Also hide create button when clicking elsewhere
    if (this.createButtonVisible()) {
      this.createButtonVisible.set(false);
    }
  }

  // ─── Hover ───
  onRowMouseEnter(workCenterId: string): void {
    this.hoveredRowId.set(workCenterId);
  }

  onRowMouseLeave(): void {
    this.hoveredRowId.set('');
  }

  // ─── Create via button ───
  onCreateNew(event: Event, workCenterId: string): void {
    event.stopPropagation(); // Prevent triggering row click

    // Create a skeleton order to pass to the panel
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    this.selectedWorkOrder.set({
      docId: '',
      docType: 'workOrder',
      data: {
        name: '',
        workCenterId: workCenterId,
        status: 'open',
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
      },
    });

    this.panelMode.set('create');
    this.createButtonVisible.set(false);
  }
}
