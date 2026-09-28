namespace IdentityMail.Web.Entities
{
    public class Category
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public int UserID { get; set; }
        public AppUser User { get; set; }
        public ICollection<UserMessage> Messages { get; set; }
        public string Color { get; set; }
    }
}