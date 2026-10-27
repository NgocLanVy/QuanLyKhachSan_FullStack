import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class HotelService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  //XÁC THỰC
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/User/login`, {
      UserName: username,
      Password: password
    });
  }

  saveUserToken(response: any): void {
    if (response && response.token) {

      localStorage.setItem('authToken', response.token);

      const userData = response.user || response.User;

      if (userData) {

        const fullName = userData.fullName || userData.userName || '';
        const role = userData.roles || userData.role || '';

        localStorage.setItem('fullName', fullName);
        localStorage.setItem('userRole', role);
      }
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  //QUẢN LÝ PHÒNG
  addRoom(roomData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Room`, roomData, {
      headers: this.getHeaders()
    });
  }

  getRoomTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/RoomType`, {
      headers: this.getHeaders()
    });
  }

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Room`);
  }

  requestInspect(roomId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Room/request-inspect/${roomId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  confirmCleaned(roomId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Room/confirm-cleaned/${roomId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  updateRoomStatus(id: number, roomData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/Room/${id}`,
      roomData,
      { headers: this.getHeaders() }
    );
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/Room/${id}`,
      { headers: this.getHeaders() }
    );
  }

  //KHÁCH HÀNG
  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/Customer`,
      { headers: this.getHeaders() }
    );
  }

  addCustomer(data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/Customer`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/Customer/${id}`,
      { headers: this.getHeaders() }
    );
  }

  updateCustomer(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/Customer/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }
  //DỊCH VỤ
  addService(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Service`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Service`);
  }

  updateService(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/Service/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/Service/${id}`,
      { headers: this.getHeaders() }
    );
  }

  //DASHBOARD
  getDashboardStats(startDate?: string, endDate?: string): Observable<any> {

    let params = '';

    if (startDate && endDate) {
      params = `?startDate=${startDate}&endDate=${endDate}`;
    }

    return this.http.get<any>(
      `${this.apiUrl}/Dashboard${params}`
    );
  }

  getRevenueReport(startDate: string, endDate: string): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.apiUrl}/Dashboard/revenue-report?startDate=${startDate}&endDate=${endDate}`,
      { headers: this.getHeaders() }
    );
  }

  //BOOKING
  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Booking`);
  }

  //HOUSEKEEPING
  saveRoomChecklist(roomId: number, services: any[]): Observable<any> {

    const payload = {
      RoomID: roomId,
      Items: services.map(s => ({
        ServiceID: s.serviceID,
        Quantity: s.inputQty
      }))
    };

    return this.http.post(
      `${this.apiUrl}/ServiceOrder/housekeeping-check`,
      payload,
      { headers: this.getHeaders() }
    );
  }
  //NHÂN VIÊN
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/User`,
      { headers: this.getHeaders() }
    );
  }

  addEmployee(userData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/User`,
      userData,
      { headers: this.getHeaders() }
    );
  }

  updateEmployee(id: number, userData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/User/${id}`,
      userData,
      { headers: this.getHeaders() }
    );
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/User/${id}`,
      { headers: this.getHeaders() }
    );
  }

}