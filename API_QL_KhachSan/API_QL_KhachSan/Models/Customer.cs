using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_QL_KhachSan.Models
{
    public class Customer
    {
        [Key]
        public int CustomerID { get; set; }
        public required string FullName { get; set; } = null!;
        public string? IdentityCard { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
