import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})

export class RoomService {

  private apiUrl = `${environment.apiUrl}/Room`;
  private typeUrl = `${environment.apiUrl}/RoomType`;

  constructor(private http: HttpClient) { }

  // Header gửi token
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('authToken');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ROOM
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addRoom(roomData: any): Observable<any> {

    return this.http.post(
      this.apiUrl,
      roomData,
      { headers: this.getHeaders() }
    );
  }

  confirmCleaned(roomId: number): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/confirm-cleaned/${roomId}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ROOM TYPE
  getRoomTypes(): Observable<any[]> {

    return this.http.get<any[]>(
      this.typeUrl,
      { headers: this.getHeaders() }
    );
  }

  addRoomType(data: any): Observable<any> {

    return this.http.post(
      this.typeUrl,
      data,
      { headers: this.getHeaders() }
    );
  }

  updateRoomType(id: number, data: any): Observable<any> {

    return this.http.put(
      `${this.typeUrl}/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  deleteRoomType(id: number): Observable<any> {

    return this.http.delete(
      `${this.typeUrl}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}