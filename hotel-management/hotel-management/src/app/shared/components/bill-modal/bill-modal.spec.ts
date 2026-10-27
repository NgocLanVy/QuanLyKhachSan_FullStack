import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillModal } from './bill-modal';

describe('BillModal', () => {
  let component: BillModal;
  let fixture: ComponentFixture<BillModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
