import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class EmployeesComponent implements OnInit {
  listEmployees: any[] = [];
  showModal = false;
  isEdit = false;
  isLoading = false;
  currentEmp: any = this.getEmptyUser();

  roleList = ['Admin', 'Staff','Lễ tân', 'Tiếp tân', 'Dọn phòng', 'Bảo vệ', 'Kế toán'];
  statusList = ['Đang trong ca', 'Hết ca', 'Nghỉ phép', 'Tạm nghỉ'];

  constructor(private hotelService: HotelService) {}

  ngOnInit() { this.fetchEmployees(); }

  getEmptyUser() {
    return { fullName: '', userName: '', passwords: '', roles: 'Lễ tân', status: 'Hết ca', phoneNumber: '' };
  }

  fetchEmployees() {
    this.isLoading = true;
    this.hotelService.getEmployees().subscribe({
      next: (data) => {
        this.listEmployees = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openModal(emp: any = null) {
    this.isEdit = !!emp;
    this.currentEmp = emp ? { ...emp } : this.getEmptyUser();
    this.showModal = true;
  }

  saveEmployee() {
    if (this.isLoading) return;
    this.isLoading = true;

    const request = this.isEdit 
      ? this.hotelService.updateEmployee(this.currentEmp.usersId, this.currentEmp)
      : this.hotelService.addEmployee(this.currentEmp);

    request.subscribe({
      next: () => {
        this.fetchEmployees();
        this.showModal = false;
        this.isLoading = false;
        alert('Thao tác thành công!');
      },
      error: (err) => {
        alert('Lỗi: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  deleteEmployee(id: number) {
    if (confirm('Vy có chắc muốn xóa nhân viên này không?')) {
      this.hotelService.deleteEmployee(id).subscribe({
        next: () => this.fetchEmployees(),
        error: (err) => alert('Lỗi khi xóa: ' + err.message)
      });
    }
  }
}