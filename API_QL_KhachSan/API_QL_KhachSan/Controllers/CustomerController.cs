using API_QL_KhachSan.Data;
using API_QL_KhachSan.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API_QL_KhachSan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly HotelContext _context;

        public CustomerController(HotelContext context)
        {
            _context = context;
        }

        //lấy danh sách khách hàng
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers.ToListAsync();
        }

        //lấy khách hàng theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
                return NotFound();

            return customer;
        }

        //tạo khách hàng mới
        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer(Customer customer)
        {
            // kiểm tra trùng CCCD
            if (!string.IsNullOrEmpty(customer.IdentityCard) &&
                _context.Customers.Any(c => c.IdentityCard == customer.IdentityCard))
            {
                return BadRequest(new { message = "CCCD đã tồn tại" });
            }

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomer),
                new { id = customer.CustomerID }, customer);
        }

        //cập nhật khách hàng
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, Customer customer)
        {
            if (id != customer.CustomerID)
                return BadRequest("ID không khớp");

            bool duplicateCCCD = _context.Customers.Any(c =>
                c.IdentityCard == customer.IdentityCard &&
                c.CustomerID != id);

            if (duplicateCCCD)
            {
                return BadRequest(new { message = "CCCD đã tồn tại" });
            }

            _context.Entry(customer).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        //xóa khách hàng
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);

            if (customer == null)
                return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //tìm kiếm khách hàng
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Customer>>> SearchCustomer(
            [FromQuery] int? id,
            [FromQuery] string? name,
            [FromQuery] string? phone)
        {
            var query = _context.Customers.AsQueryable();

            if (id.HasValue)
                query = query.Where(c => c.CustomerID == id.Value);

            if (!string.IsNullOrEmpty(name))
                query = query.Where(c => c.FullName.Contains(name));

            if (!string.IsNullOrEmpty(phone))
                query = query.Where(c => c.PhoneNumber!.Contains(phone));

            var result = await query.ToListAsync();

            if (result.Count == 0)
                return NotFound(new { message = "Không tìm thấy khách hàng" });

            return Ok(result);
        }        
    }
}
