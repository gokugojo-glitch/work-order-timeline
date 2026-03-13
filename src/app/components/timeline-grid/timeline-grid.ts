import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../services/timeline.service';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkOrderService } from '../../services/work-order.service';
import { WorkOrderDocument } from '../../models/work-order.model';
import {WorkOrderBarComponent} from '../work-order-bar/work-order-bar';
import { WorkOrderPanelComponent } from '../work-order-panel/work-order-panel';

@Component({
  selector: 'app-timeline-grid',
  standalone: true,
  imports: [CommonModule, WorkOrderBarComponent, WorkOrderPanelComponent],
  templateUrl: './timeline-grid.html',
  styleUrls: ['./timeline-grid.scss'],
})
/*
 * This is the largest and most important component. It renders the entire Gantt chart grid.
 * first it gets all work centers
 * get grouped orders map
 * combines into rows
 * filter out empty rows
 * includes some helper methods too!
 * sidebar renders work center names
 * grid renders bars for each work center rows
 * */
export class TimelineGridComponent {
  readonly timelineService = inject(TimelineService);
  readonly workCenterService = inject(WorkCenterService);
  readonly workOrderService = inject(WorkOrderService);

  selectedWorkOrder: WorkOrderDocument | null = null;

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

  readonly monthGroups = computed(() => {
    return this.timelineService.getMonthGroups();
  });

  readonly visibleDates = computed(() => {
    return this.timelineService.visibleDates();
  });

  readonly todayOffset = computed(() => {
    return this.timelineService.getTodayOffset();
  });
  /*
   * Should we show today line?*/
  readonly isTodayVisible = computed(() => {
    const offset = this.todayOffset();
    const totalWidth = this.timelineService.totalWidth();
    return offset >= 0 && offset <= totalWidth;
  });
  /*
  Highlights Today's column in blue
  */
  isToday(date: Date): boolean {
    return this.timelineService.isToday(date);
  }
  /*
   * Shades Saturday/Sunday columns grey
   * */
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
  /*
  * when the bar is clicked, stores the order and panel appears*/
  onBarClicked(order: WorkOrderDocument): void {
    this.selectedWorkOrder = order;
  }
  /*
  * when panel closes, its set to null and panel disappears*/
  closePanel(): void {
    this.selectedWorkOrder = null;
  }
}
