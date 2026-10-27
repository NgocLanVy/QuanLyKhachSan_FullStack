import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent implements OnInit {
  // 1. Tạo biến để chứa tên
  userName: string = '';

  ngOnInit(): void {
    // 2. Khi trang vừa hiện lên, lôi tên từ "kho" ra
    const savedName = localStorage.getItem('fullName'); 
    
    // Nếu có tên thì gán vào biến, không thì để khách vãng lai
    this.userName = savedName ? savedName : 'Khách';
  }
}