import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { HttpClient } from '@angular/common/http';

import {
  switchMap,
  map,
  catchError
} from 'rxjs/operators';

import { of } from 'rxjs';

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
    description?: string;
  };

  imageUrl?: string | null;
}

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './room-detail.html',
  styleUrl: './room-detail.css',
})

export class RoomDetail implements OnInit {

  room: Room | null = null;

  loading = true;

  // DOMAIN API
  private api = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadRoomDetail(id);
    }
  }

  loadRoomDetail(id: string) {

    this.http.get<Room>(
      `${this.api}/Room/${id}`
    )
    .pipe(

      switchMap(room =>

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
                : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32'
            };
          }),

          catchError(() =>

            of({
              ...room,
              imageUrl: null
            })
          )
        )
      )
    )
    .subscribe({

      next: (room) => {

        this.room = room;

        this.loading = false;
      },

      error: () => {

        this.loading = false;
      }
    });
  }

  formatPrice(amount: number | undefined): string {

    if (!amount) {
      return '0đ';
    }

    return (
      new Intl.NumberFormat('vi-VN')
      .format(amount) + 'đ'
    );
  }
}