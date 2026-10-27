using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API_QL_KhachSan.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly HotelContext _context;
        private readonly IConfiguration _config;

        public UserController(HotelContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // 1. Lấy all ds nhân viên
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Users>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // 2.chi tiết nv theo id
        [HttpGet("{id}")]
        public async Task<ActionResult<Users>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });
            return Ok(user);
        }

        // 3.tạo ms nv
        [HttpPost]
        public async Task<ActionResult<Users>> CreateUser(Users user)
        {
            if (_context.Users.Any(u => u.UserName == user.UserName))
            {
                return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });
            }

            if (string.IsNullOrEmpty(user.Roles)) user.Roles = "Lễ tân";
            if (string.IsNullOrEmpty(user.Status)) user.Status = "Hết ca";

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // 4.cnaht nv
        [HttpPut("{id}")]
        public async Task<ActionResult<Users>> UpdateUser(int id, Users user)
        {
            if (id != user.UsersId) return BadRequest(new { message = "ID không khớp" });

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                var updatedUser = await _context.Users.FindAsync(id);
                return Ok(updatedUser);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id)) return NotFound();
                else throw;
            }
        }

        // 5.cnhat tthai nv
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            user.Status = newStatus;
            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công", status = newStatus });
        }

        // 6. Xóa nv
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa nhân viên thành công" });
        }

        // 7.tìm keiems nv
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Users>>> SearchUsers([FromQuery] int? id, [FromQuery] string? fullname)
        {
            var query = _context.Users.AsQueryable();

            if (id.HasValue)
            {
                query = query.Where(u => u.UsersId == id.Value);
            }

            if (!string.IsNullOrEmpty(fullname))
            {
                query = query.Where(u => u.FullName != null && u.FullName.Contains(fullname));
            }

            var users = await query.ToListAsync();
            return users.Count == 0 ? NotFound(new { message = "Không tìm thấy" }) : Ok(users);
        }

        // 8.cnang dnhap tạo token
        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto model)
        {
            if (model == null) return BadRequest("Dữ liệu không hợp lệ");

            var user = _context.Users.FirstOrDefault(u =>
                u.UserName == model.UserName && u.passwords == model.Password);

            if (user == null) return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Role, user.Roles ?? "Staff"),
                new Claim("UserId", user.UsersId.ToString())
            };

            var jwtKey = _config["Jwt:Key"] ?? "Key_Mac_Dinh_Sieu_Bao_Mat_123456";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiryInMinutes"] ?? "60")),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                user = new { user.UsersId, user.FullName, user.Roles, user.Status }
            });
        }

        private bool UserExists(int id) => _context.Users.Any(u => u.UsersId == id);
    }
}