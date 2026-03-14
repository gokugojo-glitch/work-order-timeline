import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="context-menu" [style.left.px]="x()" [style.top.px]="y()">
      <button class="menu-item" (click)="edit.emit()">
        <span class="icon">✏️</span>
        <span>Edit</span>
      </button>
      <div class="divider"></div>
      <button class="menu-item delete" (click)="deleteItem.emit()">
        <span class="icon">🗑️</span>
        <span>Delete</span>
      </button>
    </div>
  `,
  styles: [
    `
      .context-menu {
        position: fixed;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        padding: 4px;
        min-width: 160px;
        z-index: 500;
        animation: fadeIn 0.1s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
      }
      .menu-item:hover {
        background: #f3f4f6;
      }
      .menu-item.delete {
        color: #dc2626;
      }
      .menu-item.delete:hover {
        background: #fef2f2;
      }
      .icon {
        font-size: 14px;
      }
      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 4px 0;
      }
    `,
  ],
})
export class ContextMenuComponent {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly edit = output<void>();
  readonly deleteItem = output<void>();
}
