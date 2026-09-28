namespace IdentityMail.Web.Entities
{
    public class Notification
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public int? MessageID { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}