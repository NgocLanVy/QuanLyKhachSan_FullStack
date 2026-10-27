import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRevenue } from './report-revenue';

describe('ReportRevenue', () => {
  let component: ReportRevenue;
  let fixture: ComponentFixture<ReportRevenue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportRevenue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportRevenue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
