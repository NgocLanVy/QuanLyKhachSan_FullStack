import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

import {
  DomSanitizer,
  SafeUrl
} from '@angular/platform-browser';

import {
  switchMap,
  map,
  catchError
} from 'rxjs/operators';

import { of } from 'rxjs';

import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})

export class Booking implements OnInit {

  room: any = null;

  roomImageUrl: SafeUrl | string =
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070';

  bookingData = {
    customerName: '',
    customerPhone: '',
    checkInDate: '',
    checkOutDate: '',
    totalAmount: 0
  };

  loading = true;

  submitting = false;

  // DOMAIN API
  private api = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {

    this.loading = true;

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadRoomInfo(id);
    }
  }

  loadRoomInfo(id: string) {

    this.http.get(
      `${this.api}/Room/${id}`
    )
    .pipe(

      switchMap((data: any) => {

        if (data.roomStatus !== 'Available') {

          alert('Phòng này hiện không thể đặt!');

          this.router.navigate(['/home/rooms']);

          return of(null);
        }

        this.room = data;

        return this.http.get<any[]>(
          `${this.api}/RoomImages/room/${id}`
        )
        .pipe(

          map(images => {

            if (images && images.length > 0) {

              const primary =
                images.find(i => i.isPrimary)
                || images[0];

              this.roomImageUrl =
                this.sanitizer.bypassSecurityTrustUrl(
                  `${this.api}/RoomImages/${primary.imageId}`
                );
            }

            return data;
          }),

          catchError(() => of(data))
        );
      })
    )
    .subscribe({

      next: () => {

        this.loading = false;
      },

      error: () => {

        this.loading = false;

        alert('Không tìm thấy thông tin phòng!');

        this.router.navigate(['/home/rooms']);
      }
    });
  }

  calculateTotal() {

    if (
      this.bookingData.checkInDate &&
      this.bookingData.checkOutDate
    ) {

      const start =
        new Date(this.bookingData.checkInDate);

      const end =
        new Date(this.bookingData.checkOutDate);

      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) /
        (1000 * 60 * 60 * 24)
      );

      this.bookingData.totalAmount =
        (diffDays > 0 && this.room)
        ? diffDays * this.room.roomType.pricePerNight
        : 0;
    }
  }

  submitBooking() {

    if (
      !this.bookingData.customerName.trim() ||
      !this.bookingData.customerPhone.trim()
    ) {

      alert(
        'Vui lòng điền đầy đủ thông tin khách hàng!'
      );

      return;
    }

    if (
      !this.bookingData.checkInDate ||
      !this.bookingData.checkOutDate
    ) {

      alert(
        'Vui lòng chọn ngày nhận và trả phòng!'
      );

      return;
    }

    if (this.bookingData.totalAmount <= 0) {

      alert(
        'Ngày nhận/trả phòng không hợp lệ!'
      );

      return;
    }

    if (this.submitting) {
      return;
    }

    this.submitting = true;

    const payload = {

      roomID: this.room.roomID,

      fullName:
        this.bookingData.customerName,

      identityCard: '',

      phoneNumber:
        this.bookingData.customerPhone,

      checkOutTime:
        new Date(
          this.bookingData.checkOutDate
        ).toISOString()
    };

    this.http.post(
      `${this.api}/Booking/reserve`,
      payload
    )
    .subscribe({

      next: () => {

        this.submitting = false;

        alert(
          'Đặt phòng thành công! Royal Mellow sẽ liên hệ bạn sớm nhất.'
        );

        this.router.navigate(['/home']);
      },

      error: (err) => {

        this.submitting = false;

        console.error(
          'Lỗi đặt phòng:',
          err
        );

        alert(
          'Có lỗi xảy ra. Vui lòng thử lại!'
        );
      }
    });
  }

  formatPrice(amount: number): string {

    if (!amount) {
      return '0đ';
    }

    return (
      new Intl.NumberFormat('vi-VN')
      .format(amount) + 'đ'
    );
  }
}