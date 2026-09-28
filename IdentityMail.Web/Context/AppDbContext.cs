using IdentityMail.Web.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IdentityMail.Web.Context
{
    public class AppDbContext : IdentityDbContext<AppUser, AppRole, int>
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<AppUser>().HasMany(message => message.SentMessages)
                                     .WithOne(s => s.Sender).HasForeignKey(x => x.SenderID)
                                     .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<AppUser>().HasMany(message => message.ReceivedMessages)
                                     .WithOne(r => r.Receiver).HasForeignKey(x => x.ReceiverID)
                                     .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<UserMessage>().HasOne(x => x.ParentMessage)
                                         .WithMany().HasForeignKey(x => x.ParentMessageID)
                                         .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<UserMessage>().HasOne(x => x.Category)
                                         .WithMany(x => x.Messages)
                                         .HasForeignKey(x => x.CategoryID)
                                         .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<MessageReport>().HasOne(x => x.Message)
                                           .WithMany()
                                           .HasForeignKey(x => x.MessageID)
                                           .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MessageReport>().HasOne(x => x.ReporterUser)
                                           .WithMany()
                                           .HasForeignKey(x => x.ReporterUserID)
                                           .OnDelete(DeleteBehavior.Restrict);

            base.OnModelCreating(builder);
        }

        public DbSet<UserMessage> UserMessages { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<MessageAttachment> MessageAttachments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<MessageReport> MessageReports { get; set; }
    }
}