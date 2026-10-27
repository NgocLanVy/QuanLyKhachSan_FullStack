import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel';
import { ActivatedRoute } from '@angular/router';
import { Room, RoomType } from '../../../models/room';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-list.html',
  styleUrl: './room-list.css',
})
export class RoomListComponent implements OnInit {
  allRooms: Room[] = [];
  availableRooms: Room[] = [];
  roomTypes: RoomType[] = [];
  viewMode: 'grid' | 'table' = 'grid';
  loading: boolean = false;
  showAddModal: boolean = false;
  isEditMode: boolean = false;

  newRoom: any = {
    roomID: 0,
    roomNumber: '',
    roomTypeID: null,
    roomStatus: 'Available'
  };

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['view']) {
        this.viewMode = params['view'];
      }
    });
    this.loadRoomTypes();
  }

  loadRoomPlan() {
    this.loading = true;
    this.hotelService.getRooms().subscribe({
      next: (res: any[]) => {
        this.allRooms = res;
        this.refreshLists();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        console.error("Lỗi lấy danh sách phòng:", err);
      }
    });
  }

  loadRoomTypes() {
    this.hotelService.getRoomTypes().subscribe({
      next: (res: any[]) => {
        this.roomTypes = res;
        this.loadRoomPlan();
      },
      error: (err) => console.error("Lỗi lấy loại phòng:", err)
    });
  }

  getRoomTypeName(typeId: number): string {
    if (!this.roomTypes || this.roomTypes.length === 0) return 'Đ đang tải...';
    const type = this.roomTypes.find(t => t.roomTypeID === typeId);
    return type ? type.typeName : 'N/A';
  }

  getRoomPrice(typeId: number): number {
    if (!this.roomTypes || this.roomTypes.length === 0) return 0;
    const type = this.roomTypes.find(t => t.roomTypeID === typeId);
    return type ? type.pricePerNight : 0;
  }

  getRoomClass(status: string | undefined) {
    if (!status) return 'available';
    return status.toLowerCase();
  }

  openAddModal() {
    this.isEditMode = false;
    this.newRoom = { roomID: 0, roomNumber: '', roomTypeID: null, roomStatus: 'Available' };
    this.showAddModal = true;
  }

  openEditModal(room: Room) {
    this.isEditMode = true;
    this.newRoom = {
      roomID: room.roomID,
      roomNumber: room.roomNumber,
      roomTypeID: room.roomTypeID,
      roomStatus: room.roomStatus
    };
    this.showAddModal = true;
  }

  saveRoom() {
    if (!this.newRoom.roomNumber || !this.newRoom.roomTypeID) {
      alert("Vui lòng nhập đầy đủ số phòng và loại phòng!");
      return;
    }
    this.loading = true;
    const request = this.isEditMode
      ? this.hotelService.updateRoomStatus(this.newRoom.roomID, this.newRoom)
      : this.hotelService.addRoom(this.newRoom);

    request.subscribe({
      next: () => {
        alert(this.isEditMode ? "Cập nhật thành công!" : "Thêm phòng mới thành công!");
        this.showAddModal = false;
        this.loadRoomPlan();
      },
      error: (err) => this.handleError("Thao tác thất bại!", err)
    });
  }

  deleteRoom(id: number) {
    if (confirm("Vy có chắc chắn muốn xóa phòng này không?")) {
      this.loading = true;
      this.hotelService.deleteRoom(id).subscribe({
        next: () => {
          alert("Đã xóa phòng thành công!");
          this.loadRoomPlan();
        },
        error: (err) => this.handleError("Không thể xóa phòng!", err)
      });
    }
  }

  /*  changeStatus(room: Room, newStatus: string) {
      if (this.loading) return;
      this.loading = true;
  
      if (newStatus === 'Inspecting') {
        this.hotelService.requestInspect(room.roomID).subscribe({
          next: () => {
            room.roomStatus = 'Inspecting';
            this.refreshLists();
            this.finishUpdate(`Phòng ${room.roomNumber} đang được kiểm tra!`);
          },
          error: (err: any) => this.handleError("Lỗi yêu cầu kiểm phòng!", err)
        });
        return;
      }
  
      if (newStatus === 'Available' && (room.roomStatus === 'Cleaning' || room.roomStatus === 'Inspecting')) {
        this.hotelService.confirmCleaned(room.roomID).subscribe({
          next: () => {
            room.roomStatus = 'Available';
            this.refreshLists();
            this.finishUpdate(`Phòng ${room.roomNumber} đã sẵn sàng đón khách!`);
          },
          error: (err: any) => this.handleError("Lỗi xác nhận trạng thái!", err)
        });
        return;
      }
  
      const updatedData = {
        roomID: room.roomID,
        roomNumber: room.roomNumber,
        roomStatus: newStatus,
        roomTypeID: room.roomTypeID,
        description: room.description || "", 
        maxGuests: room.maxGuests || 0,
        bedType: room.bedType || "",
      };
  
      this.hotelService.updateRoomStatus(room.roomID, updatedData).subscribe({
      next: () => {
        room.roomStatus = newStatus;
        this.refreshLists();
        this.finishUpdate(`Đã chuyển trạng thái phòng ${room.roomNumber} sang ${newStatus}`);
      },
      error: (err: any) => {
        this.handleError("Không thể cập nhật trạng thái!", err);
      }
    });
  }*/
  changeStatus(room: any, newStatus: string) {
    if (this.loading) return;
    this.loading = true;
    if (newStatus === 'Inspecting') {
      this.hotelService.requestInspect(room.roomID).subscribe({
        next: () => {
          room.roomStatus = 'Inspecting';
          this.refreshLists();
          this.finishUpdate(`Phòng ${room.roomNumber} đang được kiểm tra!`);
        },
        error: (err: any) => this.handleError("Lỗi yêu cầu kiểm phòng!", err)
      });
      return;
    }

    if (newStatus === 'Available' && (room.roomStatus === 'Cleaning' || room.roomStatus === 'Inspecting')) {
      this.hotelService.confirmCleaned(room.roomID).subscribe({
        next: () => {
          room.roomStatus = 'Available';
          this.refreshLists();
          this.finishUpdate(`Phòng ${room.roomNumber} đã sẵn sàng đón khách!`);
        },
        error: (err: any) => this.handleError("Lỗi xác nhận trạng thái!", err)
      });
      return;
    }
    const payload = {
      roomNumber: room.roomNumber,
      roomStatus: newStatus,
      roomTypeID: room.roomTypeID,
      description: (room as any).description || "",
      maxGuests: (room as any).maxGuests || 0,
      bedType: (room as any).bedType || ""
    };

    this.hotelService.updateRoomStatus(room.roomID, payload).subscribe({
      next: () => {
        room.roomStatus = newStatus;
        this.refreshLists();
        this.finishUpdate(`Đã chuyển trạng thái phòng ${room.roomNumber} sang ${newStatus}`);
        alert("Cập nhật trạng thái thành công!");
      },
      error: (err: any) => {
        this.handleError("Không thể cập nhật trạng thái!", err);
        console.error("Lỗi 400 là do payload này:", payload);
      }
    });
  }

  private refreshLists() {
    this.availableRooms = this.allRooms.filter(r => r.roomStatus === 'Available');
  }

  private finishUpdate(msg: string) {
    this.loading = false;
    console.log(msg);
    this.cdr.detectChanges();
  }

  private handleError(msg: string, err: any) {
    this.loading = false;
    console.error(msg, err);
    alert(msg);
  }
}