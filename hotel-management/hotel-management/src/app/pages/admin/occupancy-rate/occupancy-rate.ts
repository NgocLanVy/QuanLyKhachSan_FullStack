import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../core/services/hotel';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-occupancy-rate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './occupancy-rate.html',
  styleUrl: './occupancy-rate.css'
})
export class OccupancyRate implements OnInit {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef;
  chart: any;
  today: Date = new Date();
  startDate: string = '';
  endDate: string = '';
  occupancyPercent: number = 0;
  stats: any = { availableRooms: 0, occupiedRooms: 0, cleaningRooms: 0, reservedRooms: 0, totalRooms: 0 };

  constructor(private hotelService: HotelService) {
    const now = new Date();
    this.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    this.endDate = now.toISOString().split('T')[0];
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadStats();
    }, 0);
  }

  loadStats() {
    this.hotelService.getDashboardStats(this.startDate, this.endDate).subscribe({
      next: (res) => {
        this.stats = res;
        const total = res.availableRooms + res.occupiedRooms + res.cleaningRooms + res.reservedRooms;
        this.stats.totalRooms = total;
        this.occupancyPercent = total > 0 ? Math.round((res.occupiedRooms / total) * 100) : 0;
        this.initPieChart(res);
      },
      error: (err) => console.error("Lỗi:", err)
    });
  }

  initPieChart(data: any) {
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Đang ở', 'Phòng trống', 'Dọn dẹp', 'Đặt trước'],
        datasets: [{
          data: [data.occupiedRooms, data.availableRooms, data.cleaningRooms, data.reservedRooms],
          backgroundColor: ['#ff4d4d', '#2ecc71', '#f1c40f', '#3498db'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        cutout: '80%',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}