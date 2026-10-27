import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingRequestsComponent } from './booking-requests';

describe('BookingRequests', () => {
  let component: BookingRequestsComponent;
  let fixture: ComponentFixture<BookingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingRequestsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
