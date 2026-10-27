import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room';


@Component({
  selector: 'app-room-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-type.html',
  styleUrl: './room-type.css',
})
export class RoomTypeComponent implements OnInit {
  roomTypes: any[] = [];
  showTypeModal = false;
  isEdit = false;
  loading = false;

  currentType: any = {
    roomTypeID: 0,
    typeName: '',
    price: 0
  };

  constructor(
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadRoomTypes();
  }

  loadRoomTypes() {
    this.loading = true;
    this.roomService.getRoomTypes().subscribe({
      next: (data: any) => {
        this.roomTypes = [...data];
        this.loading = false;

        this.cdr.detectChanges();

        console.log('Dữ liệu loại phòng:', this.roomTypes);
      },
      error: (err: any) => {
        console.error('Lỗi khi tải loại phòng:', err);
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.isEdit = false;
    this.currentType = { roomTypeID: 0, typeName: '', pricePerNight: 0, pricePerHour: 0 };
    this.showTypeModal = true;
    this.cdr.detectChanges();
  }

  editType(type: any) {
    this.isEdit = true;
    this.currentType = { ...type };
    this.showTypeModal = true;
  }

  saveType() {
    // Kiểm tra tên và giá (Night hoặc Hour phải > 0)
    if (!this.currentType.typeName || (this.currentType.pricePerNight <= 0 && this.currentType.pricePerHour <= 0)) {
      alert('Vui lòng nhập đầy đủ tên và giá phòng hợp lệ!');
      return;
    }

    this.loading = true;
    if (this.isEdit) {
      this.roomService.updateRoomType(this.currentType.roomTypeID, this.currentType).subscribe({
        next: () => {
          alert('Cập nhật thành công!');
          this.loadRoomTypes();
          this.showTypeModal = false;
        },
        error: (err: any) => {
          alert('Lỗi khi cập nhật!');
          this.loading = false;
        }
      });
    } else {
      this.roomService.addRoomType(this.currentType).subscribe({
        next: () => {
          alert('Thêm mới thành công!');
          this.loadRoomTypes();
          this.showTypeModal = false;
        },
        error: (err: any) => {
          alert('Lỗi khi thêm mới!');
          this.loading = false;
        }
      });
    }
  }

  deleteType(id: number) {
    if (confirm('Bạn có chắc muốn xóa loại phòng này? Thao tác này có thể ảnh hưởng đến các phòng đang thuộc loại này.')) {
      this.loading = true;
      this.roomService.deleteRoomType(id).subscribe({
        next: () => {
          alert('Đã xóa thành công!');
          this.loadRoomTypes();
        },
        error: (err: any) => {
          alert('Không thể xóa loại phòng này!');
          this.loading = false;
        }
      });
    }
  }
}