import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Housekeeping } from './housekeeping';

describe('Housekeeping', () => {
  let component: Housekeeping;
  let fixture: ComponentFixture<Housekeeping>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Housekeeping]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Housekeeping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
