using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_QL_KhachSan.Models
{
    public class RoomType
    {
        [Key]
        public int RoomTypeID { get; set; }
        public required string TypeName { get; set; }  = null!;
        public decimal PricePerNight { get; set; }
        public decimal PricePerHour { get; set; }
    }
}
