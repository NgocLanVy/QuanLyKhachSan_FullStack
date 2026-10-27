import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccupancyRate } from './occupancy-rate';

describe('OccupancyRate', () => {
  let component: OccupancyRate;
  let fixture: ComponentFixture<OccupancyRate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccupancyRate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccupancyRate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
