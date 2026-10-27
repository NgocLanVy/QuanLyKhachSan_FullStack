import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistLayout } from './receptionist-layout';

describe('ReceptionistLayout', () => {
  let component: ReceptionistLayout;
  let fixture: ComponentFixture<ReceptionistLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionistLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionistLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
