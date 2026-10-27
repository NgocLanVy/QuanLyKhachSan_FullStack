import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtendStay } from './extend-stay';

describe('ExtendStay', () => {
  let component: ExtendStay;
  let fixture: ComponentFixture<ExtendStay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtendStay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtendStay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
