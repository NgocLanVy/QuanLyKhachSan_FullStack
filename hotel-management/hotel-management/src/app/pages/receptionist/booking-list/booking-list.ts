import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking';
import { HotelService } from '../../../core/services/hotel';
import { BillModal } from '../../../shared/components/bill-modal/bill-modal';

export interface BookingData {
  bookingId?: number;
  bookingID?: number;
  roomID: number;
  customerID?: number;
  checkInTime: Date;
  checkOutTime?: Date;
  totalRoomPrice: number;
  status: string;
  room?: any;
  customer?: any;
  serviceOrders?: any[];
  grandTotal?: number;
  serviceTotal?: number;
  roomPrice?: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, BillModal],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
})
export class BookingListComponent implements OnInit {
  listBookings: BookingData[] = [];
  listRooms: any[] = [];
  availableRooms: any[] = [];
  servicesList: any[] = [];

  stats: any = {
    tongKhachHang: 0,
    tongDonDatPhong: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    cleaningRooms: 0,
    reservedRooms: 0
  };

  isLoading: boolean = false;
  showServiceModal: boolean = false;
  showBillModal: boolean = false;
  showQuickBookingModal: boolean = false;

  selectedBooking?: BookingData;
  billData?: any;
  selectedServiceId: number = 0;
  quantity: number = 1;

  selectedRoomId: number = 0;
  customerName: string = '';
  idCard: string = '';
  phone: string = '';

  constructor(
    private bookingService: BookingService,
    private hotelService: HotelService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.loadBookings();
    this.fetchRooms();
    this.loadServices();
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.bookingService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Lỗi thống kê:", err)
    });
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (res: any) => {
        this.listBookings = Array.isArray(res) ? res : (res.bookings || []);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Lỗi lấy danh sách booking:", err);
        this.isLoading = false;
      }
    });
  }

  fetchRooms() {
    this.hotelService.getRooms().subscribe({
      next: (res: any[]) => {
        this.listRooms = res;
        this.availableRooms = res.filter(r =>
          r.roomStatus === 'Available' || r.status === 'Available'
        );
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Lỗi lấy danh sách phòng:", err)
    });
  }

  loadServices() {
    this.hotelService.getServices().subscribe({
      next: (res: any) => {
        this.servicesList = res.map((s: any) => ({ ...s, quantity_temp: 0 }));
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error("Lỗi tải dịch vụ:", err)
    });
  }

  getFinalTotal(booking: BookingData): number {
    if (booking.grandTotal && booking.grandTotal > 0) return Number(booking.grandTotal);

    let roomPrice = Number(booking.totalRoomPrice || booking.roomPrice || 0);

    if (roomPrice === 0 && booking.room?.roomType) {
      const giaGio = booking.room.roomType.pricePerHour || 0;
      const giaDem = booking.room.roomType.pricePerNight || 0;
      const checkIn = new Date(booking.checkInTime);
      const now = booking.checkOutTime ? new Date(booking.checkOutTime) : new Date();
      const diffMs = now.getTime() - checkIn.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);

      roomPrice = (totalHours <= 12) ? Math.ceil(totalHours) * giaGio : giaDem;
    }

    const orders = booking.serviceOrders || [];
    const serviceTotal = orders.reduce((acc, item) =>
      acc + (Number(item.priceAtOrder || item.unitPrice || 0) * Number(item.quantity || 0)), 0);

    return roomPrice + serviceTotal;
  }

  viewBill(booking: any) {
    console.log('Dữ liệu Booking chọn:', booking);
    this.selectedBooking = booking;
    this.showBillModal = true;
  }

  openModal() {
    this.showQuickBookingModal = true;
    this.selectedRoomId = 0;
    this.customerName = '';
    this.phone = '';
    this.idCard = '';
    this.fetchRooms();
  }

  confirmQuickCheckIn() {
    if (!this.customerName || !this.phone || this.selectedRoomId === 0) {
      alert("Vui lòng điền đầy đủ tên, SĐT và chọn phòng!");
      return;
    }
    const checkInData = {
      roomID: Number(this.selectedRoomId),
      fullName: this.customerName,
      identityCard: this.idCard,
      phoneNumber: this.phone
    };
    this.bookingService.checkIn(checkInData).subscribe({
      next: () => {
        alert("Đón khách thành công!");
        this.closeModal();
        this.loadAllData();
      },
      error: (err) => alert("Lỗi: " + (err.error || "Không thể thực hiện check-in"))
    });
  }

  openServiceModal(booking: BookingData) {
    this.selectedBooking = booking;
    this.servicesList.forEach(s => s.quantity_temp = 0);
    this.showServiceModal = true;
    this.selectedServiceId = 0;
    this.quantity = 1;
  }

  changeQtyInList(item: any, value: number) {
    const currentQty = item.quantity_temp || 0;
    const newQty = currentQty + value;
    if (newQty >= 0) {
      item.quantity_temp = newQty;
    }
  }

  confirmOrderService() {
    const bId = this.selectedBooking?.bookingId || (this.selectedBooking as any)?.bookingID;
    const selectedItems = this.servicesList.filter(s => s.quantity_temp > 0);

    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một dịch vụ!");
      return;
    }

    selectedItems.forEach(item => {
      const orderData = {
        bookingID: bId,
        serviceID: item.serviceID,
        quantity: item.quantity_temp
      };

      this.bookingService.orderService(orderData).subscribe({
        next: () => {
          item.quantity_temp = 0; // Reset sau khi đặt thành công
        }
      });
    });

    alert("Đã cập nhật các dịch vụ!");
    this.showServiceModal = false;
    this.loadBookings();
  }

  handleCheckOut(id: number) {
    if (confirm("Xác nhận khách thanh toán và trả phòng?")) {
      this.bookingService.checkOut(id).subscribe({
        next: () => {
          alert("Trả phòng thành công!");
          this.showBillModal = false;
          this.loadAllData();
        },
        error: (err) => alert("Lỗi khi trả phòng: " + (err.error || "Vui lòng thử lại"))
      });
    }
  }

  printBill() { window.print(); }

  closeModal() {
    this.showQuickBookingModal = false;
    this.showServiceModal = false;
    this.showBillModal = false;
  }
}