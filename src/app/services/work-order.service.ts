import { Injectable, signal, computed } from '@angular/core';
import {
  WorkOrderDocument,
  WorkOrderStatus,
} from '../models/work-order.model';
import { SAMPLE_WORK_ORDERS } from '../data/sample-data';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private readonly workOrders = signal<WorkOrderDocument[]>(SAMPLE_WORK_ORDERS);

  // Filter signals
  readonly statusFilter = signal<WorkOrderStatus | 'all'>('all');
  readonly searchQuery = signal<string>('');

  // All work orders
  readonly allWorkOrders = computed(() => this.workOrders());

  // Filtered work orders
  readonly filteredWorkOrders = computed(() => {
    let orders = this.workOrders();

    const status = this.statusFilter();
    if (status !== 'all') {
      orders = orders.filter((o) => o.data.status === status);
    }

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      orders = orders.filter((o) =>
        o.data.name.toLowerCase().includes(query)
      );
    }

    return orders;
  });

  // Group filtered work orders by work center ID
  readonly groupedByWorkCenter = computed(() => {
    const map = new Map<string, WorkOrderDocument[]>();
    for (const order of this.filteredWorkOrders()) {
      const wcId = order.data.workCenterId;
      if (!map.has(wcId)) {
        map.set(wcId, []);
      }
      map.get(wcId)!.push(order);
    }
    return map;
  });

  getOrdersByWorkCenter(workCenterId: string): WorkOrderDocument[] {
    return this.filteredWorkOrders().filter(
      (o) => o.data.workCenterId === workCenterId
    );
  }

  setStatusFilter(status: WorkOrderStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  updateWorkOrderStatus(docId: string, newStatus: WorkOrderStatus): void {
    this.workOrders.update((orders) =>
      orders.map((o) =>
        o.docId === docId
          ? {
            ...o,
            data: { ...o.data, status: newStatus },
          }
          : o
      )
    );
  }

  updateWorkOrderDates(
    docId: string,
    startDate: string,
    endDate: string
  ): void {
    this.workOrders.update((orders) =>
      orders.map((o) =>
        o.docId === docId
          ? {
            ...o,
            data: { ...o.data, startDate, endDate },
          }
          : o
      )
    );
  }

  addWorkOrder(order: WorkOrderDocument): void {
    this.workOrders.update((orders) => [...orders, order]);
  }

  deleteWorkOrder(docId: string): void {
    this.workOrders.update((orders) =>
      orders.filter((o) => o.docId !== docId)
    );
  }

  getWorkOrderById(docId: string): WorkOrderDocument | undefined {
    return this.workOrders().find((o) => o.docId === docId);
  }
}
