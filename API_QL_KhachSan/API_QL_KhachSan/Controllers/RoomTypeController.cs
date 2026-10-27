using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomTypeController : ControllerBase
    {
        private readonly HotelContext _context;

        public RoomTypeController(HotelContext context)
        {
            _context = context;
        }

        // lấy danh sách loại phòng
        [HttpGet] // api/roomtype
        public async Task<ActionResult<IEnumerable<RoomType>>> GetRoomTypes()
        {
            return await _context.RoomTypes.ToListAsync();
        }

        // lấy loại phòng theo id
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomType>> GetRoomType(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);

            if (roomType == null)
            {
                return NotFound();
            }

            return roomType;
        }

        // tạo loại phòng mới
        [HttpPost]
        public async Task<ActionResult<RoomType>> CreateRoomType(RoomType roomType)
        {
            // kiểm tra trùng tên loại phòng
            if (_context.RoomTypes.Any(r => r.TypeName == roomType.TypeName))
            {
                return BadRequest(new { message = "Loại phòng đã tồn tại" });
            }

            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRoomType",
                new { id = roomType.RoomTypeID }, roomType);
        }

        // cập nhật loại phòng
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoomType(int id, RoomType roomType)
        {
            if (id != roomType.RoomTypeID)
            {
                return BadRequest("ID loại phòng không đúng");
            }

            // kiểm tra trùng tên (trừ chính nó)
            bool isDuplicate = _context.RoomTypes
                .Any(r => r.TypeName == roomType.TypeName && r.RoomTypeID != id);

            if (isDuplicate)
            {
                return BadRequest(new { message = "Tên loại phòng đã tồn tại" });
            }

            _context.Entry(roomType).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        // xóa loại phòng
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            var roomType = await _context.RoomTypes.FindAsync(id);

            if (roomType == null)
            {
                return NotFound();
            }

            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //tìm kiếm phòng theo id và tên
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<RoomType>>> SearchRoomType([FromQuery] int? id, [FromQuery] string? typeName)
        { 
            var query = _context.RoomTypes.AsQueryable();
            if (id.HasValue) 
            {
                query = query.Where(s => s.RoomTypeID == id.Value);
            }

            if (!string.IsNullOrEmpty(typeName)) 
            {
                query = query.Where(s => s.TypeName != null && s.TypeName.Contains(typeName)); 
            }
            var roomTypes = await query.ToListAsync();
            if (roomTypes.Count == 0)
            {
                return NotFound(new { message = "Không tìm thấy loại phòng nào" });
            }
            return Ok(roomTypes);
        }
        [HttpGet("top-booked")]
        public async Task<ActionResult<IEnumerable<object>>> GetTopBookedRoomTypes()
        {
            try
            {
                var bookings = await _context.Bookings
                    .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                    .ToListAsync();
                var result = bookings
                    .GroupBy(b => b.Room.RoomType.TypeName)
                    .Select(g => new {
                        TypeName = g.Key,
                        BookingCount = g.Count(),
                        Price = g.First().Room.RoomType.PricePerNight,
                        Description = g.First().Room.Description
                    })
                    .OrderByDescending(x => x.BookingCount)
                    .Take(3)
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
