using API_QL_KhachSan.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace API_QL_KhachSan.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly HotelContext _context;

        public DashboardController(HotelContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var tongKhachHang = await _context.Customers.CountAsync();
                var tongDonDatPhong = await _context.Bookings.CountAsync();
                var tongDichVu = await _context.Services.CountAsync();
                var tongNhanSu = await _context.Users.CountAsync();

                var allCheckedOutBookings = await _context.Bookings
                    .Include(b => b.ServiceOrders)
                    .Where(b => b.Status == "Checked-out")
                    .ToListAsync();

                var tongDoanhThu = allCheckedOutBookings.Sum(b =>
                    b.TotalRoomPrice + (b.ServiceOrders?.Sum(so => so.Quantity * so.PriceAtOrder) ?? 0));

                var rooms = await _context.Rooms.ToListAsync();
                var availableRooms = rooms.Count(r => r.RoomStatus?.ToLower() == "available");
                var occupiedRooms = rooms.Count(r => r.RoomStatus?.ToLower() == "occupied");
                var cleaningRooms = rooms.Count(r => r.RoomStatus?.ToLower() == "cleaning");
                var reservedRooms = rooms.Count(r => r.RoomStatus?.ToLower() == "reserved");
                var inspectingRooms = rooms.Count(r => r.RoomStatus?.ToLower() == "inspecting");

                var topServices = await _context.ServiceOrders
                    .Include(s => s.Servicess)
                    .GroupBy(s => s.Servicess.ServiceName)
                    .Select(g => new { Name = g.Key, Count = g.Sum(x => x.Quantity) })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToListAsync();

                var today = DateTime.Today;
                var startOfWeek = today.AddDays(-(int)(today.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)today.DayOfWeek - 1));
                var endOfWeek = startOfWeek.AddDays(7);

                var weeklyCheckIns = new int[7];
                var weeklyRevenue = new decimal[7];

                var allBookingsInWeek = await _context.Bookings
                    .Include(b => b.ServiceOrders)
                    .Where(b => b.CheckInTime >= startOfWeek && b.CheckInTime < endOfWeek)
                    .ToListAsync();

                for (int i = 0; i < 7; i++)
                {
                    var date = startOfWeek.AddDays(i);
                    weeklyCheckIns[i] = allBookingsInWeek.Count(b => b.CheckInTime.Date == date.Date);

                    var checkOutsToday = allCheckedOutBookings
                        .Where(b => b.CheckOutTime.HasValue && b.CheckOutTime.Value.Date == date.Date)
                        .ToList();

                    weeklyRevenue[i] = checkOutsToday.Sum(b =>
                        b.TotalRoomPrice + (b.ServiceOrders?.Sum(so => so.Quantity * so.PriceAtOrder) ?? 0));
                }

                return Ok(new
                {
                    tongKhachHang,
                    tongDonDatPhong,
                    tongDichVu,
                    tongNhanSu,
                    tongDoanhThu,
                    availableRooms,
                    occupiedRooms,
                    cleaningRooms,
                    reservedRooms,
                    inspectingRooms,
                    weeklyCheckIns,
                    weeklyRevenue,
                    topServices
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi", error = ex.Message });
            }
        }

        [HttpGet("revenue-report")]
        public async Task<IActionResult> GetRevenueReport(DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Bookings
                .Include(b => b.ServiceOrders)
                .Where(b => b.Status == "Checked-out")
                .AsQueryable();

            if (startDate.HasValue)
                query = query.Where(b => b.CheckOutTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(b => b.CheckOutTime <= endDate.Value);

            var data = await query.ToListAsync();

            var report = data
                .GroupBy(b => b.CheckOutTime.Value.Date)
                .Select(g => new {
                    Date = g.Key,
                    OrderCount = g.Count(),
                    TotalAmount = g.Sum(b => b.TotalRoomPrice + (b.ServiceOrders?.Sum(so => so.Quantity * so.PriceAtOrder) ?? 0))
                })
                .OrderByDescending(x => x.Date)
                .ToList();

            return Ok(report);
        }
    }
}