using API_QL_KhachSan.Controllers;
using API_QL_KhachSan.Models;
using Microsoft.EntityFrameworkCore;
namespace API_QL_KhachSan.Data
{
    public class HotelContext : DbContext
    {
        public HotelContext(DbContextOptions<HotelContext> options):base (options) { }
        public DbSet<Users> Users { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<ServiceOrder> ServiceOrders { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Service>().ToTable("Servicess");
            modelBuilder.Entity<RoomType>().ToTable("RoomType");
            modelBuilder.Entity<Users>().ToTable("Users");
            modelBuilder.Entity<Customer>().ToTable("Customer");
            modelBuilder.Entity<Room>().ToTable("Room");
            modelBuilder.Entity<Booking>().ToTable("Booking");
            modelBuilder.Entity<ServiceOrder>().ToTable("ServiceOrders");
            modelBuilder.Entity<RoomImage>().ToTable("RoomImages");
            base.OnModelCreating(modelBuilder);
        }
    }
}
