import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderDialog } from './work-order-dialog';

describe('WorkOrderDialog', () => {
  let component: WorkOrderDialog;
  let fixture: ComponentFixture<WorkOrderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
