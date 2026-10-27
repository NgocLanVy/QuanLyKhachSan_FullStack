using System.ComponentModel.DataAnnotations;

namespace API_QL_KhachSan.Models
{
    public class ServiceOrder
    {
        [Key]
        public int OrderID { get; set; }
        public int BookingID { get; set; }
        public int ServiceID { get; set; }

        public int Quantity { get; set; }
        public decimal PriceAtOrder { get; set; }
        public DateTime OrderTime { get; set; }

        public Booking? Booking { get; set; }
        public Service? Servicess { get; set; }
        //        public Service? Servicess { get; set; }

    }
}
