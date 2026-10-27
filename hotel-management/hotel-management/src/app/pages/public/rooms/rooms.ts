import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  };

  imageUrl?: string | SafeUrl;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})

export class Rooms implements OnInit {

  allRooms: Room[] = [];

  loading = true;

  // DOMAIN API
  private api = environment.apiUrl;

  private fallback =
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadAllRooms();
  }

  loadAllRooms() {

    this.loading = true;

    this.http.get<any[]>(
      `${this.api}/Room`
    )
    .pipe(

      switchMap(rooms => {

        if (!rooms.length) {
          return of([]);
        }

        const requests = rooms.map(room =>

          this.http.get<any[]>(
            `${this.api}/RoomImages/room/${room.roomID}`
          )
          .pipe(

            map(images => {

              const primary =
                images?.find(i => i.isPrimary)
                || images?.[0];

              const rawUrl = primary
                ? `${this.api}/RoomImages/${primary.imageId}`
                : this.fallback;

              return {
                ...room,

                imageUrl:
                  this.sanitizer
                  .bypassSecurityTrustUrl(rawUrl)
              };
            }),

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

        this.allRooms = rooms;

        this.loading = false;
      },

      error: () => {

        this.loading = false;
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