using IdentityMail.Web.Entities;

namespace IdentityMail.Web.Models
{
    public class SideNavbarViewModel
    {
        public int DeletedMessages { get; set; }
        public List<Category> Categories { get; set; } = new();
    }
}