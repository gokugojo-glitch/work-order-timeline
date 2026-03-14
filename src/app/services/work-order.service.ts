import { Injectable, signal, computed, effect } from '@angular/core';
import {
  WorkOrderDocument,
  WorkOrderStatus,
} from '../models/work-order.model';
import { SAMPLE_WORK_ORDERS } from '../data/sample-data';
import { SupabaseService } from './supabase.service';
import { WorkCenterService } from './work-center.service';

@Injectable({
  providedIn: 'root',
})
/*
 * Stores all work orders in a signal
 * Filters them by status and search query
 * Groups them by work center for the grid
 * No Manual subscriptions. No ngOnChanges! Signals handle everything reactively!
 */
export class WorkOrderService {
  private readonly STORAGE_KEY = 'workOrders';
  private readonly workOrders = signal<WorkOrderDocument[]>([]);
  private readonly useSupabase: boolean;

  constructor(
    private supabaseService: SupabaseService,
    private workCenterService: WorkCenterService,
  ) {
    this.useSupabase = this.supabaseService.isConfigured();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.useSupabase) {
      await this.loadFromSupabase(true);
      this.subscribeToChanges();
    } else {
      this.workOrders.set(this.loadFromStorage());
    }
  }

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
      orders = orders.filter((o) => {
        const orderNameMatches = o.data.name.toLowerCase().includes(query);
        const workCenterName = this.workCenterService
          .getWorkCenterName(o.data.workCenterId)
          .toLowerCase();
        const workCenterMatches = workCenterName.includes(query);
        return orderNameMatches || workCenterMatches;
      });
    }
    return orders;
  });
  /*
   * Group filtered work orders by work center ID
   * The timeline grid uses this map to render rows
   * */
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
  /*
   * if at all we need to get orders based on Work Center
   * */
  getOrdersByWorkCenter(workCenterId: string): WorkOrderDocument[] {
    return this.filteredWorkOrders().filter((o) => o.data.workCenterId === workCenterId);
  }

  setStatusFilter(status: WorkOrderStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }
  // immutable updates
  updateWorkOrderStatus(docId: string, newStatus: WorkOrderStatus): void {
    let updatedOrder: WorkOrderDocument | undefined;
    this.workOrders.update((orders) =>
      orders.map((o) => {
        if (o.docId === docId) {
          updatedOrder = {
            ...o,
            data: { ...o.data, status: newStatus },
          };
          return updatedOrder;
        }
        return o;
      }),
    );
    if (updatedOrder) {
      this.persist(updatedOrder);
    }
  }
  // immutable updates
  updateWorkOrderDates(docId: string, startDate: string, endDate: string): void {
    let updatedOrder: WorkOrderDocument | undefined;
    this.workOrders.update((orders) =>
      orders.map((o) => {
        if (o.docId === docId) {
          updatedOrder = {
            ...o,
            data: { ...o.data, startDate, endDate },
          };
          return updatedOrder;
        }
        return o;
      }),
    );
    if (updatedOrder) {
      this.persist(updatedOrder);
    }
  }
  // another mutation method, appends new order
  addWorkOrder(order: WorkOrderDocument): void {
    this.workOrders.update((orders) => [...orders, order]);
    this.persist(order);
  }
  // another mutation method, deletes order by ID
  deleteWorkOrder(docId: string): void {
    this.workOrders.update((orders) => orders.filter((o) => o.docId !== docId));
    this.persist(undefined, docId);
  }

  getWorkOrderById(docId: string): WorkOrderDocument | undefined {
    return this.workOrders().find((o) => o.docId === docId);
  }

  updateWorkOrder(updated: WorkOrderDocument): void {
    this.workOrders.update((orders) =>
      orders.map((o) =>
        o.docId === updated.docId ? updated : o
      )
    );
    this.persist(updated);
  }

  // ─── Supabase Methods ───

  private async loadFromSupabase(isInitial = false): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        this.workOrders.set(data);
      } else if (isInitial) {
        // No data in Supabase AND it's the initial load, use sample data
        this.workOrders.set(SAMPLE_WORK_ORDERS);
        await this.seedSupabase();
      } else {
        // Real-time update and table is empty, just update UI
        this.workOrders.set([]);
      }
    } catch (error) {
      console.error('Failed to load work orders from Supabase:', error);
      if (isInitial) {
        this.workOrders.set(SAMPLE_WORK_ORDERS);
      }
    }
  }

  private async seedSupabase(): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('work_orders')
        .insert(SAMPLE_WORK_ORDERS);

      if (error) throw error;
      console.log('Seeded Supabase with sample work orders');
    } catch (error) {
      console.error('Failed to seed Supabase:', error);
    }
  }

  private subscribeToChanges(): void {
    this.supabaseService.client
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        async (payload) => {
          console.log('Work order change detected:', payload);
          await this.loadFromSupabase();
        }
      )
      .subscribe();
  }

  private async persist(orderToSave?: WorkOrderDocument, docIdToDelete?: string): Promise<void> {
    if (this.useSupabase) {
      if (docIdToDelete) {
        await this.removeFromSupabase(docIdToDelete);
      } else if (orderToSave) {
        await this.saveOrderToSupabase(orderToSave);
      } else {
        await this.saveToSupabase();
      }
    } else {
      this.saveToStorage();
    }
  }

  private async saveOrderToSupabase(order: WorkOrderDocument): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('work_orders')
        .upsert(order, { onConflict: 'docId' });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save work order to Supabase:', error);
    }
  }

  private async removeFromSupabase(docId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('work_orders')
        .delete()
        .eq('docId', docId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete work order from Supabase:', error);
    }
  }

  private async saveToSupabase(): Promise<void> {
    try {
      const orders = this.workOrders();

      // Upsert all orders
      const { error } = await this.supabaseService.client
        .from('work_orders')
        .upsert(orders, { onConflict: 'docId' });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save work orders to Supabase:', error);
    }
  }

  // ─── LocalStorage Methods (Fallback) ───

  private loadFromStorage(): WorkOrderDocument[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load work orders from storage:', error);
    }
    return SAMPLE_WORK_ORDERS;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.workOrders()));
    } catch (error) {
      console.error('Failed to save work orders to storage:', error);
    }
  }
}
