import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel';


@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css'
})
export class CustomerList implements OnInit {
  allCustomers: any[] = [];
  filteredCustomers: any[] = [];
  searchText: string = '';
  loading: boolean = false;
  
  showPopup = false;
  isEditMode = false;
  editingCustomerId: number | null = null;
  isAsc = true; 

  newCustomer = {
    fullName: '',
    phoneNumber: '',
    identityCard: '', 
    email: '' 
  };

  constructor(
    private hotelService: HotelService, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.hotelService.getCustomers().subscribe({
      next: (res) => {
        this.allCustomers = res;
        this.filteredCustomers = [...res];
        this.sortCustomers();
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Lỗi load danh sách:', err);
        this.loading = false;
      }
    });
  }

  sortCustomers() {
    this.filteredCustomers.sort((a, b) => {
      const nameA = (a.fullName || '').toLowerCase();
      const nameB = (b.fullName || '').toLowerCase();
      return this.isAsc 
        ? nameA.localeCompare(nameB, 'vi') 
        : nameB.localeCompare(nameA, 'vi');
    });
    this.cdr.detectChanges();
  }

  toggleSort() {
    this.isAsc = !this.isAsc;
    this.sortCustomers();
  }

  applyFilter() {
    const search = this.searchText.toLowerCase().trim();
    this.filteredCustomers = !search 
      ? [...this.allCustomers] 
      : this.allCustomers.filter(c => 
          c.fullName?.toLowerCase().includes(search) || 
          c.phoneNumber?.includes(search) ||
          c.identityCard?.includes(search)
        );
    this.sortCustomers();
  }

  openPopup() { this.showPopup = true; }

  closePopup() {
    this.showPopup = false;
    this.isEditMode = false;
    this.editingCustomerId = null;
    this.newCustomer = { fullName: '', phoneNumber: '', identityCard: '', email: '' };
  }

  editCustomer(item: any) {
    this.isEditMode = true;
    this.editingCustomerId = item.customerID;
    this.newCustomer = { ...item };
    this.openPopup();
  }

  onSubmit() {
    if (!this.newCustomer.fullName || !this.newCustomer.phoneNumber) {
      alert('Vui lòng điền đầy đủ tên và sđt!!');
      return;
    }

    const request = this.isEditMode 
      ? this.hotelService.updateRoomStatus(this.editingCustomerId!, this.newCustomer) // Tạm dùng updateRoomStatus nếu chưa có updateCustomer
      : this.hotelService.addCustomer(this.newCustomer);

    request.subscribe({
      next: () => {
        alert(this.isEditMode ? 'Cập nhật thành công!' : 'Thêm thành công!');
        this.loadCustomers(); 
        this.closePopup();
      },
      error: (err) => alert('Lỗi: ' + err.message)
    });
  }

  deleteCustomer(id: number) {
    if (confirm('Bạn có chắc muốn xóa khách hàng này không?')) {
      this.hotelService.deleteCustomer(id).subscribe({
        next: () => this.loadCustomers(),
        error: (err) => alert('Lỗi khi xóa: ' + err.message)
      });
    }
  }
}