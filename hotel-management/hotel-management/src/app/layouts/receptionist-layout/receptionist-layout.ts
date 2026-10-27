import { RouterModule } from "@angular/router";
import { HotelService } from "../../core/services/hotel";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-receptionist-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'receptionist-layout.html', 
  styleUrl: 'receptionist-layout.css'
})
export class ReceptionistLayoutComponent implements OnInit {
  fullName: string = '';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.fullName = localStorage.getItem('fullName') || 'Lễ tân';
  }

  logout() {
    this.hotelService.logout();
  }
}