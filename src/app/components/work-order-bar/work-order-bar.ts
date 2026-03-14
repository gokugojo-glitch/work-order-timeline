import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrderDocument, STATUS_COLOR_MAP } from '../../models/work-order.model';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-work-order-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './work-order-bar.html',
  styleUrls: ['./work-order-bar.scss'],
})
/*
 * Each Bar is like one work order*/
export class WorkOrderBarComponent {
  private readonly timelineService = inject(TimelineService);
  readonly workOrder = input.required<WorkOrderDocument>();
  readonly barClicked = output<WorkOrderDocument>();
  readonly barRightClicked = output<{
    event: MouseEvent;
    order: WorkOrderDocument;
  }>();
  /*
* This single computed does 4 things:
* LEFT position → where bar starts
   startDate='2025-06-25', rangeStart='2025-06-11'
   diff = 14 days × 40px = 560px from left
* WIDTH → how wide the bar is
   start='June 25', end='June 28'
   diff = 3+1 = 4 days × 40px = 160px wide
* BACKGROUND → light status color
   'in-progress' → #EAE4FF (light purple)
* LEFT BORDER → bold status color
   'in-progress' → 3px solid #7B61FF (purple)
*/
  readonly barStyle = computed(() => {
    const wo = this.workOrder();
    const left = this.timelineService.getDateOffset(wo.data.startDate);
    const width = this.timelineService.getDateWidth(wo.data.startDate, wo.data.endDate);
    const colors = STATUS_COLOR_MAP[wo.data.status];

    return {
      left: `${left}px`,
      width: `${width}px`,
      backgroundColor: colors.bgColor,
      borderLeft: `3px solid ${colors.color}`,
    };
  });

  readonly statusColor = computed(() => {
    return STATUS_COLOR_MAP[this.workOrder().data.status].color;
  });

  readonly statusLabel = computed(() => {
    const status = this.workOrder().data.status;
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'complete':
        return 'Complete';
      case 'blocked':
        return 'Blocked';
      default:
        return status;
    }
  });

  readonly showLabel = computed(() => {
    const wo = this.workOrder();
    const width = this.timelineService.getDateWidth(wo.data.startDate, wo.data.endDate);
    return width > 60;
  });
  // when user clicks the bar, emits the work order --> parent(TimelineGridComponent) receives it --> Opens the detail panel
  onClick(): void {
    this.barClicked.emit(this.workOrder());
  }
  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.barRightClicked.emit({
      event,
      order: this.workOrder(),
    });
  }
}
