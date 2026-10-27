namespace API_QL_KhachSan.Models
{
    public class CheckInModel
    {
        public int RoomID { get; set; }
        public string FullName { get; set; }
        public string IdentityCard { get; set; }
        public string PhoneNumber { get; set; }
        public DateTime? CheckOutTime { get; set; }
        //DTO 
    }
}
