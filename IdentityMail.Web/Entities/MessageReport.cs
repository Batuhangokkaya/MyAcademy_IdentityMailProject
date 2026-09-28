namespace IdentityMail.Web.Entities
{
    public class MessageReport
    {
        public int ID { get; set; }
        public int MessageID { get; set; }
        public UserMessage Message { get; set; }
        public int ReporterUserID { get; set; }
        public AppUser ReporterUser { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}