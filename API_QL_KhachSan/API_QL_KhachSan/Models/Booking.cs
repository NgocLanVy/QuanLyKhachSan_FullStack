using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



namespace API_QL_KhachSan.Models
{
    public class Booking
    {
        [Key]
        public int BookingID { get; set; }
        public int RoomID { get; set; }
        public Room Room { get; set; } = null!;
        public int CustomerID { get; set; }
        public Customer Customer { get; set; } = null!;
        public DateTime CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public decimal TotalRoomPrice { get; set; }
        [Column(TypeName = "nvarchar(50)")]
        public string? Status { get; set; } = "Reserved"; // Reserved, CheckedIn, CheckedOut
        public virtual ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();

    }
}
