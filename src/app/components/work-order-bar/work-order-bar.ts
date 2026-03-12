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
export class WorkOrderBarComponent {
  private readonly timelineService = inject(TimelineService);

  readonly workOrder = input.required<WorkOrderDocument>();
  readonly barClicked = output<WorkOrderDocument>();

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

  onClick(): void {
    this.barClicked.emit(this.workOrder());
  }
}
