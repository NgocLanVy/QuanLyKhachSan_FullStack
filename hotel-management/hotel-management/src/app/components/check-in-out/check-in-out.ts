import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../core/services/booking';
import { HotelService } from '../../core/services/hotel';

@Component({
  selector: 'app-check-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in-out.html',
  styleUrl: './check-in-out.css',
})
export class CheckInOutComponent implements OnInit {
  activeTab: 'checkin' | 'checkout' = 'checkin';
  availableRooms: any[] = [];
  occupiedRooms: any[] = [];
  servicesList: any[] = [];

  showInspectModal: boolean = false;
  selectedBooking: any = null;

  checkInData = {
    roomID: null,
    fullName: '',
    phoneNumber: '',
    identityCard: ''
  };

  constructor(
    private bookingService: BookingService,
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.refreshData();
    this.loadServices();
  }

  loadServices() {
    this.hotelService.getServices().subscribe(res => {
      this.servicesList = res.map((s: any) => ({ ...s, inputQty: 0 }));
    });
  }

  refreshData() {
    this.hotelService.getRooms().subscribe({
      next: (res: any[]) => {
        this.availableRooms = res.filter(r => r.roomStatus === 'Available');
      }
    });

    this.bookingService.getBookings().subscribe({
      next: (res: any[]) => {
        console.log('Bookings from API:', JSON.stringify(res));
        this.occupiedRooms = res.filter(b => b.status === 'Checked-in');
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Lỗi lấy danh sách đặt phòng:", err)
    });
  }

  onCheckIn() {
    if (!this.checkInData.roomID || !this.checkInData.fullName || !this.checkInData.phoneNumber) {
      alert("Bạn ơi, điền thiếu thông tin khách rồi kìa!");
      return;
    }
    const payload = { ...this.checkInData, roomID: Number(this.checkInData.roomID) };

    this.bookingService.checkIn(payload).subscribe({
      next: () => {
        alert('Đón khách thành công!');
        this.resetForm();
        this.refreshData();
      },
      error: (err: any) => alert('Lỗi: ' + (err.error?.message || "Dữ liệu không hợp lệ"))
    });
  }

  startInspect(booking: any) {
    this.selectedBooking = booking;
    this.servicesList.forEach(s => s.inputQty = 0); 
    this.showInspectModal = true;
  }

  updateQty(service: any, delta: number) {
    service.inputQty = Math.max(0, (service.inputQty || 0) + delta);
  }

  saveFinalInspect() {
  const usedServices = this.servicesList.filter(s => s.inputQty > 0);
  const room = this.selectedBooking.room;

  this.hotelService.saveRoomChecklist(room.roomID, usedServices).subscribe({
    next: () => {
      const updateData = { ...room, roomStatus: 'Inspecting' };
      this.hotelService.updateRoomStatus(room.roomID, updateData).subscribe({
        next: () => {
          alert(`Đã hoàn tất kiểm đồ phòng ${room.roomNumber}.`);
          this.showInspectModal = false;

          this.selectedBooking.room.roomStatus = 'Inspecting';
          this.cdr.detectChanges();

          this.refreshData(); 
        }
      });
    },
    error: (err) => {
      console.error(err);
      alert("Lỗi khi lưu danh sách dịch vụ!");
    }
  });
}

  //trả phg
  onCheckOut(booking: any) {
    const bId = booking.bookingID;

    if (confirm(`Xác nhận thanh toán cho phòng ${booking.room?.roomNumber}?`)) {
      this.bookingService.checkOut(bId).subscribe({
        next: () => {
          alert('Thanh toán thành công!');
          this.refreshData();
        },
        error: (err: any) => alert('Lỗi trả phòng: ' + err.message)
      });
    }
  }

  resetForm() {
    this.checkInData = { roomID: null, fullName: '', phoneNumber: '', identityCard: '' };
  }
}