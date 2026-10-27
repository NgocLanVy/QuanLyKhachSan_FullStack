import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { forkJoin, of } from 'rxjs';

import {
  switchMap,
  map,
  catchError
} from 'rxjs/operators';

import { environment } from '../../../../environments/environments';

interface Room {

  roomID: number;

  roomNumber: string;

  roomStatus: string;

  description: string;

  maxGuests: number;

  bedType: string;

  roomType: {
    typeName: string;
    pricePerNight: number;
    pricePerHour: number;
  };

  imageUrl?: string | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})

export class Home implements OnInit {

  featuredRooms: Room[] = [];

  topBookedTypes: any[] = [];

  totalRooms = 0;

  availableRooms = 0;

  loading = true;

  error = false;

  // DOMAIN API
  private api = environment.apiUrl;

  private fallback =
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070';

    heroImage = `${environment.apiUrl}/RoomImages/16`;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.loadRooms();

    this.loadTopBooked();
  }

  loadRooms(): void {

    this.loading = true;

    this.http.get<Room[]>(
      `${this.api}/Room`
    )
    .pipe(

      switchMap((rooms) => {

        this.totalRooms = rooms.length;

        this.availableRooms = rooms.filter(
          r => r.roomStatus === 'Available'
        ).length;

        const availableRooms = rooms
          .filter(r => r.roomStatus === 'Available')
          .slice(0, 4);

        if (!availableRooms.length) {
          return of([]);
        }

        const requests = availableRooms.map(room =>

          this.http.get<any[]>(
            `${this.api}/RoomImages/room/${room.roomID}`
          )
          .pipe(

            map(images => {

              const primary =
                images?.find(i => i.isPrimary)
                || images?.[0];

              return {
                ...room,

                imageUrl: primary
                  ? `${this.api}/RoomImages/${primary.imageId}`
                  : this.fallback
              };
            }),

            // nếu lỗi ảnh
            catchError(() =>

              of({
                ...room,
                imageUrl: this.fallback
              })
            )
          )
        );

        return forkJoin(requests);
      })
    )
    .subscribe({

      next: (rooms) => {

        this.featuredRooms = rooms;

        this.loading = false;
      },

      error: (err) => {

        console.error(
          'Lỗi load phòng:',
          err
        );

        this.loading = false;

        this.error = true;
      }
    });
  }

  loadTopBooked(): void {

    this.http.get<any[]>(
      `${this.api}/RoomType/top-booked`
    )
    .subscribe({

      next: (data) => {

        this.topBookedTypes = data;
      },

      error: (err) => {

        console.error(
          'Không lấy được top phòng:',
          err
        );
      }
    });
  }

  getRoomIcon(typeName: string): string {

    if (!typeName) {
      return 'fa-solid fa-bed';
    }

    const name = typeName.toLowerCase();

    if (name.includes('suite')) {
      return 'fa-solid fa-crown';
    }

    if (name.includes('vip')) {
      return 'fa-solid fa-gem';
    }

    if (name.includes('deluxe')) {
      return 'fa-solid fa-star';
    }

    if (name.includes('tập thể')) {
      return 'fa-solid fa-people-group';
    }

    if (name.includes('đôi')) {
      return 'fa-solid fa-bed';
    }

    if (name.includes('đơn')) {
      return 'fa-solid fa-user';
    }

    return 'fa-solid fa-hotel';
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