using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly HotelContext _context;

        public BookingController(HotelContext context)
        {
            _context = context;
        }

        // 1. Lấy all ds Booking
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<Booking>>> GetBookings()
        //{
        //    return await _context.Bookings
        //        .Include(b => b.Room)
        //        .ThenInclude(r => r.RoomType)
        //        .Include(b => b.Customer)
        //        .Include(b => b.ServiceOrders)
        //        .ThenInclude(so => so.Servicess)
        //        .OrderByDescending(b => b.CheckInTime)
        //        .ToListAsync();
        //}
        [HttpGet]
        public async Task<ActionResult> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Room).ThenInclude(r => r.RoomType)
                .Include(b => b.Customer)
                .Include(b => b.ServiceOrders).ThenInclude(so => so.Servicess)
                .OrderByDescending(b => b.CheckInTime)
                .Select(b => new
                {
                    b.BookingID,
                    b.CheckInTime,
                    b.CheckOutTime,
                    b.Status,
                    b.TotalRoomPrice,
                    Customer = b.Customer != null ? new
                    {
                        b.Customer.CustomerID,
                        b.Customer.FullName,
                        b.Customer.IdentityCard,
                        b.Customer.PhoneNumber
                    } : null,
                    Room = b.Room != null ? new
                    {
                        b.Room.RoomID,
                        b.Room.RoomNumber,
                        b.Room.RoomStatus,
                        RoomType = b.Room.RoomType != null ? new
                        {
                            b.Room.RoomType.TypeName
                        } : null
                    } : null,
                    ServiceOrders = b.ServiceOrders.Select(so => new
                    {
                        so.ServiceID,
                        so.Quantity,
                        so.PriceAtOrder,
                        ServiceName = so.Servicess != null ? so.Servicess.ServiceName : "Dịch vụ lạ"
                    }).ToList()
                })
                .ToListAsync();

            return Ok(bookings);
        }
        // 2.chi tiết booking theo id
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .Include(b => b.Customer)
                .FirstOrDefaultAsync(b => b.BookingID == id);

            if (booking == null) return NotFound("Không tìm thấy đơn đặt phòng.");

            return booking;
        }

        // 3.checkin — tạo booking mới, cập nhật trạng thái phòng
        [HttpPost("checkin")]
        public async Task<IActionResult> CheckIn(CheckInModel model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var room = await _context.Rooms.FirstOrDefaultAsync(r => r.RoomID == model.RoomID);
                if (room == null) return BadRequest("Phòng không tồn tại.");
                if (room.RoomStatus != "Available") return BadRequest("Phòng không khả dụng.");

                var customer = new Customer
                {
                    FullName = model.FullName,
                    IdentityCard = model.IdentityCard,
                    PhoneNumber = model.PhoneNumber
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();

                var booking = new Booking
                {
                    RoomID = room.RoomID,
                    CustomerID = customer.CustomerID,
                    CheckInTime = DateTime.Now,
                    Status = "Checked-in",
                    TotalRoomPrice = 0
                };
                _context.Bookings.Add(booking);

                room.RoomStatus = "Occupied";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Check-in thành công!", bookingId = booking.BookingID });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // 4. API Check-out 
        //[HttpPost("check-out/{bookingId}")]
        //public async Task<IActionResult> CheckOut(int bookingId)
        //{
        //    var booking = await _context.Bookings
        //        .Include(b => b.Room).ThenInclude(r => r.RoomType)
        //        .FirstOrDefaultAsync(b => b.BookingID == bookingId);

        //    if (booking == null) return NotFound("Booking không tồn tại.");
        //    if (booking.Status == "Checked-out") return BadRequest("Phòng này đã làm thủ tục trả rồi.");

        //    var now = DateTime.Now;
        //    booking.CheckOutTime = now;
        //    booking.Status = "Checked-out";

        //    double totalHours = (now - booking.CheckInTime).TotalHours;
        //    if (totalHours <= 0) totalHours = 0.5;

        //    decimal giaGio = booking.Room.RoomType?.PricePerHour ?? 0;
        //    decimal giaDem = booking.Room.RoomType?.PricePerNight ?? 0;
        //    decimal roomPrice = 0;

        //    if (totalHours <= 12)
        //    {
        //        // Dưới 12h tính hoàn toàn theo giờ lẻ
        //        roomPrice = (decimal)Math.Ceiling(totalHours) * giaGio;
        //    }
        //    else
        //    {
        //        // Trên 12h tính theo công thức: (Số ngày * Giá đêm) + (Số giờ lẻ * Giá giờ)
        //        int soNgay = (int)(totalHours / 24);
        //        double soGioLe = totalHours % 24;

        //        if (soGioLe > 12)
        //        {
        //            // Nếu lẻ hơn 12 tiếng =1 đêm 
        //            roomPrice = (soNgay + 1) * giaDem;
        //        }
        //        else
        //        {
        //            // Tính số ngày + số giờ lẻ
        //            roomPrice = (soNgay * giaDem) + (decimal)Math.Ceiling(soGioLe) * giaGio;
        //        }
        //    }

        //    // Tính tiền dịch vụ
        //    var serviceTotal = await _context.ServiceOrders
        //        .Where(s => s.BookingID == bookingId)
        //        .SumAsync(s => (decimal?)s.Quantity * s.PriceAtOrder) ?? 0;

        //    booking.TotalRoomPrice = roomPrice + serviceTotal;
        //    booking.Room.RoomStatus = "Cleaning";

        //    await _context.SaveChangesAsync();

        //    return Ok(new
        //    {
        //        message = "Check-out thành công!",
        //        total = booking.TotalRoomPrice,
        //        roomCharge = roomPrice,
        //        serviceCharge = serviceTotal,
        //        hoursStayed = Math.Round(totalHours, 1)
        //    });
        //}
        // 4. API Check-out 
        [HttpPost("check-out/{bookingId}")]
        public async Task<IActionResult> CheckOut(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room).ThenInclude(r => r.RoomType)
                .Include(b => b.ServiceOrders).ThenInclude(s => s.Servicess)
                .FirstOrDefaultAsync(b => b.BookingID == bookingId);

            if (booking == null) return NotFound("Booking không tồn tại.");
            if (booking.Status == "Checked-out") return BadRequest("Phòng này đã làm thủ tục trả rồi.");

            var now = DateTime.Now;
            booking.CheckOutTime = now;
            booking.Status = "Checked-out";

            double totalHours = (now - booking.CheckInTime).TotalHours;
            if (totalHours <= 0) totalHours = 0.5;

            decimal giaGio = booking.Room.RoomType?.PricePerHour ?? 0;
            decimal giaDem = booking.Room.RoomType?.PricePerNight ?? 0;
            decimal roomPrice = 0;

            if (totalHours <= 12)
            {
                roomPrice = (decimal)Math.Ceiling(totalHours) * giaGio;
            }
            else
            {
                int soNgay = (int)(totalHours / 24);
                double soGioLe = totalHours % 24;

                if (soGioLe > 12)
                {
                    roomPrice = (soNgay + 1) * giaDem;
                }
                else
                {
                    roomPrice = (soNgay * giaDem) + (decimal)Math.Ceiling(soGioLe) * giaGio;
                }
            }
            var serviceTotal = booking.ServiceOrders?
                .Sum(s => (decimal?)s.Quantity * s.PriceAtOrder) ?? 0;

            booking.TotalRoomPrice = roomPrice + serviceTotal;
            booking.Room.RoomStatus = "Cleaning";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Check-out thành công!",
                total = booking.TotalRoomPrice,
                roomCharge = roomPrice,
                serviceCharge = serviceTotal,
                serviceDetails = booking.ServiceOrders?.Select(s => new
                {
                    ServiceName = s.Servicess?.ServiceName ?? "N/A",
                    s.Quantity,
                    s.PriceAtOrder
                }),
                hoursStayed = Math.Round(totalHours, 1)
            });
        }

        // 5. Hủy Booking
        [HttpDelete("cancel/{bookingId}")]
        public async Task<IActionResult> CancelCheckIn(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.BookingID == bookingId);

            if (booking == null) return NotFound();
            if (booking.Status == "Checked-out") return BadRequest("Không thể hủy đơn đã thanh toán.");

            booking.Room.RoomStatus = "Available";

            var services = _context.ServiceOrders.Where(s => s.BookingID == bookingId);
            _context.ServiceOrders.RemoveRange(services);

            _context.Bookings.Remove(booking);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã hủy đơn đặt phòng." });
        }
        // 6. đặt phòng onl 
        [HttpPost("reserve")]
        public async Task<IActionResult> Reserve(CheckInModel model)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var room = await _context.Rooms.FirstOrDefaultAsync(r => r.RoomID == model.RoomID);
                if (room == null) return BadRequest("Phòng không tồn tại.");
                if (room.RoomStatus != "Available") return BadRequest("Phòng không khả dụng.");

                var customer = new Customer
                {
                    FullName = model.FullName,
                    IdentityCard = model.IdentityCard ?? "",
                    PhoneNumber = model.PhoneNumber
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();

                var booking = new Booking
                {
                    RoomID = room.RoomID,
                    CustomerID = customer.CustomerID,
                    CheckInTime = DateTime.Now,
                    CheckOutTime = model.CheckOutTime?.Date.AddHours(12) ?? DateTime.Now.AddDays(1).Date.AddHours(12),
                    Status = "Reserved",  
                    TotalRoomPrice = 0
                };
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Đặt phòng thành công! Chúng tôi sẽ liên hệ bạn sớm.", bookingId = booking.BookingID });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // 7. gia hạn room
        [HttpPut("extend/{bookingId}")]
        public async Task<IActionResult> ExtendStay(int bookingId, [FromBody] ExtendModel model)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room).ThenInclude(r => r.RoomType)
                .FirstOrDefaultAsync(b => b.BookingID == bookingId);
            if (booking == null) return NotFound("Booking không tồn tại.");
            if (booking.Status == "Checked-out") return BadRequest("Phòng đã check-out, không thể gia hạn.");
            if (model.NewCheckOutTime <= booking.CheckInTime)
                return BadRequest("Ngày gia hạn phải sau ngày check-in.");
            booking.CheckOutTime = model.NewCheckOutTime;
            double totalHours = (model.NewCheckOutTime - booking.CheckInTime).TotalHours;
            decimal giaGio = booking.Room.RoomType?.PricePerHour ?? 0;
            decimal giaDem = booking.Room.RoomType?.PricePerNight ?? 0;
            decimal roomPrice = 0;
            if (totalHours <= 12)
            {
                roomPrice = (decimal)Math.Ceiling(totalHours) * giaGio;
            }
            else
            {
                int soNgay = (int)(totalHours / 24);
                double soGioLe = totalHours % 24;
                roomPrice = soGioLe > 12
                    ? (soNgay + 1) * giaDem
                    : (soNgay * giaDem) + (decimal)Math.Ceiling(soGioLe) * giaGio;
            }
            booking.TotalRoomPrice = roomPrice;
            await _context.SaveChangesAsync();
            return Ok(new
            {
                message = "Gia hạn thành công!",
                newCheckOut = booking.CheckOutTime,
                newTotal = booking.TotalRoomPrice
            });
        }
        // 8.duyệt đơn đặt phòng từ xa
        [HttpPost("confirm-reserved/{id}")]
        public async Task<IActionResult> ConfirmReserved(int id)
        {
            var booking = await _context.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.BookingID == id);

            if (booking == null) return NotFound("Không tìm thấy đơn.");
            if (booking.Status != "Reserved") return BadRequest("Đơn này không ở trạng thái chờ duyệt.");
            booking.CheckInTime = DateTime.Now;
            booking.Status = "Checked-in";

            if (booking.Room != null)
            {
                booking.Room.RoomStatus = "Occupied";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Xác nhận thành công, bắt đầu tính giờ!" });
        }
    }
}