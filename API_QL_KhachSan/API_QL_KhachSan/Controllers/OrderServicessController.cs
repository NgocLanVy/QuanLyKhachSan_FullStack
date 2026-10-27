using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceOrderController : ControllerBase
    {
        private readonly HotelContext _context;

        public ServiceOrderController(HotelContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> OrderService([FromBody] OrderRequest orderRequest)
        {
            var booking = await _context.Bookings.FindAsync(orderRequest.BookingID);
            if (booking == null)
                return NotFound(new { message = "Không tìm thấy thông tin đặt phòng này." });

            if (booking.CheckOutTime != null)
                return BadRequest(new { message = "Khách đã trả phòng, không thể đặt thêm dịch vụ!" });

            var service = await _context.Services.FindAsync(orderRequest.ServiceID);
            if (service == null)
                return NotFound(new { message = "Dịch vụ không tồn tại trong hệ thống." });

            if (orderRequest.Quantity <= 0)
                return BadRequest(new { message = "Số lượng dịch vụ phải lớn hơn 0." });

            decimal priceAtOrder = service.Price * 1.01m;

            var newOrder = new ServiceOrder
            {
                BookingID = orderRequest.BookingID,
                ServiceID = orderRequest.ServiceID,
                Quantity = orderRequest.Quantity,
                PriceAtOrder = priceAtOrder,
                OrderTime = DateTime.Now
            };

            _context.ServiceOrders.Add(newOrder); 
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đặt dịch vụ thành công!",
                serviceName = service.ServiceName,
                quantity = newOrder.Quantity,
                totalPrice = newOrder.Quantity * priceAtOrder
            });
        }

        [HttpPost("housekeeping-check")]
        public async Task<IActionResult> HousekeepingCheck([FromBody] HousekeepingChecklist request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
            {
                return BadRequest(new { message = "Không có dịch vụ nào để lưu." });
            }

            var booking = await _context.Bookings
                .FirstOrDefaultAsync(b => b.RoomID == request.RoomID && b.Status == "Checked-in");

            if (booking == null)
                return NotFound(new { message = "Không tìm thấy lượt đặt phòng đang hoạt động cho phòng này." });

            foreach (var item in request.Items)
            {
                var service = await _context.Services.FindAsync(item.ServiceID);
                if (service != null)
                {
                    var order = new ServiceOrder
                    {
                        BookingID = booking.BookingID,
                        ServiceID = item.ServiceID,
                        Quantity = item.Quantity,
                        PriceAtOrder = service.Price, 
                        OrderTime = DateTime.Now
                    };
                    _context.ServiceOrders.Add(order);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật danh sách dịch vụ sử dụng thành công!" });
        }
    }

    public class OrderRequest
    {
        public int BookingID { get; set; }
        public int ServiceID { get; set; }
        public int Quantity { get; set; }
    }

    public class HousekeepingChecklist
    {
        public int RoomID { get; set; }
        public List<ServiceItem> Items { get; set; } = new List<ServiceItem>();
    }

    public class ServiceItem
    {
        public int ServiceID { get; set; }
        public int Quantity { get; set; }
    }
}