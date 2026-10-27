import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  currentUser = {
    userName: 'Đang tải...',
    role: 'User',
    avatarChar: '?'
  };

  pendingCount = 0;

  private pollSub?: Subscription;

  // API DOMAIN
  private api = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      const savedName =
        localStorage.getItem('fullName') ||
        localStorage.getItem('userName');

      const savedRole =
        localStorage.getItem('userRole');

      if (savedName) {

        this.currentUser.userName = savedName;

        const nameParts = savedName.trim().split(' ');

        const mainName =
          nameParts[nameParts.length - 1];

        this.currentUser.avatarChar =
          mainName.charAt(0).toUpperCase();
      }

      if (savedRole) {
        this.currentUser.role = savedRole;
      }
    }

    this.loadPendingCount();

    this.pollSub = interval(30000)
      .pipe(
        switchMap(() =>
          this.http.get<any[]>(
            `${this.api}/Booking`
          )
        )
      )
      .subscribe({
        next: (bookings) => {

          this.pendingCount = bookings.filter(
            b => b.status === 'Pending'
          ).length;
        }
      });
  }

  loadPendingCount(): void {

    this.http.get<any[]>(
      `${this.api}/Booking`
    )
    .subscribe({
      next: (bookings) => {

        this.pendingCount = bookings.filter(
          b => b.status === 'Pending'
        ).length;
      }
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  logout(): void {

    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {

      localStorage.clear();

      this.router.navigate(['/login']);
    }
  }
}