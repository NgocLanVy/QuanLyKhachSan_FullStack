using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        public readonly HotelContext _context;
        public ServiceController(HotelContext context)
        {
            _context = context;
        }

        // lấy danh sách dịch vụ
        [HttpGet] //api/service
        public async Task<ActionResult<IEnumerable<Service>>> GetServices()
        {
            return await _context.Services.ToListAsync();
        }
        // tạo dịch vụ mới
        [HttpPost]
        public async Task<ActionResult<Service>> CreateService(Service service)
        {
            // kiểm tra tên dịch vụ đã tồn tại chưa
            if (_context.Services.Any(s => s.ServiceName == service.ServiceName))
            {
                return BadRequest(new { message = "Tên dịch vụ đã tồn tại" });
            }

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetService", new { id = service.ServiceID },service);
        }
        //lấy dịch vụ theo id
        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetService(int id)
        {
            var service = await _context.Services.FindAsync(id);

            if (service == null)
            {
                return NotFound();
            }

            return service;
        }
        // cập nhật dịch vụ
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(int id, Service service)
        {
            if (id != service.ServiceID)
            {
                return BadRequest("ID dịch vụ không đúng");
            }

            _context.Entry(service).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        // xóa dịch vụ
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);

            if (service == null)
            {
                return NotFound();
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool ServiceExists(int id)
        {
            return _context.Services.Any(s => s.ServiceID == id);
        }
        // tìm kiếm dịch vụ theo id và tên dịch vụ
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Service>>> SearchServices([FromQuery] int? id,[FromQuery] string? serviceName) // tìm kiếm dịch vụ theo id và tên dịch vụ
        {
            // tạo câu truy vấn động
            var query = _context.Services.AsQueryable(); // AsQueryable để có thể thêm điều kiện vào câu truy vấn

            if (id.HasValue) // kiểm tra id có giá trị hay không
            {
                query = query.Where(s => s.ServiceID == id.Value); // nếu có thì thêm điều kiện vào câu truy vấn
            }

            if (!string.IsNullOrEmpty(serviceName)) // kiểm tra tên dịch vụ không rỗng
            {
                query = query.Where(s =>s.ServiceName != null &&s.ServiceName.Contains(serviceName)); // tìm gần đúng theo tên dịch vụ
            }
            // thực thi câu truy vấn và trả về kết quả
            var services = await query.ToListAsync();
            if (services.Count == 0)
            {
                return NotFound(new { message = "Không tìm thấy dịch vụ nào" });
            }
            return Ok(services);
        }


    }
}
