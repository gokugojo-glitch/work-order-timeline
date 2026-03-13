import { Injectable, signal, computed } from '@angular/core';
import { ZoomLevel } from '../models/work-order.model';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
/*
*
 Data Flow Summary
 User changes zoom
│
▼
  zoomLevel signal updates
│
▼
  pxPerDay recomputes (80/40/28)
│
├──► totalWidth recomputes
│
├──► Every bar recalculates
│    left position & width
│
├──► Grid columns resize
│
└──► Today marker repositions
*
*/
  // Zoom level signal
  readonly zoomLevel = signal<ZoomLevel>('week');

  // The visible date range
  readonly rangeStart = signal<Date>(this.getDefaultStart());
  readonly rangeEnd = signal<Date>(this.getDefaultEnd());

  // Pixels per day based on zoom
  readonly pxPerDay = computed<number>(() => {
    switch (this.zoomLevel()) {
      case 'day':
        return 80;
      case 'week':
        return 40;
      case 'month':
        return 27;
      default:
        return 40;
    }
  });

  // Generate all dates in the visible range
  readonly visibleDates = computed<Date[]>(() => {
    const dates: Date[] = [];
    const start = new Date(this.rangeStart());
    const end = new Date(this.rangeEnd());
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  });

  // Total width of the timeline in pixels
  readonly totalWidth = computed<number>(() => {
    return this.visibleDates().length * this.pxPerDay();
  });

  private getDefaultStart(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 14);
    console.log("Default Start: " + d);
    return d;
  }

  private getDefaultEnd(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 21);
    console.log("Default End: " + d);
    return d;
  }

  setZoomLevel(level: ZoomLevel): void {
    this.zoomLevel.set(level);
  }

  /**
   * Returns the left offset in pixels for a given date, This tells each bar where to start
   */
  getDateOffset(dateStr: string): number {
    const date = new Date(dateStr + 'T00:00:00');
    const start = this.rangeStart();
    const diffMs = date.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays * this.pxPerDay();
  }

  /**
   * Returns the width in pixels between two dates, This tells each bar how wide to be
   */
  getDateWidth(startDateStr: string, endDateStr: string): number {
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1; // inclusive
    return Math.max(diffDays * this.pxPerDay(), this.pxPerDay());
  }

  /**
   * Checks if a date is today
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Returns the offset of today's marker, Returns pixel position of the red vertical "today" line, centered in today's column cell.
   */
  getTodayOffset(): number {
    const today = new Date();
    const fmt = today.toISOString().split('T')[0];
    return this.getDateOffset(fmt) + this.pxPerDay() / 2;
  }

  /**
   * Navigate timeline left (shifts range 7 days back) / right (shifts range 7 days forward)
   */
  navigate(direction: 'left' | 'right'): void {
    const shift = direction === 'left' ? -7 : 7;
    const newStart = new Date(this.rangeStart());
    const newEnd = new Date(this.rangeEnd());
    newStart.setDate(newStart.getDate() + shift);
    newEnd.setDate(newEnd.getDate() + shift);
    this.rangeStart.set(newStart);
    this.rangeEnd.set(newEnd);
  }

  /**
   * Jump to today
   */
  goToToday(): void {
    this.rangeStart.set(this.getDefaultStart());
    this.rangeEnd.set(this.getDefaultEnd());
  }

  /**
   * Format date for header display
   */
  formatHeaderDate(date: Date, level: ZoomLevel): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    switch (level) {
      case 'day':
        return `${days[date.getDay()]} ${date.getDate()}`;
      case 'week':
        return `${date.getDate()}`;
      case 'month':
        return `${months[date.getMonth()]} ${date.getDate()}`;
      default:
        return `${date.getDate()}`;
    }
  }

  /**
   * Get month-year groups for top header row, Groups consecutive dates by month for the top header row
   */
  getMonthGroups(): { label: string; span: number }[] {
    const dates = this.visibleDates();
    const groups: { label: string; span: number }[] = [];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    let currentLabel = '';
    let currentSpan = 0;

    for (const date of dates) {
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (label === currentLabel) {
        currentSpan++;
      } else {
        if (currentLabel) {
          groups.push({ label: currentLabel, span: currentSpan });
        }
        currentLabel = label;
        currentSpan = 1;
      }
    }

    if (currentLabel) {
      groups.push({ label: currentLabel, span: currentSpan });
    }

    return groups;
  }
}
