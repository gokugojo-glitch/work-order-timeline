import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineService } from '../../services/timeline.service';
import { ZoomLevel } from '../../models/work-order.model';

@Component({
  selector: 'app-timescale-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timescale-selector.html',
  styleUrls: ['./timescale-selector.scss'],
})
export class TimescaleSelectorComponent {
  readonly timelineService = inject(TimelineService);

  readonly zoomOptions: { label: string; value: ZoomLevel }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  setZoom(level: ZoomLevel): void {
    this.timelineService.setZoomLevel(level);
  }

  navigate(direction: 'left' | 'right'): void {
    this.timelineService.navigate(direction);
  }

  goToToday(): void {
    this.timelineService.goToToday();
  }
}
