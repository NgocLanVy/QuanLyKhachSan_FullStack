import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = `${environment.apiUrl}/Booking`;
  private serviceOrderUrl = `${environment.apiUrl}/ServiceOrder`;
  private serviceUrl = `${environment.apiUrl}/Service`;
  private billUrl = `${environment.apiUrl}/Bill`;
  private dashboardUrl = `${environment.apiUrl}/Dashboard`;

  constructor(private http: HttpClient) { }

  // all booking
  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // lấy booking theo id
  getBookingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // checkin
  checkIn(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkin`, data);
  }

  // checkout
  checkOut(bookingId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-out/${bookingId}`, {});
  }

  // hủy booking
  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${bookingId}`);
  }

  // đặt dịch vụ
  orderService(orderData: { bookingID: number, serviceID: number, quantity: number }): Observable<any> {
    return this.http.post(this.serviceOrderUrl, orderData);
  }

  // lấy dịch vụ
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(this.serviceUrl);
  }

  // bill
  getBill(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.billUrl}/${bookingId}`);
  }

  // dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(this.dashboardUrl);
  }
}