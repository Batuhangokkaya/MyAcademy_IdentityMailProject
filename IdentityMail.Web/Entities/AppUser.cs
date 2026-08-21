using Microsoft.AspNetCore.Identity;

namespace IdentityMail.Web.Entities
{
    public class AppUser : IdentityUser<int>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? ProfileImageURL { get; set; }
        public List<UserMessage> SentMessages { get; set; }
        public List<UserMessage> ReceivedMessages { get; set; }
    }
}