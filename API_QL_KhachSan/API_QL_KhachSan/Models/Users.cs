using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API_QL_KhachSan.Models
{
    public class Users
    {
        //Models dùng để định nghĩa cấu trúc bảng trong database or mô tả bảng
        [Key] //Key là khóa chính cho bảng Users
        public int UsersId { get; set; }
        public required string UserName { get; set; }
        public required string passwords { get; set; } //required để bắt buộc nhập
        public string? FullName { get; set; }
        public string? Roles { get; set; }  //? là toán tử 3 ngôi 
        [Column(TypeName = "nvarchar(100)")]
        public string? Status { get; set; } // Thêm dòng này vào Model

    }
}
