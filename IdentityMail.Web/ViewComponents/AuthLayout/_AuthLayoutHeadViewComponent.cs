using Microsoft.AspNetCore.Mvc;

namespace IdentityMail.Web.ViewComponents.AuthLayout
{
    public class _AuthLayoutHeadViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            return View();
        }
    }
}