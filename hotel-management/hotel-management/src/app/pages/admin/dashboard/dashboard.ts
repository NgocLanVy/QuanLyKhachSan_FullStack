import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import { HotelService } from '../../../core/services/hotel';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

  currentUser = { userName: 'Người dùng', role: 'Admin' };
  tongKhachHang = 0;
  tongDonDatPhong = 0;
  tongDichVu = 0;
  tongDoanhThu = 0;

  //bdo tròn
  pieChartData: ChartData<'pie'> = {
    labels: ['Trống', 'Đang ở', 'Đang dọn', 'Đã đặt', 'Đang kiểm'],
    datasets: [{ 
      data: [0, 0, 0, 0, 0], 
      backgroundColor: ['#22c55e', '#ef4444', '#facc15', '#3b82f6', '#f59e0b'] 
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  //top dvu
  serviceChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ label: 'Số lượng', data: [], backgroundColor: '#8b5cf6' }]
  };

  horizontalBarOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true } }
  };

  //cột checkin
  barChartData: ChartData<'bar'> = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [{ label: 'Lượt check-in', data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#3c50e0' }]
  };

  //doanh thu (đg)
  lineChartData: ChartData<'line'> = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: [0, 0, 0, 0, 0, 0, 0],
      fill: true,
      borderColor: '#34d399',
      backgroundColor: 'rgba(52, 211, 153, 0.2)',
      tension: 0.4
    }]
  };

  barChartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } }
  };

  constructor(
    private service: HotelService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedName = localStorage.getItem('fullName') || localStorage.getItem('userName');
      const savedRole = localStorage.getItem('userRole') || 'Admin';
      if (savedName) this.currentUser = { userName: savedName, role: savedRole };
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    this.service.getDashboardStats().subscribe({
      next: (res) => {
        this.tongKhachHang = res.tongKhachHang || 0;
        this.tongDonDatPhong = res.tongDonDatPhong || 0;
        this.tongDichVu = res.tongDichVu || 0;
        this.tongDoanhThu = res.tongDoanhThu || 0;

        this.pieChartData = {
          ...this.pieChartData,
          datasets: [{
            ...this.pieChartData.datasets[0],
            data: [
              res.availableRooms || 0, 
              res.occupiedRooms || 0, 
              res.cleaningRooms || 0, 
              res.reservedRooms || 0,
              res.inspectingRooms || 0
            ]
          }]
        };

        if (res.topServices) {
          this.serviceChartData = {
            labels: res.topServices.map((s: any) => s.name),
            datasets: [{ ...this.serviceChartData.datasets[0], data: res.topServices.map((s: any) => s.count) }]
          };
        }

        this.barChartData = {
          ...this.barChartData,
          datasets: [{
            ...this.barChartData.datasets[0],
            data: [...(res.weeklyCheckIns || [0, 0, 0, 0, 0, 0, 0])]
          }]
        };

        this.lineChartData = {
          ...this.lineChartData,
          datasets: [{
            ...this.lineChartData.datasets[0],
            data: [...(res.weeklyRevenue || [0, 0, 0, 0, 0, 0, 0])]
          }]
        };

        this.cdr.detectChanges();
        
        setTimeout(() => {
          if (this.charts) {
            this.charts.forEach(chart => {
              chart.chart?.update();
            });
          }
        }, 250); 
      },
      error: (err) => console.error('Lỗi Dashboard:', err)
    });
  }
}