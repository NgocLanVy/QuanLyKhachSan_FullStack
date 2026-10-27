namespace API_QL_KhachSan.Models
{
    public class DashboardDto
    {
        public int TongPhong { get; set; }
        public int PhongDangThue { get; set; }
        public int PhongTrong { get; set; }
        public int TongKhachHang { get; set; }
        public int TongDonDatPhong { get; set; }
        public int[] LuotCheckInTuan { get; set; } = new int[7];
        public decimal DoanhThuThang { get; set; }
    }
}
