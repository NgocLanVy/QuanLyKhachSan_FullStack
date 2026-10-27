import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-extend-stay',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './extend-stay.html',
  styleUrl: './extend-stay.css'
})

export class ExtendStayComponent implements OnInit {

  bookings: any[] = [];

  selected: any = null;

  newCheckOut = '';

  loading = true;

  submitting = false;

  // DOMAIN API
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadOccupied();
  }

  loadOccupied() {

    this.loading = true;

    this.http.get<any[]>(
      `${this.api}/Booking`
    )
    .subscribe({

      next: (data) => {

        this.bookings = data.filter(
          b => b.status === 'Checked-in'
        );

        this.loading = false;
      },

      error: () => {

        this.loading = false;
      }
    });
  }

  selectBooking(b: any) {

    this.selected = b;

    const base =
      b.checkOutTime
      ? new Date(b.checkOutTime)
      : new Date();

    this.newCheckOut =
      base.toISOString().slice(0, 16);
  }

  submitExtend() {

    if (!this.selected || !this.newCheckOut) {
      return;
    }

    if (this.submitting) {
      return;
    }

    this.submitting = true;

    this.http.put(
      `${this.api}/Booking/extend/${this.selected.bookingID}`,
      {
        newCheckOutTime:
          new Date(this.newCheckOut).toISOString()
      }
    )
    .subscribe({

      next: (res: any) => {

        this.submitting = false;

        alert(
          `Gia hạn thành công!\n` +
          `Check-out mới: ${new Date(res.newCheckOut).toLocaleString('vi-VN')}\n` +
          `Tổng tiền phòng: ${res.newTotal?.toLocaleString('vi-VN')}đ`
        );

        this.selected = null;

        this.loadOccupied();
      },

      error: (err) => {

        this.submitting = false;

        alert(
          'Lỗi: ' +
          (err.error || 'Không thể gia hạn')
        );
      }
    });
  }

  formatDate(d: string) {

    if (!d) {
      return '—';
    }

    return new Date(d)
      .toLocaleString('vi-VN');
  }

  get minDate(): string {

    return new Date()
      .toISOString()
      .slice(0, 16);
  }
}