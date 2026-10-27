using API_QL_KhachSan.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BillController : ControllerBase
    {
        private readonly HotelContext _context;

        public BillController(HotelContext context)
        {
            _context = context;
        }

        [HttpGet("{bookingId}")]
        public async Task<IActionResult> GetBill(int bookingId)
        {
            // 1.lấy tt booking và các thông tin lquan từ csdl
            var booking = await _context.Bookings
                .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(b => b.Customer)
                .Include(b => b.ServiceOrders)
                    .ThenInclude(s => s.Servicess) //đám bảo kh lấy tên dvu
                .FirstOrDefaultAsync(b => b.BookingID == bookingId);

            if (booking == null)
            {
                return NotFound(new { message = "Booking không tồn tại" });
            }

            // 2.xử lý tính toán tgian
            var endTime = booking.CheckOutTime ?? DateTime.Now;
            var duration = endTime - booking.CheckInTime;
            double hours = duration.TotalHours;
            if (hours < 1) hours = 1;

            decimal roomPrice = 0;
            string priceType = "";

            // 3.logic tính giá room dựa trên tgian ở
            if (hours <= 12)
            {
                roomPrice = (decimal)Math.Ceiling(hours) * booking.Room.RoomType.PricePerHour;
                priceType = "Theo giờ";
            }
            else
            {
                roomPrice = booking.Room.RoomType.PricePerNight;
                priceType = "Qua đêm";
            }

            // 4.lấy ds dvu chi tiết
            var services = booking.ServiceOrders.Select(s => new
            {
                serviceName = s.Servicess?.ServiceName ?? "Dịch vụ không tên",
                unitPrice = s.PriceAtOrder,
                quantity = s.Quantity,
                total = s.Quantity * s.PriceAtOrder
            }).ToList();

            decimal serviceTotal = services.Sum(s => s.total);

            // 5.trả về kq
            return Ok(new
            {
                bookingId = booking.BookingID,
                customerName = booking.Customer?.FullName,
                phoneNumber = booking.Customer?.PhoneNumber,
                roomNumber = booking.Room?.RoomNumber,
                roomTypeName = booking.Room?.RoomType?.TypeName,
                checkInTime = booking.CheckInTime,
                checkOutTime = booking.CheckOutTime,
                durationHours = Math.Ceiling(hours),
                priceType = priceType,
                roomPrice = roomPrice,
                services = services,
                serviceTotal = serviceTotal,
                grandTotal = roomPrice + serviceTotal 
            });
        }
    }
}