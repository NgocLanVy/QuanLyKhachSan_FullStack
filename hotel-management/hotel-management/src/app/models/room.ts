// Model cho Loại phòng
export interface RoomType {
  roomTypeID: number;
  typeName: string;
  pricePerNight: number;
  pricePerHour: number;
  description?: string; 
}

// Model cho Phòng
export interface Room {
  roomID: number;
  roomNumber: string;
  roomTypeID: number;
  roomStatus: string; 
  roomType?: RoomType; 
}

// Model cho Khách hàng
export interface Customer {
  customerID: number;
  fullName: string;
  identityCard: string;
  phoneNumber: string;
}

export interface ServiceUsage {
    serviceName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Invoice {
    invoiceId: number;
    customerName: string;
    roomNumber: string;
    checkInTime: string;
    checkOutTime: string;
    roomPrice: number;
    services: ServiceUsage[]; 
    totalAmount: number;
}