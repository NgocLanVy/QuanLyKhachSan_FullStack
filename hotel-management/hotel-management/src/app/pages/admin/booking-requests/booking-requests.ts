
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-requests.html',
  styleUrl: './booking-requests.css'
})

export class BookingRequestsComponent implements OnInit {

  bookings: any[] = [];

  loading = true;

  // DOMAIN API
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadReserved();
  }

  loadReserved() {

    this.loading = true;

    this.http.get<any[]>(
      `${this.api}/Booking`
    )
    .subscribe({

      next: (data) => {

        this.bookings = data.filter(
          b => b.status === 'Reserved'
        );

        this.loading = false;
      },

      error: () => {

        this.loading = false;
      }
    });
  }

  confirm(bookingId: number) {

    if (!confirm('Xác nhận duyệt đặt phòng này?')) {
      return;
    }

    this.http.post(
      `${this.api}/Booking/confirm-reserved/${bookingId}`,
      {}
    )
    .subscribe({

      next: () => {

        alert('Xác nhận nhận phòng thành công!');

        this.loadReserved();
      },

      error: (err) => {

        console.error('Chi tiết lỗi:', err);

        alert(
          'Lỗi: ' +
          (
            err.error?.message ||
            'Không thể xác nhận. Kiểm tra lại API confirm-reserved nhé!'
          )
        );
      }
    });
  }

  cancel(bookingId: number) {

    if (!confirm('Hủy yêu cầu đặt phòng này?')) {
      return;
    }

    this.http.delete(
      `${this.api}/Booking/cancel/${bookingId}`
    )
    .subscribe({

      next: () => {

        alert('Đã hủy!');

        this.loadReserved();
      },

      error: () => {

        alert('Lỗi khi hủy!');
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
}