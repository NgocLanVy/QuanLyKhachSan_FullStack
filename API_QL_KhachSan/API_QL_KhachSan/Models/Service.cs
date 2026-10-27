using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_QL_KhachSan.Models
{
    public class Service
    {
        
        [Key]
        public int ServiceID { get; set; }
        public required string ServiceName { get; set; } // Tên dịch vụ: nước uống, giặt ủi, spa, v.v.
        public string? Unit { get; set; } // Đơn vị tính: chai, lần, kg, v.v.
        public decimal Price { get; set; } // Giá dịch vụ
        public ICollection<ServiceOrder>? ServiceOrders { get; set; }
    }
}
