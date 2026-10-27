import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login';
import { DashboardComponent } from './pages/admin/dashboard/dashboard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { RoomListComponent } from './pages/admin/room-list/room-list';
import { BookingListComponent } from './pages/receptionist/booking-list/booking-list';
import { CheckInOutComponent } from './components/check-in-out/check-in-out';
import { ReceptionistLayoutComponent } from './layouts/receptionist-layout/receptionist-layout';
import { HousekeepingComponent } from './pages/housekeeping/housekeeping';
import { RoomTypeComponent } from './pages/admin/room-type/room-type';
import { ServiceMenu } from './pages/admin/service-menu/service-menu';
import { CustomerList } from './pages/receptionist/customer-list/customer-list';
import { EmployeesComponent } from './pages/admin/employees/employees';
import { OccupancyRate } from './pages/admin/occupancy-rate/occupancy-rate';
import { ReportRevenue } from './pages/admin/report-revenue/report-revenue';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { Booking } from './pages/public/booking/booking';
import { RoomDetail } from './pages/public/room-detail/room-detail';
import { Rooms } from './pages/public/rooms/rooms';
import { Home } from './pages/public/home/home';
import { ExtendStayComponent } from './pages/admin/extend-stay/extend-stay';
import { BookingRequestsComponent } from './pages/admin/booking-requests/booking-requests';

export const routes: Routes = [
  {
    path: 'home',
    component: PublicLayout,
    children: [
      { path: '', component: Home, title: 'Royal Mellow Hotel' },
      { path: 'rooms', component: Rooms, title: 'Danh sách phòng' },
      { path: 'rooms/:id', component: RoomDetail, title: 'Chi tiết phòng' },
      { path: 'booking/:id', component: Booking, title: 'Đặt phòng' },
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Tổng quan hệ thống' },
      { path: 'report-revenue', component: ReportRevenue, title: 'Phân tích doanh thu' },
      { path: 'occupancy-rate', component: OccupancyRate, title: 'Thống kê lấp đầy' },
      { path: 'room-list', component: RoomListComponent },
      { path: 'booking-list', component: BookingListComponent },
      { path: 'booking-requests', component: BookingRequestsComponent, title: 'Yêu cầu đặt phòng' },
      { path: 'checkin-checkout', component: CheckInOutComponent },
      { path: 'extend-stay', component: ExtendStayComponent, title: 'Gia hạn phòng' },
      { path: 'housekeeping', component: HousekeepingComponent },
      { path: 'room-type', component: RoomTypeComponent, title: 'Cấu hình Loại phòng & Giá' },
      { path: 'service-menu', component: ServiceMenu, title: 'Quản lý Dịch vụ & Giá' },
      { path: 'customers', component: CustomerList, title: 'Quản lý Khách hàng' },
      { path: 'user-management', component: EmployeesComponent, title: 'Quản lý nhân sự' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'receptionist',
    component: ReceptionistLayoutComponent,
    children: [
      { path: 'room-plan', component: RoomListComponent },
      { path: 'booking-list', component: BookingListComponent },
      { path: 'checkin-checkout', component: CheckInOutComponent },
      { path: 'service-menu', component: ServiceMenu, title: 'Menu Dịch vụ' },
      { path: 'customers', component: CustomerList, title: 'Danh mục khách hàng' },
      { path: '', redirectTo: 'room-plan', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'home' }
];