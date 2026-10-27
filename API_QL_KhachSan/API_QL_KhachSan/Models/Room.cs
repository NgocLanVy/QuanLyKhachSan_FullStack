using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace API_QL_KhachSan.Models
{

    public class Room
    {

        [Key]
        public int RoomID { get; set; }
        public string RoomNumber { get; set; } = null!;
        public string RoomStatus { get; set; } = "Available";
        public int RoomTypeID { get; set; }
        public string? Description { get; set; }
        public int? MaxGuests { get; set; }
        public string? BedType { get; set; }
        public RoomType? RoomType { get; set; }
        [JsonIgnore]
        public ICollection<Booking>? Bookings { get; set; }
        public ICollection<RoomImage> RoomImages { get; set; }
    }

}
