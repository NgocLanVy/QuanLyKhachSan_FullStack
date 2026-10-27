import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bill-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill-modal.html',
  styleUrls: ['./bill-modal.css']
})
export class BillModal {
  @Input() set bookingData(data: any) {
    if (data) {
      this.processedData = this.formatBill(data);
    }
  }

  @Output() close = new EventEmitter<void>();
  @Output() confirmCheckout = new EventEmitter<number>();

  processedData: any;

  formatBill(booking: any) {
    const rawServices = booking.serviceOrders || [];
    const grouped = rawServices.reduce((acc: any, curr: any) => {
      const sName = curr.serviceName || 'Dịch vụ #' + curr.serviceID;
      const unitPrice = Number(curr.priceAtOrder || 0);
      const qty = Number(curr.quantity || 0);
      if (acc[sName]) {
        acc[sName].quantity += qty;
        acc[sName].total += qty * unitPrice;
      } else {
        acc[sName] = {
          serviceName: sName,
          quantity: qty,
          unitPrice: unitPrice, 
          total: qty * unitPrice
        };
      }
      return acc;
    }, {});
    return {
      ...booking,
      customerName: booking.customer?.fullName || 'Khách vãng lai',
      identityCard: booking.customer?.identityCard || 'N/A',
      roomNumber: booking.room?.roomNumber || 'N/A',
      roomTypeName: booking.room?.roomType?.typeName || 'Tiêu chuẩn',
      processedServices: Object.values(grouped),
      totalServicePrice: Object.values(grouped).reduce((sum: number, s: any) => sum + s.total, 0),
      grandTotal: Number(booking.totalRoomPrice || 0)
    };
  }

  printBill() {
    window.print();
  }
}