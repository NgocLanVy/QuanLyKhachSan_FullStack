import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';     
import { HotelService } from '../../core/services/hotel';


@Component({
  selector: 'app-housekeeping',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './housekeeping.html',
  styleUrls: ['./housekeeping.css']
})
export class HousekeepingComponent implements OnInit {
  viewMode: 'grid' | 'table' = 'grid';
  loading: boolean = false;
  
  showAddModal: boolean = false;
  showChecklistModal: boolean = false;

  allRooms: any[] = [];
  roomTypes: any[] = [];
  services: any[] = []; 
  
  selectedRoom: any = null;
  newRoom: any = { roomNumber: '', roomTypeID: null };

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchInitialData();
  }

  fetchInitialData() {
    this.loading = true;
    this.hotelService.getRoomTypes().subscribe({
      next: (types: any) => {
        this.roomTypes = types;
        this.loadRooms(); 
      },
      error: (err: any) => {
        console.error('Lỗi tải loại phòng:', err);
        this.loadRooms(); 
      }
    });
  }

  loadRooms() {
    this.loading = true;
    this.hotelService.getRooms().subscribe({
      next: (data: any) => {
        this.allRooms = [...data];
        this.loading = false;
        
        this.cdr.detectChanges();
        
        console.log('Dữ liệu phòng đã cập nhật:', this.allRooms);
      },
      error: (err: any) => {
        console.error('Lỗi tải phòng:', err);
        this.loading = false;
      }
    });
  }

  openChecklist(room: any) {
    this.selectedRoom = room;
    this.showChecklistModal = true;
    this.loading = true;
    
    this.hotelService.getServices().subscribe({
      next: (data: any) => {
        this.services = data.map((s: any) => ({ ...s, inputQty: 0 }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert("Không thể tải danh sách dịch vụ!");
        this.loading = false;
      }
    });
  }

  updateQty(service: any, delta: number) {
    service.inputQty = Math.max(0, service.inputQty + delta);
  }

  confirmCompleteCheck() {
    const usedServices = this.services.filter(s => s.inputQty > 0);
    
    if (usedServices.length === 0) {
      if(!confirm("Khách không dùng dịch vụ nào, xác nhận dọn phòng xong?")) return;
    }

    this.loading = true;
    this.hotelService.saveRoomChecklist(this.selectedRoom.roomID, usedServices).subscribe({
      next: () => {
        this.onConfirmClean(this.selectedRoom.roomID);
        this.showChecklistModal = false;
      },
      error: (err:any) => {
        console.error(err);
        alert("Lỗi khi lưu thông tin kiểm phòng!");
        this.loading = false;
      }
    });
  }

  onConfirmClean(roomId: number) {
    this.hotelService.confirmCleaned(roomId).subscribe({
      next: (res:any) => {
        alert(res.message || 'Xác nhận hoàn tất thành công!');
        this.loadRooms();    
      },
      error: (err:any) => {
        alert('Không thể cập nhật trạng thái dọn dẹp!');
        this.loading = false;
      }
    });
  }

  saveRoom() {
    if (!this.newRoom.roomNumber || !this.newRoom.roomTypeID) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    this.loading = true;
    this.hotelService.addRoom(this.newRoom).subscribe({
      next: () => {
        alert('Thêm phòng thành công!');
        this.showAddModal = false; 
        this.newRoom = { roomNumber: '', roomTypeID: null }; 
        this.loadRooms(); 
      },
      error: () => {
        alert('Lỗi khi thêm phòng!');
        this.loading = false;
      }
    });
  }

  getRoomTypeName(typeId: number): string {
    const type = this.roomTypes.find(t => t.roomTypeID === typeId);
    return type ? type.typeName : 'N/A';
  }

  getRoomClass(status: string) {
    return status ? status.toLowerCase() : 'available';
  }

  trackByRoomId(index: number, item: any) {
    return item.roomID;
  }
}