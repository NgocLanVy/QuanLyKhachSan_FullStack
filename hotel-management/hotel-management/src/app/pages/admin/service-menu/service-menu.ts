import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel';


@Component({
  selector: 'app-service-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-menu.html',
  styleUrls: ['./service-menu.css']
})
export class ServiceMenu implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  searchText: string = '';
  showPopup: boolean = false;
  isEditMode: boolean = false;
  loading: boolean = false;

  selectedService: any = {
    serviceID: 0,
    serviceName: '',
    price: 0,
    unit: ''
  };

  constructor(
    private hotelService: HotelService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;
    this.hotelService.getServices().subscribe({
      next: (data: any) => {
        this.services = [...data];
        this.applyFilter(); 
        this.loading = false;
        
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Lỗi tải dịch vụ:', err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredServices = [...this.services];
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredServices = this.services.filter(s => 
        s.serviceName.toLowerCase().includes(search)
      );
    }
    this.cdr.detectChanges();
  }

  openPopup(item: any = null) {
    if (item) {
      this.isEditMode = true;
      this.selectedService = { ...item };
    } else {
      this.isEditMode = false;
      this.selectedService = { serviceID: 0, serviceName: '', price: 0, unit: '' };
    }
    this.showPopup = true;
    this.cdr.detectChanges();
  }

  saveService() {
    if (!this.selectedService.serviceName || this.selectedService.price <= 0) {
      alert('Vui lòng nhập thông tin hợp lệ!');
      return;
    }

    this.loading = true;
    const action = this.isEditMode 
      ? this.hotelService.updateService(this.selectedService.serviceID, this.selectedService)
      : this.hotelService.addService(this.selectedService);

    action.subscribe({
      next: () => {
        alert(this.isEditMode ? 'Cập nhật thành công!' : 'Thêm thành công!');
        this.showPopup = false;
        this.loadServices();
      },
      error: () => {
        alert('Đã xảy ra lỗi!');
        this.loading = false;
      }
    });
  }

  deleteService(id: number) {
    if (confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      this.hotelService.deleteService(id).subscribe({
        next: () => {
          alert('Xóa thành công!');
          this.loadServices();
        },
        error: () => alert('Lỗi khi xóa dịch vụ!')
      });
    }
  }
}