import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel';

@Component({
  selector: 'app-report-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-revenue.html',
  styleUrl: './report-revenue.css'
})
export class ReportRevenue implements OnInit {
  revenueData: any[] = [];
  startDate: string = ''; 
  endDate: string = '';   
  
  totalRevenue: number = 0;
  totalOrders: number = 0;

  constructor(
    private hotelService: HotelService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchReport(); 
  }

  fetchReport() {
    this.hotelService.getRevenueReport(this.startDate, this.endDate).subscribe({
      next: (res: any) => {
        this.revenueData = [...res];
        
        this.totalRevenue = res.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
        this.totalOrders = res.reduce((sum: number, item: any) => sum + item.orderCount, 0);
        
        this.cdr.detectChanges(); 
        
        console.log("Tổng doanh thu hiện tại:", this.totalRevenue);
      },
      error: (err) => {
        console.error("Lỗi lấy báo cáo:", err);
        alert("Không thể tải báo cáo doanh thu!");
      }
    });
  }
}