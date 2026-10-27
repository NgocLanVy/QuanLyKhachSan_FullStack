using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly HotelContext _context;

        public RoomController(HotelContext context)
        {
            _context = context;
        }

        // GET: api/Room/DashboardStats
        [HttpGet("DashboardStats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var rooms = await _context.Rooms.ToListAsync();
            var stats = new
            {
                tongKhachHang = await _context.Users.CountAsync(),
                tongDonDatPhong = await _context.Bookings.CountAsync(),
                roomStatus = new
                {
                    available = rooms.Count(r => r.RoomStatus == "Available"),
                    occupied = rooms.Count(r => r.RoomStatus == "Occupied"),
                    cleaning = rooms.Count(r => r.RoomStatus == "Cleaning"),
                    reserved = rooms.Count(r => r.RoomStatus == "Reserved"),
                    inspecting = rooms.Count(r => r.RoomStatus == "Inspecting") //cnhat đến tthai ms
                },
                weeklyCheckIns = new int[] { 10, 25, 15, 30, 20, 45, 35 }
            };
            return Ok(stats);
        }

        // GET: api/Room
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            return await _context.Rooms.Include(r => r.RoomType).ToListAsync();
        }

        // GET: api/Room/Available
        [HttpGet("Available")]
        public async Task<ActionResult<IEnumerable<Room>>> GetAvailableRooms()
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Where(r => r.RoomStatus == "Available")
                .ToListAsync();
        }

        // GET: api/Room/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoom(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Bookings)
                .FirstOrDefaultAsync(r => r.RoomID == id);

            if (room == null) return NotFound("Không tìm thấy phòng");
            return Ok(room);
        }

        // GET: api/Room/All-StoredProc
        [HttpGet("All-StoredProc")]
        public async Task<IActionResult> GetRoomsUsingStoredProc()
        {
            var rooms = await _context.Database
                .SqlQuery<RoomStoredProcModel>($"EXEC dbo.GetAllRoomDetails")
                .ToListAsync();

            var result = rooms.Select(r => new RoomStoredProcModel
            {
                RoomID = r.RoomID,
                RoomNumber = r.RoomNumber,
                RoomStatus = r.RoomStatus,
                RoomTypeID = r.RoomTypeID,
                TypeName = r.TypeName,
                PricePerHour = r.PricePerHour,
                PricePerNight = r.PricePerNight,
                RoomType = new RoomType
                {
                    RoomTypeID = r.RoomTypeID,
                    TypeName = r.TypeName,
                    PricePerHour = r.PricePerHour,
                    PricePerNight = r.PricePerNight
                }
            });
            return Ok(result);
        }

        // POST: api/Room
        [HttpPost]
        public async Task<IActionResult> PostRoom(RoomInputModel input)
        {
            var roomType = await _context.RoomTypes.FindAsync(input.RoomTypeID);
            if (roomType == null) return BadRequest("Loại phòng không tồn tại");

            if (await _context.Rooms.AnyAsync(r => r.RoomNumber == input.RoomNumber))
                return BadRequest("Số phòng này đã tồn tại");

            var room = new Room
            {
                RoomNumber = input.RoomNumber,
                RoomTypeID = input.RoomTypeID,
                RoomStatus = "Available"
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return Ok(room);
        }

        // PUT: api/Room/{id}
        //[HttpPut("{id}")]
        //public async Task<IActionResult> UpdateRoomStatus(int id, [FromBody] Room roomUpdate)
        //{
        //    var room = await _context.Rooms.FindAsync(id);
        //    if (room == null) return NotFound();

        //    room.RoomStatus = roomUpdate.RoomStatus;
        //    room.RoomNumber = roomUpdate.RoomNumber ?? room.RoomNumber;
        //    if (roomUpdate.RoomTypeID > 0) room.RoomTypeID = roomUpdate.RoomTypeID;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //        return Ok(new { message = "Cập nhật thành công", room = room });
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!_context.Rooms.Any(e => e.RoomID == id)) return NotFound();
        //        else throw;
        //    }
        //}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoomStatus(int id, [FromBody] RoomUpdateModel roomUpdate)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            if (!string.IsNullOrEmpty(roomUpdate.RoomStatus)) room.RoomStatus = roomUpdate.RoomStatus;
            if (!string.IsNullOrEmpty(roomUpdate.RoomNumber)) room.RoomNumber = roomUpdate.RoomNumber;
            if (roomUpdate.RoomTypeID > 0) room.RoomTypeID = roomUpdate.RoomTypeID.Value;

            room.Description = roomUpdate.Description ?? room.Description;
            room.MaxGuests = roomUpdate.MaxGuests ?? room.MaxGuests;
            room.BedType = roomUpdate.BedType ?? room.BedType;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công", room = room });
        }

        //yêu cầu kiểm phòng
        [HttpPost("request-inspect/{id}")]
        public async Task<IActionResult> RequestInspect(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            if (room.RoomStatus == "Occupied")
            {
                room.RoomStatus = "Inspecting";
                await _context.SaveChangesAsync();
                return Ok(new { message = "Đang tiến hành kiểm phòng." });
            }
            return BadRequest("Phòng phải ở trạng thái Occupied mới có thể kiểm.");
        }

        // POST: api/Room/confirm-cleaned/{id}
        [HttpPost("confirm-cleaned/{id}")]
        public async Task<IActionResult> ConfirmCleaned(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();
            if (room.RoomStatus == "Cleaning" || room.RoomStatus == "Inspecting")
            {
                room.RoomStatus = "Available";
                await _context.SaveChangesAsync();
                return Ok(new { message = "Phòng đã sẵn sàng!" });
            }
            return BadRequest("Phòng không ở trạng thái cần dọn hoặc đang kiểm.");
        }
    }

    public class RoomInputModel
    {
        public string RoomNumber { get; set; } = null!;
        public int RoomTypeID { get; set; }
    }

    public class RoomStoredProcModel
    {
        public int RoomID { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string RoomStatus { get; set; } = null!;
        public int RoomTypeID { get; set; }
        public string TypeName { get; set; } = null!;
        public decimal PricePerHour { get; set; }
        public decimal PricePerNight { get; set; }

        [NotMapped]
        public RoomType? RoomType { get; set; }
    }
    public class RoomUpdateModel
    {
        public string? RoomNumber { get; set; }
        public string? RoomStatus { get; set; }
        public int? RoomTypeID { get; set; }
        public string? Description { get; set; }
        public int? MaxGuests { get; set; }
        public string? BedType { get; set; }
    }
}