namespace IdentityMail.Web.Entities
{
    public class Category
    {
        public int ID { get; set; }

        public string Name { get; set; }

        public int UserID { get; set; }

        public AppUser User { get; set; }

        public ICollection<UserMessage> Messages { get; set; }

        // CATEGORY COLOR #2563EB
        public string Color { get; set; }
    }
}