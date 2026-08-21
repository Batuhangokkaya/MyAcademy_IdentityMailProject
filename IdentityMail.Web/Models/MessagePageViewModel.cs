using IdentityMail.Web.Entities;

namespace IdentityMail.Web.Models
{
    public class MessagePageViewModel
    {
        public List<UserMessage> Messages { get; set; }
        public UserMessage SelectedMessage { get; set; }
    }
}