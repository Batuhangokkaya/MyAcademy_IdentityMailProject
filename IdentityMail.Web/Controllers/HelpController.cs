using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.Controllers
{
    [Authorize(Roles = "Admin,Manager,User")]
    public class HelpController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}