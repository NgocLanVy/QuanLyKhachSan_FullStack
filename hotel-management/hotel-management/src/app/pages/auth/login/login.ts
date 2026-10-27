import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../../core/services/hotel';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  user = {
    username: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(
    private hotelService: HotelService, 
    private router: Router
  ) {}

  onSubmit() {
    console.log("Đang gửi yêu cầu đăng nhập...");
    
    this.hotelService.login(this.user.username, this.user.password).subscribe({
      next: (res) => {
        this.hotelService.saveUserToken(res);
        
        const role = localStorage.getItem('userRole');
        
        if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/receptionist/booking-list']);
        }
      },
      error: (err: any) => {
        console.error("Lỗi đăng nhập:", err);
        this.errorMessage = err.error?.message || "Sai tài khoản hoặc mật khẩu rồi bạn ơi!";
      }
    });
  }
}